"""Generic forecasting for any numeric metric in any dataset."""
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures

MAX_AUTO_METRICS = 6
ID_LIKE_PATTERNS = ["_id", "id_", "zip", "postal", "phone", "code"]


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
        candidates.append(col)

    candidates.sort(key=lambda c: df[c].std() / (abs(df[c].mean()) + 1e-9), reverse=True)
    return {col: col for col in candidates[:max_metrics]}


def forecast_metric(df: pd.DataFrame, date_col: str, value_col: str, periods: int = 30) -> pd.DataFrame:
    """Aggregate value_col by day and forecast `periods` days ahead with a polynomial regression."""
    series = (
        df[[date_col, value_col]]
        .dropna()
        .groupby(pd.Grouper(key=date_col, freq="D"))[value_col]
        .sum()
        .asfreq("D", fill_value=0)
    )

    if len(series) < 5:
        raise ValueError(f"Not enough time-series data to forecast '{value_col}' (need >= 5 days).")

    x = np.arange(len(series)).reshape(-1, 1)
    y = series.values

    poly = PolynomialFeatures(degree=2)
    x_poly = poly.fit_transform(x)
    model = LinearRegression().fit(x_poly, y)

    future_x = np.arange(len(series), len(series) + periods).reshape(-1, 1)
    future_x_poly = poly.transform(future_x)
    predictions = np.clip(model.predict(future_x_poly), a_min=0, a_max=None)

    future_dates = pd.date_range(series.index[-1] + pd.Timedelta(days=1), periods=periods, freq="D")

    history = pd.DataFrame({"date": series.index, "value": series.values, "type": "actual"})
    forecast = pd.DataFrame({"date": future_dates, "value": predictions, "type": "forecast"})
    return pd.concat([history, forecast], ignore_index=True)


def run_forecasts(df: pd.DataFrame, date_col: str, periods: int = 30) -> dict:
    metrics = find_metric_columns(df)
    results = {}
    for metric, col in metrics.items():
        try:
            results[metric] = {"column": col, "data": forecast_metric(df, date_col, col, periods)}
        except ValueError:
            continue
    return results


def yearly_comparison(df: pd.DataFrame, date_col: str, value_col: str) -> dict:
    """Forecast far enough ahead to cover all of next year, then compare
    this year's actual monthly totals against next year's forecasted monthly totals."""
    last_date = df[date_col].dropna().max()
    this_year = last_date.year
    next_year = this_year + 1

    days_to_cover_next_year = (pd.Timestamp(f"{next_year}-12-31") - last_date).days
    periods = max(days_to_cover_next_year, 30)

    combined = forecast_metric(df, date_col, value_col, periods=periods)
    combined["year"] = combined["date"].dt.year
    combined["month"] = combined["date"].dt.month

    this_year_monthly = (
        combined[combined["year"] == this_year].groupby("month")["value"].sum().reindex(range(1, 13), fill_value=0)
    )
    next_year_monthly = (
        combined[combined["year"] == next_year].groupby("month")["value"].sum().reindex(range(1, 13), fill_value=0)
    )

    this_year_total = this_year_monthly.sum()
    next_year_total = next_year_monthly.sum()
    pct_change = ((next_year_total - this_year_total) / this_year_total * 100) if this_year_total else 0

    return {
        "this_year": this_year,
        "next_year": next_year,
        "this_year_monthly": this_year_monthly,
        "next_year_monthly": next_year_monthly,
        "this_year_total": this_year_total,
        "next_year_total": next_year_total,
        "pct_change": pct_change,
    }


def run_yearly_comparisons(df: pd.DataFrame, date_col: str) -> dict:
    metrics = find_metric_columns(df)
    results = {}
    for metric, col in metrics.items():
        try:
            results[metric] = {"column": col, **yearly_comparison(df, date_col, col)}
        except ValueError:
            continue
    return results
