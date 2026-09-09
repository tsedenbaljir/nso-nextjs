"use client";

import { INTRO_COLORS } from "@/lib/statcate-intro/constants";
import { finiteNum, formatValue, loc, trimLabel } from "@/lib/statcate-intro/format";
import { isTotalLabel, rowsForYear } from "@/lib/statcate-intro/query";
import type { CategoryStatsWidget } from "@/lib/statcate-intro/types";
import type { IntroDashboardState } from "@/components/statcate-intro/useIntroDashboard";

type Props = {
  widget: CategoryStatsWidget;
  dash: IntroDashboardState;
};

export default function CategoryStats({ widget, dash }: Props) {
  const { config, tablesById, year, lng } = dash;
  if (!config || !year) return null;

  const table = tablesById[widget.table];
  if (!table) return null;

  const { year: usedYear, rows: yearRows } = rowsForYear(table.rows, config, year, table);
  const totals = widget.totals ?? ["Бүгд", "Нийт", "Total", "All"];
  const items = yearRows
    .map((row) => {
      const raw = trimLabel(row[widget.dimension]);
      return {
        label: widget.labelMap?.[raw] ?? raw,
        value: finiteNum(row.value),
      };
    })
    .filter((item) => item.label && item.value != null && !isTotalLabel(item.label, totals));

  if (!items.length) return null;

  const title = widget.title ? loc(lng, widget.title) : table.label;

  return (
    <section className="sector-intro-hero">
      <h4 className="category-stats-title">
        {title}
        {usedYear !== year ? <span> · {usedYear}</span> : null}
      </h4>
      <div className="category-stats">
        {items.map((item, i) => (
          <article
            key={item.label}
            className="category-stats-card"
            style={{ ["--accent" as string]: (config.palette ?? INTRO_COLORS)[i % INTRO_COLORS.length] }}
          >
            <strong>{formatValue(item.value, lng, table.format)}</strong>
            <p>
              {item.label}
              {table.unit ? ` · ${table.unit}` : ""}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
