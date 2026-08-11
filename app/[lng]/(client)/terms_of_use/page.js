"use client";
import { use } from "react";

const content = {
    mn: {
        title: "Вэб хуудас болон нээлттэй өгөгдлийн ашиглалтын нөхцөл",
        intro:
            "Энэхүү хуудсанд Монгол Улсын Үндэсний статистикийн хороо (цаашид «Хороо» гэх) нь www.1212.mn цахим хуудсаар дамжуулан статистикийн мэдээлэл, нээлттэй өгөгдлийг олон нийтэд хүргэх нөхцөлийг тодорхойлно. Та энэхүү цахим хуудас болон түүний програмчлалын интерфейс (API)-ээс мэдээлэл авах, хуулах, татаж авах, эсхүл бусад ямар нэгэн байдлаар ашиглах бүрд доор дурдсан нөхцөлийг зөвшөөрч байгаад тооцно.",
        section1: {
            title: "1. Зөвшөөрөгдөх ашиглалт",
            lead: "2 дугаар зүйлд зааснаас бусад тохиолдолд Хороо дараах эрхийг олгоно:",
            items: [
                "Хорооны www.1212.mn цахим хуудаст байгаа статистикийн болон бусад мэдээллийг чөлөөтэй хуулбарлаж, хувилах, мөн түгээх боломжтой.",
                "Хэрэв Та www.1212.mn цахим хуудаснаас статистикийн мэдээллийг авч ашигласан болон цааш түгээсэн тохиолдолд (Эх сурвалж: Монгол Улсын Үндэсний Статистикийн Хороо) гэж заавал дурдах ёстойг анхаарна уу.",
                "Хорооны статистикийн мэдээлэл, нээлттэй өгөгдлийг (OPEN DATA) программчлалын интерфейс (API)-ээр дамжуулан авах боломжтой.",
                "Аж ахуйн нэгж, байгууллага нь ҮСХ-ны нээлттэй өгөгдлийг (OPEN DATA) ашиглан өөрсдийн шинэ бүтээгдэхүүн, үйлчилгээг хөгжүүлэх боломжтой.",
                "API ашиглан статистикийн мэдээллийн нэгдсэн санг JSON болон XML форматаар дамжуулан авах боломжтой.",
                "Хорооны www.1212.mn цахим хуудсаас API-р авсан өгөгдлийг ашгийн болон ашгийн бус зорилгоор нээлттэй ашиглаж, тархааж болно.",
                "API хэрэглэгч нэг IP хаягаас 1 секунд тутамд 1-ээс дээш хүсэлт илгээхгүй байх нь зүйтэй. Нэг хүсэлтэд хамгийн ихдээ 100,000 утгын хариу илгээнэ. Хэрэв HTTP 403- гэсэн алдаа зааж байвал уг утга нь дээд хязгаараас хэтэрсэн байна гэсэн утгатай юм.",
                "Таны ашиглаж буй API системд аюул хор учруулах бол таны хэрэглээг түдгэлзүүлэх болно.",
                "Та манай ашиглах нөхцөлийг зөрчсөн тохиолдолд таны хандах эрхийг түдгэлзүүлж Монгол Улсын холбогдох хуулийн дагуу шийдвэрлэнэ.",
                "Нээлттэй өгөгдөл нь Creative Commons Attribution 4.0 Олон улсын (CC BY 4.0) лицензийн дагуу түгээгдэнэ.",
            ],
        },
        section2: {
            title: "2. Хязгаарлалт — Хориглох зүйлс",
            lead: "1 дүгээр зүйлийг үл харгалзан дараах үйлдлийг хориглоно:",
            items: [
                "www.1212.mn цахим хуудасны мэдээлэл, статистик, агуулгыг санаатайгаар төөрөгдүүлэх, буруу ташаа мэдээлэл түгээх, статистикийн эх мэдээллийн санааг гуйвуулах зорилгоор ашиглахыг хориглоно.",
                "Хорооны зүгээс таны бүтээгдэхүүн, үйлчилгээ, хэвлэл, шинжилгээ, байгууллагыг дэмжсэн, зөвшөөрсөн, ивээн тэтгэсэн, эсхүл хамааралтай мэт ойлголт бий болгохыг хориглоно.",
                "Нэгтгэсэн мэдээлэл болон нээлттэй өгөгдөл (OPEN DATA)-ийг дангаар нь буюу бусад эх сурвалжтай хослуулан ашиглаж, тодорхой хувь хүн, өрх, аж ахуйн нэгжийг тодорхойлох, ялгах, дахин таних зорилгоор ашиглахыг хориглоно.",
                "Хорооны зүгээс хассан, залруулсан, эсхүл шинэчилсэн мэдээллийг шинэчлэлтийн тухай зохих тэмдэглэл оруулалгүйгээр хүчинтэй мэдээлэл мэт танилцуулах, нийтлэх, түгээхийг хориглоно.",
                "Хувь хүний нууц, нууцлалтай, хязгаарлагдмал статистикийн мэдээлэлд энэ нөхцөл хамаарахгүй бөгөөд ийм мэдээллийг ямар ч тохиолдолд хуулах, түгээх, дахин ашиглахыг хориглоно.",
                "API-ийн зөвшөөрөгдсөн хүсэлтийн хязгаарыг (нэг IP хаягаас секундэд 1-ээс дээшгүй хүсэлт) хэтрүүлэх, эсхүл хязгаарлалт, хандалтын хяналт, аюулгүй байдлын арга хэмжээг тойрч гарах, зайлсхийх, зохиомлоор өөрчлөхийг хориглоно.",
                "Хорооны нэр, албан ёсны бэлгэдэл, лого зэргийг урьдчилан бичгээр зөвшөөрөл авалгүйгээр дэмжлэг, түншлэл, албан ёсны холбоог илэрхийлэх байдлаар ашиглахыг хориглоно.",
                "Хорооноос урьдчилан зөвшөөрөл авалгүйгээр www.1212.mn-ээс авсан агуулга, мэдээлэлд гуравдагч этгээдийн хандалтыг төлбөртэй болгох, хязгаарлах, бусад байдлаар зөвшөөрөлтэй болгохыг хориглоно.",
                "www.1212.mn-ийн мэдээлэл, статистик, үйлчилгээг хууль бус зорилгоор, эсхүл Монгол Улсын хууль тогтоомжийг зөрчих байдлаар ашиглахыг хориглоно.",
            ],
        },
        section3: {
            title: "3. Хариуцлагаас чөлөөлөх заалт",
            body: "Хороо www.1212.mn дээр нийтэлсэн статистикийн мэдээлэл, агуулгын үнэн зөв, бүрэн бүтэн, цаг үеийн шинжийг хангахын тулд боломжит бүхий л арга хэлбэрээр бэлдэн гаргадаг. Гэсэн хэдий ч Хороо энэхүү мэдээллийг гуравдагч этгээд ашигласан, буруу ашигласан, эсхүл буруу ойлгосноос үүдэн гарах аливаа хохирол, гэмтэл, үр дагаврыг хариуцахгүй бөгөөд энэхүү мэдээллийг хуулбарласан, холбоос хийсэн, эсхүл ашиглан бүтээсэн гадаад веб сайт, аппликейшн, бүтээгдэхүүний агуулга, үнэн зөв байдал, хүртээмжийг мөн хариуцахгүй. Статистикийн бүх агуулгын хамгийн сүүлийн, албан ёсны хувилбар нь үргэлж www.1212.mn дээр нийтлэгдсэн хувилбар байх бөгөөд ашиглагч нь өөрийн түшиглэж буй хуулбарласан, тусгаарлан хадгалсан, эсхүл дахин түгээсэн хувилбар шинэчлэгдсэн эсэхийг өөрөө нягтлах үүрэгтэй.",
        },
        section4: {
            title: "4. Лиценз",
            body: "Тусгайлан зааснаас бусад тохиолдолд www.1212.mn дахь агуулга, нээлттэй өгөгдлийг Creative Commons Attribution 4.0 Олон улсын (CC BY 4.0) лицензийн дагуу түгээнэ. Энэхүү лиценз нь хувь хүний мэдээлэл, нууцлалтай статистикийн өгөгдөл, эсхүл тусдаа эрхтэй, энэ веб сайт дээр нийтлэгдсэн гуравдагч этгээдийн материал (зураг, лого, газрын зураг зэрэг)-д хамаарахгүй.",
            licenseLabel: "Лицензийн холбоос:",
            licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
            licenseDeed: "https://creativecommons.org/licenses/by/4.0/deed.mn",
        },
        section5: {
            title: "5. Хэрэгжилт ба хууль тогтоомж",
            body: "Энэхүү Ашиглалтын нөхцөлийг зөрчсөн аливаа тохиолдлыг Монгол Улсын холбогдох хууль тогтоомжийн дагуу шийдвэрлэнэ. Хороо нь статистикийн мэдээ, мэдээлэл, мэдээллийн агуулгын нөхцөлийг зөрчин ашиглаж байгаа тохиолдолд уг ашиглалтыг зогсоож, түүнийг аливаа аппликейшн, хэвлэл, платформоос хасахыг шаардах эрхтэй.",
        },
    },
    en: {
        title: "Terms of Use of Web Pages and Open Data",
        intro:
            "This page sets out the terms under which the National Statistics Office of Mongolia (“the Office”) makes statistical information and open data available to the public through www.1212.mn. By accessing, copying, downloading, or otherwise using content from this website or its Application Programming Interface (API), you agree to be bound by the following terms.",
        section1: {
            title: "1. Permitted Use",
            lead: "Subject to Section 2 below, the Office grants the following rights of use:",
            items: [
                "Statistical and other information on the www.1212.mn website of the UCC is freely copied, copied, and distributed.",
                "Please note that if you have removed and used statistics from the www.1212.mn web page (Source: National Statistical Committee of the Republic of Mongolia), you must mention.",
                "OPEN DATA statistics and open data (OPEN DATA) are available through the programming interface (API).",
                "Industry units and organizations can develop their new products and services using OPEN DATA (OPEN DATA).",
                "With the API, an integrated database of statistical data can be accessed via JSON and XML formats.",
                "The data obtained by the UCC API can be openly used and disseminated for both for-profit and non-profit purposes.",
                "An API user should not send more than 1 request every 1 second from a single IP address. A maximum of 100,000 responses will be sent to a single request. If an HTTP 403 error is pointing to an error, it means that the value is beyond the upper limit.",
                "If the API you're using is compromised, your use will be compromised.",
                "In the event of a breach of our Terms of Use, we will enforce your rights and resolve it in accordance with the relevant laws of the Republic of Mongolia.",
                "Open data is distributed under a Creative Commons Attribution 4.0 International (CC BY 4.0) license.",
            ],
        },
        section2: {
            title: "2. Restrictions — Prohibited Use",
            lead: "Notwithstanding Section 1, the following actions are not permitted:",
            items: [
                "Do not use the data, statistics, or content of www.1212.mn to intentionally mislead, misrepresent, or distort the meaning of the original statistical information.",
                "Do not present, imply, or suggest that the National Statistics Office endorses, approves, sponsors, or is affiliated with your product, service, publication, analysis, or organization.",
                "Does not permit the use of aggregated data or OPEN DATA, alone or combined with other data sources, to identify, single out, or re-identify any specific individual, household, or business entity.",
                "Do not present, publish, or distribute data that has been withdrawn, corrected, or superseded by the National Statistics Office as if it were current, unless an appropriate notice indicating the update is included.",
                "Does not extend to personal, confidential, or restricted statistical data; such data falls outside this license and may not be copied, distributed, or reused under any circumstances.",
                "Do not exceed the permitted API request rate (maximum 1 request per second per IP address) or attempt to bypass, circumvent, or manipulate rate limits, access controls, or security measures of the API.",
                "Do not use the National Statistics Office's name, official emblem, or logo in any manner suggesting endorsement, partnership, or official association without prior written permission.",
                "Do not charge, restrict, or otherwise limit third-party access to content or data sourced from www.1212.mn without prior authorization from the National Statistics Office.",
                "Do not use the data, statistics, or services of www.1212.mn for any unlawful purpose or in violation of the applicable laws of Mongolia.",
            ],
        },
        section3: {
            title: "3. Disclaimer of Liability",
            body: "The Office makes every reasonable effort to ensure the accuracy, completeness, and timeliness of the statistical data and content published on www.1212.mn. However, the Office is not liable for any loss, damage, or consequence arising from the use, misuse, or misinterpretation of this data by third parties, nor for the content, accuracy, or availability of any external website, application, or product that reproduces, links to, or is built upon this data. The most current and authoritative version of all statistical content is always the version published on www.1212.mn, and users are responsible for verifying that any cached, mirrored, or redistributed copy they rely on is up to date.",
        },
        section4: {
            title: "4. License",
            body: "Except where stated otherwise, content and open data on www.1212.mn are distributed under a Creative Commons Attribution 4.0 International (CC BY 4.0) license. This license does not cover personal data, confidential statistical microdata, or any third-party material (including images, logos, and maps) reproduced on this website with separate rights attached.",
            licenseLabel: "License link:",
            licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
            licenseDeed: "https://creativecommons.org/licenses/by/4.0/",
        },
        section5: {
            title: "5. Enforcement and Governing Law",
            body: "Any breach of these Terms of Use will be addressed and resolved in accordance with the applicable laws of Mongolia. The Office reserves the right to require that any non-compliant use of its data or content be discontinued and removed from any application, publication, or platform.",
        },
    },
};

