"use client";

import KpiRow from "@/components/statcate-intro/widgets/KpiRow";
import CategoryFlow from "@/components/statcate-intro/widgets/CategoryFlow";
import CategoryStats from "@/components/statcate-intro/widgets/CategoryStats";
import TrendChart from "@/components/statcate-intro/widgets/TrendChart";
import RegionBarChart from "@/components/statcate-intro/widgets/RegionBarChart";
import RegionMap from "@/components/statcate-intro/widgets/RegionMap";
import CategoryBarChart from "@/components/statcate-intro/widgets/CategoryBarChart";
import type { IntroDashboardState } from "@/components/statcate-intro/useIntroDashboard";
import type { IntroWidget, IntroWidgetSpan } from "@/lib/statcate-intro/types";

function spanOf(widget: IntroWidget): IntroWidgetSpan {
  if (widget.span) return widget.span;
  return widget.type === "kpis" || widget.type === "category-flow" || widget.type === "category-stats"
    ? "full"
    : "half";
}

function renderWidget(widget: IntroWidget, dash: IntroDashboardState) {
  switch (widget.type) {
    case "kpis":
      return <KpiRow widget={widget} dash={dash} />;
    case "category-flow":
      return <CategoryFlow widget={widget} dash={dash} />;
    case "category-stats":
      return <CategoryStats widget={widget} dash={dash} />;
    case "category-bars":
      return <CategoryBarChart widget={widget} dash={dash} />;
    case "trend":
      return <TrendChart widget={widget} dash={dash} />;
    case "region-bars":
      return <RegionBarChart widget={widget} dash={dash} />;
    case "region-map":
      return <RegionMap widget={widget} dash={dash} />;
  }
}

export default function WidgetList({ dash }: { dash: IntroDashboardState }) {
  const widgets = dash.config?.widgets ?? [];
  const rows: { span: IntroWidgetSpan; items: IntroWidget[] }[] = [];
  let half: IntroWidget[] = [];

  const flushHalf = () => {
    if (!half.length) return;
    rows.push({ span: "half", items: half });
    half = [];
  };

  for (const widget of widgets) {
    if (spanOf(widget) === "full") {
      flushHalf();
      rows.push({ span: "full", items: [widget] });
    } else {
      half.push(widget);
      if (half.length === 2) flushHalf();
    }
  }
  flushHalf();

  return (
    <>
      {rows.map((row, i) =>
        row.span === "full" ? (
          <div key={i} className="sector-intro-block">
            {renderWidget(row.items[0], dash)}
          </div>
        ) : (
          <section key={i} className="sector-intro-block sector-intro-charts">
            {row.items.map((widget, j) => (
              <div key={`${widget.type}-${j}`} className="sector-intro-chart-cell">
                {renderWidget(widget, dash)}
              </div>
            ))}
          </section>
        ),
      )}
    </>
  );
}
