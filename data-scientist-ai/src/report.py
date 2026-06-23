"""Generates a Word (.docx) report describing the dashboard and forecasts."""
from datetime import date
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH


def _heading(doc, text, level=1):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.color.rgb = RGBColor(0x1E, 0x40, 0xAF)
    return h


def build_report(
    df,
    log: dict,
    forecasts: dict,
    yearly: dict,
    chart_titles: list[str],
    dashboard_image: str,
    output_path: str,
):
    doc = Document()

    title = doc.add_heading("Data Scientist AI — Report", level=0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub = doc.add_paragraph(f"Generated on {date.today().isoformat()}")
    sub.alignment = WD_ALIGN_PARAGRAPH.CENTER

    _heading(doc, "1. Data Cleaning Summary")
    doc.add_paragraph(f"Rows before cleaning: {log['rows_in']}")
    doc.add_paragraph(f"Rows after cleaning: {log['rows_out']}")
    doc.add_paragraph(f"Duplicate rows removed: {log['duplicates_removed']}")
    if log["missing_filled"]:
        doc.add_paragraph("Missing values filled:")
        for col, count in log["missing_filled"].items():
            doc.add_paragraph(f"  • {col}: {count} values filled", style="List Bullet")
    else:
        doc.add_paragraph("No missing values were found.")
    if log.get("date_column"):
        doc.add_paragraph(f"Detected date column: {log['date_column']}")

    _heading(doc, "2. Dashboard")
    doc.add_paragraph(
        "The dashboard below summarizes key metrics, trends and distributions detected in the report."
    )
    doc.add_picture(dashboard_image, width=Inches(6.3))
    doc.add_paragraph("Charts included:")
    for t in chart_titles:
        doc.add_paragraph(t, style="List Bullet")

    _heading(doc, "3. Forecasts")
    if forecasts:
        for metric, payload in forecasts.items():
            data = payload["data"]
            forecast_rows = data[data["type"] == "forecast"]
            last_actual = data[data["type"] == "actual"]["value"].iloc[-1]
            avg_forecast = forecast_rows["value"].mean()
            trend = "increase" if avg_forecast > last_actual else "decrease"
            doc.add_paragraph(
                f"{metric.replace('_',' ').title()} (column '{payload['column']}'): the model projects an average "
                f"{trend} over the next {len(forecast_rows)} days, from a last observed daily value of "
                f"{last_actual:.2f} to an average forecasted daily value of {avg_forecast:.2f}."
            )
    else:
        doc.add_paragraph(
            "No forecastable numeric metrics with a usable date column were found in this report."
        )

    _heading(doc, "4. Year-over-Year Comparison")
    if yearly:
        for metric, comp in yearly.items():
            direction = "growth" if comp["pct_change"] >= 0 else "decline"
            doc.add_paragraph(
                f"{metric.replace('_',' ').title()}: {comp['this_year']} total was {comp['this_year_total']:.2f}. "
                f"Based on current trends, {comp['next_year']} is projected to total "
                f"{comp['next_year_total']:.2f} — a {abs(comp['pct_change']):.1f}% {direction} "
                f"year-over-year."
            )
    else:
        doc.add_paragraph(
            "Not enough date-stamped data was found to compare this year against next year's projection."
        )

    _heading(doc, "5. Key Takeaways")
    doc.add_paragraph(
        f"The dataset contains {log['rows_out']} clean records after removing "
        f"{log['duplicates_removed']} duplicates. "
        + (
            f"Forecasts were generated for: {', '.join(forecasts.keys())}."
            if forecasts
            else "Add a date column and at least one numeric metric column "
            "to enable forecasting in future reports."
        )
    )

    doc.save(output_path)
