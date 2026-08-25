"use client";

import { Select } from "antd";
import { type Indicator } from "@/lib/census-dashboard/indicators";

type Props = {
  indicator?: Indicator;
  categoryId: string;
  sexId: string;
  ageId: string;
  onCategoryChange: (id: string) => void;
  onSexChange: (id: string) => void;
  onAgeChange: (id: string) => void;
};

export default function FilterBar({
  indicator,
  categoryId,
  sexId,
  ageId,
  onCategoryChange,
  onSexChange,
  onAgeChange,
}: Props) {
  const categories = indicator?.categories ?? [];
  const sexes = indicator?.sexes ?? [];
  const ages = indicator?.ages ?? [];
  const hasSexes = sexes.length > 1;
  const hasAges = ages.length > 1;
  const categoryLabel = hasSexes || !hasAges ? "Ангилал" : "Хүйс";

  if (categories.length <= 1 && !hasAges && !hasSexes) return null;

  return (
    <div className="dashboard-subfilters">
      {categories.length > 1 && (
        <label className={hasSexes ? "dashboard-subfilters-wide" : undefined}>
          <span className="dashboard-filter-label">{categoryLabel}</span>
          <Select
            className="dashboard-select"
            value={categoryId}
            options={categories.map((item) => ({
              value: item.id,
              label: item.label,
            }))}
            onChange={onCategoryChange}
          />
        </label>
      )}
      {hasSexes && (
        <label>
          <span className="dashboard-filter-label">Хүйс</span>
          <Select
            className="dashboard-select"
            value={sexId}
            options={sexes.map((item) => ({
              value: item.id,
              label: item.label,
            }))}
            onChange={onSexChange}
          />
        </label>
      )}
      {hasAges && (
        <label>
          <span className="dashboard-filter-label">Насны бүлэг</span>
          <Select
            className="dashboard-select"
            showSearch
            optionFilterProp="label"
            value={ageId}
            options={ages.map((item) => ({
              value: item.id,
              label: item.label,
            }))}
            onChange={onAgeChange}
          />
        </label>
      )}
    </div>
  );
}
