import os
import logging
from datetime import datetime

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class DataPipeline:
    def run(self, file_path: str, stages: list) -> tuple[pd.DataFrame, float, list]:
        logs = []

        def log(stage_idx: int, msg: str):
            ts = datetime.now().strftime("%H:%M:%S")
            entry = f"[{ts}] {msg}"
            stages[stage_idx]["log"].append(entry)
            logs.append(entry)
            logger.info(f"Stage {stage_idx + 1}: {msg}")

        def set_status(stage_idx: int, status: str):
            stages[stage_idx]["status"] = status

        # ── Stage 1: Ingest ──────────────────────────────────────────────────
        set_status(0, "running")
        log(0, "Starting ingestion...")
        try:
            ext = os.path.splitext(file_path)[1].lower()
            if ext == ".csv":
                df = _read_csv_smart(file_path)
                log(0, f"CSV parsed — {len(df):,} rows × {len(df.columns)} columns")
            elif ext in (".xlsx", ".xls"):
                df = pd.read_excel(file_path)
                log(0, f"Excel parsed — {len(df):,} rows × {len(df.columns)} columns")
            elif ext == ".json":
                df = pd.read_json(file_path)
                log(0, f"JSON parsed — {len(df):,} rows × {len(df.columns)} columns")
            else:
                raise ValueError(f"Unsupported extension: {ext}")

            log(0, f"Columns detected: {', '.join(df.columns.tolist())}")
            log(0, f"Memory usage: {df.memory_usage(deep=True).sum() / 1024:.1f} KB")
            set_status(0, "completed")
        except Exception as e:
            set_status(0, "error")
            log(0, f"ERROR: {e}")
            raise

        # ── Stage 2: Clean ───────────────────────────────────────────────────
        set_status(1, "running")
        log(1, "Starting cleaning...")
        try:
            original_rows = len(df)
            null_before = int(df.isnull().sum().sum())

            df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
            log(1, "Column names standardized to snake_case")

            dup_count = int(df.duplicated().sum())
            if dup_count:
                df = df.drop_duplicates()
                log(1, f"Removed {dup_count:,} duplicate rows")
            else:
                log(1, "No duplicate rows found")

            df = _fix_dtypes(df)
            log(1, "Data types inferred and corrected")

            null_after = int(df.isnull().sum().sum())
            df = _impute_nulls(df)
            log(1, f"Nulls handled: {null_before:,} → {null_after:,} remaining after imputation")

            df = _standardize_strings(df)
            log(1, "String values trimmed and standardized")

            log(1, f"Rows: {original_rows:,} → {len(df):,} after cleaning")
            set_status(1, "completed")
        except Exception as e:
            set_status(1, "error")
            log(1, f"ERROR: {e}")
            raise

        # ── Stage 3: Transform ───────────────────────────────────────────────
        set_status(2, "running")
        log(2, "Starting transformation...")
        try:
            date_cols = [c for c in df.columns if "date" in c or "time" in c]
            for c in date_cols:
                try:
                    df[c] = pd.to_datetime(df[c], errors="coerce")
                    df[f"{c}_year"] = df[c].dt.year
                    df[f"{c}_month"] = df[c].dt.month
                    df[f"{c}_dayofweek"] = df[c].dt.dayofweek
                    log(2, f"Date features extracted from '{c}'")
                except Exception:
                    pass

            num_cols = df.select_dtypes(include="number").columns.tolist()
            if num_cols:
                for c in num_cols:
                    mn, mx = df[c].min(), df[c].max()
                    if mx != mn:
                        df[f"{c}_normalized"] = ((df[c] - mn) / (mx - mn)).round(4)
                log(2, f"Min-max normalization applied to {len(num_cols)} numeric columns")

            if "price" in df.columns and "quantity" in df.columns and "revenue" not in df.columns:
                df["revenue"] = (df["price"] * df["quantity"]).round(2)
                log(2, "Calculated 'revenue' = price × quantity")

            if "revenue" in df.columns:
                df["revenue_tier"] = pd.qcut(
                    df["revenue"], q=4, labels=["Low", "Medium", "High", "Premium"], duplicates="drop"
                )
                log(2, "Added 'revenue_tier' quartile segmentation")

            log(2, f"Transformation complete — {len(df.columns)} total columns")
            set_status(2, "completed")
        except Exception as e:
            set_status(2, "error")
            log(2, f"ERROR: {e}")
            raise

        # ── Stage 4: Validate ────────────────────────────────────────────────
        set_status(3, "running")
        log(3, "Starting validation...")
        try:
            issues = []

            remaining_nulls = int(df.isnull().sum().sum())
            if remaining_nulls:
                issues.append(f"{remaining_nulls} null values remain")
                log(3, f"Warning: {remaining_nulls} null values remain")
            else:
                log(3, "No null values — data is complete")

            num_cols = df.select_dtypes(include="number").columns.tolist()
            total_outliers = 0
            for c in num_cols:
                q1, q3 = df[c].quantile(0.25), df[c].quantile(0.75)
                iqr = q3 - q1
                n_out = int(((df[c] < q1 - 1.5 * iqr) | (df[c] > q3 + 1.5 * iqr)).sum())
                total_outliers += n_out
            log(3, f"Outlier scan: {total_outliers:,} outliers detected across numeric columns")

            completeness = (1 - df.isnull().sum().sum() / max(df.size, 1)) * 100
            uniqueness = (1 - df.duplicated().sum() / max(len(df), 1)) * 100
            outlier_penalty = min(total_outliers / max(len(df), 1) * 100, 20)
            quality_score = round(completeness * 0.5 + uniqueness * 0.3 + (20 - outlier_penalty) * 1.0, 2)
            quality_score = max(0, min(100, quality_score))

            log(3, f"Data quality score: {quality_score:.1f}/100")
            log(3, f"  Completeness: {completeness:.1f}%  |  Uniqueness: {uniqueness:.1f}%")
            set_status(3, "completed")
        except Exception as e:
            set_status(3, "error")
            log(3, f"ERROR: {e}")
            raise

        # ── Stage 5: Load ────────────────────────────────────────────────────
        set_status(4, "running")
        log(4, "Starting load...")
        try:
            os.makedirs("reports", exist_ok=True)
            report = {
                "run_at": datetime.now().isoformat(),
                "source_file": file_path,
                "rows": len(df),
                "columns": len(df.columns),
                "quality_score": quality_score,
                "issues": issues,
                "pipeline_logs": logs,
            }
            report_path = os.path.join("reports", f"pipeline_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
            import json
            with open(report_path, "w") as f:
                json.dump(report, f, indent=2, default=str)
            log(4, f"Pipeline report saved: {report_path}")
            log(4, f"Cleaned dataset ready — {len(df):,} rows × {len(df.columns)} columns")
            log(4, "Pipeline completed successfully!")
            set_status(4, "completed")
        except Exception as e:
            set_status(4, "error")
            log(4, f"ERROR: {e}")
            raise

        return df, quality_score, logs


# ── Helpers ──────────────────────────────────────────────────────────────────

def _read_csv_smart(path: str) -> pd.DataFrame:
    for enc in ("utf-8", "latin-1", "cp1252"):
        try:
            return pd.read_csv(path, encoding=enc, low_memory=False)
        except UnicodeDecodeError:
            continue
    return pd.read_csv(path, encoding="utf-8", errors="replace", low_memory=False)


def _fix_dtypes(df: pd.DataFrame) -> pd.DataFrame:
    for col in df.columns:
        if df[col].dtype == object:
            converted = pd.to_numeric(df[col], errors="coerce")
            if converted.notna().sum() / max(df[col].notna().sum(), 1) > 0.8:
                df[col] = converted
    return df


def _impute_nulls(df: pd.DataFrame) -> pd.DataFrame:
    for col in df.columns:
        if df[col].isnull().sum() == 0:
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            df[col] = df[col].fillna(df[col].median())
        else:
            mode_val = df[col].mode()
            df[col] = df[col].fillna(mode_val[0] if len(mode_val) else "Unknown")
    return df


def _standardize_strings(df: pd.DataFrame) -> pd.DataFrame:
    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].astype(str).str.strip()
    return df
