"use client";

import { useMemo, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import ReactECharts from "echarts-for-react";
import type { DataRow } from "@/lib/socio-dashboard/types";

const BAR_COLORS = {
  primary: "#0050C3",
  accent: "#0891b2",
  dimmed: "#64748b",
  series: ["#0050C3", "#0891b2", "#64748b"],
};

interface YearSlicerProps {
  dimensionCode: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}

interface ChartBarProps {
  data: DataRow[];
  xKey: string;
  seriesKey?: string;
  valueKey?: string;
  title: string;
  titleSuffix?: ReactNode;
  description?: string;
  maxBars?: number;
  excludeSeriesLabels?: string[];
  yearSlicer?: YearSlicerProps;
  excludeXLabels?: string[];
  onBarClick?: (row: DataRow) => void;
  highlightXValues?: string[];
  accentXLabel?: string;
  reverseOrder?: boolean;
  afterTitle?: ReactNode;
  latestValueNode?: ReactNode;
}

export function ChartBar({
  data,
  xKey,
  seriesKey,
  valueKey = "value",
  title,
  titleSuffix,
  description,
  maxBars = 30,
  excludeSeriesLabels,
  yearSlicer,
  excludeXLabels,
  onBarClick,
  highlightXValues,
  accentXLabel,
  reverseOrder,
  afterTitle,
  latestValueNode,
}: ChartBarProps) {
  const codeKey = `${xKey}_code`;

  const aggregated = useMemo(() => {
    const byKey = new Map<string, DataRow>();
    for (const r of data) {
      const x = String(r[xKey]);
      const s = seriesKey ? String(r[seriesKey] ?? "Нийт") : "Нийт";
      const v = Number(r[valueKey]) || 0;
      const k = seriesKey ? `${x}\t${s}` : x;
      if (!byKey.has(k)) {
        const row: DataRow = { [xKey]: x };
        const codeVal = r[codeKey] ?? r[xKey];
        if (codeVal != null) row[codeKey] = String(codeVal);
        if (seriesKey) row[seriesKey] = s;
        row[valueKey] = 0;
        byKey.set(k, row);
      }
      const row = byKey.get(k)!;
      if (seriesKey) (row[s] as number) = ((row[s] as number) ?? 0) + v;
      else (row[valueKey] as number) += v;
    }
    const byX = new Map<string, DataRow>();
    for (const row of byKey.values()) {
      const x = String(row[xKey]);
      if (!byX.has(x)) {
        const r: DataRow = { [xKey]: x };
        if (row[codeKey] != null) r[codeKey] = row[codeKey];
        if (seriesKey) {
          for (const [s, val] of Object.entries(row)) {
            if (s !== xKey && s !== valueKey && s !== codeKey && typeof val === "number") r[s] = val;
          }
        } else {
          r[valueKey] = row[valueKey];
        }
        byX.set(x, r);
      } else {
        const r = byX.get(x)!;
        if (seriesKey) {
          for (const [s, val] of Object.entries(row)) {
            if (s !== xKey && s !== valueKey && s !== codeKey && typeof val === "number")
              (r[s] as number) = ((r[s] as number) ?? 0) + val;
          }
        }
      }
    }
    return Array.from(byX.values());
  }, [data, xKey, seriesKey, valueKey, codeKey]);

  const seriesNamesRaw = seriesKey
    ? (Array.from(new Set(data.map((r) => r[seriesKey]).filter(Boolean))) as string[])
    : ["value"];
  const seriesNames = excludeSeriesLabels?.length
    ? seriesNamesRaw.filter((n) => !excludeSeriesLabels.includes(n))
    : seriesNamesRaw;

  const filteredByX = excludeXLabels?.length
    ? aggregated.filter((row) => !excludeXLabels.includes(String(row[xKey])))
    : aggregated;
  const sliced = filteredByX.slice(0, maxBars);
  const displayData = reverseOrder ? [...sliced].reverse() : sliced;

  const displayDataRef = useRef<DataRow[]>(displayData);
  displayDataRef.current = displayData;

  const option = useMemo(() => {
    if (!displayData.length) return {};
    const highlightSet = highlightXValues?.length ? new Set(highlightXValues) : null;
    const getBorderColor = (entry: DataRow, seriesName: string): string => {
      const xVal = String(entry[xKey] ?? "");
      const codeVal = entry[codeKey] != null ? String(entry[codeKey]) : xVal;
      if (accentXLabel && xVal === accentXLabel) return BAR_COLORS.accent;
      if (highlightSet) {
        if (highlightSet.has(xVal) || highlightSet.has(codeVal)) return BAR_COLORS.primary;
        return BAR_COLORS.dimmed;
      }
      if (seriesName === "value") return BAR_COLORS.primary;
      const idx = seriesNames.indexOf(seriesName);
      return BAR_COLORS.series[idx % BAR_COLORS.series.length];
    };
    const yCategories = displayData.map((r) => String(r[xKey] ?? "").trim());

    const series = seriesNames.map((name) => {
      const dataKey = name === "value" ? "value" : name;
      return {
        name,
        type: "bar" as const,
        stack: seriesNames.length > 1 ? "stack" : undefined,
        data: displayData.map((entry) => ({
          value: Number(entry[dataKey]) ?? 0,
          itemStyle: {
            color: "rgba(148, 163, 184, 0.3)",
            borderColor: getBorderColor(entry, name),
            borderWidth: 1.5,
          },
        })),
        barMaxWidth: 24,
        barBorderRadius: [0, 6, 6, 0],
        label: {
          show: true,
          position: "right" as const,
          fontSize: 11,
          fontFamily: "Arial, sans-serif",
          color: "#64748b",
          formatter: (params: { value?: number }) => 
            params.value != null ? Number(params.value).toLocaleString() : "",
        },
      };
    });

    return {
      grid: { left: 200, right: 24, top: 8, bottom: 40, containLabel: false },
      xAxis: {
        type: "value",
        axisLabel: { fontSize: 11, fontFamily: "Arial, sans-serif", formatter: (v: number) => v.toLocaleString() },
        splitLine: { lineStyle: { type: "dashed", color: "rgba(0,80,195,0.06)" } },
      },
      yAxis: {
        type: "category",
        data: yCategories,
        axisLabel: {
          fontSize: 11,
          fontFamily: "Arial, sans-serif",
          showMinLabel: true,
          showMaxLabel: true,
        },
        inverse: false,
        axisLine: { show: false },
        axisTick: { show: false },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        borderColor: "#0d9488",
        borderWidth: 1,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        padding: [12, 16],
        extraCssText: "border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
        textStyle: { color: "#f1f5f9", fontSize: 12 },
        formatter: (params: unknown) => {
          const p = Array.isArray(params) ? params : [];
          const axisValue = p[0]?.axisValue ?? "";
          let rows = "";
          p.forEach((item: { seriesName?: string; value?: number }) => {
            if (item.value == null) return;
            const label = item.seriesName === "value" ? "Бүлэг" : item.seriesName;
            rows += `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;">
              <span style="color:#94a3b8;font-size:12px;">${label}</span>
              <span style="color:#f1f5f9;font-weight:600;">${Number(item.value).toLocaleString()}</span>
            </div>`;
          });
          return `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);">
            <span style="color:#2dd4bf;font-size:14px;">◉</span>
            <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${title}</span>
          </div>
          <div style="padding:4px 0;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.08);">
            <span style="color:#f1f5f9;font-size:12px;">${axisValue}</span>
          </div>${rows}`;
        },
      },
      series,
      legend: { show: false },
    };
  }, [displayData, xKey, seriesNames, codeKey, accentXLabel, highlightXValues]);

  const handleClick = useCallback(
    (params: { componentType?: string; componentSubType?: string; seriesType?: string; dataIndex?: number; name?: string }) => {
      if (!onBarClick) return;
      const isBar = params.componentType === "series" && (params.seriesType === "bar" || params.componentSubType === "bar");
      if (!isBar) return;
      const data = displayDataRef.current;
      let row: DataRow | undefined = data[params.dataIndex ?? -1];
      if (!row && params.name != null)
        row = data.find((r) => String(r[xKey] ?? "") === String(params.name));
      if (row) onBarClick(row);
    },
    [onBarClick, xKey]
  );

  const onEvents = useMemo(
    () => (onBarClick ? { click: handleClick } : undefined),
    [onBarClick, handleClick]
  );

  return (
    <div className="chart-primary py-6 outline-none [&_*]:outline-none [&_*]:focus:outline-none">
      <div className="mb-4 flex flex-col md:flex-row md:flex-wrap md:items-start md:justify-between gap-4">
        <div className="min-w-0 flex-1 w-full md:w-auto">
          <h3 className="chart-section-title">
            {title}
            {titleSuffix ? <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">{titleSuffix}</span> : null}
          </h3>
          {description && (
            <p className="mt-1 text-sm font-normal leading-relaxed text-[var(--muted-foreground)]">{description}</p>
          )}
          {latestValueNode}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
          {afterTitle}
          {yearSlicer && yearSlicer.options.length > 0 && (
          <select
            value={yearSlicer.value}
            onChange={(e) => yearSlicer.onChange(e.target.value)}
            disabled={yearSlicer.loading}
            className="filter-select"
          >
            {yearSlicer.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          )}
        </div>
      </div>
      <div className={`h-[420px] w-full min-h-[240px] outline-none [&_*]:outline-none [&_*]:focus:outline-none ${onBarClick ? "cursor-pointer" : ""}`}>
        {displayData.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-md bg-[var(--card-bg-muted)]">
            <p className="text-sm text-[var(--muted-foreground)]">Өгөгдөл байхгүй</p>
          </div>
        ) : (
          <ReactECharts
            option={option}
            style={{ height: "100%", width: "100%" }}
            notMerge
            className="chart-primary"
            onEvents={onEvents}
          />
        )}
      </div>
    </div>
  );
}
