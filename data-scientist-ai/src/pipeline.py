"""Shared pipeline: clean -> forecast -> dashboard -> report. Used by main.py and server.py."""
import os

from src.cleaner import load_report, clean
from src.forecaster import run_forecasts
from src.dashboard import build_dashboard
from src.report import build_report


def run_pipeline(report_path: str, out_dir: str, periods: int = 30) -> dict:
    os.makedirs(out_dir, exist_ok=True)

    raw_df = load_report(report_path)
    df, log = clean(raw_df)

    forecasts = {}
    if log.get("date_column"):
        forecasts = run_forecasts(df, log["date_column"], periods=periods)

    dashboard_path = os.path.join(out_dir, "dashboard.png")
    chart_titles = build_dashboard(df, log.get("date_column"), forecasts, dashboard_path)

    report_path_out = os.path.join(out_dir, "report.docx")
    build_report(df, log, forecasts, chart_titles, dashboard_path, report_path_out)

    return {
        "log": log,
        "forecasts": list(forecasts.keys()),
        "dashboard_path": dashboard_path,
        "report_path": report_path_out,
    }
