#!/usr/bin/env python3
"""
Data Scientist AI
------------------
Cleans any tabular report, forecasts future metrics, builds a dashboard image,
and writes a Word report describing everything.

Usage:
    python main.py path/to/data.csv [--periods 30] [--out output]
    python main.py path/to/data.csv --quarters 2 --mode predict
    python main.py path/to/data.db --table sales --months 6
"""
import argparse

from src.pipeline import DAYS_PER_MONTH, DAYS_PER_QUARTER, DAYS_PER_YEAR, run_pipeline


def main():
    parser = argparse.ArgumentParser(description="Data Scientist AI")
    parser.add_argument("report_path", help="Path to a CSV, Excel, or SQLite (.db/.sqlite) file")
    parser.add_argument(
        "--table", default=None,
        help="Table name to load if report_path is a SQLite database (defaults to the largest table)",
    )

    horizon = parser.add_mutually_exclusive_group()
    horizon.add_argument("--periods", type=int, default=None, help="Days ahead to forecast (default: 30)")
    horizon.add_argument("--weeks", type=int, default=None, help="Weeks ahead to forecast")
    horizon.add_argument("--months", type=int, default=None, help="Months ahead to forecast")
    horizon.add_argument("--quarters", type=int, default=None, help="Quarters ahead to forecast")
    horizon.add_argument("--years", type=int, default=None, help="Years ahead to forecast")

    parser.add_argument(
        "--mode", choices=["predict", "compare", "both"], default="both",
        help="'predict' for a forward forecast, 'compare' for this-year-vs-next-year, "
             "'both' for both (default: both)",
    )
    parser.add_argument("--out", default="output", help="Output directory (default: ./output)")
    args = parser.parse_args()

    if args.weeks:
        periods = args.weeks * 7
    elif args.months:
        periods = args.months * DAYS_PER_MONTH
    elif args.quarters:
        periods = args.quarters * DAYS_PER_QUARTER
    elif args.years:
        periods = args.years * DAYS_PER_YEAR
    else:
        periods = args.periods or 30

    print(f"Loading report: {args.report_path}")
    result = run_pipeline(args.report_path, args.out, periods, mode=args.mode, table=args.table)

    log = result["log"]
    print(f"  {log['rows_in']} -> {log['rows_out']} rows, {log['duplicates_removed']} duplicates removed")
    print(f"  Forecasted metrics: {result['forecasts'] or 'none found'}")
    print(f"  Saved dashboard to {result['dashboard_path']}")
    print(f"  Saved report to {result['report_path']}")
    print("\nDone.")


if __name__ == "__main__":
    main()
