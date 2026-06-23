"""Builds a professional-looking PNG dashboard from any cleaned dataset + forecasts."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import pandas as pd
import numpy as np

from src.forecaster import ID_LIKE_PATTERNS

PALETTE = {"actual": "#2563eb", "forecast": "#f97316", "bar": "#10b981", "accent": "#6366f1"}
MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _style_axis(ax, title):
    ax.set_title(title, fontsize=12, fontweight="bold", color="#1e293b")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.grid(axis="y", alpha=0.3)


def build_dashboard(
    df: pd.DataFrame,
    date_col: str | None,
    forecasts: dict,
    yearly: dict,
    output_path: str,
) -> list[str]:
    """Render charts into a single dashboard image. Returns list of chart titles included."""
    already_charted = set(forecasts.keys()) | set(yearly.keys())
    numeric_cols = [
        c for c in df.select_dtypes(include="number").columns
        if c not in already_charted
        and c.lower() != "id"
        and not any(p in c.lower() for p in ID_LIKE_PATTERNS)
    ]
    n_forecast_charts = len(forecasts)
    n_yearly_charts = len(yearly)
    n_extra = min(2, len(numeric_cols))
    total_charts = max(1, n_forecast_charts + n_yearly_charts + n_extra)

    cols = 2
    rows = int(np.ceil(total_charts / cols))
    fig, axes = plt.subplots(rows, cols, figsize=(13, 4.5 * rows))
    fig.suptitle("Data Scientist AI — Dashboard", fontsize=18, fontweight="bold", color="#0f172a", y=1.0)
    axes = np.atleast_1d(axes).flatten()

    chart_titles = []
    idx = 0

    for metric, payload in forecasts.items():
        ax = axes[idx]
        data = payload["data"]
        actual = data[data["type"] == "actual"]
        forecast = data[data["type"] == "forecast"]
        ax.plot(actual["date"], actual["value"], color=PALETTE["actual"], label="Actual", linewidth=2)
        ax.plot(forecast["date"], forecast["value"], color=PALETTE["forecast"], label="Forecast",
                linewidth=2, linestyle="--")
        ax.axvline(actual["date"].iloc[-1], color="#94a3b8", linestyle=":", linewidth=1)
        ax.legend(loc="upper left", fontsize=9, frameon=False)
        ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %d"))
        _style_axis(ax, f"{metric.replace('_',' ').title()} — Trend & Forecast")
        chart_titles.append(f"{metric.replace('_',' ').title()} trend and {len(forecast)}-day forecast")
        idx += 1

    for metric, comp in yearly.items():
        ax = axes[idx]
        x = np.arange(12)
        groups = [(comp["this_year"], comp["this_year_monthly"], False)] + [
            (y["year"], y["monthly"], True) for y in comp["years"]
        ]
        n_groups = len(groups)
        width = 0.8 / n_groups
        forecast_shades = np.linspace(0.6, 1.0, max(len(comp["years"]), 1))
        forecast_idx = 0
        for i, (year, monthly, is_forecast) in enumerate(groups):
            offset = (i - (n_groups - 1) / 2) * width
            if is_forecast:
                color = PALETTE["forecast"]
                alpha = forecast_shades[forecast_idx]
                forecast_idx += 1
                label = f"{year} (forecast)"
            else:
                color = PALETTE["actual"]
                alpha = 1.0
                label = str(year)
            ax.bar(x + offset, monthly.values, width, color=color, alpha=alpha, label=label)
        ax.set_xticks(x)
        ax.set_xticklabels(MONTH_LABELS, fontsize=8)
        ax.legend(loc="upper left", fontsize=8, frameon=False)
        last_year = comp["years"][-1]["year"]
        _style_axis(ax, f"{metric.replace('_',' ').title()} — {comp['this_year']} vs {last_year}")
        chart_titles.append(
            f"{metric.replace('_',' ').title()}: {comp['this_year']} vs {last_year} forecast "
            f"({comp['years'][-1]['pct_change']:+.1f}%)"
        )
        idx += 1

    for col in numeric_cols[:n_extra]:
        if idx >= len(axes):
            break
        ax = axes[idx]
        ax.hist(df[col].dropna(), bins=20, color=PALETTE["bar"], edgecolor="white")
        _style_axis(ax, f"Distribution of {col.replace('_', ' ').title()}")
        chart_titles.append(f"Distribution of {col.replace('_', ' ').title()}")
        idx += 1

    for j in range(idx, len(axes)):
        axes[j].axis("off")

    plt.tight_layout(rect=[0, 0, 1, 0.97])
    plt.savefig(output_path, dpi=150, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    return chart_titles
