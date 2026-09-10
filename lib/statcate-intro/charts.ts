import type { EChartsOption } from "echarts";
import { INTRO_COLORS, INTRO_FONT } from "@/lib/statcate-intro/constants";
import { introAxisTooltipFormatter, introTooltipBase } from "@/lib/statcate-intro/tooltip";
import type { TrendYAxisMode } from "@/lib/statcate-intro/types";

const text = { fontFamily: INTRO_FONT };

/** Shared plot box so paired trend + bar cards align top/bottom axes. */
const ALIGNED_GRID = { left: 12, right: 16, top: 40, bottom: 28, containLabel: true } as const;

export type ChartTooltipMeta = {
  lng?: string;
  year?: string;
  valueLabel?: string;
  formatValue?: (value: number, seriesName?: string) => string;
};

function compactAxisNumber(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${Number((value / 1_000_000).toFixed(1))}M`;
  if (abs >= 10_000) return `${Number((value / 1_000).toFixed(0))}k`;
  if (Number.isInteger(value)) return String(value);
  return Number(value.toFixed(1)).toString();
}

function niceStep(span: number) {
  const raw = span / 4;
  const mag = 10 ** Math.floor(Math.log10(Math.max(raw, 1e-9)));
  const err = raw / mag;
  if (err <= 1) return mag;
  if (err <= 2) return 2 * mag;
  if (err <= 5) return 5 * mag;
  return 10 * mag;
}

function trendYAxis(series: { data: (number | null)[] }[], mode: TrendYAxisMode) {
  if (mode === "fromZero") return { min: 0 };
  const values = series.flatMap((item) => item.data).filter((v): v is number => v != null && Number.isFinite(v));
  if (!values.length) return { min: 0 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, Math.abs(max) * 0.08, 1);
  if (min >= 0 && min <= span * 0.4) return { min: 0 };
  const step = niceStep(span);
  const lo = Math.floor((min - span * 0.2) / step) * step;
  const hi = Math.ceil((max + span * 0.12) / step) * step;
  return { min: min >= 0 ? Math.max(0, lo) : lo, max: hi };
}

function chartTooltip(meta?: ChartTooltipMeta) {
  return {
    ...introTooltipBase,
    formatter: introAxisTooltipFormatter(meta),
  };
}

export function trendChartOption(
  years: string[],
  series: { name: string; data: (number | null)[] }[],
  colors: string[] = INTRO_COLORS,
  yAxis: TrendYAxisMode = "fromZero",
  tooltip?: ChartTooltipMeta,
): EChartsOption {
  return {
    color: colors,
    textStyle: text,
    tooltip: { trigger: "axis", ...chartTooltip(tooltip) },
    legend: {
      top: 0,
      left: "center",
      itemGap: 18,
      itemWidth: 10,
      itemHeight: 10,
      padding: [0, 0, 0, 0],
      textStyle: { ...text, color: "#5b6b80", fontSize: 12 },
    },
    grid: { ...ALIGNED_GRID },
    xAxis: {
      type: "category",
      data: years,
      axisLabel: { ...text, color: "#64748b", margin: 8 },
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: "value",
      scale: true,
      ...trendYAxis(series, yAxis),
      splitNumber: 4,
      splitLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: {
        ...text,
        color: "#64748b",
        formatter: compactAxisNumber,
      },
    },
    series: series.map((item) => ({
      name: item.name,
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 7,
      connectNulls: false,
      data: item.data,
    })),
  };
}

export function groupedBarOption(
  categories: string[],
  series: { name: string; data: number[] }[],
  colors: string[] = INTRO_COLORS,
  tooltip?: ChartTooltipMeta,
): EChartsOption {
  return {
    color: colors,
    textStyle: text,
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...chartTooltip(tooltip) },
    legend: {
      top: 0,
      left: "center",
      itemGap: 22,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { ...text, color: "#5b6b80", fontSize: 12 },
    },
    grid: { ...ALIGNED_GRID, left: 52 },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: { ...text, color: "#475569", interval: 0 },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: { ...text, color: "#64748b", formatter: compactAxisNumber },
    },
    series: series.map((item) => ({
      name: item.name,
      type: "bar",
      data: item.data,
      barMaxWidth: 28,
      itemStyle: { borderRadius: [8, 8, 0, 0] },
    })),
  };
}

export function categoryBarOption(
  categories: string[],
  values: number[],
  color = INTRO_COLORS[0],
  suffix = "",
  tooltip?: ChartTooltipMeta,
): EChartsOption {
  return {
    color: [color],
    textStyle: text,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      ...chartTooltip({
        ...tooltip,
        valueLabel: tooltip?.valueLabel ?? "",
        formatValue:
          tooltip?.formatValue ??
          ((value) => `${Number.isFinite(value) ? value : ""}${suffix}`),
      }),
    },
    legend: { show: false },
    grid: { ...ALIGNED_GRID },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: { ...text, color: "#475569", interval: 0 },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      min: values.some((value) => value < 0) ? undefined : 0,
      splitLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: {
        ...text,
        color: "#64748b",
        formatter: (value: number) => `${compactAxisNumber(value)}${suffix}`,
      },
    },
    series: [
      {
        type: "bar",
        name: tooltip?.valueLabel || undefined,
        data: values,
        barMaxWidth: 42,
        itemStyle: { borderRadius: [8, 8, 0, 0] },
      },
    ],
  };
}

export function regionBarOption(
  rows: { name: string; value: number | null }[],
  color = INTRO_COLORS[0],
  tooltip?: ChartTooltipMeta,
): EChartsOption {
  return {
    color: [color],
    textStyle: text,
    tooltip: {
      trigger: "axis",
      ...chartTooltip(tooltip),
    },
    grid: { ...ALIGNED_GRID, left: 8 },
    xAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: {
        ...text,
        color: "#64748b",
        hideOverlap: true,
        margin: 6,
        formatter: compactAxisNumber,
      },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: rows.map((item) => item.name),
      axisLabel: {
        ...text,
        color: "#475569",
        width: 128,
        overflow: "truncate",
        // ellipsis: "…",
      },
    },
    series: [
      {
        type: "bar",
        name: tooltip?.valueLabel || undefined,
        data: rows.map((item) => item.value),
        barMaxWidth: 16,
        barCategoryGap: "28%",
        itemStyle: { borderRadius: [0, 8, 8, 0] },
      },
    ],
  };
}
