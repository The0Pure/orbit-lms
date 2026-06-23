# Orbit LMS Data Scientist AI

A standalone Python tool that acts as a data scientist for Orbit LMS reports:

1. **Cleans** a CSV/Excel report (normalizes columns, removes duplicates, fills missing values, detects date columns).
2. **Forecasts** future enrollments, revenue, and completion rate using polynomial regression on the cleaned time series.
3. **Builds a dashboard** (`output/dashboard.png`) with trend/forecast charts and distribution histograms.
4. **Writes a Word report** (`output/report.docx`) describing the cleaning steps, the dashboard, and the forecasts.

## Setup

```bash
cd data-scientist-ai
pip install -r requirements.txt
```

## Usage

```bash
python main.py path/to/report.csv --periods 30 --out output
```

- `report_path`: CSV or Excel file exported from Orbit LMS (e.g. enrollments, revenue, completion rate by date).
- `--periods`: number of days to forecast ahead (default 30).
- `--out`: output directory for `dashboard.png` and `report.docx` (default `output`).

## How metric detection works

The tool looks for a date/time column and numeric columns whose names contain:

- `enroll` → Enrollments
- `revenue`, `price`, `payment`, `amount`, `income` → Revenue
- `complet`, `progress`, `score` → Completion

If your report uses different naming, rename the relevant columns before running, or extend
`METRIC_KEYWORDS` in `src/forecaster.py`.
