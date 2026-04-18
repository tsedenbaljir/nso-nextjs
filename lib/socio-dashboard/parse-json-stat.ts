import type { JsonStatDataset, DataRow } from "./types";

function getCategoryLabels(dim: JsonStatDataset["dimension"], id: string): Record<string, string> {
  const d = dim?.[id];
  const labels = d?.category?.label;
  if (typeof labels === "object" && labels !== null) return labels as Record<string, string>;
  return {};
}

function getCategoryIndex(dim: JsonStatDataset["dimension"], id: string): string[] {
  const d = dim?.[id];
  const index = d?.category?.index;
  if (Array.isArray(index)) return index;
  if (typeof index === "object" && index !== null) {
    const entries = Object.entries(index as Record<string, number>).sort((a, b) => a[1] - b[1]);
    return entries.map(([k]) => k);
  }
  return [];
}

export function jsonStatToRows(dataset: JsonStatDataset): DataRow[] {
  const ids = dataset.id ?? [];
  const size = dataset.size ?? [];
  const dim = dataset.dimension ?? {};
  const value = dataset.value;

  if (!ids.length || !size.length) return [];
  const valuesArray: (number | null)[] = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? sparseToArray(value, size)
      : [];
  if (!valuesArray.length) return [];

  const indexArrays = ids.map((id) => getCategoryIndex(dim, id));
  const labelMaps = ids.map((id) => getCategoryLabels(dim, id));
  const rows: DataRow[] = [];
  const multipliers: number[] = [];
  let m = 1;
  for (let i = size.length - 1; i >= 0; i--) {
    multipliers[i] = m;
    m *= size[i];
  }

  for (let i = 0; i < valuesArray.length; i++) {
    const row: DataRow = {};
    let idx = i;
    for (let d = 0; d < ids.length; d++) {
      const pos = Math.floor(idx / multipliers[d]) % size[d];
      const code = indexArrays[d][pos];
      const label = labelMaps[d][code] ?? code;
      row[ids[d]] = label;
      row[`${ids[d]}_code`] = code;
    }
    row.value = valuesArray[i];
    rows.push(row);
  }
  return rows;
}

function sparseToArray(sparse: Record<string, number | null>, size: number[]): (number | null)[] {
  const total = size.reduce((a, b) => a * b, 1);
  const arr: (number | null)[] = new Array(total).fill(null);
  for (const [key, val] of Object.entries(sparse)) {
    const i = parseInt(key, 10);
    if (!Number.isNaN(i) && i >= 0 && i < total) arr[i] = val;
  }
  return arr;
}

export function aggregateRows(
  rows: DataRow[],
  groupByKeys: string[],
  valueKey: string = "value"
): DataRow[] {
  const map = new Map<string, DataRow>();
  for (const row of rows) {
    const key = groupByKeys.map((k) => String(row[k] ?? "")).join("\t");
    const existing = map.get(key);
    const v = Number((row[valueKey] as number) ?? 0) || 0;
    if (!existing) {
      const newRow: DataRow = {};
      for (const k of groupByKeys) newRow[k] = row[k];
      newRow[valueKey] = v;
      map.set(key, newRow);
    } else {
      (existing[valueKey] as number) += v;
    }
  }
  return Array.from(map.values());
}
