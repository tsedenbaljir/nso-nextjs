"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { dashboards } from "@/config/socio-dashboards";
import { Beef, Wheat } from "lucide-react";
import "./socio-dashboard-shell.scss";

type KpiMap = Record<string, { value: string; period: string; growthPercent?: number }>;
type TrendMap = Record<string, { periods: string[]; values: number[] }>;

function formatNumberWithDots(value: number): string {
  const rounded = Math.round(value);
  const str = String(rounded);
  const parts: string[] = [];
  for (let i = str.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) parts.unshift(".");
    parts.unshift(str[i]);
  }
  return parts.join("");
}

function useCountUp(targetValue: string, duration: number = 1500, useCommaThousands: boolean = false): string {
  const [displayValue, setDisplayValue] = useState("0");
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Parse: "3.500.000" → 3500000, "25,841" → 25841, "7.5%" → 7.5
    const match = targetValue.match(/^([\d.,]+)\s*(.*)$/);
    if (!match) {
      queueMicrotask(() => setDisplayValue(targetValue));
      return;
    }
    const suffix = match[2].trim();
    const isDecimalSuffix = suffix !== "" && suffix !== "%" && /^[\d.]*\.\d+[\d.]*$/.test(match[1]);
    const looksLikeDecimal = /^\d+\.\d+$/.test(match[1]);
    const numStr =
      suffix === "%"
        ? match[1]
        : isDecimalSuffix || looksLikeDecimal
          ? match[1].replace(/,/g, "")
          : match[1].replace(/,/g, "").replace(/\./g, "");
    const targetNum = parseFloat(numStr);
    if (!Number.isFinite(targetNum)) {
      queueMicrotask(() => setDisplayValue(targetValue));
      return;
    }

    startTimeRef.current = null;
    const animate = (timestamp: number) => {
      if (startTimeRef.current == null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = targetNum * easeProgress;

      // Формат: хувь бол "X.X%", их наяд бол "X.X их наяд", аравтын бол toFixed(1), тоо бол цэгтэй "X.XXX.XXX"
      let formatted: string;
      if (suffix === "%") {
        formatted = current.toFixed(1) + "%";
      } else if (isDecimalSuffix && suffix) {
        formatted = current.toFixed(1) + " " + suffix;
      } else if (looksLikeDecimal) {
        formatted = current.toFixed(1);
      } else {
        formatted = useCommaThousands
          ? Math.round(current).toLocaleString("en-US")
          : formatNumberWithDots(current);
        if (suffix) formatted += " " + suffix;
      }
      setDisplayValue(formatted);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [targetValue, duration, useCommaThousands]);

  return displayValue;
}

const cardIcons: Record<string, ReactNode> = {
  population: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  cpi: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  "cpi-commodity-prices": <Beef className="size-3 shrink-0" />,
  ppi: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
    >
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M17 18h1" />
      <path d="M12 18h1" />
    </svg>
  ),
  "housing-prices": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  gdp: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
    >
      <path d="M3 3v18h18" />
      <path d="M7 16v-5h4v5" />
      <path d="M13 16V9h4v7" />
      <path d="M17 16v-3h4v3" />
    </svg>
  ),
  unemployment: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  "household-survey": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  ),
  "average-salary": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
    >
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  ),
  "state-budget": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
    >
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-8h6v8" />
    </svg>
  ),
  "foreign-trade": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  "balance-of-payments": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
    >
      <path d="M16 3h5v5" />
      <path d="M8 21H3v-5" />
      <path d="M21 3L14 10" />
      <path d="M3 21l7-7" />
    </svg>
  ),
  "money-finance": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  "society-education": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  "business-register": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  livestock: <Wheat className="size-3 shrink-0" />,
};

