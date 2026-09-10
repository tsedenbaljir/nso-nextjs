import { INTRO_CONFIGS } from "@/lib/statcate-intro/configs";
import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";

/**
 * Танилцуулга дашборд туршилтын үед false.
 * false үед бүх салбарт хуучин Tableau embed харагдана.
 */
export const INTRO_DASHBOARDS_ENABLED = false;

const BY_SUBSECTOR = new Map(
  INTRO_CONFIGS.map((item) => [item.subsector.toLowerCase(), item]),
);

export function getIntroDashboardConfig(subsector: string): IntroDashboardConfig | null {
  if (!INTRO_DASHBOARDS_ENABLED) return null;
  return BY_SUBSECTOR.get(decodeURIComponent(subsector).toLowerCase()) ?? null;
}

export function hasIntroDashboard(subsector: string) {
  if (!INTRO_DASHBOARDS_ENABLED) return false;
  return getIntroDashboardConfig(subsector) !== null;
}
