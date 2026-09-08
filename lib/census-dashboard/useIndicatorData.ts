import { useEffect, useState } from "react";
import type { IndicatorsFile } from "@/lib/census-dashboard/indicators";

export function useIndicatorData(file?: string) {
  const [data, setData] = useState<IndicatorsFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(file));

  useEffect(() => {
    if (!file) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetch(file)
      .then((res) => {
        if (!res.ok) throw new Error("load failed");
        return res.json() as Promise<IndicatorsFile>;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Өгөгдөл уншигдсангүй.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  return { data, error, loading };
}
