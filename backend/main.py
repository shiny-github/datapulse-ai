import os
import json
import logging
import shutil
from datetime import datetime
from typing import Optional

import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from pipeline import DataPipeline
from rag import RAGSystem
from azure_integration import upload_to_azure

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="DataPulse AI", version="1.0.0", description="Enterprise Data Analytics Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
CLEANED_DIR = "cleaned"
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
PERSIST_CSV = os.path.join(DATA_DIR, "current_dataset.csv")
PERSIST_META = os.path.join(DATA_DIR, "current_dataset_meta.json")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CLEANED_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

pipeline = DataPipeline()
rag_system = RAGSystem()

state = {
    "dataset_name": None,
    "raw_path": None,
    "cleaned_path": None,
    "df": None,
    "pipeline_status": {
        "stages": [
            {"id": 1, "name": "Ingest", "status": "idle", "log": []},
            {"id": 2, "name": "Clean", "status": "idle", "log": []},
            {"id": 3, "name": "Transform", "status": "idle", "log": []},
            {"id": 4, "name": "Validate", "status": "idle", "log": []},
            {"id": 5, "name": "Load", "status": "idle", "log": []},
        ],
        "running": False,
        "completed": False,
        "quality_score": None,
        "last_run": None,
    },
}


def _save_current_dataset(df: pd.DataFrame, name: str):
    try:
        df.to_csv(PERSIST_CSV, index=False)
        with open(PERSIST_META, "w") as f:
            json.dump({"dataset_name": name}, f)
        logger.info(f"Dataset persisted → {PERSIST_CSV}")
    except Exception as e:
        logger.warning(f"Failed to persist dataset: {e}")


def _load_persisted_dataset():
    if not os.path.exists(PERSIST_CSV) or not os.path.exists(PERSIST_META):
        return
    try:
        df = pd.read_csv(PERSIST_CSV)
        with open(PERSIST_META) as f:
            meta = json.load(f)
        name = meta.get("dataset_name", "dataset")
        state["df"] = df
        state["dataset_name"] = name
        state["raw_path"] = PERSIST_CSV
        rag_system.index_dataframe(df, name)
        logger.info(f"Restored dataset '{name}' ({len(df):,} rows) from disk")
    except Exception as e:
        logger.warning(f"Failed to restore persisted dataset: {e}")


@app.on_event("startup")
def startup_load():
    _load_persisted_dataset()


