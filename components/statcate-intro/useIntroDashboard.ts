"use client";

import { useEffect, useMemo, useState } from "react";
import { COPY } from "@/lib/statcate-intro/constants";
import { loc } from "@/lib/statcate-intro/format";
import { loadIntroTables } from "@/lib/statcate-intro/load";
import { listYears } from "@/lib/statcate-intro/query";
import { getIntroDashboardConfig } from "@/lib/statcate-intro/registry";
import type { IntroTableData } from "@/lib/statcate-intro/types";

type Args = {
  lng: string;
  sector: string;
  subsector: string;
};

export function useIntroDashboard({ lng, sector, subsector }: Args) {
  const sectorName = decodeURIComponent(sector);
  const subsectorName = decodeURIComponent(subsector);
  const config = getIntroDashboardConfig(subsectorName);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState("");
  const [years, setYears] = useState<string[]>([]);
  const [tables, setTables] = useState<IntroTableData[]>([]);

  useEffect(() => {
    if (!config) return;
    let cancelled = false;

    async function load() {
      if (!config) return;
      setLoading(true);
      setError(null);
      try {
        const packs = await loadIntroTables(lng, sectorName, subsectorName, config);
        if (cancelled) return;
        const uniqueYears = [
          ...new Set(packs.flatMap((table) => listYears(table.rows, config.dimensions.time))),
        ].sort((a, b) => Number(b) - Number(a));
        setTables(packs);
        setYears(uniqueYears);
        setYear((prev) => (prev && uniqueYears.includes(prev) ? prev : uniqueYears[0] ?? ""));
      } catch {
        if (!cancelled) setError(loc(lng, COPY.loadError));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [config, lng, sectorName, subsectorName]);

  const tablesById = useMemo(
    () => Object.fromEntries(tables.map((table) => [table.id, table])),
    [tables],
  );

  return { config, loading, error, year, setYear, years, tables, tablesById, lng };
}

export type IntroDashboardState = ReturnType<typeof useIntroDashboard>;