function Section({ title, lead, children }) {
    return (
        <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-3">{title}</h2>
            {lead ? <p className="mb-3 text-justify">{lead}</p> : null}
            {children}
        </section>
    );
}

function BulletList({ items, formatFlags = false }) {
    return (
        <ul className="list-disc pl-6 space-y-2 text-justify">
            {items.map((item, index) => (
                <li key={index}>
                    {formatFlags && item.includes("JSON") && item.includes("XML") ? (
                        <>
                            {item.split(/(JSON|XML)/g).map((part, i) => {
                                if (part === "JSON") {
                                    return (
                                        <span
                                            key={i}
                                            className="badge alert-info"
                                            style={{
                                                color: "#ffffff",
                                                backgroundColor: "#00b96d",
                                                borderRadius: "5px",
                                                padding: "0 5px",
                                            }}
                                        >
                                            JSON
                                        </span>
                                    );
                                }
                                if (part === "XML") {
                                    return (
                                        <span
                                            key={i}
                                            className="badge alert-info"
                                            style={{
                                                color: "#ffffff",
                                                backgroundColor: "#00a5f7",
                                                borderRadius: "5px",
                                                padding: "0 5px",
                                            }}
                                        >
                                            XML
                                        </span>
                                    );
                                }
                                return <span key={i}>{part}</span>;
                            })}
                        </>
                    ) : (
                        item
                    )}
                </li>
            ))}
        </ul>
    );
}

