"use client";

import ReactECharts from "echarts-for-react";
import { INTRO_COLORS } from "@/lib/statcate-intro/constants";
import { categoryBarOption, regionBarOption } from "@/lib/statcate-intro/charts";
import { loc, finiteNum, formatValue, trimLabel } from "@/lib/statcate-intro/format";
import { isTotalLabel, rowsForYear } from "@/lib/statcate-intro/query";
import type { CategoryBarsWidget } from "@/lib/statcate-intro/types";
import type { IntroDashboardState } from "@/components/statcate-intro/useIntroDashboard";

type Props = {
  widget: CategoryBarsWidget;
  dash: IntroDashboardState;
};

export default function CategoryBarChart({ widget, dash }: Props) {
  const { config, tablesById, year, lng } = dash;
  if (!config || !year) return null;

  const table = tablesById[widget.table];
  if (!table) return null;

  const { year: usedYear, rows: yearRows } = rowsForYear(table.rows, config, year, table);
  const totals = widget.totals ?? [];
  let rows = yearRows
    .map((row) => {
      const raw = trimLabel(row[widget.dimension]);
      const value = finiteNum(row.value);
      return {
        name: widget.labelMap?.[raw] ?? raw,
        value,
      };
    })
    .filter(
      (item): item is { name: string; value: number } =>
        Boolean(item.name) && item.value != null && (!totals.length || !isTotalLabel(item.name, totals)),
    );

  if (widget.top && rows.length > widget.top) {
    rows = [...rows]
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, widget.top)
      .sort((a, b) => b.value - a.value);
  }

  if (!rows.length) return null;

  const suffix = table.format === "percent" ? "%" : "";
  const horizontal = widget.layout === "horizontal";
  const tip = {
    lng,
    year: usedYear,
    valueLabel: table.unit || table.label,
    formatValue: (value: number) => formatValue(value, lng, table.format ?? "count"),
  };
  const option = horizontal
    ? regionBarOption(rows, (config.palette ?? INTRO_COLORS)[0], tip)
    : categoryBarOption(
        rows.map((item) => item.name),
        rows.map((item) => item.value),
        (config.palette ?? INTRO_COLORS)[0],
        suffix,
        tip,
      );
  const height = widget.height ?? (horizontal ? Math.min(480, Math.max(320, rows.length * 30)) : 320);
  const title = widget.title ? loc(lng, widget.title) : table.label;

  return (
    <div className="sector-intro-panel">
      <h4>
        {title}
        {usedYear !== year ? <span> · {usedYear}</span> : null}
      </h4>
      <div className="sector-intro-chart" style={{ height }}>
        <ReactECharts option={option} style={{ height, width: "100%" }} notMerge />
      </div>
    </div>
  );
}
