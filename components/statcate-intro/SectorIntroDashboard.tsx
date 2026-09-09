"use client";

import LoadingDiv from "@/components/Loading/Text/Index";
import WidgetList from "@/components/statcate-intro/WidgetList";
import { useIntroDashboard } from "@/components/statcate-intro/useIntroDashboard";
import { COPY } from "@/lib/statcate-intro/constants";
import { loc } from "@/lib/statcate-intro/format";
import "./intro.scss";

type Props = {
  lng: string;
  sector: string;
  subsector: string;
};

export default function SectorIntroDashboard({ lng, sector, subsector }: Props) {
  const dash = useIntroDashboard({ lng, sector, subsector });
  const { config, loading, error, year, setYear, years } = dash;

  if (!config) return null;

  if (loading) {
    return (
      <div className="sector-intro">
        <LoadingDiv />
      </div>
    );
  }

  if (error) {
    return <p className="sector-intro-error">{error}</p>;
  }

  const title = loc(lng, config.title);
  const subtitle = config.subtitle ? loc(lng, config.subtitle) : "";

  return (
    <div className="sector-intro">
      <header className="sector-intro-head">
        <div>
          <h3 className="sector-intro-title">
            {title}
            {subtitle ? <span> · {subtitle}</span> : null}
          </h3>
        </div>
        <label className="sector-intro-year">
          <span>{loc(lng, COPY.year)}</span>
          <select value={year} onChange={(event) => setYear(event.target.value)}>
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </header>

      <WidgetList dash={dash} />
    </div>
  );
}
