"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ConfigProvider, Select } from "antd";
import FilterBar from "@/components/census-dashboard/filter-bar";
import MapFocusCard from "@/components/census-dashboard/map-focus-card";
import SubFilterNav from "@/components/census-dashboard/sub-filter-nav";
import LayerControl from "@/components/census-dashboard/layer-control";
import MapToolbar from "@/components/census-dashboard/map-toolbar";
import { useGeoData } from "@/lib/census-dashboard/useGeoData";
import { useIndicatorData } from "@/lib/census-dashboard/useIndicatorData";
import { YEAR_OPTIONS, colorScaleBounds, parseUnitKey, toMapGeo, unitKey, type UnitRow } from "@/lib/census-dashboard/dashboard";
import { aggregateValue, lookupValue, TOTAL_CATEGORY } from "@/lib/census-dashboard/indicators";
import { AIMAG_OPTIONS } from "@/lib/census-dashboard/aimags";
import { CENSUS_TYPES, DEFAULT_LAYERS, TOPICS, getTopic, type Topic } from "@/lib/census-dashboard/topics";
import { captionNotes, formatShareCaption, isAllChoice } from "@/lib/census-dashboard/caption";
import type { MapLayer } from "@/lib/census-dashboard/geo";
import "@/components/census-dashboard/nso-census-dash.scss";

const UnitMap = dynamic(() => import("@/components/census-dashboard/unit-map"), {
  ssr: false,
});

// Аймгийн хүрээ — сум, баг давхаргад ижил, зөөлөн өнгөтэй хүрээ.
const AIMAG_BORDER = {
  color: "#3c5568",
  width: 1.2,
  opacity: 0.4,
};

type Props = {
  topic: Topic;
  onTopicChange: (id: string) => void;
};

