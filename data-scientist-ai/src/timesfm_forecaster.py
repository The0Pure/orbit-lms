"""Wraps Google's TimesFM foundation model as the forecasting backend.

TimesFM is a pretrained, zero-shot time-series forecasting model — it needs no
per-dataset training, it just looks at the recent history of a series and predicts
forward. The model and its ~800MB checkpoint are loaded lazily (and cached as a
process-wide singleton) on first use, since loading it is expensive and many runs
of this tool never need a fresh load.

If `timesfm`/`torch` aren't installed, `is_available()` returns False and callers
should fall back to the simpler polynomial-regression forecaster.

Uses TimesFM's full forecasting capability, not just a bare point estimate:
- The continuous quantile head's output is kept (not discarded) and turned into a
  lower/upper uncertainty band, so callers can show a confidence interval.
- Day-of-week and month are passed in as XReg dynamic categorical covariates
  (`forecast_with_covariates`), since they're known for every day, past or future,
  and TimesFM-XReg uses them to correct for weekly/seasonal patterns that a pure
  zero-shot read of the raw numbers can miss.
"""
import numpy as np
import pandas as pd

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
            return_backcast=True,  # required by forecast_with_covariates (XReg)
        )
    )
    _model = model
    return _model


def check_install() -> tuple[bool, str]:
    """Verify TimesFM is installed AND can actually load/run, not just importable.

    Returns (ok, message). A real forecast call is the only way to know the checkpoint
    downloaded correctly and inference works end-to-end — import success alone doesn't
    guarantee that.
    """
    if not is_available():
        return False, "timesfm/torch are not installed. Run `pip install timesfm[torch]`."

    try:
        sample = np.array([float(i) for i in range(60)])
        result = forecast(sample, periods=5)
    except Exception as exc:  # noqa: BLE001 - surfacing any failure reason to the user
        return False, f"timesfm/torch are installed, but the model failed to load/run: {exc}"

    if result["point"].shape != (5,):
        return False, f"Model ran but returned an unexpected shape: {result['point'].shape}"

    return True, "TimesFM is installed and working — a real forecast call succeeded."


def _calendar_covariates(dates: pd.DatetimeIndex) -> dict:
    """Day-of-week and month for each date, as XReg dynamic categorical covariates.

    Unlike arbitrary dataset columns, these are always knowable for future dates too
    (a calendar needs no data collection), which is what XReg's dynamic covariates
    require — they must cover the forecast horizon, not just the history.
    """
    return {
        "day_of_week": [int(d.dayofweek) for d in dates],
        "month": [int(d.month) for d in dates],
    }


def _forecast_chunk_with_covariates(model, context, context_dates, chunk, chunk_dates):
    """One chunk of forecast_with_covariates. Returns (point, lower, upper) or raises."""
    full_dates = list(context_dates) + list(chunk_dates)
    covariates = _calendar_covariates(pd.DatetimeIndex(full_dates))
    point_outputs, quantile_outputs = model.forecast_with_covariates(
        inputs=[np.array(context, dtype=np.float64)],
        dynamic_categorical_covariates=covariates,
        xreg_mode="xreg + timesfm",
    )
    point = np.asarray(point_outputs[0])[:chunk]
    quantiles = np.asarray(quantile_outputs[0])[:chunk]
    return _split_point_and_band(point, quantiles)


def _forecast_chunk_plain(model, context, chunk):
    """One chunk of the plain (no-covariates) forecast call. Returns (point, lower, upper)."""
    point, quantiles = model.forecast(horizon=chunk, inputs=[np.array(context, dtype=np.float64)])
    return _split_point_and_band(point[0], quantiles[0])


def _split_point_and_band(point: np.ndarray, quantiles: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """quantiles has shape (horizon, num_quantile_columns), column 0 being the mean/point
    estimate and the remaining columns spanning TimesFM's predicted quantiles (low to high).
    Use the outermost of those remaining columns as a lower/upper uncertainty band."""
    point = np.clip(point, a_min=0, a_max=None)
    if quantiles.ndim == 2 and quantiles.shape[1] > 1:
        band = quantiles[:, 1:]
        lower = np.clip(band.min(axis=-1), a_min=0, a_max=None)
        upper = np.clip(band.max(axis=-1), a_min=0, a_max=None)
    else:
        lower = point
        upper = point
    return point, lower, upper


def forecast(history: np.ndarray, periods: int, history_dates: pd.DatetimeIndex | None = None) -> dict:
    """Forecast `periods` steps ahead from `history` (a 1-D array of daily values).

    TimesFM caps a single call's horizon at `_MAX_HORIZON` and its input context at
    `_MAX_CONTEXT`. For longer requested horizons, this rolls the forecast forward in
    chunks, feeding each chunk's predictions back in as additional context for the next.

    When `history_dates` is given (one date per `history` value, ending the day before
    the forecast starts), uses TimesFM-XReg with day-of-week/month covariates instead of
    a plain zero-shot call. Falls back to the plain call per-chunk if XReg errors out.

    Returns {"point": ..., "lower": ..., "upper": ...}, each a 1-D array of length
    `periods` — `lower`/`upper` form TimesFM's own predicted uncertainty band, not a
    placeholder.
    """
    model = _get_model()
    context = list(history[-_MAX_CONTEXT:])
    context_dates = pd.DatetimeIndex(history_dates[-_MAX_CONTEXT:]) if history_dates is not None else None

    points: list[float] = []
    lowers: list[float] = []
    uppers: list[float] = []

    remaining = periods
    while remaining > 0:
        chunk = min(remaining, _MAX_HORIZON)

        chunk_point = chunk_lower = chunk_upper = None
        if context_dates is not None:
            chunk_dates = pd.date_range(context_dates[-1] + pd.Timedelta(days=1), periods=chunk, freq="D")
            try:
                chunk_point, chunk_lower, chunk_upper = _forecast_chunk_with_covariates(
                    model, context, context_dates, chunk, chunk_dates
                )
            except Exception:
                chunk_point = None  # fall through to the plain call below

        if chunk_point is None:
            chunk_point, chunk_lower, chunk_upper = _forecast_chunk_plain(model, context, chunk)
            chunk_dates = (
                pd.date_range(context_dates[-1] + pd.Timedelta(days=1), periods=chunk, freq="D")
                if context_dates is not None else None
            )

        points.extend(chunk_point.tolist())
        lowers.extend(chunk_lower.tolist())
        uppers.extend(chunk_upper.tolist())

        context = (context + chunk_point.tolist())[-_MAX_CONTEXT:]
        if context_dates is not None:
            context_dates = (context_dates.append(chunk_dates))[-_MAX_CONTEXT:]
        remaining -= chunk

    return {
        "point": np.array(points[:periods]),
        "lower": np.array(lowers[:periods]),
        "upper": np.array(uppers[:periods]),
    }
