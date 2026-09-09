import { createElement } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Banknote,
  BarChart3,
  Beef,
  BookOpen,
  Building2,
  CalendarDays,
  ChartPie,
  Church,
  ClipboardCheck,
  CloudLightning,
  Cog,
  Coins,
  CreditCard,
  DollarSign,
  Droplets,
  Factory,
  Flame,
  Gauge,
  GitCompare,
  Globe2,
  Handshake,
  Home,
  HousePlus,
  IdCard,
  Landmark,
  LandPlot,
  Leaf,
  Milk,
  Mountain,
  Package,
  Percent,
  Plane,
  Receipt,
  Salad,
  Scale,
  Shield,
  ShieldCheck,
  Trees,
  TrendingUp,
  User,
  Users,
  UsersRound,
  UtensilsCrossed,
  Wallet,
  Warehouse,
  Wheat,
  Carrot,
  Zap,
} from "lucide-react";
import { MaleMark, FemaleMark } from "@/lib/statcate-intro/marks";
import { trimLabel } from "@/lib/statcate-intro/format";
import type { IntroIconName } from "@/lib/statcate-intro/types";
import type { LucideIcon } from "lucide-react";

type Mark = typeof MaleMark;

function asMark(Icon: LucideIcon): Mark {
  function LucideMark({ size = 22, className }: { size?: number; className?: string }) {
    return createElement(Icon, {
      size,
      strokeWidth: 2,
      className,
      "aria-hidden": true,
    });
  }
  return LucideMark;
}

/** Энгийн line icon — бүх танилцуулгын KPI/flow дээр нэг албан ёсны хэв. */
export const INTRO_ICONS: Record<IntroIconName, Mark> = {
  temple: asMark(Landmark),
  people: asMark(Users),
  representatives: asMark(UsersRound),
  male: MaleMark,
  female: FemaleMark,
  book: asMark(BookOpen),
  dharma: asMark(Landmark),
  church: asMark(Church),
  mosque: asMark(Building2),
  other: asMark(Building2),
  poverty: asMark(Users),
  gini: asMark(ChartPie),
  subsistence: asMark(ClipboardCheck),
  insured: asMark(ShieldCheck),
  pensioner: asMark(IdCard),
  avgPension: asMark(Coins),
  welfare: asMark(Handshake),
  sdg: asMark(Globe2),
  child: asMark(Users),
  elder: asMark(Users),
  bop: asMark(Scale),
  cpi: asMark(Percent),
  environment: asMark(Leaf),
  energy: asMark(Zap),
  trade: asMark(ArrowLeftRight),
  budget: asMark(Landmark),
  investment: asMark(TrendingUp),
  money: asMark(Banknote),
  gdp: asMark(BarChart3),
  ppi: asMark(Factory),
  productivity: asMark(Gauge),
  fx: asMark(DollarSign),
  forest: asMark(Trees),
  goods: asMark(Package),
  services: asMark(Handshake),
  reserves: asMark(Coins),
  food: asMark(UtensilsCrossed),
  meat: asMark(Beef),
  milk: asMark(Milk),
  potato: asMark(Carrot),
  vegetables: asMark(Salad),
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
  fdi: asMark(Globe2),
  loans: asMark(CreditCard),
  npl: asMark(AlertTriangle),
  growth: asMark(Activity),
  capita: asMark(User),
  mining: asMark(Mountain),
  manufacturing: asMark(Cog),
  utilities: asMark(Droplets),
};

export const INTRO_ICON_COLORS: Partial<Record<IntroIconName, string>> = {
  representatives: "#5B6B80",
  male: "#12658F",
  female: "#8A146F",
  sdg: "#E5243B",
  child: "#1A5CAD",
  elder: "#5B6B80",
  poverty: "#C0392B",
  gini: "#5B6B80",
  subsistence: "#1A5CAD",
  insured: "#0E7C7B",
  pensioner: "#5B6B80",
  avgPension: "#B8860B",
  welfare: "#12658F",
  bop: "#0F6A6A",
  goods: "#C45A2A",
  services: "#1A5CAD",
  reserves: "#B8860B",
  cpi: "#1A5CAD",
  food: "#D35400",
  meat: "#C0392B",
  milk: "#2980B9",
  potato: "#B8860B",
  vegetables: "#2E7D32",
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
  temple: "#8A146F",
  people: "#12658F",
  book: "#5B6B80",
  dharma: "#C45A2A",
  church: "#1A5CAD",
  mosque: "#0E7C7B",
  other: "#5B6B80",
};

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
