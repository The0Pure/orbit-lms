#!/usr/bin/env python3
"""Fine-tunes TimesFM on your own dataset, then saves the result so
`main.py`/`server.py` can use it for forecasts instead of the stock pretrained model.

Usage:
    python finetune_timesfm.py mydata.csv --value-col revenue --out storage/timesfm_finetuned/revenue
    python main.py mydata.csv --finetune-dir storage/timesfm_finetuned/revenue

Requires `pip install timesfm[torch]` and a real forecast-capable install
(check with `python check_timesfm.py` first) — fine-tuning starts from that
same pretrained checkpoint.
"""
import argparse
import sys

import pandas as pd

from src import timesfm_forecaster
from src.cleaner import load_report, clean
from src.timesfm_finetune import finetune


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("data_path", help="CSV/Excel file with your time series")
    parser.add_argument("--value-col", required=True, help="Numeric column to fine-tune on")
    parser.add_argument("--date-col", default=None, help="Date column (auto-detected if omitted)")
    parser.add_argument("--table", default=None, help="Sheet/table name, for multi-sheet Excel files")
    parser.add_argument("--out", required=True, help="Directory to save the fine-tuned checkpoint to")
    parser.add_argument("--context-len", type=int, default=512)
    parser.add_argument("--horizon", type=int, default=128)
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--batch-size", type=int, default=4)
    parser.add_argument("--stride", type=int, default=32)
    parser.add_argument(
        "--trainable", choices=["light", "last2", "full"], default="light",
        help="How much of the model to update (default: light — output heads only, CPU-friendly)",
    )
    args = parser.parse_args()

    if not timesfm_forecaster.is_available():
        print("timesfm/torch are not installed. Run `pip install timesfm[torch]` first.")
        sys.exit(1)

    print("Loading and cleaning data...")
    raw_df = load_report(args.data_path, table=args.table)
    df, log = clean(raw_df)
    date_col = args.date_col or log.get("date_column")
    if not date_col:
        print("No date column found/specified — can't build a daily time series to fine-tune on.")
        sys.exit(1)
    if args.value_col not in df.columns:
        print(f"Column '{args.value_col}' not found. Available columns: {list(df.columns)}")
        sys.exit(1)

    series = (
        df[[date_col, args.value_col]]
        .dropna()
        .groupby(pd.Grouper(key=date_col, freq="D"))[args.value_col]
        .sum()
        .asfreq("D")
        .fillna(0)
        .values
    )
    print(f"Fine-tuning on {len(series)} daily points of '{args.value_col}'...")

    stats = finetune(
        series,
        output_dir=args.out,
        context_len=args.context_len,
        horizon=args.horizon,
        epochs=args.epochs,
        lr=args.lr,
        batch_size=args.batch_size,
        stride=args.stride,
        trainable=args.trainable,
    )
    print(f"Done. Trained on {stats['windows']} windows for {stats['epochs']} epochs, "
          f"final MSE loss: {stats['final_loss']:.6f}.")
    print(f"Saved fine-tuned checkpoint to: {args.out}")
    print(f"Use it with: python main.py {args.data_path} --finetune-dir {args.out}")


if __name__ == "__main__":
    main()
