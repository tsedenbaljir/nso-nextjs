import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { formatNumber, formatPercent, type UnitRow } from "@/lib/census-dashboard/dashboard";
import { LAYER_ITEMS } from "@/lib/census-dashboard/topics";
import type { MapLayer } from "@/lib/census-dashboard/geo";

type ExportMeta = {
  indicator: string;
  category?: string;
  year: string;
  layer: MapLayer;
  percent: boolean;
};

function fileSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72) || "toollogo";
}

function placeColumns(row: UnitRow, layer: MapLayer) {
  const parts = row.name.split(" · ").map((part) => part.trim()).filter(Boolean);
  if (layer === "bag") {
    if (parts.length >= 3) {
      return {
        "Аймаг, нийслэл": parts[0],
        "Сум, дүүрэг": parts[1],
        "Баг, хороо": parts.slice(2).join(" · "),
      };
    }
    return { "Баг, хороо": row.name };
  }
  if (layer === "soum") {
    if (parts.length >= 2) {
      return {
        "Аймаг, нийслэл": parts[0],
        "Сум, дүүрэг": parts.slice(1).join(" · "),
      };
    }
    return { "Сум, дүүрэг": row.name };
  }
  return { "Аймаг, нийслэл": row.name };
}

export function downloadMapRows(rows: UnitRow[], meta: ExportMeta) {
  if (!rows.length) return;

  const layerLabel = LAYER_ITEMS.find((item) => item.id === meta.layer)?.label ?? meta.layer;
  const table = rows.map((row) => ({
    ...placeColumns(row, meta.layer),
    Үзүүлэлт: meta.indicator,
    ...(meta.category ? { Ангилал: meta.category } : {}),
    Он: meta.year,
    Утга: row.value,
    Харуулсан: meta.percent ? formatPercent(row.value) : formatNumber(row.value),
  }));

  const sheet = XLSX.utils.json_to_sheet(table);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, layerLabel.slice(0, 31));
  const buffer = XLSX.write(book, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${fileSlug(`${meta.indicator}-${layerLabel}-${meta.year}`)}.xlsx`);
}
