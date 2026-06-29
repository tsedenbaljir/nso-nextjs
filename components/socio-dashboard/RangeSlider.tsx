"use client";

import { useState, useRef, useCallback } from "react";
import "./range-slider.scss";

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  labels?: string[];
  className?: string;
  showLabels?: boolean;
}

const THUMB_HOVER_RADIUS = 10;

export function RangeSlider({
  min,
  max,
  value: [low, high],
  onChange,
  labels,
  className = "",
  showLabels = true,
}: RangeSliderProps) {
  const [hoveredThumb, setHoveredThumb] = useState<"low" | "high" | "interval" | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleLow = (v: number) => onChange([Math.min(v, high - 1), high]);
  const handleHigh = (v: number) => onChange([low, Math.max(v, low + 1)]);
  const labelLow = labels?.[low] ?? String(low);
  const labelHigh = labels?.[high] ?? String(high);

  const range = max - min || 1;
  const lowPct = ((low - min) / range) * 100;
  const highPct = ((high - min) / range) * 100;
  // Эхлэх толгой: эхнээс (high-1) хүртэлх бүсэд хөдөлгөж болно, байрлал зөв гарна
  const startZonePct = high - 1 <= min ? 100 : Math.min(100, ((high - 1 - min) / range) * 100);
  const highTrackLeft = lowPct;
  const highTrackWidth = ((max - low) / range) * 100;

  const onTrackMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const w = rect.width;
      const lowCenter = (lowPct / 100) * w;
      const highCenter = (highPct / 100) * w;
      const onInterval = x >= lowCenter && x <= highCenter;
      const distLow = Math.abs(x - lowCenter);
      const distHigh = Math.abs(x - highCenter);
      const nearLow = distLow <= THUMB_HOVER_RADIUS;
      const nearHigh = distHigh <= THUMB_HOVER_RADIUS;
      if (onInterval) {
        setHoveredThumb("interval");
      } else if (nearLow && nearHigh) {
        setHoveredThumb(distLow <= distHigh ? "low" : "high");
      } else if (nearLow) {
        setHoveredThumb("low");
      } else if (nearHigh) {
        setHoveredThumb("high");
      } else {
        setHoveredThumb(null);
      }
    },
    [lowPct, highPct]
  );

  const thumbInputClass =
    "range-slider-thumb-input absolute left-0 top-1/2 z-10 h-2 w-full -translate-y-1/2 cursor-pointer";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>{labelLow}</span>
          <span>{labelHigh}</span>
        </div>
      )}
      <div
        ref={trackRef}
        className="range-slider-track-wrap relative h-8 w-full px-0"
        onMouseMove={onTrackMouseMove}
        onMouseLeave={() => setHoveredThumb(null)}
      >
        {/* Нимгэн бүтэн суурь (идэвхгүй) */}
        <div
          className="range-slider-rail-inactive absolute left-0 top-1/2 z-0 h-[2px] w-full -translate-y-1/2 rounded-full"
          aria-hidden
        />
        <div
          className="range-slider-rail-active absolute top-1/2 z-[1] h-[6px] -translate-y-1/2 rounded-full"
          style={{
            left: `${lowPct}%`,
            width: `${highPct - lowPct}%`,
          }}
          aria-hidden
        />
        {/* Start-year thumb: narrow hit zone (z-20) so it's in front and doesn't steal end-year clicks */}
        <div
          className="absolute top-1/2 z-20 -translate-y-1/2 overflow-visible"
          style={{ left: 0, width: `${startZonePct}%`, height: 24 }}
        >
          <input
            type="range"
            min={min}
            max={high - 1}
            step={1}
            value={low}
            onChange={(e) => handleLow(Number(e.target.value))}
            className={thumbInputClass}
          />
        </div>
        {/* End-year thumb: full right side */}
        <div
          className="absolute top-1/2 z-10 -translate-y-1/2 overflow-visible"
          style={{ left: `${highTrackLeft}%`, width: `${highTrackWidth}%`, height: 24 }}
        >
          <input
            type="range"
            min={low}
            max={max}
            step={1}
            value={high}
            onChange={(e) => handleHigh(Number(e.target.value))}
            className={thumbInputClass}
          />
        </div>
        {/* Дугуй дээр cursor очиход оныг харуулах tooltip (зургийн дагуу) */}
        {(hoveredThumb === "low" || hoveredThumb === "interval") && (
          <div
            className="pointer-events-none absolute z-30 flex flex-col items-center -translate-x-1/2"
            style={{ left: `${lowPct}%`, bottom: "100%", marginBottom: 4 }}
          >
            <div className="whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-md dark:bg-gray-800">
              {labelLow}
            </div>
            <span
              className="border-[5px] border-transparent border-t-gray-900 dark:border-t-gray-800"
              style={{ marginTop: -1 }}
              aria-hidden
            />
          </div>
        )}
        {(hoveredThumb === "high" || hoveredThumb === "interval") && (
          <div
            className="pointer-events-none absolute z-30 flex flex-col items-center -translate-x-1/2"
            style={{ left: `${highPct}%`, bottom: "100%", marginBottom: 4 }}
          >
            <div className="whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-md dark:bg-gray-800">
              {labelHigh}
            </div>
            <span
              className="border-[5px] border-transparent border-t-gray-900 dark:border-t-gray-800"
              style={{ marginTop: -1 }}
              aria-hidden
            />
          </div>
        )}
      </div>
    </div>
  );
}
