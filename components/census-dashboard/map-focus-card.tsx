"use client";

import { useEffect, useRef } from "react";
import { formatNumber, mapColorScaleCss } from "@/lib/census-dashboard/dashboard";

type Props = {
  title: string;
  subtitle: string;
  note?: string;
  value: number;
  min: number;
  max: number;
  markerValue?: number;
};

export default function MapFocusCard({
  title,
  subtitle,
  note,
  value,
  min,
  max,
  markerValue,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const span = max - min || 1;
  const marker =
    markerValue == null
      ? null
      : Math.min(100, Math.max(0, ((markerValue - min) / span) * 100));

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
        <strong className="map-focus-value">{formatNumber(value)}</strong>
        <div className="map-focus-copy">
          <p className="map-focus-title">{title}</p>
          <p className="map-focus-sub">{subtitle}</p>
        </div>
      </div>
      <div className="map-focus-scale">
        <div className="map-focus-bar-wrap">
          <div className="map-focus-bar" style={{ background: mapColorScaleCss() }} />
          {marker != null ? (
            <span className="map-focus-marker" style={{ left: `${marker}%` }} />
          ) : null}
        </div>
        <div className="map-focus-scale-labels">
          <span className="map-focus-scale-min">{formatNumber(min)}</span>
          <span className="map-focus-scale-max">{formatNumber(max)}</span>
        </div>
      </div>
      {note ? <p className="map-focus-note">{note}</p> : null}
    </div>
  );
}
