# Data Scientist AI

A **standalone Python program**, separate from the Orbit LMS web app. It acts as a data scientist
for any report you give it:

1. **Cleans** a CSV/Excel report (normalizes columns, removes duplicates, fills missing values, detects date columns).
2. **Forecasts** future enrollments, revenue, and completion rate using polynomial regression on the cleaned time series.
3. **Builds a dashboard** (`output/dashboard.png`) with trend/forecast charts and distribution histograms.
4. **Writes a Word report** (`output/report.docx`) describing the cleaning steps, the dashboard, and the forecasts.

It ships with its own self-contained web UI (plain HTML/JS served by the same Python server) — no
Node, React, or the Orbit LMS app required.

## Setup

```bash
cd data-scientist-ai
pip install -r requirements.txt
```

## Usage — Web UI (recommended)

```bash
python server.py
```

Then open **http://localhost:8000** in your browser. Upload an Excel/CSV file, set the forecast
horizon, click **Process & Download**, and you'll get a ZIP with `dashboard.png` and `report.docx`.

## Usage — CLI

```bash
python main.py path/to/report.csv --periods 30 --out output
```

- `report_path`: CSV or Excel file (e.g. enrollments, revenue, completion rate by date).
- `--periods`: number of days to forecast ahead (default 30).
- `--out`: output directory for `dashboard.png` and `report.docx` (default `output`).

## Usage — API

```bash
curl -F "file=@report.csv" "http://localhost:8000/process?periods=30" -o results.zip
```

## How metric detection works

The tool looks for a date/time column and numeric columns whose names contain:

- `enroll` → Enrollments
- `revenue`, `price`, `payment`, `amount`, `income` → Revenue
- `complet`, `progress`, `score` → Completion

If your report uses different naming, rename the relevant columns before running, or extend
`METRIC_KEYWORDS` in `src/forecaster.py`.
