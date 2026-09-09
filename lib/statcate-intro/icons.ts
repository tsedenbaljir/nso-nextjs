import { createElement } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Banknote,
  BarChart3,
  Building2,
  CalendarDays,
  CloudLightning,
  Cog,
  Coins,
  CreditCard,
  DollarSign,
  Droplets,
  Flame,
  Gauge,
  GitCompare,
  Handshake,
  Home,
  HousePlus,
  Landmark,
  LandPlot,
  Mountain,
  Package,
  Plane,
  Receipt,
  Scale,
  Shield,
  Trees,
  TrendingUp,
  User,
  UsersRound,
  UtensilsCrossed,
  Wallet,
  Warehouse,
  Wheat,
} from "lucide-react";
import {
  BookMark,
  BoltMark,
  CareMark,
  ChildMark,
  ChurchMark,
  CoinMark,
  DharmaMark,
  ElderMark,
  FactoryMark,
  GlobeMark,
  InsuredMark,
  LeafMark,
  MosqueMark,
  OtherMark,
  PensionerMark,
  PeopleMark,
  PercentMark,
  SdgMark,
  TempleMark,
  MaleMark,
  FemaleMark,
} from "@/lib/statcate-intro/marks";
import { trimLabel } from "@/lib/statcate-intro/format";
import type { IntroIconName } from "@/lib/statcate-intro/types";
import type { LucideIcon } from "lucide-react";

type Mark = typeof TempleMark;

function asMark(Icon: LucideIcon): Mark {
  function LucideMark({ size = 24, className }: { size?: number; className?: string }) {
    return createElement(Icon, {
      size,
      strokeWidth: 2.25,
      className,
      "aria-hidden": true,
    });
  }
  return LucideMark;
}

export const INTRO_ICONS: Record<IntroIconName, Mark> = {
  temple: TempleMark,
  people: PeopleMark,
  representatives: asMark(UsersRound),
  male: MaleMark,
  female: FemaleMark,
  book: BookMark,
  dharma: DharmaMark,
  church: ChurchMark,
  mosque: MosqueMark,
  other: OtherMark,
  poverty: PeopleMark,
  gini: OtherMark,
  subsistence: BookMark,
  insured: InsuredMark,
  pensioner: PensionerMark,
  avgPension: CoinMark,
  welfare: CareMark,
  sdg: SdgMark,
  child: ChildMark,
  elder: ElderMark,
  bop: asMark(Scale),
  cpi: PercentMark,
  environment: LeafMark,
  energy: BoltMark,
  trade: asMark(ArrowLeftRight),
  budget: asMark(Landmark),
  investment: asMark(TrendingUp),
  money: asMark(Banknote),
  gdp: asMark(BarChart3),
  ppi: FactoryMark,
  productivity: asMark(Gauge),
  fx: asMark(DollarSign),
  forest: asMark(Trees),
  goods: asMark(Package),
  services: asMark(Handshake),
  reserves: asMark(Coins),
  food: asMark(UtensilsCrossed),
  meat: asMark(UtensilsCrossed),
  milk: asMark(UtensilsCrossed),
  potato: asMark(UtensilsCrossed),
  vegetables: asMark(UtensilsCrossed),
  housing: asMark(Building2),
  housingNew: asMark(HousePlus),
  housingOld: asMark(Home),
  housingPrice: asMark(LandPlot),
  calendar: asMark(CalendarDays),
  ag: asMark(Wheat),
  fire: asMark(Flame),
  damage: asMark(CloudLightning),
  protection: asMark(Shield),
  tax: asMark(Receipt),
  export: asMark(ArrowUpFromLine),
  import: asMark(ArrowDownToLine),
  balance: asMark(GitCompare),
  expense: asMark(Wallet),
  domestic: asMark(Warehouse),
  foreign: asMark(Plane),
  fdi: GlobeMark,
  loans: asMark(CreditCard),
  npl: asMark(AlertTriangle),
  growth: asMark(Activity),
  capita: asMark(User),
  mining: asMark(Mountain),
  manufacturing: asMark(Cog),
  utilities: asMark(Droplets),
};

