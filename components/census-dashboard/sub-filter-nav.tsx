"use client";

import { Select } from "antd";
import type { Topic } from "@/lib/census-dashboard/topics";

type Props = {
  topic: Topic;
  activeId: string;
  onSelect: (id: string) => void;
};

export default function SubFilterNav({ topic, activeId, onSelect }: Props) {
  return (
    <label className="dashboard-filter-block" aria-label="Үзүүлэлт">
      <span className="dashboard-filter-label">Үзүүлэлт</span>
      <Select
        className="dashboard-select"
        value={activeId}
        options={topic.subFilters.map((item) => ({
          value: item.id,
          label: item.label,
        }))}
        onChange={onSelect}
      />
    </label>
  );
}
