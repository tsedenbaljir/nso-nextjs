import { COPY, INTRO_FONT } from "@/lib/statcate-intro/constants";
import { loc } from "@/lib/statcate-intro/format";

const PIN_SVG = `<svg class="intro-tip-pin" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
    d="M12 21s7-5.2 7-11.2A7 7 0 0 0 5 9.8C5 15.8 12 21 12 21z"/>
  <circle cx="12" cy="9.8" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/>
</svg>`;

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const introTooltipBase = {
  backgroundColor: "transparent",
  borderWidth: 0,
  borderColor: "transparent",
  padding: 0,
  extraCssText: `font-family: ${INTRO_FONT}; box-shadow: none; background: transparent; border: none;`,
  textStyle: { fontFamily: INTRO_FONT, fontSize: 12, color: "#aeb6c7" },
  className: "sector-intro-echart-tooltip",
};

type TipRow = { label: string; value: string; color?: string };

function tipLabelHtml(row: TipRow) {
  const color = row.color && /^#[0-9a-fA-F]{3,8}$|^rgb/.test(row.color) ? row.color : "";
  const swatch = color
    ? `<span class="intro-tip-swatch" style="background:${escapeHtml(color)}"></span>`
    : "";
  return `<span class="intro-tip-label">${swatch}${escapeHtml(row.label)}</span>`;
}

export function introTooltipHtml(opts: {
  title: string;
  year?: string;
  yearLabel?: string;
  rows?: TipRow[];
  /** Map pin only on region maps — looks odd on line/bar charts. */
  showPin?: boolean;
}) {
  const title = escapeHtml(opts.title.trim());
  if (!title) return "";

  const yearLabel = escapeHtml(opts.yearLabel ?? loc("mn", COPY.year));
  const year = opts.year ? escapeHtml(String(opts.year)) : "";
  const rows = (opts.rows ?? []).filter((row) => row.label || row.value);
  const variant = opts.showPin ? "map" : "chart";

  const blocks: string[] = [];
  if (year) {
    blocks.push(`<div class="intro-tip-row">
      <span class="intro-tip-label">${yearLabel}</span>
      <span class="intro-tip-value">${year}</span>
    </div>`);
  }
  for (const row of rows) {
    if (blocks.length) blocks.push(`<div class="intro-tip-divider"></div>`);
    blocks.push(`<div class="intro-tip-row">
      ${tipLabelHtml(row)}
      <span class="intro-tip-value">${escapeHtml(row.value)}</span>
    </div>`);
  }

  return `<div class="intro-tip intro-tip--${variant}">
    ${opts.showPin ? PIN_SVG : ""}
    <div class="intro-tip-title">${title}</div>
    ${blocks.join("")}
  </div>`;
}

function seriesColor(item: { color?: string; borderColor?: string }) {
  const raw = item.color || item.borderColor || "";
  // ECharts sometimes passes linear-gradient strings; keep solid colors only.
  if (/^#[0-9a-fA-F]{3,8}$/.test(raw)) return raw;
  if (/^rgba?\(/.test(raw)) return raw;
  return undefined;
}

/** Axis / category tooltips: title = axis category; optional shared year; one row per series. */
export function introAxisTooltipFormatter(opts?: {
  lng?: string;
  year?: string;
  valueLabel?: string;
  formatValue?: (value: number, seriesName?: string) => string;
}) {
  const yearLabel = loc(opts?.lng ?? "mn", COPY.year);
  const formatValue =
    opts?.formatValue ??
    ((value: number) =>
      Number.isFinite(value) ? value.toLocaleString(opts?.lng === "en" ? "en-US" : "mn-MN") : "—");

  return (params: unknown) => {
    const items = (Array.isArray(params) ? params : [params]) as {
      axisValueLabel?: string | number;
      axisValue?: string | number;
      name?: string;
      seriesName?: string;
      color?: string;
      borderColor?: string;
      value?: number | string | (number | string | null)[] | null;
      data?: number | string | null;
    }[];

    const first = items[0];
    if (!first) return "";

    const title = String(first.axisValueLabel ?? first.axisValue ?? first.name ?? "").trim();
    const rows = items
      .map((item) => {
        const raw = item.value ?? item.data;
        const num = Array.isArray(raw) ? Number(raw[raw.length - 1]) : Number(raw);
        if (!Number.isFinite(num)) return null;
        const seriesName = String(item.seriesName || opts?.valueLabel || "").trim();
        return {
          label: seriesName || "—",
          value: formatValue(num, seriesName || undefined),
          color: seriesColor(item),
        };
      })
      .filter((row): row is TipRow => Boolean(row));

    // Trend charts already use the year as the axis title — don't repeat it.
    const year = opts?.year && opts.year !== title ? opts.year : undefined;

    return introTooltipHtml({ title, year, yearLabel, rows, showPin: false });
  };
}

export function introItemTooltipFormatter(opts: {
  lng?: string;
  year?: string;
  valueLabel: string;
  formatValue: (value: number) => string;
  color?: string;
}) {
  const yearLabel = loc(opts.lng ?? "mn", COPY.year);
  return (params: unknown) => {
    const item = params as { name?: string; value?: number | string | null; color?: string };
    const title = String(item.name ?? "").trim();
    if (!title) return "";
    const num = Number(item.value);
    if (!Number.isFinite(num)) {
      return introTooltipHtml({ title, year: opts.year, yearLabel, showPin: true });
    }
    return introTooltipHtml({
      title,
      year: opts.year,
      yearLabel,
      rows: [
        {
          label: opts.valueLabel,
          value: opts.formatValue(num),
          color: seriesColor({ color: item.color || opts.color }),
        },
      ],
      showPin: true,
    });
  };
}
