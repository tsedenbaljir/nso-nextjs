import type { PxMetadata, PxVariable, PxDataRequest, JsonStatDataset } from "./types";

const PX_PROXY = "/api/px";

function buildProxyUrl(apiUrl: string): string {
  return `${PX_PROXY}?url=${encodeURIComponent(apiUrl)}`;
}

type JsonStatMetaShape = Pick<JsonStatDataset, "id" | "dimension" | "label">;

function jsonStatToPxMetadata(raw: JsonStatMetaShape): PxMetadata {
  const id = raw.id ?? [];
  const dim = raw.dimension ?? {};
  const variables: PxVariable[] = id.map((code) => {
    const d = dim[code];
    const cat = d?.category;
    let values: string[] = [];
    let valueTexts: string[] = [];
    if (cat?.index) {
      const idx = cat.index;
      if (Array.isArray(idx)) {
        values = idx.map(String);
        valueTexts = values.map((k) => (cat.label && typeof cat.label === "object" && k in cat.label ? String((cat.label as Record<string, string>)[k]) : k));
      } else if (typeof idx === "object" && idx !== null) {
        const entries = Object.entries(idx as Record<string, number>).sort((a, b) => a[1] - b[1]);
        values = entries.map(([k]) => k);
        valueTexts = values.map((k) => (cat.label && typeof cat.label === "object" && k in cat.label ? String((cat.label as Record<string, string>)[k]) : k));
      }
    }
    return { code, text: d?.label ?? code, values, valueTexts };
  });
  return { title: typeof raw.label === "string" ? raw.label : "", variables };
}

export async function getPxMetadata(apiUrl: string): Promise<PxMetadata> {
  const res = await fetch(buildProxyUrl(apiUrl), { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error("Уучлаарай алдаа гарлаа.");
  const data = (await res.json()) as PxMetadata & { id?: string[]; dimension?: Record<string, unknown> };
  if (data.id && data.dimension && Array.isArray(data.id) && data.id.length > 0) {
    return jsonStatToPxMetadata(data as JsonStatMetaShape);
  }
  return data as PxMetadata;
}

export async function getPxData(apiUrl: string, body: PxDataRequest): Promise<JsonStatDataset> {
  const url = buildProxyUrl(apiUrl);
  const opts: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  };
  let lastRes: Response | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, opts);
    lastRes = res;
    if (res.ok) return res.json() as Promise<JsonStatDataset>;
    if (res.status !== 502 && res.status !== 503) break;
    if (attempt < 3) await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  throw new Error("Уучлаарай алдаа гарлаа.");
}

export function buildFullQuery(metadata: PxMetadata): PxDataRequest {
  const query = metadata.variables.map((v) => ({
    code: v.code,
    selection: { filter: "item" as const, values: v.values },
  }));
  return { query, response: { format: "json-stat2" } };
}

export function buildQuery(
  metadata: PxMetadata,
  selections: Partial<Record<string, string[]>>
): PxDataRequest {
  const query = metadata.variables.map((v) => {
    const selected = selections[v.code];
    return {
      code: v.code,
      selection: {
        filter: "item" as const,
        values: selected && selected.length > 0 ? selected : v.values,
      },
    };
  });
  return { query, response: { format: "json-stat2" } };
}
