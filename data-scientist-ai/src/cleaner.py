"""Data cleaning utilities for LMS reports."""
import pandas as pd
import numpy as np


def load_report(path: str) -> pd.DataFrame:
    if path.lower().endswith((".xlsx", ".xls")):
        return pd.read_excel(path)
    return pd.read_csv(path)


def clean(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """Clean a raw LMS report and return the cleaned frame plus a summary of changes."""
    log = {"rows_in": len(df), "duplicates_removed": 0, "missing_filled": {}, "columns_normalized": []}

    df = df.copy()

    # Normalize column names
    original_cols = list(df.columns)
    df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]
    log["columns_normalized"] = list(zip(original_cols, df.columns))

    # Drop fully empty rows/columns
    df = df.dropna(how="all").dropna(axis=1, how="all")

    # Remove exact duplicate rows
    before = len(df)
    df = df.drop_duplicates()
    log["duplicates_removed"] = before - len(df)

    # Try to detect and parse a date column
    date_col = None
    for col in df.columns:
        if "date" in col or "time" in col:
            parsed = pd.to_datetime(df[col], errors="coerce")
            if parsed.notna().mean() > 0.7:
                df[col] = parsed
                date_col = date_col or col

    # Fill missing values: numeric -> median, text -> "Unknown"
    for col in df.columns:
        n_missing = df[col].isna().sum()
        if n_missing == 0:
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            fill_value = df[col].median()
            df[col] = df[col].fillna(fill_value)
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            continue
        else:
            fill_value = "Unknown"
            df[col] = df[col].fillna(fill_value)
        log["missing_filled"][col] = int(n_missing)

    log["rows_out"] = len(df)
    log["date_column"] = date_col
    return df, log
