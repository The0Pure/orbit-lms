"""Fine-tunes the pretrained TimesFM checkpoint on the user's own data.

TimesFM ships as a zero-shot model (`timesfm_forecaster.py` calls it with no
training step), but the underlying torch module is a normal differentiable
network — nothing stops it from being fine-tuned further on a specific
series so its forecasts adapt to that series' own patterns.

The forward pass below re-implements the "prefill" half of
`TimesFM_2p5_200M_torch.decode()` (patch the context, run the running
instance-norm stats per patch, run the transformer, de-normalize the last
patch's output) but WITHOUT `torch.no_grad()`, since decode() is inference-only
and disables gradients entirely. This gives a real, gradient-producing
"predict the next `horizon` points from `context_len` points of history" loss
to fine-tune against.
"""
import numpy as np
import torch


def _prefill_forward(module, patched_inputs: torch.Tensor, patched_masks: torch.Tensor):
    """One differentiable forward pass over a full context, mirroring the prefill
    section of `TimesFM_2p5_200M_torch.decode()`. Returns the de-normalized point
    forecast for the `horizon` steps following the context (shape (batch, o))."""
    from timesfm.torch import util

    revin = util.revin
    batch_size, num_patches, _ = patched_inputs.shape
    device = patched_inputs.device

    n = torch.zeros(batch_size, device=device)
    mu = torch.zeros(batch_size, device=device)
    sigma = torch.zeros(batch_size, device=device)
    patch_mu, patch_sigma = [], []
    for i in range(num_patches):
        (n, mu, sigma), _ = util.update_running_stats(n, mu, sigma, patched_inputs[:, i], patched_masks[:, i])
        patch_mu.append(mu)
        patch_sigma.append(sigma)
    context_mu = torch.stack(patch_mu, dim=1)
    context_sigma = torch.stack(patch_sigma, dim=1)

    normed_inputs = revin(patched_inputs, context_mu, context_sigma, reverse=False)
    normed_inputs = torch.where(patched_masks, 0.0, normed_inputs)

    (_, _, normed_outputs, _), _ = module(normed_inputs, patched_masks, None)

    renormed_outputs = torch.reshape(
        revin(normed_outputs, context_mu, context_sigma, reverse=True),
        (batch_size, num_patches, module.o, module.q),
    )
    return renormed_outputs[:, -1, :, module.aridx]


def _make_windows(series: np.ndarray, context_len: int, horizon: int, stride: int) -> list[tuple[np.ndarray, np.ndarray]]:
    """Slides a (context, target) window across `series`. `context_len` must be a
    multiple of the model's patch length (32) — the caller rounds it down."""
    windows = []
    end = len(series) - context_len - horizon
    for start in range(0, max(end, 0) + 1, stride):
        ctx = series[start:start + context_len]
        target = series[start + context_len:start + context_len + horizon]
        windows.append((ctx, target))
    return windows


TRAINABLE_PRESETS = {
    "light": ["output_projection_point", "output_projection_quantiles"],
    "last2": ["output_projection_point", "output_projection_quantiles", "stacked_xf.18", "stacked_xf.19"],
    "full": None,  # None means "train everything"
}


def _set_trainable(module, preset: str):
    names = TRAINABLE_PRESETS.get(preset)
    if names is None:
        for p in module.parameters():
            p.requires_grad_(True)
        return
    for p in module.parameters():
        p.requires_grad_(False)
    trained_any = False
    for name, sub in module.named_modules():
        if any(name == n or name.startswith(n + ".") for n in names):
            for p in sub.parameters(recurse=False):
                p.requires_grad_(True)
                trained_any = True
    if not trained_any:
        raise ValueError(f"No matching layers found for trainable preset '{preset}'.")


def finetune(
    series: np.ndarray,
    output_dir: str,
    context_len: int = 512,
    horizon: int = 128,
    epochs: int = 3,
    lr: float = 1e-4,
    batch_size: int = 4,
    stride: int = 32,
    trainable: str = "light",
    progress_cb=None,
) -> dict:
    """Fine-tunes TimesFM on `series` (a 1-D array of daily values, no NaNs) and
    saves the result to `output_dir`. `timesfm_forecaster.use_finetuned()` points
    the forecaster at that directory afterwards.

    `trainable` controls how much of the 200M-parameter model gets updated:
    - "light" (default): only the output projection heads — fast, low risk of
      overfitting on a small dataset, on CPU this is the only practical option.
    - "last2": also unfreezes the last two transformer blocks.
    - "full": fine-tunes the entire model — needs a GPU and a sizeable dataset.

    Returns {"epochs": ..., "windows": ..., "final_loss": ...}.
    """
    import timesfm

    from src import timesfm_forecaster

    p = 32
    context_len = (context_len // p) * p
    if context_len < p:
        raise ValueError(f"context_len must be at least {p} (one patch).")

    windows = _make_windows(np.asarray(series, dtype=np.float64), context_len, horizon, stride)
    if not windows:
        raise ValueError(
            f"Not enough data to build a single training window: need >= "
            f"{context_len + horizon} points, got {len(series)}."
        )

    base_model = timesfm_forecaster._get_model()
    module = base_model.model
    _set_trainable(module, trainable)
    module.train()

    optimizer = torch.optim.AdamW(
        [p for p in module.parameters() if p.requires_grad], lr=lr
    )
    loss_fn = torch.nn.MSELoss()

    final_loss = None
    for epoch in range(epochs):
        np.random.shuffle(windows)
        epoch_losses = []
        for batch_start in range(0, len(windows), batch_size):
            batch = windows[batch_start:batch_start + batch_size]
            ctx = torch.tensor(np.stack([w[0] for w in batch]), dtype=torch.float32)
            target = torch.tensor(np.stack([w[1] for w in batch]), dtype=torch.float32)
            patched_inputs = ctx.reshape(ctx.shape[0], -1, p)
            patched_masks = torch.zeros_like(patched_inputs, dtype=torch.bool)

            pred = _prefill_forward(module, patched_inputs, patched_masks)
            pred = pred[:, :target.shape[1]]
            loss = loss_fn(pred, target)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            epoch_losses.append(loss.item())

        final_loss = float(np.mean(epoch_losses))
        if progress_cb:
            progress_cb(epoch + 1, epochs, final_loss)
        else:
            print(f"[timesfm_finetune] epoch {epoch + 1}/{epochs} - mse loss: {final_loss:.6f}")

    module.eval()
    base_model.save_pretrained(output_dir)
    return {"epochs": epochs, "windows": len(windows), "final_loss": final_loss}
