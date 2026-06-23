#!/usr/bin/env python3
"""
Data Scientist AI
------------------
Cleans any tabular report, forecasts future metrics, builds a dashboard image,
and writes a Word report describing everything.

Usage:
    python main.py path/to/data.csv [--periods 30] [--out output]
    python main.py path/to/data.csv --quarters 2 --mode predict
"""
import argparse

from src.pipeline import DAYS_PER_QUARTER, run_pipeline


def main():
    parser = argparse.ArgumentParser(description="Data Scientist AI")
    parser.add_argument("report_path", help="Path to a CSV or Excel file")
    parser.add_argument("--periods", type=int, default=30, help="Days ahead to forecast (default: 30)")
    parser.add_argument(
        "--quarters", type=int, default=None,
        help="Quarters ahead to forecast (e.g. 2 for the next two quarters). Overrides --periods.",
    )
    parser.add_argument(
        "--mode", choices=["predict", "compare", "both"], default="both",
        help="'predict' for a forward forecast, 'compare' for this-year-vs-next-year, "
             "'both' for both (default: both)",
    )
    parser.add_argument("--out", default="output", help="Output directory (default: ./output)")
    args = parser.parse_args()

    periods = args.quarters * DAYS_PER_QUARTER if args.quarters else args.periods

    print(f"Loading report: {args.report_path}")
    result = run_pipeline(args.report_path, args.out, periods, mode=args.mode)

    log = result["log"]
    print(f"  {log['rows_in']} -> {log['rows_out']} rows, {log['duplicates_removed']} duplicates removed")
    print(f"  Forecasted metrics: {result['forecasts'] or 'none found'}")
    print(f"  Saved dashboard to {result['dashboard_path']}")
    print(f"  Saved report to {result['report_path']}")
    print("\nDone.")


if __name__ == "__main__":
    main()
