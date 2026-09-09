"use client";

import { useEffect, useRef } from "react";
import {
  countClassLabels,
  formatNumber,
  formatPercent,
  legendMarkerPercent,
  MAP_COLORS,
  percentClassLabels,
  type ColorClass,
} from "@/lib/census-dashboard/dashboard";

type Props = {
  title: string;
  subtitle: string;
  note?: string;
  value: number;
  classes: ColorClass[];
<<<<<<< HEAD
=======
  colors?: string[];
  classLabels?: string[];
>>>>>>> 57db59cc3621a9a85e9ee2e1cc194a1c05f43e9b
  markerValue?: number;
  percent?: boolean;
};

export default function MapFocusCard({
  title,
  subtitle,
  note,
  value,
  classes,
<<<<<<< HEAD
=======
  colors,
  classLabels,
>>>>>>> 57db59cc3621a9a85e9ee2e1cc194a1c05f43e9b
  markerValue,
  percent = false,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mode = percent ? "percent" : "auto";
  const marker =
    markerValue == null
      ? null
      : legendMarkerPercent(markerValue, { mode, classes });
<<<<<<< HEAD
  const labels = percent ? percentClassLabels(classes) : countClassLabels(classes);
  const swatches = MAP_COLORS.slice(0, Math.max(1, classes.length));
=======
  const labels =
    classLabels ??
    (percent ? percentClassLabels(classes) : countClassLabels(classes));
  const swatches = (colors?.length ? colors : MAP_COLORS).slice(
    0,
    Math.max(1, classes.length),
  );
>>>>>>> 57db59cc3621a9a85e9ee2e1cc194a1c05f43e9b

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
<<<<<<< HEAD
        <div className={`map-focus-classes${percent ? "" : " is-count"}`}>
=======
        <div
          className={`map-focus-classes${percent ? "" : " is-count"}`}
          style={{ gridTemplateColumns: `repeat(${swatches.length}, minmax(0, 1fr))` }}
        >
>>>>>>> 57db59cc3621a9a85e9ee2e1cc194a1c05f43e9b
          {swatches.map((color, i) => (
            <div key={color} className="map-focus-class">
              <span
                className="map-focus-class-swatch"
                style={{ background: color }}
              />
              <span className="map-focus-class-label">{labels[i]}</span>
            </div>
          ))}
          {marker != null ? (
            <span className="map-focus-marker" style={{ left: `${marker}%` }} aria-hidden>
              <svg viewBox="0 0 16 12" width="16" height="12">
                <polygon
                  points="8,11 1.2,1.6 14.8,1.6"
                  fill="#fff"
                  stroke="#111"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          ) : null}
        </div>
      </div>
      {note ? <p className="map-focus-note">{note}</p> : null}
    </div>
  );
}
