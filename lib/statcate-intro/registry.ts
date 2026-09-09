import { INTRO_CONFIGS } from "@/lib/statcate-intro/configs";
import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";

const BY_SUBSECTOR = new Map(
  INTRO_CONFIGS.map((item) => [item.subsector.toLowerCase(), item]),
);

export function getIntroDashboardConfig(subsector: string): IntroDashboardConfig | null {
  return BY_SUBSECTOR.get(decodeURIComponent(subsector).toLowerCase()) ?? null;
}

export function hasIntroDashboard(subsector: string) {
  return getIntroDashboardConfig(subsector) !== null;
}
