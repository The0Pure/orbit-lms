#!/usr/bin/env python3
"""
Data Scientist AI — standalone program for analyzing and forecasting any dataset.

Run:
    python server.py

Then open http://localhost:8000 in your browser to use the upload UI,
or POST a CSV/Excel file directly to http://localhost:8000/process
to receive a ZIP containing dashboard.png + report.docx.
"""
import re
import shutil
import zipfile
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from src.pipeline import DAYS_PER_QUARTER, run_pipeline

WEB_DIR = Path(__file__).parent / "web"
STORAGE_DIR = Path(__file__).parent / "storage"
STORAGE_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Data Scientist AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}


@app.get("/health")
def health():
    return {"status": "ok"}


def _safe_stem(filename: str) -> str:
    stem = Path(filename or "upload").stem
    stem = re.sub(r"[^A-Za-z0-9_-]+", "_", stem).strip("_")
    return stem or "upload"


@app.post("/process")
async def process(
    file: UploadFile = File(...),
    periods: int = Query(30, ge=1, le=2000),
    quarters: int | None = Query(None, ge=1, le=20, description="Overrides `periods` if set"),
    mode: str = Query("both", pattern="^(predict|compare|both)$"),
):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type '{suffix}'. Use CSV or Excel.")

    effective_periods = quarters * DAYS_PER_QUARTER if quarters else periods

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
        run_pipeline(str(input_path), str(out_dir), periods=effective_periods, mode=mode)
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
    )


app.mount("/", StaticFiles(directory=WEB_DIR, html=True), name="web")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