/** dashboard.gov.mn-ийн гадаад статистик холбоосууд — карт бүр нэг холбоос */
const EXTERNAL_CARDS: { category: string; name: string; url: string }[] = [
  { category: "ХҮН АМ", name: "Хүн ам", url: "https://dashboard.gov.mn/statistic/kZpIN1A791d4" },
  { category: "ЭДИЙН ЗАСАГ", name: "Валютын ханш", url: "https://dashboard.gov.mn/statistic/h8Qz7Xc2Jk5M" },
  { category: "ЭДИЙН ЗАСАГ", name: "Бодлогын хүү", url: "https://dashboard.gov.mn/statistic/ff2ccb6ba423" },
  { category: "БОЛОВСРОЛ", name: "СӨБ, ЕБС-д хамрагдаж буй хүүхдүүдийн томуугийн өвчлөл", url: "https://dashboard.gov.mn/statistic/A7gK4mZ1xB2Q" },
  { category: "БОЛОВСРОЛ", name: "ЕБС-н ажилтны хөдөлмөр эрхлэлт", url: "https://dashboard.gov.mn/statistic/f369cb89fc62" },
  { category: "БОЛОВСРОЛ", name: "СӨБ-н байгууллагын ажилтны хөдөлмөр эрхлэлт", url: "https://dashboard.gov.mn/statistic/eb624dbe56eb" },
  { category: "НИЙГМИЙН ХАЛАМЖ", name: "Нийгмийн халамжийн ерөнхий мэдээлэл", url: "https://dashboard.gov.mn/statistic/4a8596a7790b" },
  { category: "ЭРҮҮЛ МЭНД", name: "Эрүүл мэнд ерөнхий үзүүлэлт", url: "https://dashboard.gov.mn/statistic/vDa0GOb1K73N" },
  { category: "ЭРҮҮЛ МЭНД", name: "Эмийн үнэ", url: "https://dashboard.gov.mn/statistic/e3d6c4d4599e" },
  { category: "ЭРҮҮЛ МЭНД", name: "Эрүүл мэндийн даатгал", url: "https://dashboard.gov.mn/statistic/02d20bbd7e39" },
  { category: "ЭРҮҮЛ МЭНД", name: "Дархлаажуулалт", url: "https://dashboard.gov.mn/statistic/K8d3PqZ7nM2r" },
  { category: "ЭРҮҮЛ МЭНД", name: "СӨБ, ЕБС-д хамрагдаж буй хүүхдүүдийн томуугийн өвчлөл", url: "https://dashboard.gov.mn/statistic/yGGsLCki0CCT" },
  { category: "ЭРҮҮЛ МЭНД", name: "Эрүүл мэндийн хөдөлмөр эрхлэлт", url: "https://dashboard.gov.mn/statistic/1da51b8d8ff9" },
  { category: "ЭРҮҮЛ МЭНД", name: "Эрүүл мэндийн хүний нөөц", url: "https://dashboard.gov.mn/statistic/0fecf9247f3d" },
  { category: "ЭРҮҮЛ МЭНД", name: "Яаралтай түргэн тусламжийн дуудлага", url: "https://dashboard.gov.mn/statistic/16dc368a89b4" },
  { category: "ХУУЛЬ ЗҮЙ", name: "Хууль зүй, гэмт хэрэг", url: "https://dashboard.gov.mn/statistic/4523540f1504" },
  { category: "ХУУЛЬ ЗҮЙ", name: "Өргөдөл, гомдлын нэгдсэн сан", url: "https://dashboard.gov.mn/statistic/59b524f8de03" },
  { category: "БАЙГАЛЬ ОРЧИН", name: "Цаг уур, орчны шинжилгээ", url: "https://dashboard.gov.mn/statistic/h6VH8t995Vbf" },
  { category: "ЗАМ ТЭЭВЭР", name: "Зам тээврийн ерөнхий мэдээлэл", url: "https://dashboard.gov.mn/statistic/6e4001871c0c" },
  { category: "АЯЛАЛ ЖУУЛЧЛАЛ", name: "Гадаад иргэний НӨАТ-н буцаан олголт", url: "https://dashboard.gov.mn/statistic/R3f7KpX9mN2L" },
  { category: "ЭРЧИМ ХҮЧ", name: "Эрчим хүчний тоон үзүүлэлт", url: "https://dashboard.gov.mn/statistic/b8aed072d294" },
];

const svg = (d: string, className = "size-3 shrink-0") => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

