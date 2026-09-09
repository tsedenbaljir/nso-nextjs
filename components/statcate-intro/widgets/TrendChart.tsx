"use client";

import ReactECharts from "echarts-for-react";
import { TrendMark } from "@/lib/statcate-intro/marks";
import { COPY, INTRO_COLORS } from "@/lib/statcate-intro/constants";
import { formatValue, loc } from "@/lib/statcate-intro/format";
import { trendChartOption } from "@/lib/statcate-intro/charts";
import { hasYear, listYears, nationalValue, timeDimOf, yearOrLatest } from "@/lib/statcate-intro/query";
import type { TrendWidget } from "@/lib/statcate-intro/types";
import type { IntroDashboardState } from "@/components/statcate-intro/useIntroDashboard";

type Props = {
  widget: TrendWidget;
  dash: IntroDashboardState;
  chartHeight?: number;
};

export default function TrendChart({ widget, dash, chartHeight }: Props) {
  const { config, tables, lng } = dash;
  if (!config) return null;

  const ids = widget.tables ?? config.tables.map((table) => table.id);
  const selected = ids
    .map((id) => tables.find((table) => table.id === id))
    .filter((table): table is NonNullable<typeof table> => Boolean(table));
  const labels = [
    ...new Set(selected.flatMap((table) => listYears(table.rows, timeDimOf(config, table)))),
  ].sort((a, b) => Number(a) - Number(b));
  const option = trendChartOption(
    labels,
    selected.map((table) => {
      return {
        name: table.label,
        data: labels.map((year) =>
          hasYear(table.rows, config, year, table)
            ? nationalValue(table.rows, config, yearOrLatest(table.rows, config, year, table, false), undefined, table)
            : null,
        ),
      };
    }),
    config.palette ?? INTRO_COLORS,
    widget.yAxis ?? (selected.every((table) => table.format === "percent" || table.format === "decimal") ? "nice" : "fromZero"),
    {
      lng,
      formatValue: (value, seriesName) => {
        const table = selected.find((item) => item.label === seriesName);
        return formatValue(value, lng, table?.format ?? selected[0]?.format ?? "count");
      },
    },
  );
  const icon = config.sectionIcons?.trend;
  const height = widget.height ?? chartHeight ?? 320;

  return (
    <div className="sector-intro-panel">
      <h4>
        {icon ? (
          <img className="sector-intro-panel-icon" src={icon} alt="" width={28} height={28} />
        ) : (
          <TrendMark size={16} />
        )}
        {loc(lng, widget.title ?? COPY.trend)}
      </h4>
      <div className="sector-intro-chart" style={{ height }}>
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} notMerge />
      </div>
    </div>
  );
}
