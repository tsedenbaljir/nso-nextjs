import { useEffect, useState } from "react";
import type {
  AimagCollection,
  BagCollection,
  SoumCollection,
} from "@/lib/census-dashboard/geo";
import type { GeoData } from "@/lib/census-dashboard/dashboard";

const EMPTY: GeoData | null = null;

export function useGeoData() {
  const [data, setData] = useState<GeoData | null>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/census-dashboard/geo/aimag.geojson").then((res) => res.json() as Promise<AimagCollection>),
      fetch("/census-dashboard/geo/soum.geojson").then((res) => res.json() as Promise<SoumCollection>),
      fetch("/census-dashboard/geo/bag.geojson").then((res) => res.json() as Promise<BagCollection>),
    ])
      .then(([aimags, soums, bags]) => {
        if (!cancelled) setData({ aimags, soums, bags });
      })
      .catch(() => {
        if (!cancelled) setError("Газрын зургийн өгөгдөл уншигдсангүй.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error, loading: !data && !error };
}