/** Их өгөгдлийн хянах самбар — карт бүрийн icon (url-аар) */
const externalCardIconsByUrl: Record<string, ReactNode> = {
  "https://dashboard.gov.mn/statistic/kZpIN1A791d4": svg("M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75"),
  "https://dashboard.gov.mn/statistic/h8Qz7Xc2Jk5M": svg("M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"),
  "https://dashboard.gov.mn/statistic/ff2ccb6ba423": svg("M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83 M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2"),
  "https://dashboard.gov.mn/statistic/580811fa9526": svg("M22 12h-4l-3 9L9 3l-3 9H2"),
  "https://dashboard.gov.mn/statistic/A7gK4mZ1xB2Q": svg("M2 3h6a4 4 0 0 1 4 4v14H2V3z M22 3h-6a4 4 0 0 0-4 4v14h10V7z M16 11h2 M12 11h2"),
  "https://dashboard.gov.mn/statistic/f369cb89fc62": svg("M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z M8 7h8 M8 11h8"),
  "https://dashboard.gov.mn/statistic/eb624dbe56eb": svg("M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10"),
  "https://dashboard.gov.mn/statistic/4a8596a7790b": svg("M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"),
  "https://dashboard.gov.mn/statistic/fb84a9739699": svg("M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"),
  "https://dashboard.gov.mn/statistic/8e28c5eb829e": svg("M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"),
  "https://dashboard.gov.mn/statistic/vDa0GOb1K73N": svg("M22 12h-4l-3 9L9 3l-3 9H2"),
  "https://dashboard.gov.mn/statistic/t8Kp1zM3qW4b": svg("M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 6v6l4 2"),
  "https://dashboard.gov.mn/statistic/e3d6c4d4599e": svg("M10.5 2h3v6l5 2-5 2v6h-3v-6l-5-2 5-2V2z"),
  "https://dashboard.gov.mn/statistic/02d20bbd7e39": svg("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"),
  "https://dashboard.gov.mn/statistic/K8d3PqZ7nM2r": svg("M22 12h-4l-3 9L9 3l-3 9H2"),
  "https://dashboard.gov.mn/statistic/yGGsLCki0CCT": svg("M2 3h6a4 4 0 0 1 4 4v14H2V3z M22 3h-6a4 4 0 0 0-4 4v14h10V7z"),
  "https://dashboard.gov.mn/statistic/1da51b8d8ff9": svg("M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M8.5 3a4 4 0 0 1 7 0 M12 11h6 M16 15h6"),
  "https://dashboard.gov.mn/statistic/0fecf9247f3d": svg("M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 8 0 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75"),
  "https://dashboard.gov.mn/statistic/16dc368a89b4": svg("M22 12h-4l-3 9L9 3l-3 9H2 M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83"),
  "https://dashboard.gov.mn/statistic/4523540f1504": svg("M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"),
  "https://dashboard.gov.mn/statistic/59b524f8de03": svg("M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"),
  "https://dashboard.gov.mn/statistic/h6VH8t995Vbf": svg("M18 20V10 M12 20V4 M6 20v-6"),
  "https://dashboard.gov.mn/statistic/6e4001871c0c": svg("M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83 M5 17l5-5 5 5 M12 7v10"),
  "https://dashboard.gov.mn/statistic/R3f7KpX9mN2L": svg("M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10 M16 5l2-2 2 2 M19 9l2 2-2 2"),
  "https://dashboard.gov.mn/statistic/b8aed072d294": svg("M13 2L3 14h9l-1 8 10-12h-9l1-8z"),
};

const defaultCardIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0-8V7h14v2H7z" />
  </svg>
);

/** Салбар бүрийн өнгө */
const CATEGORY_COLORS: Record<string, string> = {
  "ХҮН АМ": "#64748b",        // slate бүдэг
  "ЭДИЙН ЗАСАГ": "#0050C3",   // цэнхэр (primary)
  "БОЛОВСРОЛ": "#78909c",     // blue-gray бүдэг
  "НИЙГМИЙН ХАЛАМЖ": "#607d8b", // blue-gray бүдэг
  "ЭРҮҮЛ МЭНД": "#26a69a",    // teal бүдэг
  "ХУУЛЬ ЗҮЙ": "#546e7a",     // blue-gray бүдэг
  "БАЙГАЛЬ ОРЧИН": "#66bb6a", // green бүдэг
  "ЗАМ ТЭЭВЭР": "#8d6e63",    // brown бүдэг
  "АЯЛАЛ ЖУУЛЧЛАЛ": "#5c6bc0", // indigo бүдэг
  "ЭРЧИМ ХҮЧ": "#ffa726",     // orange бүдэг
  "ХӨДӨЛМӨР": "#26a69a",      // teal бүдэг
  "НИЙГЭМ": "#42a5f5",        // blue бүдэг
  "Тест": "#9e9e9e",          // саарал
  // "Бизнес регистр": "#0050C3", // цэнхэр
};

