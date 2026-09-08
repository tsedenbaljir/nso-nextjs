"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS, type ChartSeries } from "@/lib/commodity-price-dashboard/chart";
import { useTheme } from "./theme-provider";
import { ProductIcon } from "./product-icon";

type Props = {
  times: string[];
  series: ChartSeries[];
  newestFirst?: boolean;
  limit?: number;
  rangeEnd?: number;
  rangeFrom?: number;
};

function productName(name: string) {
  return name.replace(/ · хэрэглээний үнэ$/, "").replace(/ · үйлдвэрлэгчийн үнэ$/, "");
}

function SeriesLine({ color, dashed }: { color: string; dashed?: boolean }) {
  return (
    <span
      className="series-line"
      style={{
        background: dashed
          ? `repeating-linear-gradient(90deg, ${color} 0 3px, transparent 3px 6px)`
          : color,
      }}
    />
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ name?: unknown; value?: unknown; color?: unknown }>;
  label?: unknown;
}) {
  if (!active || !payload?.length) return null;

  const groups = new Map<
    string,
    Array<{ name: string; value: unknown; color: string; dashed: boolean }>
  >();
  for (const item of payload) {
    const name = String(item.name ?? "");
    const color = String(item.color ?? "");
    const product = productName(name);
    const rows = groups.get(product) ?? [];
    rows.push({
      name,
      value: item.value,
      color,
      dashed: name.includes("үйлдвэрлэгч"),
    });
    groups.set(product, rows);
  }

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{String(label)}</p>
      <div className="chart-tooltip-groups">
        {[...groups.entries()].map(([product, rows]) => (
          <div key={product}>
            <div className="chart-tooltip-head">
              <ProductIcon name={product} size="sm" />
              <span>{product}</span>
            </div>
            <div className="chart-tooltip-rows">
              {rows.map((row) => {
                const kind = row.name === product ? null : row.name.replace(`${product} · `, "");
                return (
                  <div key={row.name} className="chart-tooltip-row">
                    <SeriesLine color={row.color} dashed={row.dashed} />
                    <span className={`chart-tooltip-kind${kind ? "" : " is-empty"}`}>{kind}</span>
                    <span className="chart-tooltip-value" style={{ color: row.color }}>
                      {row.value == null
                        ? "—"
                        : `${Number(row.value).toLocaleString("mn-MN")} ₮`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PriceChart({
  times,
  series,
  newestFirst = true,
  limit = 52,
  rangeEnd: externalEnd,
  rangeFrom: externalFrom,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const { resolved } = useTheme();
  const dark = resolved === "dark";
  const grid = dark ? "#2a3544" : "#e3ebf4";
  const tick = dark ? "#93a0b3" : "#6b7a90";
  const tooltipBg = dark ? "#171e28" : "#ffffff";
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; end: number; moved: boolean } | null>(null);
  const [panning, setPanning] = useState(false);

  const data = useMemo(() => {
    return times.map((_, i) => {
      const sourceIndex = newestFirst ? times.length - 1 - i : i;
      const point: Record<string, string | number | null> = { time: times[sourceIndex] };
      for (const item of series) {
        point[item.name] = item.values[sourceIndex];
      }
      return point;
    });
  }, [newestFirst, series, times]);

  const windowSize = Math.min(limit > 0 ? limit : 18, data.length);
  const [end, setEnd] = useState(data.length);
  const endRef = useRef(end);
  endRef.current = end;

  useEffect(() => {
    if (externalEnd != null) {
      setEnd(externalEnd);
    } else {
      setEnd(data.length);
    }
  }, [data.length, windowSize, externalEnd]);

  const from = externalFrom != null ? externalFrom : Math.max(0, end - windowSize);
  const recent = data.slice(from, end);
  const canPan = data.length > windowSize;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    function onDown(event: PointerEvent) {
      if (event.button !== 0) return;
      if (data.length <= windowSize) return;
      drag.current = { x: event.clientX, end: endRef.current, moved: false };
    }

    function onMove(event: PointerEvent) {
      const start = drag.current;
      if (!start) return;
      const dx = event.clientX - start.x;
      if (!start.moved && Math.abs(dx) < 8) return;
      start.moved = true;
      setPanning(true);
      const shift = Math.round(dx / 18);
      setEnd(Math.min(data.length, Math.max(windowSize, start.end - shift)));
    }

    function onUp() {
      drag.current = null;
      setPanning(false);
    }

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [data.length, windowSize]);

  return (
    <div ref={wrapRef} className={`chart-fill${canPan ? " is-pannable" : ""}${panning ? " is-dragging" : ""}`}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={280}
        initialDimension={{ width: 800, height: 420 }}
      >
        <AreaChart data={recent} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <defs>
            {series.map((item, i) => {
              const color = item.color ?? CHART_COLORS[i % CHART_COLORS.length];
              const top = item.dashed ? (dark ? 0.22 : 0.16) : dark ? 0.42 : 0.32;
              return (
                <linearGradient
                  key={`${uid}-${i}`}
                  id={`${uid}-${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={top} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid stroke={grid} strokeDasharray="3 6" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: tick, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: grid }}
            minTickGap={28}
          />
          <YAxis
            tick={{ fill: tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${Math.round(value / 1000)} мян` : String(value)
            }
          />
          <Tooltip
            cursor={panning ? false : { stroke: dark ? "#6eb0f5" : "#2563EB", strokeWidth: 1, strokeDasharray: "4 4" }}
            content={panning ? () => null : (props) => <ChartTooltip {...props} />}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          {series.map((item, i) => {
            const color = item.color ?? CHART_COLORS[i % CHART_COLORS.length];
            return (
              <Area
                key={item.name}
                type="monotone"
                dataKey={item.name}
                stroke={color}
                fill={`url(#${uid}-${i})`}
                strokeWidth={2.2}
                strokeDasharray={item.dashed ? "6 4" : undefined}
                dot={false}
                activeDot={{ r: 5, stroke: tooltipBg, strokeWidth: 2 }}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
