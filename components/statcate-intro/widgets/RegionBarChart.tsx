"use client";

import ReactECharts from "echarts-for-react";
import { MapMark } from "@/lib/statcate-intro/marks";
import { COPY, INTRO_COLORS } from "@/lib/statcate-intro/constants";
import { loc, num, trimLabel } from "@/lib/statcate-intro/format";
import { regionBarOption } from "@/lib/statcate-intro/charts";
import { geoDimOf, queryRows, yearOrLatest } from "@/lib/statcate-intro/query";
import type { RegionBarsWidget } from "@/lib/statcate-intro/types";
import type { IntroDashboardState } from "@/components/statcate-intro/useIntroDashboard";

type Props = {
  widget: RegionBarsWidget;
  dash: IntroDashboardState;
};

export default function RegionBarChart({ widget, dash }: Props) {
  const { config, tablesById, year, lng } = dash;
  if (!config || !year) return null;

  const table = tablesById[widget.table];
  const geo = geoDimOf(config, table);
  if (!table || !geo) return null;

  const barYear = yearOrLatest(table.rows, config, year);
  const rows = queryRows(
    table.rows,
    config,
    {
      year: barYear,
      category: config.dimensions.category ? "total" : undefined,
      geo: widget.geoMode === "all" ? "all" : "aimags",
    },
    table,
  )
    .map((row) => ({
      name: trimLabel(row[geo]),
      value: num(row.value),
    }))
    .filter((item) => item.name)
    .sort((a, b) => b.value - a.value);

  const height = Math.min(480, Math.max(340, rows.length * 22));
  const title = widget.title ? loc(lng, widget.title) : loc(lng, COPY.byRegion);

  return (
    <div className="sector-intro-panel">
      <h4>
        <MapMark size={16} />
        {title}
        {barYear !== year ? <span> · {barYear}</span> : null}
      </h4>
      <div className="sector-intro-chart" style={{ height }}>
        <ReactECharts
          option={regionBarOption(rows, (config.palette ?? INTRO_COLORS)[0])}
          style={{ height: "100%" }}
          notMerge
        />
      </div>
    </div>
  );
}