const EXTERNAL_CATEGORIES = [...new Set(EXTERNAL_CARDS.map((c) => c.category))];

/** Дотоод dashboards-ийн салбарууд */
const DASHBOARD_CATEGORIES = [...new Set(dashboards.map((d) => d.category).filter(Boolean))] as string[];

/** Нэгдсэн бүх салбарууд */
const ALL_CATEGORIES = [...new Set([...DASHBOARD_CATEGORIES, ...EXTERNAL_CATEGORIES])];

/** Үндсэн салбарууд (дотоод dashboard-тай) */
const PRIMARY_CATEGORIES = ["ХҮН АМ", "ЭДИЙН ЗАСАГ", "ХӨДӨЛМӨР", "НИЙГЭМ"];

/** Их өгөгдлийн хянах самбарын салбарууд */
const SECONDARY_CATEGORIES = ["БОЛОВСРОЛ", "НИЙГМИЙН ХАЛАМЖ", "ЭРҮҮЛ МЭНД", "ХУУЛЬ ЗҮЙ", "БАЙГАЛЬ ОРЧИН", "ЗАМ ТЭЭВЭР", "АЯЛАЛ ЖУУЛЧЛАЛ", "ЭРЧИМ ХҮЧ"];

function getDisplayKpi(
  d: (typeof dashboards)[number],
  kpiMap: KpiMap,
): { value: string; period: string; growthPercent?: number } {
  const fromApi = kpiMap[d.id];
  return {
    value: fromApi?.value ?? d.kpiValue ?? "—",
    period: fromApi?.period ?? d.kpiPeriod ?? "",
    growthPercent: fromApi?.growthPercent,
  };
}

