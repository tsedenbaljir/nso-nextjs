"use client";

import { useRouter } from "next/navigation";

export default function Statistic({ params }) {
  const { lng } = params;
  const router = useRouter();

  return (
    <>
      <div className="nso_container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
          <div className="flex flex-col items-center cursor-pointer text-justify text-[--font-size15] hover:scale-[1.01] transition-transform"
            onClick={() => router.push(`/statistic/fun-statistic/given-name`)}
            style={{ width: "300px" }}>
            <img
              className="w-[250px] h-[250px] rounded-[20px]"
              src="/images/sonirkholtoi/givenname/Default.jpg" />
            <br />
            <label className="text-center text-[--font-size20] font-semibold hover:text-[--accent]">
              {lng === "mn" ? "Тантай ижил нэрийн статистик" : ""}
            </label>
            <span className="desc">{lng === "mn" ? "Хүн ам, өрхийн мэдээллийн санд бүртгэгдсэн нэрийн урт, тухайн нэрийн тархалт болон хамгийн түгээмэл/ховор нэрүүдийн интерактив мэдээлэл." : ""}</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer text-justify text-[--font-size15] hover:scale-[1.01] transition-transform"
            onClick={() => router.push(`/statistic/fun-statistic/same-day-people`)}
            style={{ width: "300px" }}>
            <img
              className="w-[250px] h-[250px] rounded-[20px]"
              src="/images/sonirkholtoi/SameDay.png" />
            <br />
            <label className="text-center text-[--font-size20] font-semibold hover:text-[--accent]">
              {lng === "mn" ? "Ижил өдөр төрсөн хүмүүсийн тоо" : ""}
            </label>
            <span className="desc">{lng === "mn" ? "Ижил өдөр төрсөн хүмүүсийн тоогоо энэдээс хараарай" : ""}</span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer text-justify text-[--font-size15] hover:scale-[1.01] transition-transform"
            onClick={() => router.push(`/statistic/fun-statistic/human`)}
            style={{ width: "300px" }}
          >
            <img
              className="w-[250px] h-[250px] rounded-[20px]"
              src="https://gateway.1212.mn/services/fms/api/public/download/0/xG--k5NJCSn3-kV-ga-G-flm-KJGTVAXjXMDV1oo.jpg"
            />
            <br />
            <label className="text-center text-[--font-size20] font-semibold hover:text-[--accent]">
              {lng === "mn" ? "Та Монгол улсын хэддэх иргэн бэ?" : ""}
            </label>
            <span className="desc">
              {lng === "mn"
                ? "Эндээс та Монгол Улсын хэддэх иргэн болон танай ижил нэртэй хүмүүсийн мэдээллийг авах боломжтой."
                : ""}
            </span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer text-justify text-[--font-size15] hover:scale-[1.01] transition-transform"
            onClick={() => router.push(`/statistic/fun-statistic/age-pyramid`)}
            style={{ width: "300px" }}
          >
            <img
              className="w-[250px] h-[250px] rounded-[20px]"
              src="https://gateway.1212.mn/services/fms/api/public/download/0/GBsYBy-h_BNhG1VcOD2-F39lYi_LXw1CIdnfwE_t.jpg"
            />
            <br />
            <label className="text-center text-[--font-size20] font-semibold hover:text-[--accent]">
              {lng === "mn" ? "Монгол Улсын хүн амын нас, хүйсийн суварга" : ""}
            </label>
            <span className="desc">
              {lng === "mn"
                ? "1963 оноос 2016 он хүртэлх хүн амын тоо болон 2017 оноос 2045 он хүртэлх хэтийн тооцооны хүн амын тоо."
                : ""}
            </span>
          </div>

          <div
            className="flex flex-col items-center cursor-pointer text-justify text-[--font-size15] hover:scale-[1.01] transition-transform"
            onClick={() =>
              router.push(`/statistic/fun-statistic/historicalGivenName`)
            }
            style={{ width: "300px" }}
          >
            <img
              className="w-[250px] h-[250px] rounded-[20px]"
              src="https://gateway.1212.mn/services/fms/api/public/download/0/U0h-zkNU_Mv0-QtMK3-E2AKn58-UZ-BOfsQlUZ_-.jpg"
            />
            <br />
            <label className="text-center text-[--font-size20] font-semibold hover:text-[--accent]">
              {lng === "mn" ? "Түүхэн нэртэй хүмүүсийн тоо" : ""}
            </label>
            <span className="desc">
              {lng === "mn"
                ? "Монгол Улсын түүх болж үлдсэн хүмүүстэй ижил нэртэй хүмүүсийн жагсаалт"
                : ""}
            </span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer text-justify text-[--font-size15] hover:scale-[1.01] transition-transform"
            onClick={() => router.push(`/statistic/fun-statistic/family-name`)}
            style={{ width: "300px" }}
          >
            <img
              className="w-[250px] h-[250px] rounded-[20px]"
              src="https://gateway.1212.mn/services/fms/api/public/download/0/w1taOqIq4Chxt9CMpF9f-SsH-ZoAGLRw-S-k37-R.jpg"
            />
            <br />
            <label className="text-center text-[--font-size20] font-semibold hover:text-[--accent]">
              {lng === "mn" ? "Ургийн овог" : ""}
            </label>
            <span className="desc">
              {lng === "mn"
                ? "Монгол Улсын хүн амын ургийн овгийн тоо баримт."
                : ""}
            </span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer text-justify text-[--font-size15] hover:scale-[1.01] transition-transform"
            onClick={() => router.push(`/statistic/fun-statistic/population`)}
            style={{ width: "300px" }}
          >
            <img
              className="w-[250px] h-[250px] rounded-[20px]"
              src="https://gateway.1212.mn/services/fms/api/public/download/0/cT_QAwH_4QLSbTtYter0e_8t2ZRx_1kh_fLT6tge.jpg"
            />
            <br />
            <label className="text-center text-[--font-size20] font-semibold hover:text-[--accent]">
              {lng === "mn" ? "Монгол улсын хүн амын тоо" : ""}
            </label>
            <span className="desc">
              {lng === "mn"
                ? "1933 оноос 2018 он хүртэлх жилийн эцсийн хүн амын тоо"
                : ""}
            </span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer text-justify text-[--font-size15] hover:scale-[1.01] transition-transform"
            onClick={() => router.push(`/statistic/fun-statistic/household`)}
            style={{ width: "300px" }}
          >
            <img
              className="w-[250px] h-[250px] rounded-[20px]"
              src="https://gateway.1212.mn/services/fms/api/public/download/0/tjjqml--dUPNdE_FVXYLhMTGjE-FgVf2JY8aQFMP.png"
            />
            <br />
            <label className="text-center text-[--font-size20] font-semibold hover:text-[--accent]">
              {lng === "mn" ? "Өрхийн орлого, хөдөлмөр эрхлэлт" : ""}
            </label>
            <span className="desc">
              {lng === "mn"
                ? "Таны  орлого, цалин, хөдөлмөр эрхлэлтийг улсын дундажтай харьцуулахад (2024)"
                : ""}
            </span>
          </div>
        </div>
      </div>
      <br />
      <br />
      <br />
    </>
  );
}
