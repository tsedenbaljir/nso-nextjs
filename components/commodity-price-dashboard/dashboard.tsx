"use client";

import { useRef, useMemo, useState } from "react";
import type { PriceRow, PriceTable } from "@/lib/commodity-price-dashboard/nso";
import { GROUPS, matchesGroup, type GroupId } from "@/lib/commodity-price-dashboard/groups";
import { shortName } from "@/lib/commodity-price-dashboard/format";
import { MARKET_PRICE_METHOD_NOTE } from "@/lib/commodity-price-dashboard/price-notes";
import { WeeklyTable } from "./weekly-table";
import { ChartPanel } from "./chart-panel";
import { ExcelTable } from "./excel-table";
import { ThemeProvider } from "./theme-provider";
import "./nso-price-dash.scss";

function DashboardInner({ data }: { data: PriceTable }) {
  const [group, setGroup] = useState<GroupId>("all");
  const [selected, setSelected] = useState<string[]>(() =>
    data.rows[0] ? [data.rows[0].product] : [],
  );

  const detailRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(
    () => data.rows.filter((row) => matchesGroup(row.product, group)),
    [data.rows, group],
  );

  const visibleSelected = useMemo(() => {
    const visible = new Set(rows.map((row) => row.product));
    return selected.filter((name) => visible.has(name));
  }, [rows, selected]);

  const chartSeries = useMemo(
    () =>
      visibleSelected
        .map((name) => data.rows.find((row) => row.product === name))
        .filter((row): row is PriceRow => Boolean(row))
        .map((row) => ({ name: shortName(row.product), values: row.values })),
    [visibleSelected, data.rows],
  );

  function selectGroup(id: GroupId) {
    setGroup(id);
    const first = data.rows.find((row) => matchesGroup(row.product, id));
    setSelected(first ? [first.product] : []);
  }

  function smoothScroll(targetY: number) {
    const start = window.scrollY;
    const diff = targetY - start;
    const duration = 1200;
    let startTime: number | null = null;

    function step(time: number) {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo(0, start + diff * ease);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function toggle(product: string) {
    setSelected([product]);
    setTimeout(() => {
      const el = detailRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      smoothScroll(top);
    }, 50);
  }

  function scrollToTop() {
    smoothScroll(0);
  }

  return (
    <main className="page">
      <div className="pcards-header">
        <div className="pcards-heading">
          <h2 className="pcards-title">Өргөн хэрэглээний бүтээгдэхүүний үнэ</h2>
          <p className="pcards-lede">
            <span className="pcards-subtitle">Зах зээлийн үнэ ба үйлдвэрлэгчийн үнэ</span>
            {" — "}
            <span className="pcards-method">{MARKET_PRICE_METHOD_NOTE}</span>
          </p>
        </div>
        <div className="site-tools">
          <div className="live-pill">
            <span className="live-dot" />
            <span className="live-label">Сүүлийн мэдээ</span>
            <span className="live-date">{data.periods.thisWeek.date}</span>
          </div>
        </div>
      </div>

      <section className="chips">
        {GROUPS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`chip${group === item.id ? " is-on" : ""}`}
            onClick={() => selectGroup(item.id)}
          >
            {item.label}
          </button>
        ))}
      </section>

      <section className="stack">
        <WeeklyTable
          rows={rows}
          selected={visibleSelected}
          periods={data.periods}
          onToggle={toggle}
        />
      </section>

      <section className="stack" ref={detailRef}>
        <ChartPanel times={data.times} series={chartSeries} fileName="unii-hodolgoon-7honog" />
      </section>

      <section className="stack stack--follow">
        <ExcelTable selected={visibleSelected} />
      </section>

      <button
        type="button"
        className="scroll-top-btn"
        onClick={scrollToTop}
        aria-label="Дээш"
      >
        ↑
      </button>
    </main>
  );
}

export function CommodityPriceDashboard({ data }: { data: PriceTable }) {
  return (
    <ThemeProvider>
      <DashboardInner data={data} />
    </ThemeProvider>
  );
}
