"use client";

import { useMemo } from "react";
import type { Periods, PriceRow } from "@/lib/commodity-price-dashboard/nso";
import {
  changeKind,
  formatAmount,
  formatPct,
  formatTugrik,
  monthDot,
  pctChange,
  shortName,
} from "@/lib/commodity-price-dashboard/format";
import type { CpiPpiFile } from "@/lib/commodity-price-dashboard/useCpiPpiMonthly";
import { ProductIcon } from "./product-icon";
import { PpiStars, WeeklyPpiLegend } from "./price-notes";
import { ppiProductStars } from "@/lib/commodity-price-dashboard/price-notes";

type Props = {
  rows: PriceRow[];
  selected: string[];
  periods: Periods;
  onToggle: (product: string) => void;
  monthly: CpiPpiFile;
};

export function WeeklyTable({ rows, selected, periods, onToggle, monthly }: Props) {
  const ppiIndex = monthly.months.length - 1;
  const ppiDate = monthDot(monthly.months[ppiIndex] ?? "");

  const ppiByName = useMemo(() => {
    const map = new Map<
      string,
      { latest: number | null; mom: number | null; yoy: number | null }
    >();
    for (const product of monthly.products) {
      const values = product.ppi;
      const latest = values[ppiIndex] ?? null;
      const prevMonth = ppiIndex > 0 ? values[ppiIndex - 1] ?? null : null;
      const prevYear = ppiIndex >= 12 ? values[ppiIndex - 12] ?? null : null;
      map.set(product.name, {
        latest,
        mom: pctChange(latest, prevMonth),
        yoy: ppiIndex >= 12 ? pctChange(latest, prevYear) : null,
      });
    }
    return map;
  }, [monthly, ppiIndex]);

  return (
    <div className="pcards">
      <div className="pcards-grid">
        {rows.map((row) => {
          const active = selected.includes(row.product);
          const ppi = ppiByName.get(row.product);
          const stars = ppiProductStars(row.product);
          const delta =
            row.latest != null && ppi?.latest != null ? row.latest - ppi.latest : null;
          const vsMarket = pctChange(row.latest, ppi?.latest ?? null);

          return (
            <article
              key={row.product}
              className={`pcard${active ? " is-on" : ""}`}
              onClick={() => onToggle(row.product)}
            >
              <div className="pcard-top">
                <ProductIcon name={row.product} size="md" />
                <div className="pcard-top-body">
                  <span className="pcard-name">{shortName(row.product)}</span>
                  <div className="pcard-prices">
                    <div className="pcard-price-col">
                      <span className="pcard-price-row">
                        <span className="pcard-price">{formatTugrik(row.latest)}</span>
                        <span className={`pcard-pct is-${changeKind(row.wow)}`}>
                          {formatPct(row.wow)}
                        </span>
                        <span className="pcard-date">{periods.thisWeek.date}</span>
                      </span>
                      <div className="pcard-subs">
                        <Sub label="сар" value={row.mom} />
                        <Sub label="жил" value={row.yoy} />
                      </div>
                    </div>
                    <div className="pcard-price-col pcard-price-col--ppi">
                      <span className="pcard-ppi-label">Үйлдвэрлэгчийн үнэ</span>
                      <span className="pcard-ppi-price">
                        <PpiStars count={stars} />
                        {formatTugrik(ppi?.latest ?? null)}
                        <span className="pcard-date">{ppiDate}</span>
                      </span>
                      <span className="pcard-diff-row">
                        <span className="pcard-diff-label">Зөрүү</span>
                        <span className={`pcard-diff-val is-${changeKind(delta)}`}>
                          {delta != null
                            ? `${delta > 0 ? "+" : ""}${formatAmount(delta)}₮`
                            : "—"}
                        </span>
                        <span className={`pcard-diff-pct is-${changeKind(vsMarket)}`}>
                          {formatPct(vsMarket)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <WeeklyPpiLegend />
    </div>
  );
}

function Sub({ label, value }: { label: string; value: number | null }) {
  return (
    <span className="pcard-sub">
      <span className="pcard-sub-label">{label}</span>
      <span className={`pcard-sub-val is-${changeKind(value)}`}>{formatPct(value)}</span>
    </span>
  );
}
