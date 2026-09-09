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
  const fromSector = table.sourceSector ?? sector;
  const fromSubsector = table.sourceSubsector ?? subsector;
  const meta = await fetchPxMetadata(lng, fromSector, fromSubsector, file, table.subtables);
  return fetchPxRows(lng, fromSector, fromSubsector, file, meta, table.select, table.subtables);
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
      const packs = await Promise.all(files.map((source) => {
        // Historical files may encode the same indicator with different dimensions.
        const file = typeof source === "string" ? source : source.file;
        const sourceTable = typeof source === "string" ? table : { ...table, select: source.select };
        return loadFile(lng, sector, subsector, sourceTable, file);
      }));
      return {
        id: table.id,
        label: loc(lng, table.label),
        icon: table.icon,
        unit: table.unit ? loc(lng, table.unit) : undefined,
        format: table.format,
        geo: table.geo,
        time: table.time,
        nationalMode: table.nationalMode,
        rows: packs.flat(),
      };
    }),
  );
}
