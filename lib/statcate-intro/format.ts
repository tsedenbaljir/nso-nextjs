import type { LocalizedText } from "@/lib/statcate-intro/types";

export function loc(lng: string, text: LocalizedText) {
  return lng === "en" ? text.en : text.mn;
}

export function num(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function trimLabel(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function formatCount(value: number, lng: string) {
  return value.toLocaleString(lng === "en" ? "en-US" : "mn-MN", {
    maximumFractionDigits: 0,
  });
}

export function formatValue(
  value: number,
  lng: string,
  format: "count" | "percent" | "decimal" | "currency" = "count",
) {
  const locale = lng === "en" ? "en-US" : "mn-MN";
  if (format === "percent") {
    return `${value.toLocaleString(locale, { maximumFractionDigits: 1, minimumFractionDigits: 0 })}%`;
  }
  if (format === "decimal") {
    return value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (format === "currency") {
    return value.toLocaleString(locale, { maximumFractionDigits: 0 });
  }
  return formatCount(value, lng);
}