function Dashboard({ topic, onTopicChange }: Props) {
  const geo = useGeoData();
  const stats = useIndicatorData(topic.dataFile);
  const [indicatorId, setIndicatorId] = useState(topic.subFilters[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(TOTAL_CATEGORY);
  const [sexId, setSexId] = useState(TOTAL_CATEGORY);
  const [ageId, setAgeId] = useState(TOTAL_CATEGORY);
  const [year, setYear] = useState("2025");
  const [fitToken, setFitToken] = useState(0);
  const [layer, setLayer] = useState<MapLayer>("bag");
  const [aimagId, setAimagId] = useState<number | null>(null);
  const [soumCode, setSoumCode] = useState<number | null>(null);
  const [bagAsb, setBagAsb] = useState<number | null>(null);

  const data = geo.data;
  const indicator = stats.data?.indicators.find((item) => item.id === indicatorId);
  const allowedLayers = indicator?.layers?.length ? indicator.layers : DEFAULT_LAYERS;

  useEffect(() => {
    if (!indicator?.categories.length) return;
    if (indicator.categories.some((item) => item.id === categoryId)) return;
    setCategoryId(indicator.categories[0].id);
  }, [indicator, categoryId]);

  useEffect(() => {
    if (!indicator?.layers?.length) return;
    if (indicator.layers.includes(layer)) return;
    const next =
      indicator.defaultLayer && indicator.layers.includes(indicator.defaultLayer)
        ? indicator.defaultLayer
        : indicator.layers[indicator.layers.length - 1];
    setLayer(next);
    setAimagId(null);
    setSoumCode(null);
    setBagAsb(null);
    setFitToken((n) => n + 1);
  }, [indicator, layer]);

  const rows = useMemo<UnitRow[]>(() => {
    if (!data) return [];

    if (layer === "aimag") {
      return data.aimags.features.map((feature) => ({
        key: unitKey("aimag", feature.properties.id),
        name: feature.properties.name,
        value: lookupValue(indicator, categoryId, "aimag", feature.properties.id, ageId, sexId),
        aimagId: feature.properties.id,
      }));
    }

    if (layer === "soum") {
      return data.soums.features
        .filter((feature) => !aimagId || feature.properties.aimagId === aimagId)
        .map((feature) => ({
          key: unitKey("soum", feature.properties.asCode),
          name: aimagId
            ? feature.properties.name
            : `${feature.properties.aimagName} · ${feature.properties.name}`,
          value: lookupValue(indicator, categoryId, "soum", feature.properties.asCode, ageId, sexId),
          aimagId: feature.properties.aimagId,
          asCode: feature.properties.asCode,
        }));
    }

    return data.bags.features
      .filter((feature) => {
        if (soumCode) return feature.properties.asCode === soumCode;
        if (aimagId) return feature.properties.aimagId === aimagId;
        return true;
      })
      .map((feature) => ({
        key: unitKey("bag", feature.properties.asb),
        name: soumCode
          ? feature.properties.name
          : `${feature.properties.aimagName} · ${feature.properties.soumName} · ${feature.properties.name}`,
        value: lookupValue(indicator, categoryId, "bag", feature.properties.asb, ageId, sexId),
        aimagId: feature.properties.aimagId,
        asCode: feature.properties.asCode,
        asb: feature.properties.asb,
      }));
  }, [ageId, aimagId, categoryId, data, indicator, layer, sexId, soumCode]);

  const tableTotal = useMemo(() => {
    if (!indicator) return undefined;
    const codes = rows
      .map((row) => row.asb ?? row.asCode ?? row.aimagId)
      .filter((code): code is number => code != null);
    return aggregateValue(indicator, layer, codes, categoryId, ageId, sexId);
  }, [ageId, categoryId, indicator, layer, rows, sexId]);

  const mapGeo = useMemo(() => {
    if (!data) return { type: "FeatureCollection" as const, features: [] };
    if (layer === "aimag") {
      return toMapGeo(data.aimags.features, (p) => unitKey("aimag", p.id));
    }
    if (layer === "soum") {
      const features = data.soums.features.filter(
        (feature) => !aimagId || feature.properties.aimagId === aimagId,
      );
      return toMapGeo(features, (p) => unitKey("soum", p.asCode));
    }
    const bags = data.bags.features.filter((feature) => {
      if (soumCode) return feature.properties.asCode === soumCode;
      if (aimagId) return feature.properties.aimagId === aimagId;
      return true;
    });
    return toMapGeo(bags, (p) => unitKey("bag", p.asb));
  }, [aimagId, data, layer, soumCode]);

  const overlays = useMemo(() => {
    if (!data) return [];

    if (layer === "soum") {
      const aimags = data.aimags.features.filter(
        (feature) => !aimagId || feature.properties.id === aimagId,
      );
      return [
        {
          geojson: toMapGeo(aimags, (p) => unitKey("aimag", p.id)),
          ...AIMAG_BORDER,
        },
      ];
    }

    if (layer === "bag") {
      const soums = data.soums.features.filter((feature) => {
        if (soumCode) return feature.properties.asCode === soumCode;
        if (aimagId) return feature.properties.aimagId === aimagId;
        return true;
      });
      const aimags = data.aimags.features.filter(
        (feature) => !aimagId || feature.properties.id === aimagId,
      );
      return [
        {
          geojson: toMapGeo(soums, (p) => unitKey("soum", p.asCode)),
          color: "#5c7488",
          width: soumCode ? 1.2 : 0.9,
          opacity: soumCode ? 0.6 : 0.42,
        },
        // Сумын бүдэг шугамын дараа зурагдаж, аймгийн хүрээ дээр гарна.
        {
          geojson: toMapGeo(aimags, (p) => unitKey("aimag", p.id)),
          ...AIMAG_BORDER,
        },
      ];
    }

    return [];
  }, [aimagId, data, layer, soumCode]);

  const mapValues = useMemo(() => {
    const next: Record<string, number> = {};
    rows.forEach((row) => {
      next[row.key] = row.value;
    });
    return next;
  }, [rows]);

  const selectedKey =
    layer === "bag" && bagAsb
      ? unitKey("bag", bagAsb)
      : layer === "soum" && soumCode
        ? unitKey("soum", soumCode)
        : layer === "aimag" && aimagId
          ? unitKey("aimag", aimagId)
          : null;

  const selectedRow = selectedKey
    ? rows.find((row) => row.key === selectedKey)
    : undefined;

  const percentScale =
    indicator?.unit === "share" || indicator?.unit === "rate";
  const legendScale = useMemo(
    () =>
      colorScaleBounds(
        rows.map((row) => row.value),
        percentScale ? "percent" : "auto",
      ),
    [percentScale, rows],
  );

  const focusTitle = selectedRow?.name
    ?? (soumCode
      ? data?.soums.features.find((feature) => feature.properties.asCode === soumCode)?.properties.name
      : undefined)
    ?? (aimagId
      ? AIMAG_OPTIONS.find((item) => item.value === aimagId)?.label
      : undefined)
    ?? "Монгол Улс";

  const focusValue = selectedRow?.value ?? tableTotal ?? 0;
  const indicatorLabel =
    topic.subFilters.find((item) => item.id === indicatorId)?.label ??
    indicator?.label ??
    "";
  const selectedCategoryLabel = indicator?.categories.find(
    (item) => item.id === categoryId,
  )?.label;
  const sexLabel = !isAllChoice(sexId)
    ? indicator?.sexes?.find((item) => item.id === sexId)?.label
    : undefined;
  const ageLabel = !isAllChoice(ageId)
    ? indicator?.ages?.find((item) => item.id === ageId)?.label
    : undefined;
  const categoryLabel = [
    selectedCategoryLabel && selectedCategoryLabel !== indicatorLabel
      ? selectedCategoryLabel
      : undefined,
    sexLabel,
    ageLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  const shareNoun: "хүн амын" | "өрхийн" =
    topic.id === "household" ? "өрхийн" : "хүн амын";
  const isShare = indicator?.unit === "share" && Boolean(selectedCategoryLabel);
  const isNationalFocus = !selectedRow;
  const shareCaption = isShare
    ? formatShareCaption({
        place: focusTitle,
        layer,
        value: focusValue,
        category: selectedCategoryLabel!,
        sex: sexLabel,
        age: ageLabel,
        indicatorId,
        noun: shareNoun,
        national: isNationalFocus,
      })
    : null;
  const notes = captionNotes(indicatorId);
  const cardNote =
    indicatorId === "sex-ratio" || indicatorId === "dependency"
      ? notes[0]
      : undefined;

  const tooltip = useMemo(
    () => ({
      kind: isShare ? ("share" as const) : ("plain" as const),
      layer,
      noun: shareNoun,
      indicatorId,
      category: selectedCategoryLabel,
      sex: sexLabel,
      age: ageLabel,
      indicatorLabel,
      categoryLabel: categoryLabel || undefined,
      year,
      note: cardNote,
    }),
    [
      ageLabel,
      cardNote,
      categoryLabel,
      indicatorId,
      indicatorLabel,
      isShare,
      layer,
      selectedCategoryLabel,
      sexLabel,
      shareNoun,
      year,
    ],
  );

  const loading = geo.loading || stats.loading;
  const error = geo.error || stats.error;

  function resetToCountry() {
    const homeLayer =
      indicator?.defaultLayer && allowedLayers.includes(indicator.defaultLayer)
        ? indicator.defaultLayer
        : allowedLayers.includes("bag")
          ? "bag"
          : allowedLayers[allowedLayers.length - 1];
    setLayer(homeLayer);
    setAimagId(null);
    setSoumCode(null);
    setBagAsb(null);
    setFitToken((n) => n + 1);
  }

  function handleTopicChange(id: string) {
    if (id !== topic.id) onTopicChange(id);
  }

  function handleSubFilter(id: string) {
    setIndicatorId(id);
    setCategoryId(TOTAL_CATEGORY);
    setSexId(TOTAL_CATEGORY);
    setAgeId(TOTAL_CATEGORY);
  }

  function handleLayerChange(next: MapLayer) {
    if (next === layer) return;
    setLayer(next);
    setAimagId(null);
    setSoumCode(null);
    setBagAsb(null);
    setFitToken((n) => n + 1);
  }

  function drillToSoum(id: number) {
    setAimagId(id);
    setSoumCode(null);
    setBagAsb(null);
    setLayer("soum");
  }

  function drillToBag(asCode: number, parentAimagId: number) {
    setAimagId(parentAimagId);
    setSoumCode(asCode);
    setBagAsb(null);
    setLayer("bag");
  }

  function handleMapSelect(mapName: string) {
    let { layer: clickedLayer, id } = parseUnitKey(mapName);
    if (!Number.isFinite(id) && data && layer === "aimag") {
      const aimag = data.aimags.features.find(
        (feature) => String(feature.properties.name) === mapName,
      );
      if (aimag) {
        clickedLayer = "aimag";
        id = aimag.properties.id;
      }
    }
    if (layer === "bag") {
      if (clickedLayer === "bag") setBagAsb(id);
      return;
    }
    if (clickedLayer === "aimag") {
      drillToSoum(id);
      return;
    }
    if (clickedLayer === "soum") {
      const soum = data?.soums.features.find((f) => f.properties.asCode === id);
      if (!soum) return;
      if (!allowedLayers.includes("bag")) {
        setSoumCode(id);
        setBagAsb(null);
        return;
      }
      drillToBag(id, soum.properties.aimagId);
      return;
    }
    const bag = data?.bags.features.find((f) => f.properties.asb === id);
    if (bag) {
      setBagAsb(id);
      setSoumCode(bag.properties.asCode);
      setAimagId(bag.properties.aimagId);
    }
  }

  return (
    <ConfigProvider
      getPopupContainer={() => document.body}
      theme={{
        token: {
          colorPrimary: "#1d4e78",
          borderRadius: 6,
          fontFamily: "Arial, Helvetica, sans-serif",
          zIndexPopupBase: 2000,
        },
      }}
    >
      <div className="dashboard">
        <div className="dashboard-card">
          <aside className="dashboard-sidebar">
            <header className="dashboard-intro">
              <h1>Тооллогын газрын зураг</h1>
              <p>
                2025 оны 12-р сард Монгол даяар хүмүүсийн амьдрал ямар байсныг
                мэдэхийн тулд манай газрын зургийг ашиглаарай
              </p>
            </header>
            <div className="dashboard-sidebar-filters">
              <label className="dashboard-filter-block dashboard-filter-census">
                <span className="dashboard-filter-label">Тооллого</span>
                <Select
                  className="dashboard-select"
                  value={CENSUS_TYPES[0].value}
                  options={[...CENSUS_TYPES]}
                />
              </label>
              <label className="dashboard-filter-block dashboard-filter-topic">
                <span className="dashboard-filter-label">Бүлэг</span>
                <Select
                  className="dashboard-select"
                  value={topic.id}
                  options={TOPICS.map((item) => ({
                    value: item.id,
                    label: item.label,
                  }))}
                  onChange={handleTopicChange}
                />
              </label>
              <SubFilterNav
                topic={topic}
                activeId={indicatorId}
                onSelect={handleSubFilter}
              />
              <label className="dashboard-filter-block dashboard-filter-year">
                <span className="dashboard-filter-label">Он</span>
                <Select
                  className="dashboard-select"
                  value={year}
                  options={YEAR_OPTIONS}
                  onChange={setYear}
                />
              </label>
              <LayerControl
                layer={layer}
                layers={allowedLayers}
                onLayerChange={handleLayerChange}
              />
              <FilterBar
                indicator={indicator}
                indicatorId={indicatorId}
                categoryId={categoryId}
                sexId={sexId}
                ageId={ageId}
                onCategoryChange={setCategoryId}
                onSexChange={setSexId}
                onAgeChange={setAgeId}
              />
              {!indicator ? (
                <p className="dashboard-note">Энэ үзүүлэлтийн өгөгдөл байхгүй байна.</p>
              ) : null}
              {notes.length > 0 && !cardNote ? (
                <div className="dashboard-note">
                  {notes.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              ) : null}
              {error && <p className="dashboard-note">{error}</p>}
            </div>
          </aside>

          <main className="dashboard-map">
            <MapToolbar onHome={resetToCountry} />
            {data ? (
              <UnitMap
                mapId={`${layer}-${aimagId ?? "all"}-${soumCode ?? "all"}-${mapGeo.features.length}`}
                geojson={mapGeo}
                values={mapValues}
                layer={layer}
                overlays={overlays}
                tooltip={tooltip}
                fitToken={fitToken}
                percentScale={percentScale}
                onSelect={handleMapSelect}
              />
            ) : (
              <div className="dashboard-loading">Газрын зураг ачааллаж байна…</div>
            )}
            {indicator && !loading ? (
              <MapFocusCard
                title={focusTitle}
                subtitle={
                  shareCaption ??
                  [indicatorLabel, categoryLabel, year].filter(Boolean).join(" · ")
                }
                note={cardNote}
                value={focusValue}
                min={legendScale.min}
                max={legendScale.max}
                sorted={legendScale.sorted}
                markerValue={selectedRow?.value}
                percent={percentScale}
              />
            ) : null}
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
}

export function CensusDashboard() {
  const [topicId, setTopicId] = useState(TOPICS[0].id);
  const topic = getTopic(topicId) ?? TOPICS[0];

  return (
    <div className="nso-census-dash">
      <Dashboard key={topic.id} topic={topic} onTopicChange={setTopicId} />
    </div>
  );
}
