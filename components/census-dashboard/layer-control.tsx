"use client";

import { LAYER_ITEMS } from "@/lib/census-dashboard/topics";
import type { MapLayer } from "@/lib/census-dashboard/geo";

type Props = {
  layer: MapLayer;
  layers?: MapLayer[];
  onLayerChange: (layer: MapLayer) => void;
};

export default function LayerControl({ layer, layers, onLayerChange }: Props) {
  const items = layers?.length
    ? LAYER_ITEMS.filter((item) => layers.includes(item.id))
    : LAYER_ITEMS;

  return (
    <div className="layer-toggle">
      <span className="dashboard-filter-label">Засаг захиргааны нэгж</span>
      <div className="layer-toggle-group" role="group" aria-label="Газрын зургийн түвшин">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={layer === item.id ? "is-active" : undefined}
            aria-pressed={layer === item.id}
            onClick={() => onLayerChange(item.id)}
          >
            <span className="layer-toggle-full">{item.label}</span>
            <span className="layer-toggle-short">{item.shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
