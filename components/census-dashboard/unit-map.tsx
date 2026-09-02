"use client";

import { useLayoutEffect, useRef } from "react";
import L from "leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import "leaflet/dist/leaflet.css";
import { colorScaleBounds, formatNumber, mapColor, MAP_COLORS, parseUnitKey, type ColorClass, type ColorScaleMode, type EchartsGeo } from "@/lib/census-dashboard/dashboard";
import { formatShareCaption } from "@/lib/census-dashboard/caption";
import { AIMAG_LABEL_OFFSET } from "@/lib/census-dashboard/aimags";
import type { MapLayer } from "@/lib/census-dashboard/geo";

type TooltipInfo = {
  kind: "share" | "plain";
  layer: MapLayer;
  noun: string;
  indicatorId?: string;
  category?: string;
  sex?: string;
  age?: string;
  indicatorLabel: string;
  categoryLabel?: string;
  year?: string;
  note?: string;
};

type BorderOverlay = {
  geojson: EchartsGeo;
  color: string;
  width: number;
  opacity?: number;
};

type Props = {
  mapId: string;
  geojson: FeatureCollection<Geometry, Record<string, string | number>>;
  values: Record<string, number>;
  layer: MapLayer;
  overlays?: BorderOverlay[];
  tooltip: TooltipInfo;
  fitToken?: number;
  percentScale?: boolean;
  onSelect: (mapName: string) => void;
};

type MapFeature = Feature<Geometry, Record<string, string | number>>;

type ScaleState = {
  min: number;
  max: number;
  sorted: number[];
  mode: ColorScaleMode;
  classes: ColorClass[];
  faintBorder: string;
  faintWidth: number;
};

const BASEMAP =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
// Доод талд илүү зай нөөцөлж, газрын зургийг focus картны дээгүүр гаргана.
const FIT_PADDING_TOP: L.PointTuple = [50, 14];
const FIT_PADDING_BOTTOM: L.PointTuple = [50, 114];
const FIT_PADDING_TOP_SMALL: L.PointTuple = [16, 8];
const FIT_PADDING_BOTTOM_SMALL: L.PointTuple = [16, 72];

// Жижиг дэлгэц дээр 84px зай нь газрын зургийн талыг эзэлдэг тул багасгана.
function fitPadding(map: L.Map) {
  const size = map.getSize();
  const small = size.x < 620 || size.y < 420;
  return small
    ? { top: FIT_PADDING_TOP_SMALL, bottom: FIT_PADDING_BOTTOM_SMALL }
    : { top: FIT_PADDING_TOP, bottom: FIT_PADDING_BOTTOM };
}
const MAP_MAX_ZOOM = 16;
const MAP_MIN_ZOOM = 5;
// Хэмжилтийн үеийн түр шал — үүнээс доош хэзээ ч томруулж харуулахгүй.
const MAP_ZOOM_FLOOR = 2;
const WORLD_BOUNDS: L.LatLngBoundsLiteral = [
  [-85, -180],
  [85, 180],
];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function tooltipPath(layer: MapLayer, props: Record<string, string | number>) {
  if (layer === "soum") return String(props.aimagName ?? "");
  if (layer === "bag") {
    return [props.aimagName, props.soumName].filter(Boolean).join(" · ");
  }
  return "";
}

function tooltipHtml(
  tooltip: TooltipInfo,
  displayName: string,
  path: string,
  value: number,
) {
  if (tooltip.kind === "share" && tooltip.category) {
    const caption = escapeHtml(
      formatShareCaption({
        place: displayName,
        layer: tooltip.layer,
        value,
        category: tooltip.category,
        sex: tooltip.sex,
        age: tooltip.age,
        indicatorId: tooltip.indicatorId,
        noun: tooltip.noun,
      }),
    );
    const trail = escapeHtml(path);
    return `<div class="map-tooltip">
      ${trail ? `<div class="map-tooltip-path">${trail}</div>` : ""}
      <p class="map-tooltip-caption">${caption}</p>
    </div>`;
  }

  const name = escapeHtml(displayName);
  const trail = escapeHtml(path);
  const label = escapeHtml(tooltip.categoryLabel || tooltip.indicatorLabel || "Тоо");
  const note = tooltip.note ? escapeHtml(tooltip.note) : "";
  return `<div class="map-tooltip">
    <div class="map-tooltip-head">
      <span class="map-tooltip-dot"></span>
      <div class="map-tooltip-title">
        <div class="map-tooltip-name">${name}</div>
        ${trail ? `<div class="map-tooltip-path">${trail}</div>` : ""}
      </div>
    </div>
    <div class="map-tooltip-row">
      <span class="map-tooltip-label">${label}</span>
      <span class="map-tooltip-value">${formatNumber(value)}</span>
    </div>
    ${note ? `<p class="map-tooltip-caption">${note}</p>` : ""}
  </div>`;
}