/** KPI icon бүрт өөр өнгө — нэг л palette-ийн давталтаас илүү ялгаатай. */
export const INTRO_ICON_COLORS: Partial<Record<IntroIconName, string>> = {
  representatives: "#5B6B80",
  male: "#12658F",
  female: "#8A146F",
  sdg: "#E5243B",
  child: "#1A5CAD",
  elder: "#5B6B80",
  poverty: "#E5243B",
  bop: "#0F6A6A",
  goods: "#C45A2A",
  services: "#1A5CAD",
  reserves: "#B8860B",
  cpi: "#C0392B",
  food: "#D35400",
  meat: "#D35400",
  milk: "#D35400",
  potato: "#D35400",
  vegetables: "#D35400",
  housing: "#2980B9",
  housingNew: "#0E7C7B",
  housingOld: "#5B6B80",
  housingPrice: "#C45A2A",
  calendar: "#5B6B80",
  environment: "#2E7D32",
  ag: "#558B2F",
  forest: "#1B5E20",
  fire: "#E65100",
  damage: "#6A1B9A",
  protection: "#00695C",
  tax: "#6A1B9A",
  energy: "#F9A825",
  trade: "#1565C0",
  export: "#2E7D32",
  import: "#C62828",
  balance: "#5B6B80",
  budget: "#5B2C6F",
  expense: "#AD1457",
  investment: "#1565C0",
  domestic: "#00838F",
  foreign: "#6A1B9A",
  fdi: "#0277BD",
  money: "#1A5CAD",
  fx: "#B8860B",
  loans: "#00695C",
  npl: "#C62828",
  gdp: "#1A5CAD",
  growth: "#0E7C7B",
  capita: "#3949AB",
  ppi: "#E67E22",
  mining: "#5D4037",
  manufacturing: "#455A64",
  utilities: "#0277BD",
  productivity: "#00897B",
};

const INTRO_ICON_IMAGES: Partial<Record<IntroIconName, string>> = {
  meat: "/icons/price/meat.png",
  milk: "/icons/price/milk.png",
  potato: "/icons/price/potato.png",
  vegetables: "/icons/price/cabbage.png",
  temple: "/icons/religion/temple.png",
  people: "/icons/religion/people.png",
  book: "/icons/religion/book.png",
  dharma: "/icons/religion/buddha.png",
  church: "/icons/religion/church.png",
  mosque: "/icons/religion/mosque.png",
  other: "/icons/religion/other.png",
  poverty: "/icons/poverty/poverty.png",
  gini: "/icons/poverty/gini.png",
  subsistence: "/icons/poverty/adt.png",
};

const INTRO_CLERGY_IMAGES: Partial<Record<IntroIconName, string>> = {
  dharma: "/icons/religion/clergy-monk.png",
  church: "/icons/religion/clergy-priest.png",
  mosque: "/icons/religion/clergy-islam.png",
  other: "/icons/religion/clergy-other.png",
};

export function resolveIconImage(name?: IntroIconName): string | undefined {
  return name ? INTRO_ICON_IMAGES[name] : undefined;
}

export function resolveIcon(name?: IntroIconName): Mark {
  return INTRO_ICONS[name ?? "other"];
}

export function resolveIconColor(name?: IntroIconName): string | undefined {
  return name ? INTRO_ICON_COLORS[name] : undefined;
}

export function resolveCategoryIconName(label: string, map?: Record<string, IntroIconName>): IntroIconName {
  if (map) {
    const t = trimLabel(label).toLowerCase();
    for (const [key, icon] of Object.entries(map)) {
      if (t.includes(key.toLowerCase())) return icon;
    }
  }
  return "other";
}

export function resolveCategoryIcon(label: string, map?: Record<string, IntroIconName>): Mark {
  return INTRO_ICONS[resolveCategoryIconName(label, map)];
}

export function resolveCategoryImage(label: string, map?: Record<string, IntroIconName>): string | undefined {
  return INTRO_ICON_IMAGES[resolveCategoryIconName(label, map)];
}

export function resolveCategoryClergyImage(label: string, map?: Record<string, IntroIconName>): string | undefined {
  return INTRO_CLERGY_IMAGES[resolveCategoryIconName(label, map)];
}
