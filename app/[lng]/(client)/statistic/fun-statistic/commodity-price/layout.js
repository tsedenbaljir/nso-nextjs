"use client";
import { use } from "react";

import Path from "@/components/path/Index";
import { useTranslation } from "@/app/i18n/client";

export default function CommodityPriceLayout(props) {
  const { lng } = use(props.params);
  const { children } = props;
  const { t } = useTranslation(lng, "lng", "");
  const pageTitle =
    lng === "mn"
      ? "Гол нэрийн барааны үнийн тооцоолол"
      : "Main commodity price calculator";

  const breadMap = [
    { label: t("home"), url: [lng === "mn" ? "/mn" : "/en"] },
    {
      label: t("statistic"),
      url: [(lng === "mn" ? "/mn" : "/en") + "/statcate"],
    },
    {
      label: t("funStatistic.name"),
      url: [(lng === "mn" ? "/mn" : "/en") + "/statistic/fun-statistic/home"],
    },
    { label: pageTitle },
  ];

  return (
    <div className="nso_statistic_section bg-white magazines">
      <Path name={t("funStatistic.name")} breadMap={breadMap} />
      {children}
    </div>
  );
}
