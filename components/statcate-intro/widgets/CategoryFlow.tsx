"use client";

import { formatCount } from "@/lib/statcate-intro/format";
import {
  resolveCategoryClergyImage,
  resolveCategoryIcon,
  resolveCategoryImage,
} from "@/lib/statcate-intro/icons";
import { colorFor, listCategories, nationalValue } from "@/lib/statcate-intro/query";
import type { CategoryFlowWidget } from "@/lib/statcate-intro/types";
import type { IntroDashboardState } from "@/components/statcate-intro/useIntroDashboard";

type Props = {
  widget: CategoryFlowWidget;
  dash: IntroDashboardState;
};

export default function CategoryFlow({ widget, dash }: Props) {
  const { config, tablesById, year, lng } = dash;
  if (!config || !year) return null;

  const source = tablesById[widget.source];
  const target = tablesById[widget.target];
  const extra = widget.extra ? tablesById[widget.extra] : undefined;
  if (!source || !target) return null;

  const items = listCategories(source.rows, config).map((label, i) => ({
    label,
    color: colorFor(label, i, widget.colors),
    source: nationalValue(source.rows, config, year, label),
    target: nationalValue(target.rows, config, year, label),
    extra: extra ? nationalValue(extra.rows, config, year, label) : 0,
  }));

  if (!items.length) return null;

  return (
    <section className="sector-intro-hero">
      <div className="category-flow">
        <div className="category-flow-col category-flow-col--left">
          {items.map((item) => {
            const image = resolveCategoryImage(item.label, widget.categoryIcons);
            const Icon = resolveCategoryIcon(item.label, widget.categoryIcons);
            return (
              <div key={item.label} className="category-flow-node">
                <span className="category-flow-orb">
                  {image ? <img src={image} alt="" width={40} height={40} /> : <Icon size={20} />}
                </span>
                <div>
                  <strong>{formatCount(item.source, lng)}</strong>
                  <p>
                    <span>{item.label}</span>
                    <span>{source.label}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="category-flow-col category-flow-col--right">
          {items.map((item) => {
            const clergy = resolveCategoryClergyImage(item.label, widget.categoryIcons);
            const Icon = resolveCategoryIcon(item.label, widget.categoryIcons);
            return (
              <article
                key={item.label}
                className="category-flow-card"
                style={{ ["--accent" as string]: item.color }}
              >
                <span className="category-flow-card-icon">
                  {clergy ? <img src={clergy} alt="" width={40} height={40} /> : <Icon size={20} />}
                </span>
                <div>
                  <p>
                    <b>{formatCount(item.target, lng)}</b>
                    <span>{target.label}</span>
                  </p>
                  {extra ? (
                    <p>
                      <b>{formatCount(item.extra, lng)}</b>
                      <span>{extra.label}</span>
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