function CcByLink({ href }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="license noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-900 mt-3"
            aria-label="Creative Commons Attribution 4.0 International"
        >
            <span className="inline-flex shrink-0 items-center" aria-hidden="true">
                <svg
                    width={62}
                    height={31}
                    viewBox="0 0 128 64"
                    className="text-gray-900"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g fill="currentColor" stroke="currentColor">
                        <circle cx={32} cy={32} r={28.5} fill="none" strokeWidth={2.5} />
                        <text
                            x={32}
                            y={40}
                            textAnchor="middle"
                            fontFamily="system-ui, -apple-system, 'Segoe UI', Arial, sans-serif"
                            fontSize={22}
                            fontWeight={700}
                            stroke="none"
                        >
                            cc
                        </text>
                        <circle cx={96} cy={32} r={28.5} fill="none" strokeWidth={2.5} />
                        <g stroke="none">
                            <circle cx={96} cy={22} r={7} />
                            <rect x={87.5} y={32} width={17} height={20} rx={4} />
                        </g>
                    </g>
                </svg>
            </span>
            <span className="font-semibold">CC BY 4.0</span>
        </a>
    );
}

export default function TermsOfUse(props) {
    const { lng } = use(props.params);
    const t = content[lng === "en" ? "en" : "mn"];

    return (
        <div className="nso_statistic_section">
            <div className="nso_container">
                <div className="mx-auto bg-white rounded-lg shadow-md">
                    <div className="p-6 md:p-8">
                        <div className="container mx-auto px-4 mb-6">
                            <h1 className="text-3xl md:text-4xl font-bold text-center">{t.title}</h1>
                        </div>

                        <div className="text-lg leading-relaxed">
                            <p className="mb-8 text-justify">{t.intro}</p>

                            <Section title={t.section1.title} lead={t.section1.lead}>
                                <BulletList items={t.section1.items} formatFlags />
                            </Section>

                            <Section title={t.section2.title} lead={t.section2.lead}>
                                <BulletList items={t.section2.items} />
                            </Section>

                            <Section title={t.section3.title}>
                                <p className="text-justify">{t.section3.body}</p>
                            </Section>

                            <Section title={t.section4.title}>
                                <p className="text-justify mb-3">{t.section4.body}</p>
                                <p className="text-justify">
                                    {t.section4.licenseLabel}{" "}
                                    <a
                                        href={t.section4.licenseUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline break-all"
                                    >
                                        {t.section4.licenseUrl}
                                    </a>
                                </p>
                                <CcByLink href={t.section4.licenseDeed} />
                            </Section>

                            <Section title={t.section5.title}>
                                <p className="text-justify">{t.section5.body}</p>
                            </Section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
