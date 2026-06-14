import os
import logging
import json
from typing import Optional

import pandas as pd
from groq import Groq
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


class RAGSystem:
    def __init__(self):
        self.groq = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
        self.df: Optional[pd.DataFrame] = None
        self.chunks: list[str] = []
        self.chunk_meta: list[dict] = []
        self.vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        self.tfidf_matrix = None

    def reset(self):
        self.df = None
        self.chunks = []
        self.chunk_meta = []
        self.tfidf_matrix = None

    def index_dataframe(self, df: pd.DataFrame, dataset_name: str):
        self.df = df
        self.chunks = []
        self.chunk_meta = []

        # Schema chunk
        schema_lines = [f"Dataset: {dataset_name}", f"Shape: {df.shape[0]} rows × {df.shape[1]} columns", "Columns:"]
        for col in df.columns:
            dtype = str(df[col].dtype)
            if pd.api.types.is_numeric_dtype(df[col]):
                schema_lines.append(f"  {col} ({dtype}): min={df[col].min():.2f}, max={df[col].max():.2f}, mean={df[col].mean():.2f}")
            else:
                top = df[col].value_counts().head(3).index.tolist()
                schema_lines.append(f"  {col} ({dtype}): top values = {top}")
        self.chunks.append("\n".join(schema_lines))
        self.chunk_meta.append({"type": "schema", "dataset": dataset_name})

        # Aggregate summary chunks
        num_cols = df.select_dtypes(include="number").columns.tolist()
        if num_cols:
            agg = df[num_cols].describe().to_string()
            self.chunks.append(f"Numeric summary for {dataset_name}:\n{agg}")
            self.chunk_meta.append({"type": "aggregate", "dataset": dataset_name})

        cat_cols = df.select_dtypes(include="object").columns.tolist()
        for cat in cat_cols[:5]:
            vc = df[cat].value_counts().head(10)
            chunk = f"Value distribution for '{cat}':\n" + vc.to_string()
            self.chunks.append(chunk)
            self.chunk_meta.append({"type": "distribution", "column": cat, "dataset": dataset_name})

        # Row-level chunks (every 100 rows)
        chunk_size = 100
        for start in range(0, min(len(df), 2000), chunk_size):
            end = min(start + chunk_size, len(df))
            sample = df.iloc[start:end]
            row_text = f"Rows {start}–{end} of {dataset_name}:\n{sample.to_string(index=False, max_cols=10)}"
            self.chunks.append(row_text)
            self.chunk_meta.append({"type": "rows", "start": start, "end": end, "dataset": dataset_name})

        # Fit TF-IDF on all chunks
        if self.chunks:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.chunks)
            logger.info(f"Indexed {len(self.chunks)} chunks with TF-IDF")

    def _retrieve(self, question: str, top_k: int = 3) -> list[str]:
        if self.tfidf_matrix is not None and len(self.chunks) > 0:
            try:
                query_vec = self.vectorizer.transform([question])
                scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
                top_indices = scores.argsort()[::-1][:top_k]
                return [self.chunks[i] for i in top_indices]
            except Exception:
                pass

        # Keyword fallback
        q_lower = question.lower()
        scored = [(c, sum(1 for w in q_lower.split() if w in c.lower())) for c in self.chunks]
        scored.sort(key=lambda x: x[1], reverse=True)
        return [c for c, _ in scored[:top_k]]

    def query(self, question: str, dataset_name: str) -> dict:
        if not self.groq:
            raise RuntimeError("GROQ_API_KEY not configured")

        context_chunks = self._retrieve(question, top_k=3)
        truncated = [c[:500] for c in context_chunks]
        context = "\n\n---\n\n".join(truncated)

        system_prompt = (
            "You are DataPulse AI, an expert enterprise data analyst. "
            "You have access to real data from the user's uploaded dataset. "
            "Answer questions precisely using the provided data context. "
            "Include specific numbers, percentages, and trends from the data. "
            "If you reference specific rows or values, cite them. "
            "Never make up data that isn't in the context."
        )

        user_prompt = (
            f"Dataset: {dataset_name}\n\n"
            f"Data Context:\n{context}\n\n"
            f"Question: {question}\n\n"
            "Provide a detailed, data-driven answer with specific numbers from the context."
        )

        response = self.groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.1,
            max_tokens=1024,
        )

        answer = response.choices[0].message.content
        tokens_used = response.usage.total_tokens if response.usage else 0

        # Extract sample source rows
        source_rows = []
        if self.df is not None:
            for chunk in context_chunks[:2]:
                if "Rows" in chunk:
                    try:
                        lines = chunk.split("\n")[1:6]
                        source_rows.extend([l.strip() for l in lines if l.strip()])
                    except Exception:
                        pass

        confidence = min(0.95, 0.5 + len(context_chunks) * 0.08)

        return {
            "answer": answer,
            "source_rows": source_rows[:5],
            "chunks_used": len(context_chunks),
            "confidence": round(confidence, 2),
            "tokens_used": tokens_used,
            "dataset": dataset_name,
        }

    def generate_insights(self, df: pd.DataFrame, dataset_name: str) -> list[dict]:
        if not self.groq:
            raise RuntimeError("GROQ_API_KEY not configured")

        num_cols = df.select_dtypes(include="number").columns.tolist()
        cat_cols = df.select_dtypes(include="object").columns.tolist()

        stats_parts = [f"Dataset: {dataset_name}", f"Shape: {df.shape[0]} rows × {df.shape[1]} cols"]
        if num_cols:
            stats_parts.append("Numeric stats:\n" + df[num_cols].describe().round(2).to_string())
        for c in cat_cols[:3]:
            stats_parts.append(f"\nTop '{c}' values:\n" + df[c].value_counts().head(5).to_string())

        context = "\n\n".join(stats_parts)

        prompt = (
            f"You are a senior data analyst. Analyze this dataset and return exactly 6 business insights as JSON.\n\n"
            f"{context}\n\n"
            "Return ONLY a JSON array with this structure (no markdown, no extra text):\n"
            '[\n'
            '  {\n'
            '    "title": "Short insight title",\n'
            '    "description": "2-3 sentence insight with specific numbers",\n'
            '    "type": "trend|anomaly|opportunity|risk|performance|pattern",\n'
            '    "confidence": 0.85,\n'
            '    "action": "Recommended action in one sentence"\n'
            '  }\n'
            ']'
        )

        response = self.groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=2048,
        )

        raw = response.choices[0].message.content.strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        try:
            insights = json.loads(raw)
            if not isinstance(insights, list):
                insights = [insights]
            return insights[:8]
        except json.JSONDecodeError:
            return [{
                "title": "Data Analysis Complete",
                "description": f"Dataset '{dataset_name}' contains {df.shape[0]} rows and {df.shape[1]} columns ready for analysis.",
                "type": "pattern",
                "confidence": 0.9,
                "action": "Run specific queries to explore patterns in your data.",
            }]
