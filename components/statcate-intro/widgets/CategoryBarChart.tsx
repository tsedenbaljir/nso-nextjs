"use client";

import ReactECharts from "echarts-for-react";
import { INTRO_COLORS } from "@/lib/statcate-intro/constants";
import { categoryBarOption } from "@/lib/statcate-intro/charts";
import { loc, num, trimLabel } from "@/lib/statcate-intro/format";
import { dimLabel, yearOrLatest } from "@/lib/statcate-intro/query";
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

  const usedYear = yearOrLatest(table.rows, config, year);
  const rows = table.rows
    .filter((row) => dimLabel(row, config.dimensions.time) === usedYear)
    .map((row) => {
      const raw = trimLabel(row[widget.dimension]);
      return {
        name: widget.labelMap?.[raw] ?? raw,
        value: num(row.value),
      };
    })
    .filter((item) => item.name);

  if (!rows.length) return null;

  const suffix = table.format === "percent" ? "%" : "";
  const option = categoryBarOption(
    rows.map((item) => item.name),
    rows.map((item) => item.value),
    (config.palette ?? INTRO_COLORS)[0],
    suffix,
  );
  const height = widget.height ?? 320;
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