function formatSparklineValue(v: number): string {
  if (Math.abs(v) >= 1000) return formatNumberWithDots(Math.round(v));
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

const BOP_CHART_COLOR = "#0050C3";
const BOP_AREA_FILL = "rgba(0, 80, 195, 0.15)";

function CardTrendChart({
  periods,
  values,
  className,
  valueSuffix,
}: {
  periods: string[];
  values: number[];
  className?: string;
  valueSuffix?: string;
}) {
  if (!values.length) return null;
  const formatVal = (val: number) => {
    if (valueSuffix?.trim() === "%") return `${val.toFixed(1)}%`;
    const num = formatSparklineValue(val);
    return valueSuffix ? `${num} ${valueSuffix.trim()}` : num;
  };
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const useLogScale = minVal > 0 && maxVal / minVal > 5;
  const chartOption: EChartsOption = {
    animation: true,
    animationDuration: 1200,
    animationEasing: "cubicOut",
    grid: { left: 0, right: 0, top: 4, bottom: 0 },
    xAxis: { show: false, type: "category", data: periods },
    yAxis: {
      show: false,
      type: useLogScale ? "log" : "value",
      ...(useLogScale ? { min: minVal } : {}),
    },
    tooltip: {
      trigger: "axis",
      confine: false,
      appendTo: typeof document !== "undefined" ? "body" : undefined,
      borderColor: "#e2e8f0",
      borderWidth: 1,
      backgroundColor: "#ffffff",
      padding: [12, 16],
      textStyle: { color: "#334155", fontSize: 12 },
      extraCssText: "z-index: 999999 !important; min-width: 9rem; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); font-family: Arial, sans-serif;",
      formatter: (p: unknown) => {
        const arr = Array.isArray(p) ? p : [];
        const axisVal = (arr[0] as { axisValue?: string })?.axisValue ?? "";
        const val = (arr[0] as { value?: number })?.value;
        const valueStr = val != null && Number.isFinite(val) ? formatVal(val) : "—";
        return `<div style="display:flex;flex-direction:column;">
          <div style="display:flex;align-items:center;gap:6px;color:#334155;font-weight:500;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;"></span>
            ${axisVal}
          </div>
          <div style="margin-top:6px;padding-top:6px;border-top:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;gap:16px;">
            <span style="color:#64748b;">Утга</span>
            <span style="font-weight:600;color:#0f172a;">${valueStr}</span>
          </div>
        </div>`;
      },
    },
    series: [{
      type: "line",
      smooth: true,
      symbol: "none",
      lineStyle: { color: BOP_CHART_COLOR, width: 1.5 },
      areaStyle: { color: BOP_AREA_FILL },
      data: values,
    }],
  };
  return (
    <div className={`w-[80px] h-9 shrink-0 ${className ?? ""}`}>
      <ReactECharts option={chartOption} style={{ height: 36 }} notMerge />
    </div>
  );
}

function CardSparkline({
  values,
  periods,
  chartId,
  valueSuffix,
  colorVariant,
}: {
  values: number[];
  periods?: string[];
  chartId: string;
  valueSuffix?: string;
  /** BOP-ийн графиктай ижил өнгө — цэнхэр шугам, дүүргэлт */
  colorVariant?: "bop";
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isBop = colorVariant === "bop";

  if (!values.length) return null;
  const w = 80;
  const h = 36;
  const pad = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const n = values.length;
  const coords = values.map((v, i) => {
    const x = pad + (i / Math.max(n - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const linePath = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1]![0]} ${h - pad} L ${coords[0]![0]} ${h - pad} Z`;
  const gradientId = `sparkline-${chartId}`;
  const strokeColor = isBop ? BOP_CHART_COLOR : "var(--primary)";

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const innerW = w - pad * 2;
    const t = Math.max(0, Math.min(1, (x - pad) / innerW));
    const idx = n > 1 ? Math.round(t * (n - 1)) : 0;
    setHoverIndex(idx);

    const pointCoord = coords[idx];
    if (pointCoord) {
      setTooltipPos({
        x: rect.left + pointCoord[0],
        y: rect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setTooltipPos(null);
  };

  const point = hoverIndex != null ? coords[hoverIndex] : null;
  const periodLabel =
    hoverIndex != null && periods?.[hoverIndex] != null
      ? periods[hoverIndex]
      : null;
  const valueLabel =
    hoverIndex != null ? `${formatSparklineValue(values[hoverIndex]!)}${valueSuffix ?? ""}` : null;
  const showTooltip = hoverIndex != null && valueLabel != null && point && tooltipPos;

  return (
    <div className="relative shrink-0" onMouseLeave={handleMouseLeave}>
      {showTooltip && typeof document !== "undefined" && document.body && createPortal(
        <div
          className="pointer-events-none fixed z-[9999] flex min-w-[9rem] flex-col rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 8,
            transform: "translate(-50%, -100%)",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {periodLabel && (
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              {periodLabel}
            </div>
          )}
          <div className="mt-1.5 flex items-center justify-between gap-4 border-t border-slate-100 pt-1.5">
            <span className="text-slate-500">Утга</span>
            <span className="font-semibold text-slate-900">{valueLabel}</span>
          </div>
        </div>,
        document.body
      )}
      <svg
        ref={svgRef}
        width={w}
        height={h}
        className="overflow-visible"
        aria-hidden
        onMouseMove={handleMouseMove}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="1" y2="0">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={isBop ? 0.4 : 0.3} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={isBop ? BOP_AREA_FILL : `url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {point && (
          <circle
            cx={point[0]}
            cy={point[1]}
            r={3}
            fill={strokeColor}
            stroke="var(--background)"
            strokeWidth={1.5}
          />
        )}
      </svg>
    </div>
  );
}

function getLastPeriodGrowth(values: number[]): { value: string; isPositive: boolean } | null {
  if (!values || values.length < 2) return null;
  const prev = values[values.length - 2]!;
  const curr = values[values.length - 1]!;
  if (prev === 0) return null;
  const pct = ((curr - prev) / prev) * 100;
  const rounded = Math.round(pct * 10) / 10;
  const sign = rounded >= 0 ? "+" : "";
  return { value: `${sign}${rounded}%`, isPositive: rounded >= 0 };
}

function AnimatedKpiValue({
  value,
  period,
  percent,
  kpiFormat,
  growthPercent,
  valueSuffix,
  useCommaThousands,
}: {
  value: string;
  period: string;
  percent: string;
  kpiFormat?: "number" | "percent" | "index-to-percent";
  growthPercent?: { value: string; isPositive: boolean } | null;
  valueSuffix?: string;
  useCommaThousands?: boolean;
}) {
  const animated = useCountUp(value, 1500, useCommaThousands ?? false);
  const showPercent =
    percent && (kpiFormat === "percent" || kpiFormat === "index-to-percent");
  return (
    <p className="mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm font-bold text-[var(--foreground)] sm:text-base">
      <span className="min-w-0 break-words">
        {animated.includes("%")
          ? animated
          : animated.replace(".", ",").replace(".", ",")}{valueSuffix ? ` ${valueSuffix}` : ""}
      </span>
      {growthPercent != null ? (
        <span
          className={`shrink-0 text-sm font-normal ${growthPercent.isPositive ? "text-[var(--chart-growth)]" : "text-red-600 dark:text-red-400"}`}
        >
          {growthPercent.value}
        </span>
      ) : null}
      {period ? (
        <span className="shrink-0 text-sm font-normal text-[var(--muted-foreground)] whitespace-nowrap">
          {showPercent && <span className="text-green-500">{percent}</span>} (
          {period})
        </span>
      ) : null}
    </p>
  );
}

export default function SocioEconomicDashboardHome({ lng }: { lng: string }) {
  const [kpiMap, setKpiMap] = useState<KpiMap>({});
  const [trendMap, setTrendMap] = useState<TrendMap>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const dashboardCardHref = (d: (typeof dashboards)[number]) => {
    if (d.cardHref?.startsWith("http")) return d.cardHref;
    if (d.cardHref) return `/${lng}${d.cardHref}`;
    const slug = d.id === "business-register" ? "business" : d.id;
    return `/${lng}/s-e-dashboard/${slug}`;
  };

  useEffect(() => {
    fetch("/api/socio-dashboard/kpi")
      .then((r) => r.json())
      .then((data: KpiMap) => setKpiMap(data))
      .catch(() => { });
  }, []);

  useEffect(() => {
    fetch("/api/socio-dashboard/kpi/trend")
      .then((r) => r.json())
      .then((data: TrendMap) => setTrendMap(data))
      .catch(() => { });
  }, []);

  // const handleGovCardClick = async (url: string, title: string) => {
  //   if (govTokenLoading) return;
  //   setGovTokenLoading(true);
  //   try {
  //     const res = await fetch("/api/auth/gov-token", { cache: "no-store" });
  //     const data = (await res.json()) as { access_token?: string; error?: string };
  //     if (!res.ok || !data.access_token) {
  //       alert(data.error ?? "Токен авахад алдаа гарлаа.");
  //       return;
  //     }
  //     const sep = url.includes("?") ? "&" : "?";
  //     const targetUrl = `${url}${sep}access_token=${encodeURIComponent(data.access_token)}`;
  //     setGovIframeTitle(title);
  //     setGovIframeUrl(targetUrl);
  //   } catch {
  //     alert("Токен татах боломжгүй байна.");
  //   } finally {
  //     setGovTokenLoading(false);
  //   }
  // };

  return (
    <div className="socio-dash-root min-h-auto min-w-0 overflow-x-hidden bg-[var(--background)]">
      <main className="mx-auto w-full min-w-0 max-w-[90rem] px-3 pt-4 pb-10 sm:px-6 sm:pt-6">
          <>
          {/* <h1 className="text-head-title mb-4 text-lg font-medium text-[var(--foreground)] sm:mb-6 sm:text-xl">
            Монгол Улсын нийгэм, эдийн засгийн үндсэн үзүүлэлтүүд
          </h1> */}
          <p className="mb-4 hidden text-sm leading-relaxed text-[var(--muted-foreground)] sm:mb-6 sm:block w-full">
          Энэ хэсгээс Үндэсний статистикийн хорооноос боловсруулдаг Монгол Улсын хүн ам, нийгэм, эдийн засгийн үндсэн статистик мэдээлэлтэй танилцах боломжтой.
          </p>

          {/* Category filter - үндсэн салбарууд */}
          <div className="mb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 pb-2">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${selectedCategory === null
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
                  }`}
              >
                Бүгд
              </button>
              {PRIMARY_CATEGORIES.map((cat) => {
                const color = CATEGORY_COLORS[cat] ?? "#0050C3";
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-all hover:shadow-sm"
                    style={{
                      backgroundColor: isSelected ? color : `${color}10`,
                      color: isSelected ? "#fff" : color,
                      boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
                    }}
                  >
                    <span
                      className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: isSelected ? "#fff" : color }}
                    />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>


          <ul className="socio-dash-kpi-grid">
            {dashboards
              .filter((d) => selectedCategory === null || d.category === selectedCategory)
              .map((d) => {
                const catColor = CATEGORY_COLORS[d.category ?? ""] ?? "#0050C3";
                return (
                  <li key={d.id} className="socio-dash-kpi-grid__cell">
                    <Link
                      href={dashboardCardHref(d)}
                      className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-lg border border-[var(--card-border)] border-l-4 bg-[var(--card-bg)] p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:shadow-none dark:hover:shadow-md sm:p-4"
                      style={{ borderLeftColor: catColor }}
                    >
                      {/* Ангилал + icon нэг мөр; гарчиг доор бүтэн өргөнөөр */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            {d.category ? (
                              <p
                                className="text-xs font-medium uppercase tracking-wider"
                                style={{ color: catColor }}
                              >
                                {d.category}
                              </p>
                            ) : null}
                          </div>
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: `${catColor}15`, color: catColor }}
                            aria-hidden
                          >
                            {cardIcons[d.id] ?? (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="size-3"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0-8V7h14v2H7z"
                                />
                              </svg>
                            )}
                          </span>
                        </div>
                        <h2 className="w-full min-w-0 text-sm font-medium leading-snug text-[var(--foreground)] group-hover:text-[var(--primary)] sm:text-base break-words">
                          {d.name}
                        </h2>
                      </div>
                      {/* {d.description && (
                  <p className="mt-2 text-sm font-normal leading-relaxed text-[var(--muted-foreground)]">
                    {d.description}
                  </p>
                )} */}
                      {(() => {
                        const kpi = getDisplayKpi(d, kpiMap);
                        const hasKpi = kpi.value !== "—" || kpi.period || d.kpiLabel;
                        const trend = trendMap[d.id];
                        return (
                          <div className="mt-auto pt-3">
                            {hasKpi ? (
                              <>
                                <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-2">
                                  <div className="flex min-w-0 max-w-full flex-1 flex-wrap items-baseline gap-1">
                                    {d.kpiLabel && (
                                      <span className="shrink-0 text-xs font-medium text-[var(--muted-foreground)]">
                                        {d.kpiLabel}
                                      </span>
                                    )}
                                    {!d.hideKpiValue && (
                                      <AnimatedKpiValue
                                        value={kpi.value}
                                        period={kpi.period}
                                        percent={
                                          d.percent != null ? String(d.percent) : ""
                                        }
                                        kpiFormat={d.kpiFormat}
                                        valueSuffix={d.kpiValueSuffix}
                                        useCommaThousands={d.id === "cpi-commodity-prices"}
                                        growthPercent={
                                          kpi.growthPercent != null && d.id !== "balance-of-payments"
                                            ? { value: `${kpi.growthPercent >= 0 ? "+" : ""}${kpi.growthPercent.toFixed(1)}%`, isPositive: kpi.growthPercent >= 0 }
                                            : trend?.values?.length >= 2 &&
                                              !["cpi", "ppi", "housing-prices", "unemployment", "balance-of-payments", "cpi-commodity-prices"].includes(d.id)
                                              ? getLastPeriodGrowth(trend.values) ?? null
                                              : null
                                        }
                                      />
                                    )}
                                  </div>
                                  {trend?.values?.length ? (
                                    <CardTrendChart
                                      periods={trend.periods}
                                      values={trend.values}
                                      className="shrink-0 min-w-0 max-w-[80px]"
                                      valueSuffix={d.trendValueSuffix}
                                    />
                                  ) : null}
                                </div>
                              </>
                            ) : (
                              <span className="inline-flex items-center text-sm font-medium text-[var(--primary)]">
                                Самбар нээх
                                <svg
                                  className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </Link>
                  </li>
                );
              })}
          </ul>
          </>

        {/* <section className="mt-8 sm:mt-10">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)] sm:mb-5 sm:text-xl">
            Их өгөгдлийн хянах самбар
          </h2>

          <div className="mb-5 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1.5 pb-2">
              <button
                type="button"
                onClick={() => setSelectedBigDataCategory(null)}
                className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedBigDataCategory === null
                    ? "bg-slate-800 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                Бүгд
              </button>
              <button
                type="button"
                onClick={() => setSelectedBigDataCategory("ЭДИЙН ЗАСАГ")}
                className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-all hover:shadow-sm ${
                  selectedBigDataCategory === "ЭДИЙН ЗАСАГ"
                    ? "text-white"
                    : ""
                }`}
                style={{
                  backgroundColor: selectedBigDataCategory === "ЭДИЙН ЗАСАГ" ? (CATEGORY_COLORS["ЭДИЙН ЗАСАГ"] ?? "#0050C3") : `${CATEGORY_COLORS["ЭДИЙН ЗАСАГ"] ?? "#0050C3"}10`,
                  color: selectedBigDataCategory === "ЭДИЙН ЗАСАГ" ? "#fff" : (CATEGORY_COLORS["ЭДИЙН ЗАСАГ"] ?? "#0050C3"),
                  boxShadow: selectedBigDataCategory === "ЭДИЙН ЗАСАГ" ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
                }}
              >
                <span
                  className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: selectedBigDataCategory === "ЭДИЙН ЗАСАГ" ? "#fff" : (CATEGORY_COLORS["ЭДИЙН ЗАСАГ"] ?? "#0050C3") }}
                />
                ЭДИЙН ЗАСАГ
              </button>
              {EXTERNAL_CATEGORIES.filter((c) => c !== "ЭДИЙН ЗАСАГ" && c !== "ХҮН АМ").map((cat) => {
                const color = CATEGORY_COLORS[cat] ?? "#64748b";
                const isSelected = selectedBigDataCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedBigDataCategory(cat)}
                    className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-all hover:shadow-sm"
                    style={{
                      backgroundColor: isSelected ? color : `${color}10`,
                      color: isSelected ? "#fff" : color,
                      boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
                    }}
                  >
                    <span
                      className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: isSelected ? "#fff" : color }}
                    />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {EXTERNAL_CARDS
              .filter((card) => card.name !== "Хүн ам")
              .filter((card) => selectedBigDataCategory === null || card.category === selectedBigDataCategory)
              .map((card) => {
                const catColor = CATEGORY_COLORS[card.category] ?? "#0050C3";
                return (
                  <li key={card.url} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => handleGovCardClick(card.url, card.name)}
                      disabled={govTokenLoading}
                      className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-lg border border-[var(--card-border)] border-l-4 bg-[var(--card-bg)] p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 dark:shadow-none dark:hover:shadow-md sm:p-4"
                      style={{ borderLeftColor: catColor }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {card.category && (
                            <span
                              className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                              style={{ backgroundColor: `${catColor}15`, color: catColor }}
                            >
                              {card.category}
                            </span>
                          )}
                          <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-[var(--foreground)] group-hover:text-[var(--primary)]">
                            {card.name}
                          </h3>
                        </div>
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${catColor}15`, color: catColor }}
                          aria-hidden
                        >
                          {externalCardIconsByUrl[card.url] ?? defaultCardIcon}
                        </span>
                      </div>
                      <div className="mt-auto flex justify-end pt-3">
                        <span
                          className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors group-hover:text-white"
                          style={{
                            backgroundColor: `${catColor}15`,
                            color: catColor,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = catColor;
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = `${catColor}15`;
                            e.currentTarget.style.color = catColor;
                          }}
                        >
                          {govTokenLoading ? "Ачааллаж байна..." : "Самбар нээх"}
                          <svg className="ml-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
          </ul>
        </section> */}
      </main>

      {/* {govIframeUrl && (
        <div
          className="fixed inset-x-0 bottom-0 z-[60] flex flex-col bg-[var(--background)] shadow-lg top-[4.5rem] sm:top-[5rem] max-sm:pb-[env(safe-area-inset-bottom)]"
          aria-modal="true"
          role="dialog"
        >
          <div className="flex shrink-0 items-center gap-2 sm:gap-3 overflow-hidden border-b border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2.5 sm:px-4 sm:py-3 sm:pr-6">
            <span className="min-w-0 flex-1 truncate text-xs sm:text-sm font-medium text-[var(--foreground)]">
              {govIframeTitle || "СМТТ-ийн дашбоард"}
            </span>
            <button
              type="button"
              onClick={() => setGovIframeUrl(null)}
              className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md bg-[var(--primary)] px-3 py-2 sm:px-4 text-sm font-medium text-white shadow hover:opacity-90"
              aria-label="Цонх хаах"
            >
              Хаах
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden p-1.5 sm:p-2">
            <iframe
              src={govIframeUrl}
              title={govIframeTitle || "СМТТ-ийн дашбоард"}
              className="h-full w-full rounded border border-[var(--card-border)] bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              allow="fullscreen"
            />
          </div>
        </div>
      )} */}
    </div>
  );
}
