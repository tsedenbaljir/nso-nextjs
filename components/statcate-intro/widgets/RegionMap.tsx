"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import { MapMark } from "@/lib/statcate-intro/marks";
import { COPY, INTRO_FONT, INTRO_MAP_HEIGHT, INTRO_MAP_SERIES } from "@/lib/statcate-intro/constants";
import { AIMAG_ID_TO_NAME, canonicalAimagName, mapColorPieces } from "@/lib/statcate-intro/aimag-map";
import { formatValue, loc, finiteNum, trimLabel } from "@/lib/statcate-intro/format";
import { queryRows, yearOrLatest } from "@/lib/statcate-intro/query";
import { introItemTooltipFormatter, introTooltipBase } from "@/lib/statcate-intro/tooltip";
import type { RegionMapLayout, RegionMapWidget } from "@/lib/statcate-intro/types";
import type { IntroDashboardState } from "@/components/statcate-intro/useIntroDashboard";

const MAP_NAME = "nso-intro-aimag";
const GEO_URL = "/census-dashboard/geo/aimag.geojson";

function mapSeriesLayout(layout?: RegionMapLayout) {
  const legend = layout?.legend ?? "horizontal";
  const inset = legend === "vertical" ? INTRO_MAP_SERIES.vertical : INTRO_MAP_SERIES.horizontal;
  return {
    aspectScale: INTRO_MAP_SERIES.aspectScale,
    ...inset,
  };
}

type Props = {
  widget: RegionMapWidget;
  dash: IntroDashboardState;
  chartHeight?: number;
};

type GeoCollection = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    geometry: unknown;
    properties?: { id?: number; aimag_id?: number; name?: string; aimagname1?: string };
  }[];
};

export default function RegionMap({ widget, dash }: Props) {
  const { config, tablesById, year, lng } = dash;
  const [ready, setReady] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [geoRatio, setGeoRatio] = useState(0);

  useEffect(() => {
    const element = chartRef.current;
    if (!element || !widget.layout?.fitToContainer) return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, [config, year, widget.layout?.fitToContainer]);

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((res) => res.json())
      .then((json: GeoCollection) => {
        if (cancelled) return;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        function visit(coordinates: unknown) {
          if (!Array.isArray(coordinates)) return;
          if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
            minX = Math.min(minX, coordinates[0]); maxX = Math.max(maxX, coordinates[0]);
            minY = Math.min(minY, coordinates[1]); maxY = Math.max(maxY, coordinates[1]);
          } else coordinates.forEach(visit);
        }
        json.features.forEach((feature) => visit((feature.geometry as { coordinates?: unknown })?.coordinates));
        if (maxY > minY) setGeoRatio((maxX - minX) / (maxY - minY));
        const features = (json.features ?? []).map((feature) => {
          const id = feature.properties?.id ?? feature.properties?.aimag_id;
          const name =
            (id != null ? AIMAG_ID_TO_NAME[id] : undefined) ??
            feature.properties?.name ??
            feature.properties?.aimagname1 ??
            "";
          return { ...feature, properties: { ...feature.properties, name } };
        });
        echarts.registerMap(MAP_NAME, { ...json, features } as Parameters<typeof echarts.registerMap>[1]);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const table = config && year ? tablesById[widget.table] : undefined;
  const mapYear = table && config && year ? yearOrLatest(table.rows, config, year, table) : year;
  const geoDim = table?.geo ?? config?.dimensions.geo;

  const rows = useMemo(() => {
    if (!config || !mapYear || !geoDim || !table) return [];
    const byName = new Map<string, number>();
    for (const row of queryRows(
      table.rows,
      config,
      {
        year: mapYear,
        category: config.dimensions.category ? "total" : undefined,
        geo: "aimags",
      },
      table,
    )) {
      const name = canonicalAimagName(trimLabel(row[geoDim]));
      if (!name) continue;
      const value = finiteNum(row.value);
      if (value == null) continue;
      byName.set(name, value);
    }
    return [...byName.entries()].map(([name, value]) => ({ name, value }));
  }, [config, table, widget.table, mapYear, geoDim]);

  if (!config || !year || !geoDim) return null;

  const values = rows.map((row) => row.value);
  const tableLabel = table?.label ?? "";
  const format = table?.format ?? "count";
  const mapColors = config.mapColors;
  const digits = format === "percent" || format === "decimal" ? 1 : 0;
  const pieces = mapColorPieces(values, mapColors, digits);
  const emptyColor = mapColors?.[0] ?? "#C5D9EE";
  const hoverColor = config.palette?.[1] ?? "#0E7C7B";
  const icon = config.sectionIcons?.map;
  const layout = widget.layout;
  const height = INTRO_MAP_HEIGHT;
  const legend = layout?.legend ?? "horizontal";
  const fittedLayout = layout?.fitToContainer && containerWidth > 0 && geoRatio > 0
    ? {
        aspectScale: layout.aspectScale ?? 0.75,
        layoutCenter: ["50%", "45%"] as [string, string],
        layoutSize: Math.min(containerWidth * 0.94, (height * 0.9 - 32) * geoRatio * (layout.aspectScale ?? 0.75)),
      }
    : mapSeriesLayout(layout);

  const option: EChartsOption = {
    textStyle: { fontFamily: INTRO_FONT },
    tooltip: {
      trigger: "item",
      ...introTooltipBase,
      formatter: introItemTooltipFormatter({
        lng,
        year: mapYear,
        valueLabel: table?.unit || tableLabel,
        formatValue: (value) => formatValue(value, lng, format),
      }),
    },
    visualMap: {
      type: "piecewise",
      pieces,
      orient: legend,
      ...(legend === "horizontal"
        ? { left: "center", bottom: 4, itemGap: 14 }
        : { left: 0, bottom: 0, itemGap: 6 }),
      itemWidth: legend === "horizontal" ? 14 : 12,
      itemHeight: 10,
      textStyle: { color: "#5b6b80", fontSize: 11, fontFamily: INTRO_FONT },
    },
    series: [
      {
        type: "map",
        map: MAP_NAME,
        roam: false,
        ...fittedLayout,
        data: rows,
        name: tableLabel,
        itemStyle: { borderColor: "#fff", borderWidth: 0.8, areaColor: emptyColor },
        emphasis: {
          label: { show: false },
          itemStyle: { areaColor: hoverColor },
        },
        select: { disabled: true },
      },
    ],
  };

  return (
    <div className="sector-intro-panel">
      <h4>
        {icon ? (
          <img className="sector-intro-panel-icon" src={icon} alt="" width={28} height={28} />
        ) : (
          <MapMark size={16} />
        )}
        {loc(lng, widget.title ?? COPY.byRegion)}
        {mapYear && mapYear !== year ? <span> · {mapYear}</span> : null}
      </h4>
      <div ref={chartRef} className="sector-intro-chart sector-intro-chart--map" style={{ height }}>
        {ready ? (
          rows.length ? (
            <ReactECharts option={option} style={{ height: "100%", width: "100%" }} notMerge />
          ) : (
            <p className="sector-intro-map-loading">
              {lng === "en" ? "No regional breakdown for this year." : "Энэ онд аймгийн задаргаа байхгүй."}
            </p>
          )
        ) : (
          <p className="sector-intro-map-loading">{lng === "en" ? "Loading map…" : "Газрын зураг ачаалж байна…"}</p>
        )}
      </div>
    </div>
  );
}
