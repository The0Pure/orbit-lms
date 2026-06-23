"""Shared pipeline: clean -> forecast -> dashboard -> report. Used by main.py and server.py."""
import json
import os

from src.cleaner import load_report, clean
from src.forecaster import run_forecasts, run_yearly_comparisons
from src.dashboard import build_dashboard
from src.report import build_report
from src.chat import build_context

DAYS_PER_QUARTER = 91
DAYS_PER_MONTH = 30
DAYS_PER_YEAR = 365


def run_pipeline(
    report_path: str, out_dir: str, periods: int = 30, mode: str = "both", table: str | None = None
) -> dict:
    """mode controls which forward-looking analysis to run:
    - "predict": only the short-horizon forecast (`periods` days ahead)
    - "compare": only the this-year-vs-next-year comparison
    - "both": run both (default)

    `table` selects a specific table when `report_path` is a SQLite database file.
    """
    os.makedirs(out_dir, exist_ok=True)

    raw_df = load_report(report_path, table=table)
    df, log = clean(raw_df)

    forecasts = {}
    yearly = {}
    if log.get("date_column"):
        if mode in ("predict", "both"):
            forecasts = run_forecasts(df, log["date_column"], periods=periods)
        if mode in ("compare", "both"):
            yearly = run_yearly_comparisons(df, log["date_column"])

    dashboard_path = os.path.join(out_dir, "dashboard.png")
    chart_titles = build_dashboard(df, log.get("date_column"), forecasts, yearly, dashboard_path)

    report_path_out = os.path.join(out_dir, "report.docx")
    build_report(df, log, forecasts, yearly, chart_titles, dashboard_path, report_path_out)

    context = build_context(df, log, forecasts, yearly)
    with open(os.path.join(out_dir, "context.json"), "w") as f:
        json.dump(context, f, indent=2)

    return {
        "log": log,
        "forecasts": list(forecasts.keys()),
        "dashboard_path": dashboard_path,
        "report_path": report_path_out,
        "context": context,
    }
