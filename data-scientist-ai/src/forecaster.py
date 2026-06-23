"""Generic forecasting for any numeric metric in any dataset."""
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures

from src import timesfm_forecaster

MAX_AUTO_METRICS = 6
ID_LIKE_PATTERNS = [
    "_id", "id_", "zip", "postal", "phone", "code", "msisdn", "imsi", "imei",
    "iccid", "msid", "mdn", "ssn", "account_no", "account_number", "serial",
    "mac_address", "ip_address", "uuid", "guid", "hash",
]


def find_metric_columns(df: pd.DataFrame, max_metrics: int = MAX_AUTO_METRICS) -> dict:
    """Pick numeric columns worth forecasting: skip ID-like columns and pick the
    ones with the most variation (most informative), up to max_metrics."""
    candidates = []
    for col in df.select_dtypes(include="number").columns:
        name = col.lower()
        if name == "id" or any(p in name for p in ID_LIKE_PATTERNS):
            continue
        if df[col].nunique() <= 1:
            continue
        # Catch unnamed identifier columns too: a near-unique integer column with a huge
        # magnitude (e.g. an 10-15 digit phone/account number) is almost never a real metric,
        # whereas business metrics like revenue/counts repeat values and stay in a normal range.
        is_high_cardinality_id = (
            pd.api.types.is_integer_dtype(df[col])
            and df[col].nunique() / len(df) > 0.95
            and abs(df[col].mean()) > 1e6
        )
        if is_high_cardinality_id:
            continue
        candidates.append(col)

    candidates.sort(key=lambda c: df[c].std() / (abs(df[c].mean()) + 1e-9), reverse=True)
    return {col: col for col in candidates[:max_metrics]}


def _forecast_polynomial(series: pd.Series, periods: int, degree: int) -> np.ndarray:
    """Fallback used when TimesFM isn't installed/available.

    `degree=2` captures short-term acceleration/deceleration well, but compounds into unrealistic
    swings over long horizons (e.g. a full year ahead) — callers forecasting far out should pass
    `degree=1` for a stable linear extrapolation instead.
    """
    x = np.arange(len(series)).reshape(-1, 1)
    y = series.values

    poly = PolynomialFeatures(degree=degree)
    x_poly = poly.fit_transform(x)
    model = LinearRegression().fit(x_poly, y)

    future_x = np.arange(len(series), len(series) + periods).reshape(-1, 1)
    future_x_poly = poly.transform(future_x)
    return np.clip(model.predict(future_x_poly), a_min=0, a_max=None)


def forecast_metric(
    df: pd.DataFrame, date_col: str, value_col: str, periods: int = 30, degree: int = 2
) -> tuple[pd.DataFrame, str]:
    """Aggregate value_col by day and forecast `periods` days ahead.

    Uses Google's TimesFM foundation model (zero-shot, pretrained) when available, since it
    handles trend/seasonality without the long-horizon blowup polynomial regression suffers from.
    Falls back to polynomial regression (see `_forecast_polynomial`) if TimesFM/torch aren't installed.

    Returns (data, source) where source is "timesfm" or "polynomial_regression" — labeling which
    engine actually produced the forecast, since TimesFM can silently fall back at runtime
    (e.g. no network access to download its checkpoint).
    """
    raw_series = (
        df[[date_col, value_col]]
        .dropna()
        .groupby(pd.Grouper(key=date_col, freq="D"))[value_col]
        .sum()
        .asfreq("D")  # leaves gaps as NaN rather than 0 — a day with no rows is "unknown", not "zero"
    )

    if len(raw_series) < 5:
        raise ValueError(f"Not enough time-series data to forecast '{value_col}' (need >= 5 days).")

    # Zero-filled view for display and for the polynomial fallback (which can't handle NaN).
    series = raw_series.fillna(0)

    predictions = None
    source = "polynomial_regression"
    if timesfm_forecaster.is_available():
        try:
            # Pass the NaN-gapped series: TimesFM linearly interpolates internal gaps and strips
            # leading NaNs itself, which represents missing data far better than treating gaps as
            # literal zeros (zero-filling makes sparse/non-daily data look like real zero-activity
            # days, which skews the model's read of the trend).
            predictions = timesfm_forecaster.forecast(raw_series.values, periods)
            source = "timesfm"
        except Exception as exc:
            # Model install is present but couldn't load (e.g. no network access to
            # download the checkpoint from Hugging Face) — fall back below, but tell
            # the user why instead of silently switching engines.
            print(f"[forecaster] TimesFM is installed but failed to run for '{value_col}': "
                  f"{exc}. Falling back to polynomial regression.")
            predictions = None
    if predictions is None:
        predictions = _forecast_polynomial(series, periods, degree)
        source = "polynomial_regression"

    future_dates = pd.date_range(series.index[-1] + pd.Timedelta(days=1), periods=periods, freq="D")

    history = pd.DataFrame({"date": series.index, "value": series.values, "type": "actual"})
    forecast = pd.DataFrame({"date": future_dates, "value": predictions, "type": "forecast"})
    return pd.concat([history, forecast], ignore_index=True), source


def run_forecasts(df: pd.DataFrame, date_col: str, periods: int = 30) -> dict:
    metrics = find_metric_columns(df)
    results = {}
    for metric, col in metrics.items():
        try:
            data, source = forecast_metric(df, date_col, col, periods)
            results[metric] = {"column": col, "data": data, "source": source}
        except ValueError:
            continue
    return results


def yearly_comparison(df: pd.DataFrame, date_col: str, value_col: str, years_ahead: int = 1) -> dict:
    """Forecast far enough ahead to cover `years_ahead` future years, then compare this year's
    actual monthly totals against each of those future years' forecasted monthly totals."""
    last_date = df[date_col].dropna().max()
    this_year = last_date.year
    last_future_year = this_year + years_ahead

    days_to_cover = (pd.Timestamp(f"{last_future_year}-12-31") - last_date).days
    periods = max(days_to_cover, 30)

    combined, source = forecast_metric(df, date_col, value_col, periods=periods, degree=1)
    combined["year"] = combined["date"].dt.year
    combined["month"] = combined["date"].dt.month

    def monthly_totals(year):
        return combined[combined["year"] == year].groupby("month")["value"].sum().reindex(range(1, 13), fill_value=0)

    this_year_monthly = monthly_totals(this_year)
    this_year_total = this_year_monthly.sum()

    years = []
    for offset in range(1, years_ahead + 1):
        year = this_year + offset
        year_monthly = monthly_totals(year)
        year_total = year_monthly.sum()
        pct_change = ((year_total - this_year_total) / this_year_total * 100) if this_year_total else 0
        years.append({
            "year": year,
            "monthly": year_monthly,
            "total": year_total,
            "pct_change": pct_change,
        })

    return {
        "this_year": this_year,
        "this_year_monthly": this_year_monthly,
        "this_year_total": this_year_total,
        "years": years,
        "source": source,
        # Back-compat aliases for the immediate next year (years_ahead == 1 is the common case).
        "next_year": years[0]["year"],
        "next_year_monthly": years[0]["monthly"],
        "next_year_total": years[0]["total"],
        "pct_change": years[0]["pct_change"],
    }


def run_yearly_comparisons(df: pd.DataFrame, date_col: str, years_ahead: int = 1) -> dict:
    metrics = find_metric_columns(df)
    results = {}
    for metric, col in metrics.items():
        try:
            results[metric] = {"column": col, **yearly_comparison(df, date_col, col, years_ahead=years_ahead)}
        except ValueError:
            continue
    return results
