# Data Scientist AI

A **standalone Python program** that acts as a data scientist for any tabular dataset you give it —
not tied to any specific app or platform. Give it any CSV, Excel, or SQLite file and it will:

1. **Clean** the data (normalize columns, remove duplicates, fill missing values, detect a date column).
2. **Forecast** the most informative numeric columns forward in time using polynomial regression —
   in days, weeks, months, quarters, or years.
3. **Compare this year vs. next year** for each forecasted metric (monthly totals, % change).
4. **Build a dashboard** (`output/dashboard.png`) with trend/forecast charts, year-over-year bars, and distributions.
5. **Write a Word report** (`output/report.docx`) describing the cleaning, the dashboard, and the forecasts in plain,
   business-oriented English.
6. **Chat about the results** with an expert data analyst / business consultant persona that has full context of
   the cleaned data, the forecasts, and the year-over-year comparison.

It has its own self-contained web UI (plain HTML/JS served by the same Python server) — no Node,
React, or any other app required. Point it at any dataset: sales, sign-ups, web traffic, finance,
inventory, survey results, anything with a date column and some numbers.

## Setup

```bash
cd data-scientist-ai
pip install -r requirements.txt
```

To enable the chat feature, set an Anthropic API key before starting the server:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Without this key, everything else (cleaning, forecasting, dashboard, report) still works — only
`/chat` requires it, and it returns a clear error if the key is missing.

## Usage — Web UI (recommended)

```bash
python server.py
```

Then open **http://localhost:8000** in your browser. Upload any Excel/CSV/SQLite file, pick the
analysis mode and forecast horizon, click **Process & Download**, and you'll get a ZIP with
`dashboard.png` and `report.docx`. Once processed, use the **Chat with your data** panel to ask
follow-up questions about the results.

Every upload is also saved locally under `data-scientist-ai/storage/<timestamp>_<filename>/`,
alongside its generated `output/dashboard.png`, `output/report.docx`, `output/context.json`
(used for chat), and `results.zip` — so nothing is lost once the download finishes and you can
revisit past runs at any time.

## Usage — CLI

```bash
python main.py path/to/data.csv --periods 30 --out output
python main.py path/to/data.csv --quarters 2 --mode predict   # next two quarters, forecast only
python main.py path/to/data.csv --mode compare                # this year vs next year only
python main.py path/to/data.db --table sales --years 1        # SQLite input, pick a table
```

- `report_path`: any CSV, Excel, or SQLite (`.db`/`.sqlite`/`.sqlite3`) file.
- `--table`: table name to load if `report_path` is a SQLite database (defaults to the table with the most rows).
- Forecast horizon (pick one, mutually exclusive): `--periods` (days, default 30), `--weeks`, `--months`,
  `--quarters`, `--years`.
- `--mode`: `predict` (forward forecast only), `compare` (this year vs next year only), or `both` (default).
- `--out`: output directory for `dashboard.png` and `report.docx` (default `output`).

## Usage — API

```bash
curl -F "file=@data.csv" "http://localhost:8000/process?periods=30&mode=both" -o results.zip
curl -F "file=@data.csv" "http://localhost:8000/process?quarters=2&mode=predict" -o results.zip
curl -F "file=@data.db" "http://localhost:8000/tables"   # list tables in a SQLite file
curl -F "file=@data.db" "http://localhost:8000/process?table=sales&months=6"
```

- `mode`: `predict`, `compare`, or `both` (default `both`).
- Forecast horizon (pick one): `periods` (days, default 30), `weeks`, `months`, `quarters`, `years`.
- `table`: table name, if uploading a SQLite database.
- The response includes an `X-Run-Id` header — use it to chat about that run:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"run_id": "<the X-Run-Id value>", "message": "What should I focus on next quarter?"}'
```

`GET /runs` lists past run IDs you can still chat about (their `context.json` is kept in `storage/`).

## How it picks what to analyze

- It auto-detects any column with "date" or "time" in its name that parses as real dates.
- Among the numeric columns, it skips obvious ID-like columns (e.g. `user_id`, `zip_code`) and
  picks the columns with the most meaningful variation, up to 6, to forecast and chart.
- For SQLite input, it picks the table with the most rows unless you specify `--table`/`table=`.
- Works on any dataset shape — it's not limited to a fixed set of column names.
