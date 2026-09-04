import { loc } from "@/lib/statcate-intro/format";
import { fetchPxMetadata, fetchPxRows } from "@/lib/statcate-intro/px";
import type { IntroDashboardConfig, IntroTableConfig, IntroTableData, PxRow } from "@/lib/statcate-intro/types";

async function loadFile(
  lng: string,
  sector: string,
  subsector: string,
  table: IntroTableConfig,
  file: string,
): Promise<PxRow[]> {
  const meta = await fetchPxMetadata(lng, sector, subsector, file, table.subtables);
  return fetchPxRows(lng, sector, subsector, file, meta, table.select, table.subtables);
}

export async function loadIntroTables(
  lng: string,
  sector: string,
  subsector: string,
  config: IntroDashboardConfig,
): Promise<IntroTableData[]> {
  return Promise.all(
    config.tables.map(async (table) => {
      const files = [table.file, ...(table.files ?? [])];
      const packs = await Promise.all(files.map((file) => loadFile(lng, sector, subsector, table, file)));
      return {
        id: table.id,
        label: loc(lng, table.label),
        icon: table.icon,
        unit: table.unit ? loc(lng, table.unit) : undefined,
        format: table.format,
        geo: table.geo,
        nationalMode: table.nationalMode,
        rows: packs.flat(),
      };
    }),
  );
}
