import type { LocalizedText } from "@/lib/statcate-intro/types";

export function loc(lng: string, text: LocalizedText) {
  return lng === "en" ? text.en : text.mn;
}

export function num(value: unknown) {
  return finiteNum(value) ?? 0;
}

/** null / "" / NaN → null. Жинхэнэ 0-ийг 0 гэж үлдээнэ. */
export function finiteNum(value: unknown) {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
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
  value: number | null | undefined,
  lng: string,
  format: "count" | "percent" | "decimal" | "currency" = "count",
) {
  if (value == null || !Number.isFinite(value)) return "—";
  const locale = lng === "en" ? "en-US" : "mn-MN";
  if (format === "percent") {
    return `${value.toLocaleString(locale, { maximumFractionDigits: 1, minimumFractionDigits: 0 })}%`;
  }
  if (format === "decimal") {
    const digits = Number.isInteger(value) ? 0 : Math.abs(value) >= 100 ? 1 : 2;
    return value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  if (format === "currency") {
    return value.toLocaleString(locale, { maximumFractionDigits: 0 });
  }
  return formatCount(value, lng);
}
