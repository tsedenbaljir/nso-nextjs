"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import dynamic from "next/dynamic";
import type { ChartSeries } from "@/lib/commodity-price-dashboard/chart";
import { ExportButtons } from "./export-buttons";

function RangeSlider({
  min,
  max,
  from,
  to,
  times,
  playing,
  onPlay,
  onChange,
}: {
  min: number;
  max: number;
  from: number;
  to: number;
  times: string[];
  playing: boolean;
  onPlay: () => void;
  onChange: (from: number, to: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function posFromEvent(e: RPointerEvent<HTMLDivElement> | globalThis.PointerEvent) {
    const track = trackRef.current;
    if (!track) return from;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return Math.round(min + pct * (max - min));
  }

  const [dragging, setDragging] = useState<"from" | "to" | null>(null);

  function handlePointerDown(e: RPointerEvent<HTMLDivElement>) {
    const val = posFromEvent(e as unknown as globalThis.PointerEvent);
    const distFrom = Math.abs(val - from);
    const distTo = Math.abs(val - to);
    const handle = distFrom <= distTo ? "from" : "to";
    setDragging(handle);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (handle === "from") {
      onChange(Math.min(val, to), to);
    } else {
      onChange(from, Math.max(val, from));
    }
  }

  function handlePointerMove(e: RPointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const val = posFromEvent(e as unknown as globalThis.PointerEvent);
    if (dragging === "from") {
      onChange(Math.min(val, to), to);
    } else {
      onChange(from, Math.max(val, from));
    }
  }

  function handlePointerUp() {
    setDragging(null);
  }

  const leftPct = ((from - min) / (max - min)) * 100;
  const rightPct = ((to - min) / (max - min)) * 100;

  return (
    <div className="range-slider">
      <button
        type="button"
        className={`range-play${playing ? " is-playing" : ""}`}
        onClick={onPlay}
        aria-label={playing ? "Зогсоох" : "Тоглуулах"}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <span className="range-label">{times[from] ?? ""}</span>
      <div
        className="range-track-wrap"
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="range-track" />
        <div
          className="range-fill"
          style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
        />
        <div className="range-thumb" style={{ left: `${leftPct}%` }} />
        <div className="range-thumb" style={{ left: `${rightPct}%` }} />
      </div>
      <span className="range-label">{times[to] ?? ""}</span>
    </div>
  );
}

const PriceChart = dynamic(
  () => import("./price-chart").then((mod) => mod.PriceChart),
  { ssr: false },
);

type Props = {
  times: string[];
  series: ChartSeries[];
  newestFirst?: boolean;
  limit?: number;
  fileName?: string;
};

export function ChartPanel({
  times,
  series,
  newestFirst,
  limit = 52,
  fileName = "unii-hodolgoon",
}: Props) {
  const shotRef = useRef<HTMLDivElement>(null);
  const chronoTimes = newestFirst !== false ? [...times].reverse() : times;
  const windowSize = Math.min(limit > 0 ? limit : 18, chronoTimes.length);
  const total = chronoTimes.length;
  const [rangeFrom, setRangeFrom] = useState(Math.max(0, total - windowSize));
  const [rangeTo, setRangeTo] = useState(total - 1);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setRangeFrom(Math.max(0, total - windowSize));
    setRangeTo(total - 1);
  }, [total, windowSize]);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setRangeTo((prev) => {
        if (prev >= total - 1) {
          setPlaying(false);
          return total - 1;
        }
        return prev + 1;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [playing, total]);

  const handlePlay = useCallback(() => {
    if (rangeTo >= total - 1) {
      setRangeTo(rangeFrom);
    }
    setPlaying((p) => !p);
  }, [rangeTo, rangeFrom, total]);

  const fromIdx = rangeFrom;
  const rangeEnd = rangeTo + 1;

  return (
    <div className="panel panel--pad">
      <div className="chart-toolbar">
        <h2 className="panel-title chart-title">Үнийн хөдөлгөөн</h2>
        {series.length > 0 && <ExportButtons targetRef={shotRef} name={fileName} />}
      </div>
      {series.length > 0 ? (
        <>
          <div ref={shotRef} className="chart-box">
            <PriceChart
              times={times}
              series={series}
              newestFirst={newestFirst}
              limit={limit}
              rangeEnd={rangeEnd}
              rangeFrom={fromIdx}
            />
          </div>
          <RangeSlider
            min={0}
            max={total - 1}
            from={fromIdx}
            to={rangeTo}
            times={chronoTimes}
            playing={playing}
            onPlay={handlePlay}
            onChange={(from, to) => {
              setPlaying(false);
              setRangeFrom(from);
              setRangeTo(to);
            }}
          />
        </>
      ) : (
        <div className="chart-empty">Бараа сонгоход график гарна</div>
      )}
    </div>
  );
}
