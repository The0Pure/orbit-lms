"""Forecasting for LMS metrics: enrollments, revenue, completion rate."""
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures

METRIC_KEYWORDS = {
    "enrollments": ["enroll"],
    "revenue": ["revenue", "price", "payment", "amount", "income"],
    "completion": ["complet", "progress", "score"],
}


def find_metric_columns(df: pd.DataFrame) -> dict:
    found = {}
    for metric, keywords in METRIC_KEYWORDS.items():
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]) and any(k in col for k in keywords):
                found[metric] = col
                break
    return found


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
