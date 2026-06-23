# Data Scientist AI

A **standalone Python program** that acts as a data scientist for any tabular dataset you give it —
not tied to any specific app or platform. Give it any CSV or Excel file and it will:

1. **Clean** the data (normalize columns, remove duplicates, fill missing values, detect a date column).
2. **Forecast** the most informative numeric columns forward in time using polynomial regression.
3. **Compare this year vs. next year** for each forecasted metric (monthly totals, % change).
4. **Build a dashboard** (`output/dashboard.png`) with trend/forecast charts, year-over-year bars, and distributions.
5. **Write a Word report** (`output/report.docx`) describing the cleaning, the dashboard, and the forecasts in plain English.

It has its own self-contained web UI (plain HTML/JS served by the same Python server) — no Node,
React, or any other app required. Point it at any dataset: sales, sign-ups, web traffic, finance,
inventory, survey results, anything with a date column and some numbers.

## Setup

```bash
cd data-scientist-ai
pip install -r requirements.txt
```

## Usage — Web UI (recommended)

```bash
python server.py
```

Then open **http://localhost:8000** in your browser. Upload any Excel/CSV file, set the forecast
horizon, click **Process & Download**, and you'll get a ZIP with `dashboard.png` and `report.docx`.

Every upload is also saved locally under `data-scientist-ai/storage/<timestamp>_<filename>/`,
alongside its generated `output/dashboard.png`, `output/report.docx`, and `results.zip` — so
nothing is lost once the download finishes and you can revisit past runs at any time.

## Usage — CLI

```bash
python main.py path/to/data.csv --periods 30 --out output
python main.py path/to/data.csv --quarters 2 --mode predict   # next two quarters, forecast only
python main.py path/to/data.csv --mode compare                # this year vs next year only
```

- `report_path`: any CSV or Excel file.
- `--periods`: number of days to forecast ahead (default 30).
- `--quarters`: number of quarters ahead to forecast (1 quarter = 91 days). Overrides `--periods`.
- `--mode`: `predict` (forward forecast only), `compare` (this year vs next year only), or `both` (default).
- `--out`: output directory for `dashboard.png` and `report.docx` (default `output`).

## Usage — API

```bash
curl -F "file=@data.csv" "http://localhost:8000/process?periods=30&mode=both" -o results.zip
curl -F "file=@data.csv" "http://localhost:8000/process?quarters=2&mode=predict" -o results.zip
```

- `mode`: `predict`, `compare`, or `both` (default `both`).
- `quarters`: forecast horizon in quarters (overrides `periods` if set).
- `periods`: forecast horizon in days (default 30, used if `quarters` is not set).

## How it picks what to analyze

- It auto-detects any column with "date" or "time" in its name that parses as real dates.
- Among the numeric columns, it skips obvious ID-like columns (e.g. `user_id`, `zip_code`) and
  picks the columns with the most meaningful variation, up to 6, to forecast and chart.
- Works on any dataset shape — it's not limited to a fixed set of column names.
