"use client";
import { use } from "react";
import { useRouter } from "next/navigation";

export default function Statistic(props) {
  const { lng } = use(props.params);
  const router = useRouter();
  const base = `/${lng}/statistic/fun-statistic`;
  return (
    <>
      <div className="nso_container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
          {/*
        <div className="w-full pt-10 pb-20">
         <div
            className="w-full overflow-hidden rounded-[28px] border border-[#dbe7f3] bg-white shadow-[0_20px_50px_rgba(15,76,129,0.1)]"
            role="status"
            aria-live="polite"
          >
            <div className="grid w-full grid-cols-1 md:grid-cols-2">
              <div className="relative min-h-[240px] w-full md:min-h-[380px]">
                  <img
                    src="https://hakimisolutions.com/wp-content/uploads/Website-Maintenance-1.png"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0f4c81]/40 via-[#1d6fad]/20 to-[#0f4c81]/55" />
                  <div className="w-70 absolute bottom-5 left-5 right-5 rounded-2xl bg-white/92 px-4 py-3 text-left backdrop-blur-sm shadow-sm">
                    <p className="text-sm font-semibold text-[#0f4c81]">
                      {isMn ? "Сонирхолтой статистик" : "Fun statistics"}
                    </p>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      {isMn ? "Удахгүй шинээр нээгдэнэ" : "Reopening soon"}
                    </p>
                  </div>
                </div>

                <div className="flex w-full flex-col items-center justify-center text-center px-6 py-10 md:px-10 md:py-12 bg-gradient-to-br from-[#f8fbfe] via-[#f1f7fc] to-[#e8f2fb]">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dbeafe] shadow-inner">
                    <i className="pi pi-hourglass text-3xl text-[#0f4c81]" aria-hidden="true" />
                  </div>

                  <h1 className="text-[--font-size24] md:text-[26px] font-bold text-[#0f4c81] leading-snug mb-3">
                    {isMn
                      ? "Шинэчлэл хийгдэж байгаа тул түр хүлээнэ үү"
                      : "Updates in progress — please check back soon"}
                  </h1>

                  <p className="text-[--font-size15] text-[#64748b] leading-relaxed mb-8 max-w-lg">
                    {isMn
                      ? "Сонирхолтой статистикийн хэсгийг сайжруулж байна. Түр хүлээгээд дахин зочлоорой."
                      : "We are improving the fun statistics section. Please visit again soon."}
                  </p>

                  <div className="flex items-center gap-2 rounded-full border border-[#bfd7ec] bg-[#eef5fb] px-5 py-2.5 text-sm font-medium text-[#0f4c81]">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3b82f6] opacity-60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#0f4c81]" />
                    </span>
                    {isMn ? "Шинэчлэлт явагдаж байна" : "Maintenance in progress"}
                  </div>
                </div>
            </div>
          </div> */}

          <div
            className="flex flex-col items-center cursor-pointer text-justify text-[--font-size15] hover:scale-[1.01] transition-transform"
            onClick={() => router.push(`${base}/human`)}
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
                ? "Эндээс та Монгол Улсын хэд дэх иргэн болон танай ижил нэртэй хүмүүсийн мэдээллийг авах боломжтой."
                : ""}
            </span>
          </div>
          <div className="flex flex-col items-center cursor-pointer text-justify text-[--font-size15] hover:scale-[1.01] transition-transform"
            onClick={() => router.push(`${base}/same-day-people`)}
            style={{ width: "300px" }}>
            <img
              className="w-[250px] h-[250px] rounded-[20px]"
              src="/images/sonirkholtoi/SameDay.png" />
            <br />
            <label className="text-center text-[--font-size20] font-semibold hover:text-[--accent]">
              {lng === "mn" ? "Ижил өдөр төрсний сонирхолтой статистик" : ""}
            </label>
            <span className="desc">{lng === "mn" ? "Ижил өдөр төрсөн хүмүүсийн тоогоо эндээс хараарай." : ""}</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer text-justify text-[--font-size15] hover:scale-[1.01] transition-transform"
            onClick={() => router.push(`${base}/given-name`)}
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
          <div
            className="flex flex-col items-center cursor-pointer text-justify text-[--font-size15] hover:scale-[1.01] transition-transform"
            onClick={() => router.push(`${base}/age-pyramid`)}
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
              router.push(`${base}/historicalGivenName`)
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
            onClick={() => router.push(`${base}/family-name`)}
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
            onClick={() => router.push(`${base}/population`)}
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
                ? "1935 оноос 2024 он хүртэлх жилийн эцсийн хүн амын тоо"
                : ""}
            </span>
          </div>
          {/* <div
            className="flex flex-col items-center cursor-pointer text-justify text-[--font-size15] hover:scale-[1.01] transition-transform"
            onClick={() => router.push(`${base}/household`)}
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
          </div> */}
        </div>
      </div>
    </>
  );
}
