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
    return {
      Аймаг: parts[0] ?? "",
      Сум: parts[1] ?? "",
      Баг: parts[2] ?? parts[0] ?? row.name,
    };
  }
  if (layer === "soum") {
    return {
      Аймаг: parts[0] ?? "",
      Сум: parts[1] ?? parts[0] ?? row.name,
    };
  }
  return { Аймаг: row.name };
}

export function downloadMapRows(rows: UnitRow[], meta: ExportMeta) {
  const valueHeader = meta.percent ? "Хувь" : "Утга";
  const sheetRows = rows.map((row) => ({
    ...placeColumns(row, meta.layer),
    [valueHeader]: meta.percent ? formatPercent(row.value) : formatNumber(row.value),
  }));
  const sheet = XLSX.utils.json_to_sheet(sheetRows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Өгөгдөл");
  const buffer = XLSX.write(book, { bookType: "xlsx", type: "array" });
  const layerLabel = LAYER_ITEMS.find((item) => item.id === meta.layer)?.shortLabel ?? meta.layer;
  const name = [meta.indicator, meta.category, meta.year, layerLabel]
    .filter(Boolean)
    .map((part) => fileSlug(String(part)))
    .join("_");
  saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${name}.xlsx`);
}
