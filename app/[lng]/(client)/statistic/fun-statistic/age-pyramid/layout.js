"use client";

import Path from "@/components/path/Index";
import { useTranslation } from "@/app/i18n/client";

export default function Statistic({ children, params }) {
  const { lng } = params;
  const { t } = useTranslation(lng, "lng", "");

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
    { label: "Монгол Улсын хүн амын нас, хүйсийн суварга" },
  ];

  return (
    <>
      <div className="nso_statistic_section bg-white magazines">
        <Path name={t("funStatistic.name")} breadMap={breadMap} />
        {children}
      </div>
    </>
  );
}
