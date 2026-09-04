import { jsonStatToRows } from "@/lib/socio-dashboard/parse-json-stat";
import type { JsonStatDataset, PxMetadata } from "@/lib/socio-dashboard/types";
import type { PxRow } from "@/lib/statcate-intro/types";

function tableViewUrl(
  lng: string,
  sector: string,
  subsector: string,
  file: string,
  subtables?: string,
) {
  const params = new URLSearchParams({ lng, sector, subsector, id: file });
  if (subtables) params.set("subtables", subtables);
  return `/api/table-view?${params.toString()}`;
}

export async function fetchPxMetadata(
  lng: string,
  sector: string,
  subsector: string,
  file: string,
  subtables?: string,
): Promise<PxMetadata> {
  const res = await fetch(tableViewUrl(lng, sector, subsector, file, subtables), { cache: "no-store" });
  if (!res.ok) throw new Error(`PX metadata failed: ${file}`);
  const data = await res.json();
  if (!data?.variables) throw new Error(`PX metadata empty: ${file}`);
  return data;
}

export async function fetchPxRows(
  lng: string,
  sector: string,
  subsector: string,
  file: string,
  metadata: PxMetadata,
  select?: Record<string, string[]>,
  subtables?: string,
): Promise<PxRow[]> {
  const body = {
    query: metadata.variables.map((v) => ({
      code: v.code,
      selection: {
        filter: "item",
        values: select?.[v.code] ?? v.values,
      },
    })),
    response: { format: "json-stat2" },
  };
  const res = await fetch(tableViewUrl(lng, sector, subsector, file, subtables), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PX data failed: ${file}`);
  const dataset = (await res.json()) as JsonStatDataset;
  return jsonStatToRows(dataset) as PxRow[];
}
