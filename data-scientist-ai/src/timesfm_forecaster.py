"""Wraps Google's TimesFM foundation model as the forecasting backend.

TimesFM is a pretrained, zero-shot time-series forecasting model — it needs no
per-dataset training, it just looks at the recent history of a series and predicts
forward. The model and its ~800MB checkpoint are loaded lazily (and cached as a
process-wide singleton) on first use, since loading it is expensive and many runs
of this tool never need a fresh load.

If `timesfm`/`torch` aren't installed, `is_available()` returns False and callers
should fall back to the simpler polynomial-regression forecaster.
"""
import numpy as np

_model = None
_MAX_CONTEXT = 1024
_MAX_HORIZON = 256


def is_available() -> bool:
    try:
        import timesfm  # noqa: F401
        import torch  # noqa: F401
        return True
    except ImportError:
        return False


def _get_model():
    global _model
    if _model is not None:
        return _model

    import torch
    import timesfm

    torch.set_float32_matmul_precision("high")
    model = timesfm.TimesFM_2p5_200M_torch.from_pretrained("google/timesfm-2.5-200m-pytorch")
    model.compile(
        timesfm.ForecastConfig(
            max_context=_MAX_CONTEXT,
            max_horizon=_MAX_HORIZON,
            normalize_inputs=True,
            use_continuous_quantile_head=True,
            force_flip_invariance=True,
            infer_is_positive=True,
            fix_quantile_crossing=True,
        )
    )
    _model = model
    return _model


def forecast(history: np.ndarray, periods: int) -> np.ndarray:
    """Forecast `periods` steps ahead from `history` (a 1-D array of daily values).

    TimesFM caps a single call's horizon at `_MAX_HORIZON` and its input context at
    `_MAX_CONTEXT`. For longer requested horizons, this rolls the forecast forward in
    chunks, feeding each chunk's predictions back in as additional context for the next.
    """
    model = _get_model()
    context = list(history[-_MAX_CONTEXT:])
    predictions: list[float] = []

    remaining = periods
    while remaining > 0:
        chunk = min(remaining, _MAX_HORIZON)
        point, _quantiles = model.forecast(horizon=chunk, inputs=[np.array(context, dtype=np.float64)])
        chunk_predictions = np.clip(point[0], a_min=0, a_max=None)
        predictions.extend(chunk_predictions.tolist())
        context = (context + chunk_predictions.tolist())[-_MAX_CONTEXT:]
        remaining -= chunk

    return np.array(predictions[:periods])
