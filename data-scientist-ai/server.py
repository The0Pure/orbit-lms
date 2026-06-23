#!/usr/bin/env python3
"""
Data Scientist AI — standalone program (independent of Orbit LMS).

Run:
    python server.py

Then open http://localhost:8000 in your browser to use the upload UI,
or POST a CSV/Excel file directly to http://localhost:8000/process
to receive a ZIP containing dashboard.png + report.docx.
"""
import shutil
import tempfile
import zipfile
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from src.pipeline import run_pipeline

WEB_DIR = Path(__file__).parent / "web"

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


@app.post("/process")
async def process(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    periods: int = Query(30, ge=1, le=365),
):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type '{suffix}'. Use CSV or Excel.")

    work_dir = Path(tempfile.mkdtemp(prefix="orbit_ds_"))
    background_tasks.add_task(shutil.rmtree, work_dir, ignore_errors=True)

    input_path = work_dir / f"input{suffix}"
    with input_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    out_dir = work_dir / "output"
    try:
        run_pipeline(str(input_path), str(out_dir), periods=periods)
    except Exception as exc:
        raise HTTPException(422, f"Failed to process report: {exc}") from exc

    zip_path = work_dir / "orbit_data_scientist_results.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(out_dir / "dashboard.png", "dashboard.png")
        zf.write(out_dir / "report.docx", "report.docx")

    return FileResponse(
        zip_path,
        media_type="application/zip",
        filename="orbit_data_scientist_results.zip",
        background=background_tasks,
    )


app.mount("/", StaticFiles(directory=WEB_DIR, html=True), name="web")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
