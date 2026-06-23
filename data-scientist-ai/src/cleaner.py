"""Data cleaning utilities for any tabular dataset (CSV, Excel, or SQLite)."""
import sqlite3

import pandas as pd
import numpy as np

DB_EXTENSIONS = (".db", ".sqlite", ".sqlite3")


def load_report(path: str, table: str | None = None) -> pd.DataFrame:
    if path.lower().endswith((".xlsx", ".xls")):
        return pd.read_excel(path)
    if path.lower().endswith(DB_EXTENSIONS):
        return load_sqlite_table(path, table)
    return pd.read_csv(path)


def list_sqlite_tables(path: str) -> list[str]:
    with sqlite3.connect(path) as conn:
        rows = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
    return [r[0] for r in rows]


def load_sqlite_table(path: str, table: str | None = None) -> pd.DataFrame:
    """Load a table from a SQLite database file. Defaults to the table with the most rows."""
    with sqlite3.connect(path) as conn:
        tables = list_sqlite_tables(path)
        if not tables:
            raise ValueError(f"No tables found in SQLite database '{path}'.")
        if table is None:
            counts = {t: conn.execute(f'SELECT COUNT(*) FROM "{t}"').fetchone()[0] for t in tables}
            table = max(counts, key=counts.get)
        elif table not in tables:
            raise ValueError(f"Table '{table}' not found. Available tables: {', '.join(tables)}")
        return pd.read_sql_query(f'SELECT * FROM "{table}"', conn)


def clean(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """Clean a raw tabular dataset and return the cleaned frame plus a summary of changes."""
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
