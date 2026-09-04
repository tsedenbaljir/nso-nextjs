import {
  BookMark,
  CareMark,
  ChildMark,
  ChurchMark,
  CoinMark,
  DharmaMark,
  ElderMark,
  InsuredMark,
  MosqueMark,
  OtherMark,
  PensionerMark,
  PeopleMark,
  SdgMark,
  TempleMark,
} from "@/lib/statcate-intro/marks";
import { trimLabel } from "@/lib/statcate-intro/format";
import type { IntroIconName } from "@/lib/statcate-intro/types";

type Mark = typeof TempleMark;

export const INTRO_ICONS: Record<IntroIconName, Mark> = {
  temple: TempleMark,
  people: PeopleMark,
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
};

const INTRO_ICON_IMAGES: Partial<Record<IntroIconName, string>> = {
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
