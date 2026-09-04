import type { EChartsOption } from "echarts";
import { INTRO_COLORS, INTRO_FONT } from "@/lib/statcate-intro/constants";
import type { TrendYAxisMode } from "@/lib/statcate-intro/types";

const text = { fontFamily: INTRO_FONT };
const tooltipBase = {
  extraCssText: `font-family: ${INTRO_FONT};`,
  textStyle: { fontFamily: INTRO_FONT, fontSize: 13 },
  className: "sector-intro-echart-tooltip",
};

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

export function trendChartOption(
  years: string[],
  series: { name: string; data: (number | null)[] }[],
  colors: string[] = INTRO_COLORS,
  yAxis: TrendYAxisMode = "fromZero",
): EChartsOption {
  return {
    color: colors,
    textStyle: text,
    tooltip: { trigger: "axis", ...tooltipBase },
    legend: {
      bottom: 0,
      itemGap: 22,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { ...text, color: "#5b6b80", fontSize: 12 },
    },
    grid: { left: 48, right: 18, top: 28, bottom: 44, containLabel: true },
    xAxis: { type: "category", data: years, axisLabel: { ...text, color: "#64748b" } },
    yAxis: {
      type: "value",
      scale: true,
      ...trendYAxis(series, yAxis),
      splitNumber: 4,
      splitLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: {
        ...text,
        color: "#64748b",
        formatter: (value: number) => (Number.isInteger(value) ? String(value) : Number(value.toFixed(1)).toString()),
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
): EChartsOption {
  return {
    color: colors,
    textStyle: text,
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...tooltipBase },
    legend: {
      bottom: 0,
      itemGap: 22,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { ...text, color: "#5b6b80", fontSize: 12 },
    },
    grid: { left: 52, right: 20, top: 16, bottom: 48 },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: { ...text, color: "#475569", interval: 0 },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: { ...text, color: "#64748b" },
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
): EChartsOption {
  return {
    color: [color],
    textStyle: text,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      ...tooltipBase,
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        const row = item as { name?: string; value?: number };
        return `${row.name ?? ""}: <b>${row.value ?? ""}${suffix}</b>`;
      },
    },
    legend: { show: false },
    grid: { left: 48, right: 18, top: 20, bottom: 36, containLabel: true },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: { ...text, color: "#475569", interval: 0 },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      min: 0,
      splitLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: {
        ...text,
        color: "#64748b",
        formatter: (value: number) => `${value}${suffix}`,
      },
    },
    series: [
      {
        type: "bar",
        data: values,
        barMaxWidth: 42,
        itemStyle: { borderRadius: [8, 8, 0, 0] },
      },
    ],
  };
}

export function regionBarOption(rows: { name: string; value: number }[], color = INTRO_COLORS[0]): EChartsOption {
  return {
    color: [color],
    textStyle: text,
    tooltip: { trigger: "axis", ...tooltipBase },
    grid: { left: 108, right: 16, top: 8, bottom: 24 },
    xAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: { ...text, color: "#64748b" },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: rows.map((item) => item.name),
      axisLabel: { ...text, color: "#475569", width: 96, overflow: "truncate" },
    },
    series: [
      {
        type: "bar",
        data: rows.map((item) => item.value),
        barMaxWidth: 14,
        itemStyle: { borderRadius: [0, 8, 8, 0] },
      },
    ],
  };
}
