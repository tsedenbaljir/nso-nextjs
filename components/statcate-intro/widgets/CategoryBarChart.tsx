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
  chartHeight?: number;
};

export default function CategoryBarChart({ widget, dash, chartHeight }: Props) {
  const { config, tablesById, year, lng } = dash;
  if (!config || !year) return null;

  const table = tablesById[widget.table];
  if (!table) return null;

  const { year: usedYear, rows: yearRows } = rowsForYear(table.rows, config, year, table, widget.fallbackYear ?? true);
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

  const chartRows = widget.categories
    ? widget.categories.map(({ code, label }) => {
        const row = code == null ? undefined : yearRows.find(
          (item) => String(item[`${widget.dimension}_code`]) === code,
        );
        return { name: loc(lng, label), value: finiteNum(row?.value) };
      })
    : rows;

  const suffix = table.format === "percent" ? "%" : "";
  const horizontal = widget.layout === "horizontal";
  const color = widget.color ?? (config.palette ?? INTRO_COLORS)[0];
  const tip = {
    lng,
    year: usedYear,
    valueLabel: table.unit || table.label,
    formatValue: (value: number) => formatValue(value, lng, table.format ?? "count"),
  };
  const option = horizontal
    ? regionBarOption(chartRows, color, tip)
    : categoryBarOption(
        chartRows.map((item) => item.name),
        chartRows.map((item) => item.value),
        color,
        suffix,
        tip,
      );
  if (widget.valueColorBands?.length) {
    option.visualMap = {
      type: "piecewise",
      show: false,
      dimension: 0,
      seriesIndex: 0,
      pieces: widget.valueColorBands.map(({ min, max, color }) => ({
        ...(min != null ? { gte: min } : {}),
        ...(max != null ? { lt: max } : {}),
        color,
      })),
    };
  }
  const height =
    widget.height ?? chartHeight ?? (horizontal ? Math.min(480, Math.max(320, rows.length * 30)) : 320);
  const title = widget.title ? loc(lng, widget.title) : table.label;

  return (
    <div className="sector-intro-panel">
      <h4>
        {title}
        {usedYear !== year ? <span> · {usedYear}</span> : null}
      </h4>
      <div className="sector-intro-chart" style={{ height }}>
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} notMerge />
      </div>
    </div>
  );
}
