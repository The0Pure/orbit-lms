#!/usr/bin/env python3
"""
Orbit LMS Data Scientist AI
----------------------------
Cleans an LMS report, forecasts future metrics, builds a dashboard image,
and writes a Word report describing everything.

Usage:
    python main.py path/to/report.csv [--periods 30] [--out output]
"""
import argparse
import os

from src.cleaner import load_report, clean
from src.forecaster import run_forecasts
from src.dashboard import build_dashboard
from src.report import build_report


def main():
    parser = argparse.ArgumentParser(description="Orbit LMS Data Scientist AI")
    parser.add_argument("report_path", help="Path to a CSV or Excel LMS report")
    parser.add_argument("--periods", type=int, default=30, help="Days ahead to forecast (default: 30)")
    parser.add_argument("--out", default="output", help="Output directory (default: ./output)")
    args = parser.parse_args()

    os.makedirs(args.out, exist_ok=True)

    print(f"Loading report: {args.report_path}")
    raw_df = load_report(args.report_path)

    print("Cleaning data...")
    df, log = clean(raw_df)
    print(f"  {log['rows_in']} -> {log['rows_out']} rows, {log['duplicates_removed']} duplicates removed")

    forecasts = {}
    if log.get("date_column"):
        print(f"Detected date column '{log['date_column']}', running forecasts...")
        forecasts = run_forecasts(df, log["date_column"], periods=args.periods)
        print(f"  Forecasted metrics: {list(forecasts.keys()) or 'none found'}")
    else:
        print("No date column detected — skipping forecasts.")

    dashboard_path = os.path.join(args.out, "dashboard.png")
    print("Building dashboard...")
    chart_titles = build_dashboard(df, log.get("date_column"), forecasts, dashboard_path)
    print(f"  Saved dashboard to {dashboard_path}")

    report_path = os.path.join(args.out, "report.docx")
    print("Writing Word report...")
    build_report(df, log, forecasts, chart_titles, dashboard_path, report_path)
    print(f"  Saved report to {report_path}")

    print("\nDone.")


if __name__ == "__main__":
    main()
