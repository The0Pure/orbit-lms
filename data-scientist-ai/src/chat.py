"""Lets the user chat with a local LLM that has full context of the analyzed dataset,
acting as an expert data analyst and business consultant.

Runs entirely against a local Ollama server (https://ollama.com) — no external API key,
no data leaving the machine. Requires Ollama to be running locally with a model pulled,
e.g. `ollama pull llama3.1`. Without Ollama reachable, `ask()` raises a clear error
instead of silently failing.
"""
import json
import os
import urllib.error
import urllib.request

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.1")

SYSTEM_PROMPT = """\
You are an expert data analyst and business consultant. You think like a seasoned \
business intelligence professional: precise with numbers, clear about uncertainty, \
and always tying findings back to concrete business decisions (pricing, staffing, \
marketing spend, risk, growth opportunities).

Below is a JSON object with the exact, already-computed summary of a dataset (column \
stats, detected trends, and forecasts). This JSON is your ONLY source of truth:
- Quote numbers exactly as they appear in the JSON. Never recompute, round differently,
  estimate, or invent a number that isn't present in it.
- If the user asks something this JSON can't answer, say so plainly and suggest what
  additional data or analysis would be needed — do not guess.
- If a forecast or comparison section is missing/empty, that analysis was not run for
  this dataset; say so instead of making one up.

Keep answers focused and practical. Use plain business language, not jargon, unless
the user asks for technical detail.
"""


def build_context(df, log: dict, forecasts: dict, yearly: dict) -> dict:
    """Summarize the cleaned dataset, forecasts, and YoY comparisons into a compact,
    JSON-serializable dict that can be replayed into an LLM prompt later (no need to
    keep the original DataFrame around)."""
    numeric_summary = {}
    for col in df.select_dtypes(include="number").columns:
        s = df[col]
        numeric_summary[col] = {
            "mean": round(float(s.mean()), 4),
            "median": round(float(s.median()), 4),
            "std": round(float(s.std()), 4),
            "min": round(float(s.min()), 4),
            "max": round(float(s.max()), 4),
        }

    forecast_summary = {}
    for metric, payload in forecasts.items():
        data = payload["data"]
        actual = data[data["type"] == "actual"]["value"]
        forecast = data[data["type"] == "forecast"]["value"]
        forecast_summary[metric] = {
            "recent_actual_avg": round(float(actual.tail(min(7, len(actual))).mean()), 4),
            "forecast_avg": round(float(forecast.mean()), 4),
            "forecast_horizon_days": int(len(forecast)),
        }

    yearly_summary = {
        metric: {
            "this_year": comp["this_year"],
            "next_year": comp["next_year"],
            "this_year_total": round(float(comp["this_year_total"]), 4),
            "next_year_total": round(float(comp["next_year_total"]), 4),
            "pct_change": round(float(comp["pct_change"]), 2),
        }
        for metric, comp in yearly.items()
    }

    return {
        "rows_in": log["rows_in"],
        "rows_out": log["rows_out"],
        "duplicates_removed": log["duplicates_removed"],
        "missing_filled": log["missing_filled"],
        "date_column": log.get("date_column"),
        "columns": list(df.columns),
        "numeric_summary": numeric_summary,
        "forecasts": forecast_summary,
        "yearly_comparison": yearly_summary,
    }


def ask(context: dict, message: str, history: list[dict] | None = None) -> str:
    """Ask a question about the analyzed dataset. `history` is a list of
    {"role": "user"|"assistant", "content": str} from earlier turns in the conversation."""
    system = SYSTEM_PROMPT + "\n\nDataset summary (JSON):\n" + json.dumps(context, indent=2)

    messages = [{"role": "system", "content": system}]
    messages.extend(history or [])
    messages.append({"role": "user", "content": message})

    payload = json.dumps(
        {
            "model": OLLAMA_MODEL,
            "messages": messages,
            "stream": False,
            "options": {"temperature": 0},
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        f"{OLLAMA_HOST}/api/chat",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=120) as resp:
            body = json.loads(resp.read())
    except urllib.error.URLError as exc:
        raise RuntimeError(
            f"Could not reach a local Ollama server at {OLLAMA_HOST}. Make sure Ollama is "
            f"running (`ollama serve`) and the model is pulled (`ollama pull {OLLAMA_MODEL}`)."
        ) from exc
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Ollama returned an error: {detail}") from exc

    return body.get("message", {}).get("content", "")
