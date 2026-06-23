"""Lets the user chat with an LLM that has full context of the analyzed dataset,
acting as an expert data analyst and business consultant.

Requires an ANTHROPIC_API_KEY environment variable. Without one, `ask()` raises
a clear error instead of silently failing.
"""
import os

import pandas as pd

MODEL = "claude-sonnet-4-5"

SYSTEM_PROMPT = """\
You are an expert data analyst and business consultant. You think like a seasoned \
business intelligence professional: precise with numbers, clear about uncertainty, \
and always tying findings back to concrete business decisions (pricing, staffing, \
marketing spend, risk, growth opportunities).

You have been given a structured summary of a dataset that has already been cleaned \
and analyzed (column stats, detected trends, and forecasts). Use it as your primary \
source of truth — don't invent numbers that aren't in the summary. If the user asks \
something the summary can't answer, say so plainly and suggest what additional data \
or analysis would be needed.

Keep answers focused and practical. Use plain business language, not jargon, unless \
the user asks for technical detail.
"""


def build_context(df: pd.DataFrame, log: dict, forecasts: dict, yearly: dict) -> dict:
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


def _context_to_prompt(context: dict) -> str:
    lines = [
        f"Rows: {context['rows_in']} originally -> {context['rows_out']} after cleaning "
        f"({context['duplicates_removed']} duplicates removed).",
        f"Columns: {', '.join(context['columns'])}",
        f"Date column used for trends: {context.get('date_column') or 'none detected'}",
        "",
        "Numeric column summary:",
    ]
    for col, stats in context["numeric_summary"].items():
        lines.append(
            f"- {col}: mean={stats['mean']}, median={stats['median']}, std={stats['std']}, "
            f"min={stats['min']}, max={stats['max']}"
        )

    if context["forecasts"]:
        lines.append("\nShort-horizon forecasts:")
        for metric, f in context["forecasts"].items():
            lines.append(
                f"- {metric}: recent average {f['recent_actual_avg']} -> forecast average "
                f"{f['forecast_avg']} over the next {f['forecast_horizon_days']} days"
            )

    if context["yearly_comparison"]:
        lines.append("\nYear-over-year comparison:")
        for metric, c in context["yearly_comparison"].items():
            lines.append(
                f"- {metric}: {c['this_year']} total = {c['this_year_total']}, "
                f"{c['next_year']} projected total = {c['next_year_total']} "
                f"({c['pct_change']:+.1f}%)"
            )

    return "\n".join(lines)


def ask(context: dict, message: str, history: list[dict] | None = None) -> str:
    """Ask a question about the analyzed dataset. `history` is a list of
    {"role": "user"|"assistant", "content": str} from earlier turns in the conversation."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set. Set it as an environment variable to enable chat "
            "(e.g. `export ANTHROPIC_API_KEY=sk-ant-...` before running the server)."
        )

    try:
        import anthropic
    except ImportError as exc:
        raise RuntimeError(
            "The 'anthropic' package is not installed. Run `pip install anthropic`."
        ) from exc

    client = anthropic.Anthropic(api_key=api_key)

    messages = list(history or [])
    messages.append({"role": "user", "content": message})

    system = SYSTEM_PROMPT + "\n\nDataset summary:\n" + _context_to_prompt(context)

    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=system,
        messages=messages,
    )
    return "".join(block.text for block in response.content if block.type == "text")
