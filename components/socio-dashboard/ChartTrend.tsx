"use client";

import { type ReactNode, useState, useMemo, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { DataRow } from "@/lib/socio-dashboard/types";
import { RangeSlider } from "./RangeSlider";

const CHART_COLORS = {
  series: ["#0050C3", "#0891b2", "#64748b"],
  growth: "#10b981",
  muted: "#64748b",
  grid: "rgba(0, 80, 195, 0.06)",
};

/**
 * Улирал (2013-4), сар (2013-10), өдөр зэрэг түлхүүрүүдийг хугацааны дарааллаар эрэмбэлнэ.
 * Анхдагч string sort-оор "2013-10" &lt; "2013-2" болж график эвдэрдэг.
 */
function compareStatTimeKeys(a: string, b: string): number {
  const sa = String(a).trim();
  const sb = String(b).trim();
  if (sa === sb) return 0;
  if (/^\d+$/.test(sa) && /^\d+$/.test(sb)) return Number(sa) - Number(sb);
  const m1 = /^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/.exec(sa);
  const m2 = /^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/.exec(sb);
  if (m1 && m2) {
    const y1 = parseInt(m1[1], 10);
    const y2 = parseInt(m2[1], 10);
    const p1 = parseInt(m1[2], 10);
    const p2 = parseInt(m2[2], 10);
    const d1 = m1[3] ? parseInt(m1[3], 10) : 0;
    const d2 = m2[3] ? parseInt(m2[3], 10) : 0;
    if (y1 !== y2) return y1 - y2;
    if (p1 !== p2) return p1 - p2;
    return d1 - d2;
  }
  return sa.localeCompare(sb, undefined, { numeric: true });
}

interface ChartTrendProps {
  data: DataRow[];
  xKey: string;
  seriesKey?: string;
  valueKey?: string;
  showGrowth?: boolean;
  title: string;
  description?: string;
  enableSlicers?: boolean;
  excludeSeriesLabels?: string[];
  onRangeChange?: (endYear: string) => void;
  rangeYears?: [string, string];
  onRangeYearsChange?: (startYear: string, endYear: string) => void;
  showRangeSlider?: boolean;
  /** Play товч дарахад эхлэх жил (жишээ: "1989"). Хоосон бол өгөгдлийн эхнээс эхэлнэ. */
  rangeSliderPlayFromYear?: string;
  /** Tooltip болон value series-ийн нэр. Өгөгдөөгүй бол "Тоо". Жишээ: "Хүн ам:" */
  valueLabel?: string;
  /** Y тэнхлэгийн гарчиг. null бол гарчиг харуулахгүй, өгөгдөөгүй бол "Тоо". */
  valueAxisTitle?: string | null;
  colorVariant?: "default" | "muted" | "orange";
  mutedSeriesLabels?: string[];
  chartHeight?: number;
  /** Хоёр багана зэрэгцээ layout-д гарчиг давхардахгүй байхын тулд гарчиг/тайлбар блокийг нууна. */
  hideHeader?: boolean;
  /** Toggle товчны өмнө гарчгийн мөрөнд нэмэлт контент харуулах (жишээ: inline filter). */
  headerExtra?: ReactNode;
  /** true бол headerExtra-г гарчигны доор тооны урд (value row) харуулна; false/undefined бол гарчигны мөрөнд баруун талд (байсан байр). */
  headerExtraInValueRow?: boolean;
  /** Гарчигны мөрөнд (баруун талд) үргэлж харуулах контент (жишээ: 4 chart-г удирдах нэг toggle). */
  headerExtraTitleRow?: ReactNode;
  /** Сүүлийн хугацааны нийт утгыг chart-ийн дээр харуулах. */
  showLatestValue?: boolean;
  /** showLatestValue-н утгыг форматлах функц. Өгөгдөөгүй бол toLocaleString() ашиглана. */
  latestValueFormatter?: (value: number, period: string) => string;
  /** Гадаас удирдах metricMode (controlled). Өгөгдвөл дотоод state-г дарна. */
  controlledMetricMode?: "value" | "growth";
  /** Сүүлийн утгыг series-ээр шүүх (жишээ: ["Бүгд"] бол зөвхөн Бүгд series харуулна) */
  latestValueSeriesFilter?: string[];
  /** Олон series-ийн утгыг тус тусад нь харуулах (нийлбэр биш) */
  showLatestValueBySeries?: boolean;
  /** Series утгуудыг босоо чиглэлд харуулах (default: false = хэвтээ) */
  latestValueVertical?: boolean;
  /** Тасархай шугамаар харуулах series-үүд */
  dashedSeriesLabels?: string[];
  /** Tooltip-д нэгж харуулах (жишээ: "сая төгрөг", "ам.доллар") */
  tooltipUnit?: string;
  /** Tooltip-д утгыг форматлах функц. Жишээ: (v) => `${(v/1000).toFixed(1)} сая` */
  valueFormatter?: (value: number) => string;
  /** Y-axis-д утгыг форматлах функц (текстгүй, зөвхөн тоо). Жишээ: (v) => `${(v/1000).toFixed(0)}` */
  axisFormatter?: (value: number) => string;
  /** Series-д өнгө тодорхойлох (жишээ: { "Эрэгтэй": "#0050C3", "Эмэгтэй": "#0891b2" }) */
  seriesColorMap?: Record<string, string>;
  /** Y тэнхлэгийн хамгийн бага утга */
  yAxisMin?: number;
  /** Y тэнхлэгийн хамгийн их утга */
  yAxisMax?: number;
  /** Series label-г өөрчлөх (жишээ: { "Бүгд": "Улсын дундаж" }) */
  seriesLabelMap?: Record<string, string>;
  /** Chart-ийн дээд талын padding (default: 16) */
  gridTop?: number;
  /** Header/value section-ий доор зайг арилгах */
  noHeaderMargin?: boolean;
  /** Chart-ийн өмнөх зай (px) */
  chartMarginTop?: number;
  /** Гарчиг болон утгын хоорондох зай (default: "mt-2") */
  latestValueMarginClass?: string;
  /** Бүх series-д gradient area хэрэглэх (single series шиг харагдах) */
  forceGradientArea?: boolean;
  /** Y тэнхлэгийн хэвтээ тэнцүүлэгч: зээлийн жижиг картууд — solid, ипотек — dashed */
  yGridLineStyle?: "solid" | "dashed";
  /** Өөрчлөлт % горимд x тэнхлэг (жил) энэ утгаас эхлэн харуулах (жишээ: 1990). */
  growthFromYear?: number;
  /** Олон series-ийг stacked area болгох (жишээ өрхийн орлого/зарлагын гол chart) */
  seriesStackId?: string;
  /** true бол зураасны зүүн/баруун margin багасгаж өргөн зураг (зээлийн 2×2 гэх мэт) */
  widePlot?: boolean;
}

function computeGrowth(rows: DataRow[], xKey: string, valueKey: string): DataRow[] {
  const byX = new Map<string, number>();
  for (const r of rows) {
    const x = String(r[xKey]);
    const v = Number(r[valueKey]) || 0;
    byX.set(x, (byX.get(x) ?? 0) + v);
  }
  const sortedX = Array.from(byX.keys()).sort(compareStatTimeKeys);
  let prev = 0;
  return sortedX.map((x) => {
    const curr = byX.get(x) ?? 0;
    const growth = prev ? ((curr - prev) / prev) * 100 : 0;
    prev = curr;
    return { [xKey]: x, value: curr, growth: Math.round(growth * 10) / 10 } as DataRow;
  });
}

type MetricMode = "value" | "growth";

export function ChartTrend({
  data,
  xKey,
  seriesKey,
  valueKey = "value",
  showGrowth,
  title,
  description,
  enableSlicers = true,
  excludeSeriesLabels,
  onRangeChange,
  rangeYears,
  onRangeYearsChange,
  showRangeSlider = true,
  rangeSliderPlayFromYear,
  valueLabel = "Тоо",
  valueAxisTitle,
  colorVariant = "default",
  mutedSeriesLabels,
  chartHeight = 320,
  hideHeader = false,
  headerExtra,
  headerExtraInValueRow = false,
  headerExtraTitleRow,
  showLatestValue = true,
  latestValueFormatter,
  controlledMetricMode,
  latestValueSeriesFilter,
  showLatestValueBySeries = false,
  latestValueVertical = false,
  dashedSeriesLabels,
  seriesColorMap,
  yAxisMin,
  yAxisMax,
  seriesLabelMap,
  tooltipUnit,
  valueFormatter,
  axisFormatter,
  gridTop = 16,
  noHeaderMargin = false,
  chartMarginTop,
  latestValueMarginClass = "mt-2",
  forceGradientArea = false,
  yGridLineStyle = "dashed",
  growthFromYear,
  seriesStackId,
  widePlot = false,
}: ChartTrendProps) {
  const hasSeries = !!seriesKey && new Set(data.map((r) => r[seriesKey])).size > 1;

  const sortX = (arr: string[]) => {
    if (!arr.length) return arr;
    return [...arr].sort(compareStatTimeKeys);
  };

  const aggregated = hasSeries
    ? (() => {
        const byXAndSeries = new Map<string, number>();
        for (const r of data) {
          const x = String(r[xKey]);
          const s = String(r[seriesKey] ?? "Нийт");
          const v = Number(r[valueKey]) || 0;
          const k = `${x}\t${s}`;
          byXAndSeries.set(k, (byXAndSeries.get(k) ?? 0) + v);
        }
        const seriesNames = Array.from(new Set(data.map((r) => r[seriesKey]).filter(Boolean))) as string[];
        const xValues = sortX(Array.from(new Set(data.map((r) => String(r[xKey])))));
        return xValues.map((x) => {
          const row: DataRow = { [xKey]: x };
          let total = 0;
          for (const s of seriesNames) {
            const val = byXAndSeries.get(`${x}\t${s}`) ?? 0;
            row[String(s)] = val;
            total += val;
          }
          row.value = total;
          if (showGrowth) (row as DataRow).growth = 0;
          return row;
        });
      })()
    : computeGrowth(data, xKey, valueKey);

  const seriesNamesRaw = hasSeries
    ? (Array.from(new Set(data.map((r) => r[seriesKey]).filter(Boolean))) as string[])
    : ["value"];
  const seriesNames = excludeSeriesLabels?.length
    ? seriesNamesRaw.filter((n) => !excludeSeriesLabels.includes(n))
    : seriesNamesRaw;

  const sortedAggregated = useMemo(() => {
    if (!aggregated.length) return aggregated;
    return [...aggregated].sort((a, b) =>
      compareStatTimeKeys(String(a[xKey]), String(b[xKey]))
    );
  }, [aggregated, xKey]);

  const withGrowth = useMemo(() => {
    if (!showGrowth || !sortedAggregated.length) return sortedAggregated;
    const out = sortedAggregated.map((r) => ({ ...r }));
    
    if (hasSeries && seriesNames.length > 0) {
      const prevBySeriesMap: Record<string, number> = {};
      out.forEach((r) => {
        for (const sName of seriesNames) {
          const curr = Number(r[sName]) ?? 0;
          const prev = prevBySeriesMap[sName] ?? 0;
          (r as DataRow)[`${sName}_growth`] = prev ? Math.round(((curr - prev) / prev) * 1000) / 10 : 0;
          prevBySeriesMap[sName] = curr;
        }
        const totalCurr = Number(r.value) ?? 0;
        const totalPrev = prevBySeriesMap["__total__"] ?? 0;
        (r as DataRow).growth = totalPrev ? Math.round(((totalCurr - totalPrev) / totalPrev) * 1000) / 10 : 0;
        prevBySeriesMap["__total__"] = totalCurr;
      });
    } else {
      let prev = 0;
      out.forEach((r) => {
        const curr = Number(r.value) ?? 0;
        (r as DataRow).growth = prev ? Math.round(((curr - prev) / prev) * 1000) / 10 : 0;
        prev = curr;
      });
    }
    return out;
  }, [showGrowth, sortedAggregated, hasSeries, seriesNames]);

  const n = withGrowth.length;
  const isNumericX = n > 0 && /^\d+$/.test(String(withGrowth[0][xKey]));
  const isYearMonthX = n > 0 && /^\d{4}-\d{2}$/.test(String(withGrowth[0][xKey]));
  const isYearQuarterX = n > 0 && /^\d{4}-\d$/.test(String(withGrowth[0][xKey]));
  const isTimeLikeX = isNumericX || isYearMonthX || isYearQuarterX;
  const hasRangeYears = !!rangeYears;
  const isControlledRange = hasRangeYears && !!onRangeYearsChange;
  const [metricModeInternal, setMetricMode] = useState<MetricMode>("value");
  const metricMode: MetricMode = controlledMetricMode ?? metricModeInternal;
  const dataForDisplay = useMemo(() => {
    if (growthFromYear == null || !showGrowth) return withGrowth;
    if (metricMode !== "growth") return withGrowth;
    return withGrowth.filter((r) => {
      const x = r[xKey] ?? r[`${xKey}_code`];
      const y = typeof x === "number" ? x : parseInt(String(x), 10);
      return !isNaN(y) && y >= growthFromYear;
    });
  }, [withGrowth, growthFromYear, showGrowth, metricMode, xKey]);
  const nDisplay = dataForDisplay.length;
  const [range, setRange] = useState<[number, number]>([0, Math.max(0, nDisplay - 1)]);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rangeRef = useRef<[number, number]>([0, Math.max(0, nDisplay - 1)]);

  useEffect(() => {
    if (nDisplay > 0 && !hasRangeYears) setRange([0, nDisplay - 1]);
  }, [nDisplay, hasRangeYears]);

  const rangeFromProps = useMemo(() => {
    if (!rangeYears || nDisplay === 0) return null;
    const [startY, endY] = rangeYears;
    const getX = (i: number) => String(dataForDisplay[i]?.[xKey] ?? "");
    let cmpStart: (x: string) => boolean;
    let cmpEnd: (x: string) => boolean;
    if (isYearQuarterX) {
      cmpStart = (x: string) => x >= startY;
      cmpEnd = (x: string) => x <= endY;
    } else if (isYearMonthX) {
      const startCmp = startY.slice(0, 4) || startY;
      const endCmp = endY.slice(0, 4) || endY;
      cmpStart = (x: string) => x.slice(0, 4) >= startCmp;
      cmpEnd = (x: string) => x.slice(0, 4) <= endCmp;
    } else {
      cmpStart = (x: string) => x >= startY;
      cmpEnd = (x: string) => x <= endY;
    }
    let i0 = 0, i1 = nDisplay - 1;
    for (let i = 0; i < nDisplay; i++) {
      if (cmpStart(getX(i))) { i0 = i; break; }
    }
    for (let i = nDisplay - 1; i >= 0; i--) {
      if (cmpEnd(getX(i))) { i1 = i; break; }
    }
    return [i0, i1] as [number, number];
  }, [rangeYears, nDisplay, xKey, dataForDisplay, isYearMonthX, isYearQuarterX]);

  const rangeClamped: [number, number] = (hasRangeYears && rangeFromProps)
    ? rangeFromProps
    : [
        Math.max(0, Math.min(range[0], nDisplay - 1)),
        Math.max(0, Math.min(range[1], nDisplay - 1)),
      ];
  if (rangeClamped[0] > rangeClamped[1]) rangeClamped[0] = rangeClamped[1];
  rangeRef.current = rangeClamped;

  const onRangeChangeRef = useRef(onRangeChange);
  onRangeChangeRef.current = onRangeChange;
  const lastEmittedYearRef = useRef<string | null>(null);
  useEffect(() => {
    const endIndex = rangeClamped[1];
    if (!dataForDisplay.length || endIndex < 0) return;
    const endYear = String(dataForDisplay[endIndex]?.[xKey] ?? "");
    if (!endYear || lastEmittedYearRef.current === endYear) return;
    lastEmittedYearRef.current = endYear;
    onRangeChangeRef.current?.(endYear);
  }, [rangeClamped[1], nDisplay, xKey, dataForDisplay]);

  const windowSize = isYearMonthX
    ? Math.min(12 * 5, Math.max(12, nDisplay))
    : isYearQuarterX
      ? Math.min(4 * 5, Math.max(4, nDisplay))
      : Math.min(6, Math.max(3, nDisplay));
  useEffect(() => {
    if (!isPlaying || nDisplay <= 1) return;
    intervalRef.current = setInterval(() => {
      const [a, b] = rangeRef.current;
      if (b >= nDisplay - 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPlaying(false);
        return;
      }
      // Эхлэх оноосоо хойшоо: сар (12 алхам), улирал (4 алхам), бусад 1
      const step = isYearMonthX ? 12 : isYearQuarterX ? 4 : 1;
      const nextEnd = Math.min(b + step, nDisplay - 1);
      const nextStart = a;
      rangeRef.current = [nextStart, nextEnd];
      if (isControlledRange && onRangeYearsChange) {
        const startY = String(dataForDisplay[nextStart]?.[xKey] ?? "");
        const endY = String(dataForDisplay[nextEnd]?.[xKey] ?? "");
        onRangeYearsChange(startY, endY);
      } else {
        setRange([nextStart, nextEnd]);
      }
    }, 800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isPlaying, nDisplay, isControlledRange, onRangeYearsChange, dataForDisplay, xKey, isYearMonthX, isYearQuarterX]);

  const filteredData = useMemo(
    () => dataForDisplay.slice(rangeClamped[0], rangeClamped[1] + 1),
    [dataForDisplay, rangeClamped[0], rangeClamped[1]]
  );

  const showValueLines = controlledMetricMode != null
    ? controlledMetricMode === "value"
    : (!enableSlicers || metricMode === "value");
  const showGrowthLine = !!showGrowth && (
    controlledMetricMode != null
      ? controlledMetricMode === "growth"
      : (!enableSlicers || metricMode === "growth")
  );

  const colors = colorVariant === "muted"
    ? ["#64748b", "#94a3b8", "#cbd5e1", "#94a3b8"]
    : colorVariant === "orange"
    ? ["#f97316", "#fb923c", "#fdba74", "#fed7aa"]
    : CHART_COLORS.series;
  const defaultPrimaryColor = colorVariant === "muted" ? CHART_COLORS.muted : colorVariant === "orange" ? "#f97316" : CHART_COLORS.series[0];
  const primaryColor = seriesColorMap?.["value"] ?? defaultPrimaryColor;
  const mutedColor = CHART_COLORS.muted;
  const getSeriesColor = (name: string, index: number) => {
    if (seriesColorMap?.[name]) return seriesColorMap[name];
    if (mutedSeriesLabels?.includes(name)) return mutedColor;
    return colors[index % colors.length];
  };

  const option: EChartsOption = useMemo(() => {
    if (!filteredData.length) return {};
    const xData = filteredData.map((r) => String(r[xKey]));
    const series: EChartsOption["series"] = [];

    if (showValueLines) {
      seriesNames.forEach((name, i) => {
        const displayName = name === "value" ? (tooltipUnit || title || valueLabel) : name;
        const color = name === "value" ? primaryColor : getSeriesColor(name, i);
        const dataKey = name === "value" ? "value" : name;
        const isDashed = dashedSeriesLabels?.includes(name) || dashedSeriesLabels?.includes(displayName);
        series.push({
          name: displayName,
          type: "line",
          data: filteredData.map((r) => (r[dataKey] != null ? Number(r[dataKey]) : null)),
          smooth: false,
          showSymbol: false,
          ...(seriesStackId ? { stack: seriesStackId } : {}),
          itemStyle: { color },
          lineStyle: { width: 1, color, type: isDashed ? "dashed" : "solid" },
          areaStyle: (name === "value" || forceGradientArea)
            ? {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: color + "47" },
                    { offset: 1, color: color + "08" },
                  ],
                },
              }
            : isDashed ? undefined : { color, opacity: 0.15 },
          yAxisIndex: 0,
        });
      });
    }

    if (showGrowthLine) {
      if (hasSeries && seriesNames.length > 1) {
        seriesNames.forEach((name, i) => {
          const color = getSeriesColor(name, i);
          const growthKey = `${name}_growth`;
          series.push({
            name: `${name} %`,
            type: "line",
            data: filteredData.map((r) => (r[growthKey] != null ? Number(r[growthKey]) : null)),
            smooth: false,
            showSymbol: false,
            itemStyle: { color },
            lineStyle: { width: 1, color, type: "dashed" },
            areaStyle: { color, opacity: 0.1 },
            yAxisIndex: 1,
          });
        });
      } else {
        series.push({
          name: "Өөрчлөлт %",
          type: "line",
          data: filteredData.map((r) => (r.growth != null ? Number(r.growth) : null)),
          smooth: false,
          showSymbol: false,
          lineStyle: { width: 1, color: CHART_COLORS.growth, type: "dashed" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: CHART_COLORS.growth + "38" },
                { offset: 1, color: CHART_COLORS.growth + "05" },
              ],
            },
          },
          yAxisIndex: 1,
        });
      }
    }

    if (!series.length) return {};

    const yAxes: EChartsOption["yAxis"] = [
      {
        type: "value",
        show: showValueLines,
        min: yAxisMin,
        max: yAxisMax,
        name: valueAxisTitle ?? undefined,
        nameLocation: "middle",
        nameRotate: 90,
        nameTextStyle: { color: "#94a3b8", fontSize: 10 },
        nameGap: 2,
        axisLabel: { 
          formatter: (v: number) => axisFormatter ? axisFormatter(v) : (typeof v === "number" ? v.toLocaleString() : String(v)), 
          color: "#64748b" 
        },
        splitLine: { lineStyle: { type: yGridLineStyle, color: CHART_COLORS.grid } },
      },
    ];
    if (showGrowthLine) {
      yAxes.push({
        type: "value",
        position: "right",
        axisLabel: { formatter: (v: number) => `${v}%`, color: "#64748b" },
        splitLine: { show: false },
      });
    }

    return {
      // Axis label-ууд тасрах/алга болохоос сэргийлж margin + containLabel
      grid: {
        top: 10,
        bottom: widePlot ? 20 : 24,
        left: widePlot ? (valueAxisTitle ? 40 : 28) : valueAxisTitle ? 44 : 38,
        right: showGrowthLine ? 36 : widePlot ? 6 : 12,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        borderColor: "#0d9488",
        borderWidth: 1,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        confine: true,
        padding: [12, 16],
        extraCssText: "min-width: 180px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
        textStyle: { color: "#f1f5f9", fontSize: 12 },
        formatter: (params: unknown) => {
          const p = Array.isArray(params) ? params : [];
          const axisValue = p[0]?.axisValue ?? "";
          const rows = p
            .filter((item: { value?: number }) => item.value != null)
            .map((item: { seriesName?: string; value?: number; color?: string }) => {
              let val: string;
              if (item.seriesName === "Өөрчлөлт %") {
                val = `${Number(item.value).toFixed(1)}%`;
              } else if (valueFormatter) {
                val = valueFormatter(Number(item.value)); 
              } else {
                val = `${Number(item.value).toLocaleString()}`;
              }
              const rawName = item.seriesName ?? "";
              const mappedName = seriesLabelMap?.[rawName] ?? rawName;
              const isMainValueSeries = mappedName === "value" || mappedName === "" || mappedName === tooltipUnit || mappedName === valueLabel;
              const displayName = isMainValueSeries ? (tooltipUnit || title || mappedName) : mappedName;
              return `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                <span style="color:#94a3b8;font-size:12px;">${displayName}</span>
                <span style="color:#f1f5f9;font-weight:600;">${val}</span>
              </div>`;
            });
          return `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);">
            <span style="color:#2dd4bf;font-size:14px;">◉</span>
            <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${String(axisValue)}</span>
          </div>${rows.join("")}`;
        },
      },
      xAxis: {
        type: "category",
        data: xData,
        boundaryGap: false,
        axisLabel: {
          fontSize: 11,
          showMinLabel: true,
          showMaxLabel: true,
          color: "#64748b",
          hideOverlap: true,
        },
        axisLine: { show: true, lineStyle: { color: CHART_COLORS.grid } },
        axisTick: { show: true, lineStyle: { color: CHART_COLORS.grid } },
      },
      yAxis: yAxes.length === 1 ? yAxes[0] : yAxes,
      series,
      legend: { show: false },
    };
  }, [
    filteredData,
    xKey,
    seriesNames,
    showValueLines,
    showGrowthLine,
    hasSeries,
    primaryColor,
    mutedSeriesLabels,
    valueLabel,
    valueAxisTitle,
    seriesLabelMap,
    title,
    tooltipUnit,
    valueFormatter,
    axisFormatter,
    valueLabel,
    seriesStackId,
    forceGradientArea,
    yGridLineStyle,
    yAxisMin,
    yAxisMax,
    widePlot,
  ]);

  const hasRenderableSeries =
    Array.isArray(option.series) && (option.series as unknown[]).length > 0;

  const showHeader = (!hideHeader && !!(title || description || (enableSlicers && showGrowth))) || showLatestValue;

  const latestEntry = (showLatestValue || showHeader) && sortedAggregated.length > 0 ? sortedAggregated[sortedAggregated.length - 1] : null;
  const prevEntry = sortedAggregated.length > 1 ? sortedAggregated[sortedAggregated.length - 2] : null;
  const latestPeriod = latestEntry ? String(latestEntry[xKey] ?? "") : "";
  const latestTotal = latestEntry ? Number(latestEntry.value ?? 0) : 0;
  const prevTotal = prevEntry ? Number(prevEntry.value ?? 0) : 0;
  const latestChangePct = prevTotal !== 0 ? ((latestTotal - prevTotal) / prevTotal) * 100 : null;
  const latestValueStr = latestValueFormatter
    ? latestValueFormatter(latestTotal, latestPeriod)
    : latestTotal.toLocaleString();

  const latestSeriesValues = useMemo(() => {
    if (!showLatestValueBySeries || !seriesKey || !latestPeriod) return [];
    const latestRows = data.filter((r) => String(r[xKey]) === latestPeriod);
    const prevRows = prevEntry ? data.filter((r) => String(r[xKey]) === String(prevEntry[xKey])) : [];
    const seriesLabels = latestValueSeriesFilter ?? [...new Set(latestRows.map((r) => String(r[seriesKey])))];
    return seriesLabels.map((label) => {
      const row = latestRows.find((r) => String(r[seriesKey]) === label);
      const prevRow = prevRows.find((r) => String(r[seriesKey]) === label);
      const value = row ? Number(row[valueKey] ?? 0) : 0;
      const prevValue = prevRow ? Number(prevRow[valueKey] ?? 0) : 0;
      const changePct = prevValue !== 0 ? ((value - prevValue) / prevValue) * 100 : null;
      return { label, value, changePct };
    });
  }, [showLatestValueBySeries, seriesKey, latestPeriod, data, xKey, valueKey, latestValueSeriesFilter, prevEntry]);

  return (
    <div className={`${hideHeader ? "pb-3" : "py-3"} w-full min-w-0`}>
      {(showHeader || showLatestValue) && (
      <div className={noHeaderMargin ? "" : "mb-2"}>
        <div className="flex w-full min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 w-full flex-1">
            {!hideHeader && title && (
              <h3 className="chart-section-title">{title}</h3>
            )}
            {!hideHeader && description && (
              <p className="mt-0.5 chart-section-label font-normal leading-relaxed text-[var(--muted-foreground)]">{description}</p>
            )}
            {(showLatestValue && (latestEntry || (headerExtra && headerExtraInValueRow))) && (
              <div className={noHeaderMargin ? "" : latestValueMarginClass}>
                <div className="flex flex-wrap items-baseline gap-2">
                  {headerExtraInValueRow && headerExtra && <span className="shrink-0">{headerExtra}</span>}
                  {latestEntry && showLatestValueBySeries && latestSeriesValues.length > 0 ? (
                    <div className={latestValueVertical ? "flex flex-col gap-1" : "flex flex-wrap items-baseline gap-4"}>
                      {latestSeriesValues.map((sv) => (
                        <div key={sv.label} className="flex items-baseline gap-1.5">
                          <span className="chart-section-label text-[var(--muted-foreground)]">{seriesLabelMap?.[sv.label] ?? sv.label}:</span>
                          <span className="chart-section-value tabular-nums">
                            {latestValueFormatter ? latestValueFormatter(sv.value, latestPeriod) : sv.value.toLocaleString()}
                          </span>
                          {showGrowth && sv.changePct != null && (
                            <span className={`chart-section-label font-medium ${sv.changePct >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {sv.changePct >= 0 ? "+" : ""}{sv.changePct.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      ))}
                      {!latestValueVertical && <span className="chart-section-label text-[var(--muted-foreground)]">({latestPeriod})</span>}
                    </div>
                  ) : latestEntry ? (
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="chart-section-value tabular-nums leading-none">{latestValueStr}</span>
                      {showGrowth && latestChangePct != null && (
                        <span className={`chart-section-label font-medium ${latestChangePct >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {latestChangePct >= 0 ? "+" : ""}{latestChangePct.toFixed(1)}%
                        </span>
                      )}
                      <span className="chart-section-label text-[var(--muted-foreground)]">({latestPeriod})</span>
                    </div>
                  ) : (
                    <span className="chart-section-label text-[var(--muted-foreground)]">—</span>
                  )}
                </div>
              </div>
            )}
          </div>
          {((headerExtraTitleRow != null) || (headerExtra && !(headerExtraInValueRow && showLatestValue && (latestEntry || headerExtra))) || (enableSlicers && showGrowth)) && (
            <div className="flex shrink-0 flex-wrap items-center gap-2 w-full md:w-auto">
              {headerExtraTitleRow}
              {headerExtra && !(headerExtraInValueRow && showLatestValue && (latestEntry || headerExtra)) && headerExtra}
              {enableSlicers && showGrowth && (
                <div className="filter-btn-group">
                  <button
                    type="button"
                    onClick={() => setMetricMode("value")}
                    className={metricMode === "value" ? "active" : ""}
                  >
                    {valueLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetricMode("growth")}
                    className={metricMode === "growth" ? "active" : ""}
                  >
                    Өөрчлөлт %
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}
      <div className="w-full" style={{ height: chartHeight, marginTop: chartMarginTop }}>
        {filteredData.length === 0 || !hasRenderableSeries ? (
          <div className="flex h-full items-center justify-center rounded-md bg-[var(--card-bg-muted)]">
            <p className="text-sm text-[var(--muted-foreground)]">Өгөгдөл байхгүй</p>
          </div>
        ) : (
          <ReactECharts
            option={option}
            style={{ height: "100%", width: "100%" }}
            notMerge
            className="chart-primary"
          />
        )}
      </div>
      {enableSlicers && showRangeSlider && isTimeLikeX && nDisplay > 1 && (
        <div className="mt-4">
          <div className="flex flex-nowrap items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                // Тулцан бол эхнээс (эсвэл rangeSliderPlayFromYear-аас); сүүлийн он дээр байхад эхний сонгосон оноос хойшоо гүйнэ
                if (!isPlaying) {
                  const atEnd = rangeClamped[1] >= nDisplay - 1;
                  const stuck = rangeClamped[0] === rangeClamped[1];
                  const minPlayIndex =
                    rangeSliderPlayFromYear != null
                      ? Math.max(
                          0,
                          dataForDisplay.findIndex((r) => {
                            const x = String(r[xKey] ?? "");
                            const playVal = rangeSliderPlayFromYear;
                            // Жил-сар (YYYY-MM) эсвэл зөвхөн жил (YYYY): эхний 4 тэмдэгтээр жил харьцуулна
                            if (isYearMonthX && playVal.length >= 4 && x.length >= 4) {
                              return x.slice(0, 4) >= playVal.slice(0, 4);
                            }
                            return x >= playVal;
                          })
                        )
                      : 0;
                  const startIndex = minPlayIndex >= 0 ? minPlayIndex : 0;
                  let newRange: [number, number] | null = null;
                  if (stuck) {
                    newRange = isYearMonthX
                      ? [startIndex, nDisplay - 1]
                      : [startIndex, Math.min(startIndex + windowSize - 1, nDisplay - 1)];
                  } else if (atEnd) {
                    // rangeSliderPlayFromYear байвал дахин тоглуулахад тэр жилээс эхлүүлнэ
                    const start =
                      rangeSliderPlayFromYear != null && startIndex > 0 ? startIndex : rangeClamped[0];
                    newRange = [start, Math.min(start + windowSize - 1, nDisplay - 1)];
                  }
                  if (newRange) {
                    if (isControlledRange && onRangeYearsChange) {
                      const startY = String(dataForDisplay[newRange[0]]?.[xKey] ?? "");
                      const endY = String(dataForDisplay[newRange[1]]?.[xKey] ?? "");
                      onRangeYearsChange(startY, endY);
                    } else {
                      setRange(newRange);
                    }
                    rangeRef.current = newRange;
                  }
                }
                setIsPlaying((p) => !p);
              }}
              className="range-slider-play-btn"
              title={isPlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
              aria-label={isPlaying ? "Зогсоох" : "Тоглуулах"}
            >
              {isPlaying ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div className="flex min-h-9 min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <span className="min-w-[4.5rem] shrink-0 text-xs font-normal tabular-nums text-slate-700 dark:text-slate-200">
                {String(dataForDisplay[rangeClamped[0]]?.[xKey] ?? "")}
              </span>
              <div className="min-w-0 flex-1 self-center">
                <RangeSlider
                  min={0}
                  max={nDisplay - 1}
                  value={rangeClamped}
                  onChange={(v) => {
                    if (isControlledRange && onRangeYearsChange) {
                      const startY = String(dataForDisplay[v[0]]?.[xKey] ?? "");
                      const endY = String(dataForDisplay[v[1]]?.[xKey] ?? "");
                      onRangeYearsChange(startY, endY);
                    } else {
                      setRange(v);
                    }
                    setIsPlaying(false);
                  }}
                  labels={dataForDisplay.map((r) => String(r[xKey]))}
                  showLabels={false}
                />
              </div>
              <span className="min-w-[4.5rem] shrink-0 text-right text-xs font-normal tabular-nums text-slate-700 dark:text-slate-200">
                {String(dataForDisplay[rangeClamped[1]]?.[xKey] ?? "")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
