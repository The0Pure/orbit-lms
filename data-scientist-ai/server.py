#!/usr/bin/env python3
"""
Data Scientist AI — standalone program for analyzing and forecasting any dataset.

Run:
    python server.py

Then open http://localhost:8000 in your browser to use the upload UI,
or POST a CSV/Excel/SQLite file directly to http://localhost:8000/process
to receive a ZIP containing dashboard.png + report.docx, plus chat with
the analyzed data via http://localhost:8000/chat.
"""
import json
import re
import shutil
import zipfile
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from src.pipeline import DAYS_PER_MONTH, DAYS_PER_QUARTER, DAYS_PER_YEAR, run_pipeline
from src.cleaner import DB_EXTENSIONS, list_sqlite_tables
from src.chat import ask as chat_ask

WEB_DIR = Path(__file__).parent / "web"
STORAGE_DIR = Path(__file__).parent / "storage"
STORAGE_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Data Scientist AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Run-Id"],
)

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"} | set(DB_EXTENSIONS)


@app.get("/health")
def health():
    return {"status": "ok"}


def _safe_stem(filename: str) -> str:
    stem = Path(filename or "upload").stem
    stem = re.sub(r"[^A-Za-z0-9_-]+", "_", stem).strip("_")
    return stem or "upload"


def _resolve_periods(periods: int, weeks: int | None, months: int | None, quarters: int | None, years: int | None) -> int:
    if weeks:
        return weeks * 7
    if months:
        return months * DAYS_PER_MONTH
    if quarters:
        return quarters * DAYS_PER_QUARTER
    if years:
        return years * DAYS_PER_YEAR
    return periods


@app.post("/tables")
async def tables(file: UploadFile = File(...)):
    """List the tables in an uploaded SQLite database, so the UI can let the user pick one."""
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in DB_EXTENSIONS:
        raise HTTPException(400, "This endpoint only accepts SQLite database files (.db/.sqlite).")

    tmp_path = STORAGE_DIR / f"_tmp_{_safe_stem(file.filename)}{suffix}"
    with tmp_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    try:
        return {"tables": list_sqlite_tables(str(tmp_path))}
    finally:
        tmp_path.unlink(missing_ok=True)


@app.post("/process")
async def process(
    file: UploadFile = File(...),
    periods: int = Query(30, ge=1, le=3650),
    weeks: int | None = Query(None, ge=1, le=520),
    months: int | None = Query(None, ge=1, le=120),
    quarters: int | None = Query(None, ge=1, le=40),
    years: int | None = Query(None, ge=1, le=10),
    mode: str = Query("both", pattern="^(predict|compare|both)$"),
    table: str | None = Query(None, description="Table name, if uploading a SQLite database"),
    finetune_dir: str | None = Query(
        None, description="Path to a TimesFM checkpoint fine-tuned on your data (see finetune_timesfm.py)"
    ),
):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type '{suffix}'. Use CSV, Excel, or SQLite.")

    if finetune_dir:
        from src import timesfm_forecaster
        timesfm_forecaster.use_finetuned(finetune_dir)

    effective_periods = _resolve_periods(periods, weeks, months, quarters, years)

    # Every upload is kept on disk under storage/, so past inputs and results
    # are never lost once the response is sent (unlike a tempdir that gets wiped).
    run_id = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{_safe_stem(file.filename)}"
    run_dir = STORAGE_DIR / run_id
    run_dir.mkdir(parents=True, exist_ok=True)

    input_path = run_dir / f"input{suffix}"
    with input_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    out_dir = run_dir / "output"
    try:
        run_pipeline(str(input_path), str(out_dir), periods=effective_periods, mode=mode, table=table)
    except Exception as exc:
        raise HTTPException(422, f"Failed to process report: {exc}") from exc

    zip_path = run_dir / "results.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(out_dir / "dashboard.png", "dashboard.png")
        zf.write(out_dir / "report.docx", "report.docx")

    return FileResponse(
        zip_path,
        media_type="application/zip",
        filename="data_scientist_ai_results.zip",
        headers={"X-Run-Id": run_id},
    )


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    run_id: str
    message: str
    history: list[ChatMessage] = []


@app.post("/chat")
async def chat(req: ChatRequest):
    context_path = STORAGE_DIR / req.run_id / "output" / "context.json"
    if not context_path.exists():
        raise HTTPException(404, f"No analyzed dataset found for run_id '{req.run_id}'.")

    with context_path.open() as f:
        context = json.load(f)

    try:
        reply = chat_ask(
            context,
            req.message,
            history=[{"role": m.role, "content": m.content} for m in req.history],
        )
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc

    return {"reply": reply}


@app.get("/runs")
def list_runs():
    """List past run_ids (most recent first) so the UI can offer to chat about a past upload."""
    runs = [p.name for p in STORAGE_DIR.iterdir() if p.is_dir() and (p / "output" / "context.json").exists()]
    return {"runs": sorted(runs, reverse=True)}


app.mount("/", StaticFiles(directory=WEB_DIR, html=True), name="web")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