@app.get("/")
def root():
    return {"message": "DataPulse AI API is running", "version": "1.0.0"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    allowed = {".csv", ".xlsx", ".xls", ".json"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}. Allowed: {', '.join(allowed)}")

    dest = os.path.join(UPLOAD_DIR, file.filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        if ext == ".csv":
            df = pd.read_csv(dest)
        elif ext in (".xlsx", ".xls"):
            df = pd.read_excel(dest)
        else:
            df = pd.read_json(dest)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse file: {str(e)}")

    state["dataset_name"] = file.filename
    state["raw_path"] = dest
    state["cleaned_path"] = None
    state["df"] = df
    _save_current_dataset(df, file.filename)

    for s in state["pipeline_status"]["stages"]:
        s["status"] = "idle"
        s["log"] = []
    state["pipeline_status"]["running"] = False
    state["pipeline_status"]["completed"] = False
    state["pipeline_status"]["quality_score"] = None

    rag_system.reset()

    logger.info(f"Uploaded: {file.filename} — {len(df)} rows × {len(df.columns)} cols")
    return {
        "success": True,
        "filename": file.filename,
        "rows": len(df),
        "columns": list(df.columns),
        "shape": [len(df), len(df.columns)],
    }


@app.post("/pipeline/run")
async def run_pipeline(background_tasks: BackgroundTasks):
    if state["raw_path"] is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded. Upload a file first.")
    if state["pipeline_status"]["running"]:
        raise HTTPException(status_code=409, detail="Pipeline already running.")

    background_tasks.add_task(_run_pipeline_task)
    return {"success": True, "message": "Pipeline started. Poll /pipeline/status for updates."}


def _run_pipeline_task():
    ps = state["pipeline_status"]
    ps["running"] = True
    ps["completed"] = False

    try:
        cleaned_df, quality_score, logs = pipeline.run(
            state["raw_path"], ps["stages"]
        )
        state["df"] = cleaned_df
        _save_current_dataset(cleaned_df, state["dataset_name"])
        cleaned_path = os.path.join(CLEANED_DIR, "cleaned_" + os.path.basename(state["raw_path"]))
        if cleaned_path.endswith(".xlsx") or cleaned_path.endswith(".xls"):
            cleaned_path = cleaned_path.rsplit(".", 1)[0] + ".csv"
        cleaned_df.to_csv(cleaned_path, index=False)
        state["cleaned_path"] = cleaned_path

        rag_system.index_dataframe(cleaned_df, state["dataset_name"])

        try:
            upload_to_azure(cleaned_path, "datapulse-results")
        except Exception:
            logger.warning("Azure upload skipped (not configured)")

        ps["quality_score"] = quality_score
        ps["last_run"] = datetime.now().isoformat()
        ps["completed"] = True
    except Exception as e:
        logger.error(f"Pipeline error: {e}")
        for s in ps["stages"]:
            if s["status"] == "running":
                s["status"] = "error"
                s["log"].append(f"ERROR: {str(e)}")
    finally:
        ps["running"] = False


@app.get("/pipeline/status")
def get_pipeline_status():
    return state["pipeline_status"]


@app.post("/query")
async def query_data(body: dict = Body(...)):
    question = body.get("question", "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required.")

    df = state["df"]
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded. Upload a file first.")

    try:
        result = rag_system.query(question, state["dataset_name"] or "dataset")
        return result
    except Exception as e:
        logger.error(f"Query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/insights")
def get_insights():
    df = state["df"]
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded.")

    try:
        insights = rag_system.generate_insights(df, state["dataset_name"] or "dataset")
        return {"insights": insights, "dataset": state["dataset_name"], "generated_at": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/profile")
def get_profile():
    df = state["df"]
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded.")

    profile = _compute_profile(df)
    return profile


def _compute_profile(df: pd.DataFrame) -> dict:
    import numpy as np

    total_cells = df.shape[0] * df.shape[1]
    null_cells = int(df.isnull().sum().sum())
    duplicate_rows = int(df.duplicated().sum())

    columns = []
    for col in df.columns:
        s = df[col]
        col_info = {
            "name": col,
            "dtype": str(s.dtype),
            "non_null": int(s.notna().sum()),
            "null_count": int(s.isnull().sum()),
            "null_pct": round(s.isnull().mean() * 100, 2),
            "unique": int(s.nunique()),
        }
        if pd.api.types.is_numeric_dtype(s):
            col_info.update({
                "min": _safe_val(s.min()),
                "max": _safe_val(s.max()),
                "mean": round(float(s.mean()), 4) if s.notna().any() else None,
                "std": round(float(s.std()), 4) if s.notna().any() else None,
                "median": round(float(s.median()), 4) if s.notna().any() else None,
                "outliers": _count_outliers(s),
            })
        else:
            top = s.value_counts().head(5).to_dict()
            col_info["top_values"] = {str(k): int(v) for k, v in top.items()}
        columns.append(col_info)

    completeness = round((1 - null_cells / max(total_cells, 1)) * 100, 2)
    uniqueness = round((1 - duplicate_rows / max(len(df), 1)) * 100, 2)
    quality_score = round((completeness * 0.6 + uniqueness * 0.4), 2)

    return {
        "rows": len(df),
        "columns": len(df.columns),
        "null_cells": null_cells,
        "duplicate_rows": duplicate_rows,
        "completeness_pct": completeness,
        "uniqueness_pct": uniqueness,
        "quality_score": quality_score,
        "column_profiles": columns,
    }


def _safe_val(v):
    try:
        if pd.isna(v):
            return None
        return round(float(v), 4)
    except Exception:
        return str(v)


def _count_outliers(s: pd.Series) -> int:
    import numpy as np
    if s.dtype == bool or s.dtype == object:
        return 0
    clean = s.dropna()
    if len(clean) < 4:
        return 0
    q1, q3 = clean.quantile(0.25), clean.quantile(0.75)
    iqr = q3 - q1
    return int(((clean < q1 - 1.5 * iqr) | (clean > q3 + 1.5 * iqr)).sum())


@app.get("/domains")
def get_domains():
    df = state["df"]
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded.")

    cols_lower = {c.lower() for c in df.columns}

    domain_signals = {
        "E-Commerce": {"order", "product", "revenue", "cart", "sku", "shipping", "discount", "category"},
        "Healthcare": {"patient", "diagnosis", "icd", "medication", "hospital", "doctor", "treatment", "visit"},
        "Finance": {"transaction", "account", "balance", "debit", "credit", "interest", "loan", "stock"},
        "Supply Chain": {"warehouse", "supplier", "inventory", "shipment", "lead_time", "sku", "stock"},
        "HR": {"employee", "salary", "department", "hire_date", "performance", "attrition", "payroll"},
        "Marketing": {"campaign", "impressions", "clicks", "ctr", "conversion", "spend", "roas", "channel"},
    }

    scores = {}
    for domain, keywords in domain_signals.items():
        match = sum(1 for k in keywords if any(k in c for c in cols_lower))
        scores[domain] = round(match / len(keywords) * 100, 1)

    detected = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    primary = detected[0][0] if detected[0][1] > 0 else "General"

    return {
        "primary_domain": primary,
        "scores": dict(detected),
        "dataset": state["dataset_name"],
    }
