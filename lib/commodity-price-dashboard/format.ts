const FLAT = 0.05;

export function formatAmount(value: number | null | undefined) {
  if (value == null) return null;
  return Math.round(value).toLocaleString("mn-MN");
}

export function formatTugrik(value: number | null | undefined) {
  const amount = formatAmount(value);
  if (amount == null) return "—";
  return `${amount} ₮`;
}

export function formatPct(value: number | null | undefined) {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function changeKind(value: number | null | undefined) {
  if (value == null || Math.abs(value) < FLAT) return "flat" as const;
  return value > 0 ? ("up" as const) : ("down" as const);
}

export function changeArrow(value: number | null | undefined) {
  const kind = changeKind(value);
  if (kind === "flat") return "→";
  return kind === "up" ? "▲" : "▼";
}

export function pctChange(
  current: number | null | undefined,
  previous: number | null | undefined,
) {
  if (current == null || previous == null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function shortName(name: string) {
  const parts = name.split(",").map((part) => part.trim());
  const last = parts[parts.length - 1] ?? "";
  if (parts.length > 1 && /^(кг|л|ш|гр|г|\d)/u.test(last)) {
    return parts.slice(0, -1).join(", ");
  }
  return parts[0] ?? name;
}

export function productUnit(name: string) {
  return name.split(",").pop()?.trim() || name;
}

export function formatMonth(iso: string) {
  const [year, month] = iso.split("-");
  return `${year} оны ${Number(month)}-р сар`;
}

export function monthDot(iso: string) {
  const [year, month] = iso.split("-");
  return `${year}.${month}`;
}
