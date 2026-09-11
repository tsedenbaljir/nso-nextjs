"use client";

import { useEffect, useState } from "react";
import staticJson from "@/lib/commodity-price-dashboard/cpi-vs-ppi.json";

export type CpiPpiFile = {
  title?: string;
  months: string[];
  updated?: string | null;
  products: Array<{
    id: string;
    name: string;
    short: string;
    unit?: string;
    category?: string;
    cpi: Array<number | null>;
    ppi: Array<number | null>;
  }>;
};

export function useCpiPpiMonthly() {
  const [data, setData] = useState<CpiPpiFile>(staticJson as CpiPpiFile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/cpi-ppi", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("load failed");
        return res.json() as Promise<CpiPpiFile>;
      })
      .then((json) => {
        if (cancelled) return;
        if (json?.months?.length && json?.products?.length) {
          setData(json);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Сарын үнэ API-аас уншигдсангүй — JSON ашиглаж байна");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