function featureStyle(
  feature: MapFeature | undefined,
  values: Record<string, number>,
  hoverName: string | null,
  scale: ScaleState,
) {
  const name = String(feature?.properties.mapName ?? "");
  const hovered = name === hoverName;
  const fill = mapColor(values[name] ?? 0, scale);
  return {
    color: hovered ? fill : scale.faintBorder,
    weight: hovered ? 2.75 : scale.faintWidth,
    fillColor: fill,
    fillOpacity: 0.94,
    opacity: 1,
    lineJoin: "round" as const,
  };
}

function paintLayer(
  dataLayer: L.GeoJSON,
  values: Record<string, number>,
  hoverName: string | null,
  scale: ScaleState,
) {
  dataLayer.eachLayer((item) => {
    const shape = item as L.Path & { feature?: MapFeature };
    if (!shape.feature) return;
    shape.setStyle(featureStyle(shape.feature, values, hoverName, scale));
  });
}

function fitMap(
  map: L.Map,
  bounds: L.LatLngBounds,
  countryBounds: L.LatLngBounds | null,
  animated = false,
) {
  map.stop();
  // Do not shrink maxBounds to the drill target — that fights flyToBounds.
  map.setMaxBounds(countryBounds ?? WORLD_BOUNDS);
  const padding = fitPadding(map);
  // Нарийхан дэлгэцэнд бүтэн Монгол zoom 5-д багтахгүй тул доод хязгаарыг
  // тухайн хэмжээст шаардагдах zoom хүртэл буулгана. getBoundsZoom нь
  // хариугаа одоогийн minZoom-оор хайчилдаг тул эхлээд шалыг сулруулна.
  const widest = countryBounds ?? bounds;
  const inset = L.point(
    padding.top[0] + padding.bottom[0],
    padding.top[1] + padding.bottom[1],
  );
  const usable = map.getSize().subtract(inset);
  if (widest.isValid() && usable.x > 0 && usable.y > 0) {
    map.setMinZoom(MAP_ZOOM_FLOOR);
    const needed = map.getBoundsZoom(widest, false, inset);
    if (Number.isFinite(needed)) {
      map.setMinZoom(Math.min(MAP_MIN_ZOOM, needed));
    } else {
      map.setMinZoom(MAP_MIN_ZOOM);
    }
  }
  const options: L.FitBoundsOptions = {
    paddingTopLeft: padding.top,
    paddingBottomRight: padding.bottom,
    maxZoom: MAP_MAX_ZOOM,
    animate: false,
  };
  if (animated) {
    map.flyToBounds(bounds, {
      ...options,
      animate: true,
      duration: 0.75,
      easeLinearity: 0.4,
    });
    return;
  }
  map.fitBounds(bounds, options);
}

