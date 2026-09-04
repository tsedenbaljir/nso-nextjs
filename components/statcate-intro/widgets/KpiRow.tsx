"use client";

import { INTRO_COLORS } from "@/lib/statcate-intro/constants";
import { formatValue } from "@/lib/statcate-intro/format";
import { resolveIcon, resolveIconImage } from "@/lib/statcate-intro/icons";
import { nationalValue, yearOrLatest } from "@/lib/statcate-intro/query";
import type { KpiWidget } from "@/lib/statcate-intro/types";
import type { IntroDashboardState } from "@/components/statcate-intro/useIntroDashboard";

type Props = {
  widget: KpiWidget;
  dash: IntroDashboardState;
};

export default function KpiRow({ widget, dash }: Props) {
  const { config, tables, year, lng } = dash;
  if (!config || !year) return null;

  const palette = config.palette ?? INTRO_COLORS;
  const ids = widget.tables ?? config.tables.map((table) => table.id);
  const items = ids
    .map((id) => tables.find((table) => table.id === id))
    .filter((table): table is NonNullable<typeof table> => Boolean(table))
    .map((table) => {
      const usedYear = yearOrLatest(table.rows, config, year);
      return {
        id: table.id,
        label: table.label,
        unit: table.unit,
        format: table.format,
        icon: table.icon,
        year: usedYear !== year ? usedYear : undefined,
        value: nationalValue(table.rows, config, year, undefined, table, true),
      };
    });

  return (
    <section className="sector-intro-kpis">
      {items.map((item, i) => {
        const image = resolveIconImage(item.icon);
        const Icon = resolveIcon(item.icon);
        return (
          <article
            key={item.id}
            className="sector-intro-kpi"
            style={{ ["--accent" as string]: palette[i % palette.length] }}
          >
            <span className="sector-intro-kpi-icon">
              {image ? <img src={image} alt="" width={44} height={44} /> : <Icon size={22} />}
            </span>
            <div>
              <strong>{formatValue(item.value, lng, item.format)}</strong>
              <p>
                {item.label}
                {item.year ? ` · ${item.year}` : ""}
                {item.unit ? ` · ${item.unit}` : ""}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
