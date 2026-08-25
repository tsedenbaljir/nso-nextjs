"use client";

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
import { ProductIcon } from "./product-icon";
import { PpiStars, WeeklyPpiLegend } from "./price-notes";
import { ppiProductStars } from "@/lib/commodity-price-dashboard/price-notes";
import monthly from "@/lib/commodity-price-dashboard/cpi-vs-ppi.json";

const PPI_INDEX = monthly.months.length - 1;

const PPI_BY_NAME = new Map(
  monthly.products.map((product) => {
    const values = product.ppi;
    const latest = values[PPI_INDEX] ?? null;
    const prevMonth = PPI_INDEX > 0 ? values[PPI_INDEX - 1] ?? null : null;
    const prevYear = PPI_INDEX >= 12 ? values[PPI_INDEX - 12] ?? null : null;

    return [
      product.name,
      {
        latest,
        mom: pctChange(latest, prevMonth),
        yoy: PPI_INDEX >= 12 ? pctChange(latest, prevYear) : null,
      },
    ];
  }),
);

const PPI_DATE = monthDot(monthly.months[PPI_INDEX] ?? "");

type Props = {
  rows: PriceRow[];
  selected: string[];
  periods: Periods;
  onToggle: (product: string) => void;
};

export function WeeklyTable({ rows, selected, periods, onToggle }: Props) {
  return (
    <div className="pcards">
      <div className="pcards-grid">
        {rows.map((row) => {
          const active = selected.includes(row.product);
          const ppi = PPI_BY_NAME.get(row.product);
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
                        <span className={`pcard-pct is-${changeKind(row.wow)}`}>{formatPct(row.wow)}</span>
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
                        <PpiStars count={stars} />{formatTugrik(ppi?.latest)}
                        <span className="pcard-date">{PPI_DATE}</span>
                      </span>
                      <span className="pcard-diff-row">
                        <span className="pcard-diff-label">Зөрүү</span>
                        <span className={`pcard-diff-val is-${changeKind(delta)}`}>
                          {delta != null ? `${delta > 0 ? "+" : ""}${formatAmount(delta)}₮` : "—"}
                        </span>
                        <span className={`pcard-diff-pct is-${changeKind(vsMarket)}`}>{formatPct(vsMarket)}</span>
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
