"use client";

import { useEffect, useRef } from "react";
import {
  countClassLabels,
  formatNumber,
  formatPercent,
  legendMarkerPercent,
  MAP_COLORS,
  PERCENT_CLASS_LABELS,
  quantileClasses,
} from "@/lib/census-dashboard/dashboard";

type Props = {
  title: string;
  subtitle: string;
  note?: string;
  value: number;
  min: number;
  max: number;
  sorted: number[];
  markerValue?: number;
  percent?: boolean;
};

export default function MapFocusCard({
  title,
  subtitle,
  note,
  value,
  sorted,
  markerValue,
  percent = false,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mode = percent ? "percent" : "auto";
  const classes = quantileClasses(sorted);
  const marker =
    markerValue == null
      ? null
      : legendMarkerPercent(markerValue, { mode, classes });
  const labels = percent ? PERCENT_CLASS_LABELS : countClassLabels(sorted);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return undefined;
    // Хүрэлцэх дэлгэц дээр tap нь mousemove төрүүлж, карт бүдгэрсэн хэвээр
    // үлддэг тул зөвхөн хулгана байхад л нуух дүрмийг хэрэглэнэ.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return undefined;
    }

    const onMove = (event: MouseEvent) => {
      const box = el.getBoundingClientRect();
      const over =
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom;
      el.classList.toggle("is-map-peek", over);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={elRef} className="map-focus">
      <div className="map-focus-main">
        <strong className="map-focus-value">
          {percent ? formatPercent(value) : formatNumber(value)}
        </strong>
        <div className="map-focus-copy">
          <p className="map-focus-title">{title}</p>
          <p className="map-focus-sub">{subtitle}</p>
        </div>
      </div>
      <div className="map-focus-scale">
        <div className={`map-focus-classes${percent ? "" : " is-count"}`}>
          {MAP_COLORS.map((color, i) => (
            <div key={color} className="map-focus-class">
              <span
                className="map-focus-class-swatch"
                style={{ background: color }}
              />
              <span className="map-focus-class-label">{labels[i]}</span>
            </div>
          ))}
          {marker != null ? (
            <span className="map-focus-marker" style={{ left: `${marker}%` }} />
          ) : null}
        </div>
      </div>
      {note ? <p className="map-focus-note">{note}</p> : null}
    </div>
  );
}