export default function UnitMap({
  mapId,
  geojson,
  values,
  layer,
  overlays = [],
  tooltip,
  fitToken = 0,
  percentScale = false,
  onSelect,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const dataLayerRef = useRef<L.GeoJSON | null>(null);
  const overlayRef = useRef<L.LayerGroup | null>(null);
  const labelsRef = useRef<L.LayerGroup | null>(null);
  const borderRendererRef = useRef<L.SVG | null>(null);
  const hoverRef = useRef<L.Tooltip | null>(null);
  const hoverNameRef = useRef<string | null>(null);
  const onSelectRef = useRef(onSelect);
  const fitKeyRef = useRef<string | null>(null);
  const lastBoundsRef = useRef<L.LatLngBounds | null>(null);
  const countryBoundsRef = useRef<L.LatLngBounds | null>(null);
  const pendingViewFitRef = useRef(false);
  const lastSizeRef = useRef({ w: 0, h: 0 });
  const valuesRef = useRef(values);
  const tooltipRef = useRef(tooltip);
  const layerRef = useRef(layer);
  const percentScaleRef = useRef(percentScale);
  const scaleRef = useRef<ScaleState>({
    min: 0,
    max: 1,
    sorted: [0, 1],
    mode: "auto",
    classes: MAP_COLORS.map(() => ({ min: 0, max: 0 })),
    faintBorder: "#111111",
    faintWidth: 1,
  });

  onSelectRef.current = onSelect;
  valuesRef.current = values;
  tooltipRef.current = tooltip;
  layerRef.current = layer;
  percentScaleRef.current = percentScale;

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return undefined;

    const map = L.map(el, {
      attributionControl: false,
      zoomControl: false,
      preferCanvas: true,
      minZoom: MAP_MIN_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
      zoomSnap: 0,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 140,
      bounceAtZoomLimits: false,
      maxBoundsViscosity: 0.8,
    });
    map.createPane("borders");
    const bordersPane = map.getPane("borders")!;
    bordersPane.style.zIndex = "450";
    bordersPane.style.pointerEvents = "none";
    borderRendererRef.current = L.svg({ pane: "borders" });

    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer(BASEMAP, {
      maxZoom: 16,
    }).addTo(map);

    const labels = L.layerGroup().addTo(map);
    const overlay = L.layerGroup([], { pane: "borders" }).addTo(map);
    mapRef.current = map;
    labelsRef.current = labels;
    overlayRef.current = overlay;

    const observer = new ResizeObserver(() => {
      const size = map.getSize();
      if (size.x < 40 || size.y < 40) return;
      map.invalidateSize({ animate: false });
      const prev = lastSizeRef.current;
      const grewFromZero = prev.w < 40 || prev.h < 40;
      // Дэлгэц эргэх/layout солигдоход өргөн нь мэдэгдэхүйц хувирна. Хаяг
      // хайрцаг нуугдахад зөвхөн өндөр хувирдаг тул түүнд дахин тохируулахгүй.
      const widthShift =
        prev.w >= 40 && Math.abs(size.x - prev.w) / prev.w > 0.2;
      lastSizeRef.current = { w: size.x, h: size.y };
      const bounds = lastBoundsRef.current;
      if ((grewFromZero || widthShift) && bounds && fitKeyRef.current) {
        fitMap(map, bounds, countryBoundsRef.current);
      }
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      hoverRef.current?.remove();
      hoverRef.current = null;
      map.remove();
      mapRef.current = null;
      dataLayerRef.current = null;
      overlayRef.current = null;
      labelsRef.current = null;
      borderRendererRef.current = null;
      fitKeyRef.current = null;
      lastBoundsRef.current = null;
      countryBoundsRef.current = null;
      pendingViewFitRef.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    const map = mapRef.current;
    const overlayGroup = overlayRef.current;
    const labelGroup = labelsRef.current;
    if (!map || !overlayGroup || !labelGroup || !geojson.features.length) return;

    const nums = geojson.features.map(
      (feature) => valuesRef.current[String(feature.properties.mapName)] ?? 0,
    );
    const { min, max, sorted, mode, classes } = colorScaleBounds(
      nums,
      percentScaleRef.current ? "percent" : "auto",
    );
    scaleRef.current = {
      min,
      max,
      sorted,
      mode,
      classes,
      faintBorder: layer === "aimag" ? "#111111" : "rgba(255,255,255,0.75)",
      faintWidth: layer === "bag" ? 0.45 : layer === "soum" ? 0.7 : 1,
    };
    const showLabels = geojson.features.length <= 40;

    if (dataLayerRef.current) {
      dataLayerRef.current.remove();
      dataLayerRef.current = null;
    }
    overlayGroup.clearLayers();
    labelGroup.clearLayers();
    hoverRef.current?.remove();
    hoverRef.current = null;
    hoverNameRef.current = null;

    const dataLayer = L.geoJSON(geojson, {
      interactive: true,
      bubblingMouseEvents: false,
      style: (feature) =>
        featureStyle(
          feature as MapFeature,
          valuesRef.current,
          hoverNameRef.current,
          scaleRef.current,
        ),
      onEachFeature: (feature, shape) => {
        const props = (feature as MapFeature).properties;
        const name = String(props.mapName);
        const displayName = String(props.name ?? "");

        shape.bindTooltip(
          () =>
            tooltipHtml(
              tooltipRef.current,
              displayName,
              tooltipPath(layerRef.current, props),
              valuesRef.current[name] ?? 0,
            ),
          {
            className: "map-hover-tooltip",
            sticky: true,
            direction: "top",
            opacity: 1,
            offset: [0, -8],
          },
        );
        shape.on("click", () => onSelectRef.current(name));
        shape.on("mouseover", () => {
          hoverNameRef.current = name;
          const path = shape as L.Path;
          path.setStyle(
            featureStyle(
              feature as MapFeature,
              valuesRef.current,
              name,
              scaleRef.current,
            ),
          );
          if (typeof path.bringToFront === "function") path.bringToFront();
        });
        shape.on("mouseout", () => {
          hoverNameRef.current = null;
          (shape as L.Path).setStyle(
            featureStyle(
              feature as MapFeature,
              valuesRef.current,
              null,
              scaleRef.current,
            ),
          );
        });

        if (showLabels && displayName) {
          const offset =
            layer === "aimag"
              ? AIMAG_LABEL_OFFSET[parseUnitKey(name).id]
              : undefined;
          const center = (shape as L.Polygon).getBounds().getCenter();
          L.marker(center, {
            interactive: false,
            keyboard: false,
            icon: L.divIcon({
              className: "map-unit-label",
              html: escapeHtml(displayName),
              iconSize: [96, 18],
              iconAnchor: offset
                ? [48 - offset[0], 9 - offset[1]]
                : [48, 9],
            }),
          }).addTo(labelGroup);
        }
      },
    }).addTo(map);
    dataLayerRef.current = dataLayer;

    overlays.forEach((overlay) => {
      L.geoJSON(overlay.geojson, {
        pane: "borders",
        interactive: false,
        style: {
          renderer: borderRendererRef.current ?? L.svg({ pane: "borders" }),
          color: overlay.color,
          weight: overlay.width,
          fill: false,
          fillOpacity: 0,
          opacity: overlay.opacity ?? 1,
          lineJoin: "round",
        },
      }).addTo(overlayGroup);
    });

    const bounds = dataLayer.getBounds();
    if (bounds.isValid()) {
      lastBoundsRef.current = bounds;
      if (!countryBoundsRef.current) {
        countryBoundsRef.current = bounds.pad(0.18);
      }
      if (fitKeyRef.current !== mapId) {
        pendingViewFitRef.current = true;
        fitMap(map, bounds, countryBoundsRef.current, fitKeyRef.current != null);
        fitKeyRef.current = mapId;
      }
    }
  }, [geojson, layer, mapId, overlays]);

  useLayoutEffect(() => {
    if (!fitToken) {
      pendingViewFitRef.current = false;
      return;
    }
    if (pendingViewFitRef.current) {
      pendingViewFitRef.current = false;
      return;
    }
    const map = mapRef.current;
    const bounds = lastBoundsRef.current ?? dataLayerRef.current?.getBounds();
    if (!map || !bounds?.isValid()) return;
    fitMap(map, bounds, countryBoundsRef.current, true);
  }, [fitToken]);

  useLayoutEffect(() => {
    const dataLayer = dataLayerRef.current;
    if (!dataLayer || !geojson.features.length) return;
    const nums = geojson.features.map(
      (feature) => values[String(feature.properties.mapName)] ?? 0,
    );
    const { min, max, sorted, mode, classes } = colorScaleBounds(
      nums,
      percentScale ? "percent" : "auto",
    );
    scaleRef.current = { ...scaleRef.current, min, max, sorted, mode, classes };
    paintLayer(
      dataLayer,
      values,
      hoverNameRef.current,
      scaleRef.current,
    );
  }, [geojson, values, percentScale]);

  return <div ref={elRef} className="unit-map" />;
}
