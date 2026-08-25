"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import monthly from "@/lib/commodity-price-dashboard/cpi-vs-ppi.json";
import { catalogIndex } from "@/lib/commodity-price-dashboard/nso";
import { CHART_COLORS } from "@/lib/commodity-price-dashboard/chart";
import { formatMonth, formatTugrik, monthDot, pctChange } from "@/lib/commodity-price-dashboard/format";
import { ProductIcon } from "./product-icon";
import { PpiStars } from "./price-notes";
import { ppiProductStars } from "@/lib/commodity-price-dashboard/price-notes";
import { ChartPanel } from "./chart-panel";
import { Scroller } from "./scroller";
import { CpiPriceInfo } from "./price-notes";

function ChangeBadge({ value }: { value: number | null }) {
  if (value == null) {
    return <span className="badge badge--flat">—</span>;
  }
  if (Math.abs(value) < 0.05) {
    return <span className="badge badge--flat">→ 0.0%</span>;
  }
  if (value > 0) {
    return <span className="badge badge--up">↑ +{value.toFixed(1)}%</span>;
  }
  return <span className="badge badge--down">↓ {value.toFixed(1)}%</span>;
}

export function ExcelTable({ selected }: { selected: string[] }) {
  const months = monthly.months;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const products = useMemo(() => {
    const names = new Set(selected);
    return monthly.products
      .filter((product) => names.has(product.name) || names.has(product.short))
      .sort((a, b) => catalogIndex(a.name) - catalogIndex(b.name));
  }, [selected]);

  const monthLabels = months.map(monthDot);

  const chartSeries = useMemo(
    () =>
      products.flatMap((product, i) => {
        const color = CHART_COLORS[i % CHART_COLORS.length];
        return [
          { name: `${product.short} · хэрэглээний үнэ`, values: product.cpi, color },
          { name: `${product.short} · үйлдвэрлэгчийн үнэ`, values: product.ppi, color, dashed: true },
        ];
      }),
    [products],
  );

  function toggle(id: string) {
    setCollapsed((current) => ({
      ...current,
      [id]: !(current[id] ?? true),
    }));
  }

  return (
    <>
      <div className="panel month-panel">
        <div className="panel-head">
          <h2 className="panel-title">Хэрэглээний үнэ ба үйлдвэрлэгчийн үнэ</h2>
        </div>
        <Scroller>
          <table className="data-table month-table">
            <colgroup>
              <col className="col-name" />
              <col className="col-month" />
              <col className="col-price" />
              <col className="col-change" />
              <col className="col-change" />
              <col className="col-price" />
              <col className="col-change" />
              <col className="col-change" />
            </colgroup>
            <thead>
              <tr>
                <th rowSpan={2} className="name">
                  Бүтээгдэхүүн
                </th>
                <th rowSpan={2} className="month">
                  Сар
                </th>
                <th colSpan={3} className="center group-start">
                  <span className="th-with-info">
                    Хэрэглээний үнэ
                    <CpiPriceInfo />
                  </span>
                </th>
                <th colSpan={3} className="center group-start">
                  Үйлдвэрлэгчийн үнэ
                </th>
              </tr>
              <tr>
                <th className="num group-start">Үнэ</th>
                <th className="change">
                  <span className="th-long">Өмнөх сараас</span>
                  <span className="th-short">Сар</span>
                </th>
                <th className="change">
                  <span className="th-long">Өмнөх жилээс</span>
                  <span className="th-short">Жил</span>
                </th>
                <th className="num group-start">Үнэ</th>
                <th className="change">
                  <span className="th-long">Өмнөх сараас</span>
                  <span className="th-short">Сар</span>
                </th>
                <th className="change">
                  <span className="th-long">Өмнөх жилээс</span>
                  <span className="th-short">Жил</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-row">
                    Бараа сонгоно уу
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const folded = collapsed[product.id] ?? true;
                  const indices = folded ? [months.length - 1] : months.map((_, i) => i);
                  return indices.map((i, row) => {
                    const month = months[i];
                    const cpi = product.cpi[i] ?? null;
                    const ppi = product.ppi[i] ?? null;
                    return (
                      <tr key={`${product.id}-${month}`}>
                        {row === 0 && (
                          <td
                            rowSpan={indices.length}
                            className="name group-cell"
                            onClick={() => toggle(product.id)}
                          >
                            <span className="product-head">
                              <ProductIcon name={product.name} size="sm" />
                              <span>{product.short}</span>
                              <ChevronDown
                                className={`group-chevron${folded ? " is-folded" : ""}`}
                              />
                            </span>
                          </td>
                        )}
                        <td className="now month">{formatMonth(month)}</td>
                        <td className="num group-start">{formatTugrik(cpi)}</td>
                        <td className="change">
                          <ChangeBadge value={pctChange(cpi, product.cpi[i - 1])} />
                        </td>
                        <td className="change">
                          <ChangeBadge value={i >= 12 ? pctChange(cpi, product.cpi[i - 12]) : null} />
                        </td>
                        <td className="num group-start"><PpiStars count={ppiProductStars(product.name)} />{formatTugrik(ppi)}</td>
                        <td className="change">
                          <ChangeBadge value={pctChange(ppi, product.ppi[i - 1])} />
                        </td>
                        <td className="change">
                          <ChangeBadge value={i >= 12 ? pctChange(ppi, product.ppi[i - 12]) : null} />
                        </td>
                      </tr>
                    );
                  });
                })
              )}
            </tbody>
          </table>
        </Scroller>
      </div>
      <ChartPanel
        times={monthLabels}
        series={chartSeries}
        newestFirst={false}
        limit={0}
        fileName="unii-hodolgoon-sar"
      />
    </>
  );
}
