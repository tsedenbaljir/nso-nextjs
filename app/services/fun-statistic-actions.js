"use server";

import { Agent } from "undici";
import { db, homoStatistic } from "@/app/api/config/db_csweb.config";
import { setImage, setImage1 } from "@/utils/imageGeneration";

const TABLEAU_REPORT_URL =
    "https://gateway.1212.mn/services/dynamic/api/public/tableau-report";

// gateway.1212.mn leaf cert often fails verification on the production host
const insecureTlsAgent = new Agent({ connect: { rejectUnauthorized: false } });

function normalizeHomoRows(result) {
    if (!result) return [];

    if (Array.isArray(result)) {
        if (Array.isArray(result[0])) {
            return result[0];
        }
        return result;
    }

    if (result.recordset && Array.isArray(result.recordset)) {
        return result.recordset;
    }

    if (result.recordsets && result.recordsets.length) {
        return result.recordsets[0];
    }

    if (result.rows && Array.isArray(result.rows)) {
        return result.rows;
    }

    if (Array.isArray(result?.[0]?.recordset)) {
        return result[0].recordset;
    }

    return [];
}

function getFirstHomoRow(result) {
    if (Array.isArray(result)) {
        return result[0]?.[0] || result[0] || {};
    }
    if (result?.recordset) {
        return result.recordset[0] || {};
    }
    if (result?.[0]?.recordset) {
        return result[0].recordset[0] || {};
    }
    const rows = normalizeHomoRows(result);
    return rows[0] || {};
}

function homoReturnNii(count) {
    const mod = count % 10;
    switch (mod) {
        case 1:
        case 4:
        case 9:
            return `${count}-ний`;
        case 0:
        case 2:
        case 3:
        case 5:
        case 6:
        case 7:
        case 8:
            return `${count}-ны`;
        default:
            return `${count}-ны/ний`;
    }
}

function toHomoIntParam(value, fallback = 0) {
    if (value == null || value === "") return fallback;
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.trunc(value);
    }

    const str = String(value).trim();
    if (!str || str === "*") return fallback;

    const num = Number(str);
    return Number.isInteger(num) ? num : fallback;
}

async function getHomoDataFromLegacy(registerNo) {
    const homoNameResult = await homoStatistic.raw(
        "EXEC [dbo].[HomoGetNames] @RegisterNo = ?",
        [registerNo]
    );
    const homoName = getFirstHomoRow(homoNameResult);

    const nameParam =
        homoName.givenName || homoName.name || homoName.Name || "";
    const ageParam = toHomoIntParam(homoName.age ?? homoName.Age, 0);
    const educationLevelIDParam = toHomoIntParam(
        homoName.educationLevelID ?? homoName.EducationLevelID,
        0
    );
    const employmentStatusIDParam = toHomoIntParam(
        homoName.employmentStatusID ?? homoName.EmploymentStatusID,
        0
    );
    const birthDateParam =
        homoName.BirthDate || homoName.birthDate || homoName.dateBirth || null;
    const registerNoParam =
        homoName.registerNo || homoName.RegisterNo || registerNo;

    const [homoStatisticResult, homoCheckcountPopProcResult] =
        await Promise.all([
            homoStatistic.raw(
                "EXEC [dbo].[HomoStatistic] @Name = ?, @Age = ?, @EducationLevelID = ?, @EmploymentStatusID = ?",
                [nameParam, ageParam, educationLevelIDParam, employmentStatusIDParam]
            ),
            homoStatistic.raw(
                "EXEC [dbo].[HomoCheckcountPopProc] @dateBirth = ?, @registerNo = ?",
                [birthDateParam, registerNoParam]
            ),
        ]);

    return {
        homoName,
        homoStatistic: getFirstHomoRow(homoStatisticResult),
        homoCheckcountPopProc: getFirstHomoRow(homoCheckcountPopProcResult),
    };
}

function buildHomoDescription(model) {
    let retrunTxt =
        `ЭРХЭМ ${model.name} ТАНАА <br> Хүн ам, өрхийн мэдээллийн санд ` +
        `${model.year} оны ${model.month}-р сарын ${homoReturnNii(
            model.day
        )} өдрийн байдлаар` +
        ` Тантай ижил нэртэй ${model.countName.toLocaleString(
            "mn-MN"
        )} иргэн Тантай ижил насны ${model.countAge.toLocaleString(
            "mn-MN"
        )} иргэн байгаагийн ${model.countAgeM.toLocaleString(
            "mn-MN"
        )} нь эрэгтэй ${model.countAgeF.toLocaleString(
            "mn-MN"
        )} нь эмэгтэй`;

    if (model.Age > 14) {
        retrunTxt += ` Таны насны хөдөлмөр эрхэлдэг ${model.countEmployment.toLocaleString(
            "mn-MN"
        )} иргэн`;
    }
    if (model.Age > 5) {
        retrunTxt += ` Таны насны, тантай ижил түвшний боловсролтой ${model.countEducaton.toLocaleString(
            "mn-MN"
        )} иргэн байна.`;
    }
    return retrunTxt;
}

async function buildHomoModel(registerNo) {
    const { homoName, homoStatistic: homoStat, homoCheckcountPopProc } =
        await getHomoDataFromLegacy(registerNo);

    const now = new Date();
    const birthDate = homoName.BirthDate || homoName.birthDate;
    const birth = birthDate ? new Date(birthDate) : new Date();

    const model = {
        registerNo: String(homoName.registerNo || "").toUpperCase(),
        surename: String(homoName.sureName || "").toUpperCase(),
        name: String(homoName.givenName || "").toUpperCase(),
        Age: Number(homoName.age || 0),
        countName: Number(homoStat.countName || 0),
        countAge: Number(homoStat.countAge || 0),
        countAgeM: Number(homoStat.countAgeM || 0),
        countAgeF: Number(homoStat.countAgeF || 0),
        countEducaton: Number(homoStat.countEducaton || 0),
        countEmployment: Number(homoStat.countEmployment || 0),
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        year1: birth.getFullYear(),
        month1: birth.getMonth() + 1,
        day1: birth.getDate(),
        countPop: 0,
    };

    const regUpper = model.registerNo;
    if (regUpper === "КЮ15212444") {
        model.countPop = 3000000;
    } else if (regUpper === "УС76112813") {
        model.countPop = 1508173;
    } else if (regUpper === "ДЖ73020128") {
        model.countPop = 1343112;
    } else {
        model.countPop = Number(homoCheckcountPopProc.countPop || 0);
    }

    return model;
}

export async function processHomoHuman(registerNo) {
    if (!registerNo) {
        return { ok: false, error: "Та регистрийн дугаараа оруулна уу." };
    }

    try {
        const trimmed = registerNo.trim();
        const model = await buildHomoModel(trimmed);
        const description = buildHomoDescription(model);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
        const shareUrl = `${baseUrl}/sonirkholtoi/human?reg=${encodeURIComponent(trimmed)}`;

        let image1Data = null;
        let image2Data = null;

        try {
            image1Data = await setImage(
                model.surename,
                model.name,
                model.year1,
                model.month1,
                model.day1,
                model.countPop
            );
            image2Data = await setImage1(model, { headerFontSize: 60, bodyFontSize: 50 });
        } catch (imgError) {
            console.error("Image generation error:", imgError);
        }

        return {
            ok: true,
            model,
            description,
            shareUrl,
            image1Url: image1Data?.dataUrl || null,
            image2Url: image2Data?.dataUrl || null,
            imgID: image1Data?.imgID || null,
        };
    } catch (err) {
        console.error("HUMAN API error:", err);
        return { ok: false, error: "Дотоод алдаа гарлаа." };
    }
}

export async function fetchHomoHuman(registerNo) {
    try {
        const body = await processHomoHuman(registerNo);
        if (!body.ok) {
            return { success: false, error: body.error || "Failed to fetch Homo Human" };
        }
        return { success: true, data: body };
    } catch (error) {
        console.error("Homo Human fetch error:", error);
        return { success: false, error: error.message };
    }
}

export async function getFamilyNameStatistic(rawSearch = "") {
    const search = (rawSearch || "").trim();

    try {
        if (search && search.length >= 2) {
            const searchUpper = search.toUpperCase();
            const result = await homoStatistic.raw(
                "EXEC [dbo].[ServiceByFamilyName1] @Filter = ?",
                [searchUpper]
            );
            const rows = normalizeHomoRows(result);

            if (!rows.length) {
                return {
                    success: false,
                    error: `"${searchUpper}" гэсэн ургийн овог олдсонгүй.`,
                    mode: "aimag",
                };
            }

            const total = rows.reduce(
                (sum, row) => sum + Number(row?.Pop || row?.pop || 0),
                0
            );

            return {
                success: true,
                mode: "aimag",
                familyName: searchUpper,
                total,
                regions: rows.map((row) => ({
                    rowNo: row.RowNo ?? row.rowNo ?? null,
                    name: row.AimagName || row.aimagName || "",
                    population: row.Pop || row.pop || 0,
                })),
            };
        }

        const result = await homoStatistic.raw("EXEC [dbo].[ServiceByFamilyName]");
        const rows = normalizeHomoRows(result);

        return {
            success: true,
            mode: "top",
            families: rows.map((row) => ({
                rowNo: row.RowNo ?? row.rowNo ?? null,
                name: row.FamilyName || row.familyName || "",
                population: row.Pop || row.pop || 0,
            })),
        };
    } catch (error) {
        console.error("Family name API error:", error);
        return {
            success: false,
            error: "Өгөгдөл татахад алдаа гарлаа.",
            details: error.message,
        };
    }
}

export async function getGivenNameStatistic(query = "") {
    const trimmed = (query || "").trim();

    try {
        if (trimmed && trimmed.length >= 2) {
            const filter = trimmed.toUpperCase();
            const result = await homoStatistic.raw(
                "EXEC [dbo].[ServiceByGivenName] @Filter = ?",
                [filter]
            );
            const rows = normalizeHomoRows(result);

            if (!rows.length) {
                return {
                    success: false,
                    mode: "detail",
                    error: `"${filter}" нэрийн статистик олдсонгүй.`,
                };
            }

            const series = rows.map((row) => ({
                rowNo: row.RowNo ?? row.rowNo ?? null,
                year: row.YearCode ?? row.yearCode ?? null,
                population: row.Pop ?? row.pop ?? 0,
            }));
            const totalPopulation = series.reduce(
                (sum, row) => sum + (row.population || 0),
                0
            );

            return {
                success: true,
                mode: "detail",
                name: filter,
                series,
                totalPopulation,
            };
        }

        const [longResult, commonResult] = await Promise.all([
            homoStatistic.raw("EXEC [dbo].[ServiceByLongGivenName]"),
            homoStatistic.raw("EXEC [dbo].[ServiceByCommonGivenName]"),
        ]);

        const longRows = normalizeHomoRows(longResult);
        const commonRows = normalizeHomoRows(commonResult);

        return {
            success: true,
            mode: "summary",
            longNames: longRows.map((row) => ({
                rowNo: row.RowNo ?? row.rowNo ?? null,
                name: row.GivenName || row.givenName || "",
                length: row.Length ?? row.length ?? (row.GivenName?.length || 0),
            })),
            commonNames: commonRows.map((row) => ({
                rowNo: row.RowNo ?? row.rowNo ?? null,
                name: row.GivenName || row.givenName || "",
                population: row.Pop ?? row.pop ?? 0,
            })),
        };
    } catch (error) {
        console.error("Given name API error:", error);
        return {
            success: false,
            error: "Нэрийн статистик татах үед алдаа гарлаа.",
            details: error.message,
        };
    }
}

export async function getHistoricalNames() {
    try {
        const result = await homoStatistic.raw(
            "EXEC [dbo].[ServiceByHistoricalGivenName]"
        );
        const data = normalizeHomoRows(result);

        if (!data.length) {
            return { success: false, error: "Өгөгдөл олдсонгүй", names: [] };
        }

        const names = data.map((row) => {
            const givenName = row.GivenName || "";
            const population = row.Pop || 0;
            return {
                givenName,
                population,
                imageUrl: givenName ? `${givenName}.jpg` : "",
            };
        });

        return { success: true, names };
    } catch (error) {
        console.error("Historical names API error:", error);
        return {
            success: false,
            error: "Өгөгдөл татахад алдаа гарлаа",
            names: [],
        };
    }
}

export async function getSameDayPeopleCount({ year, month, day }) {
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    const currentYear = new Date().getFullYear();
    const minYear = 1900;

    if (!Number.isInteger(y) || y < minYear || y > currentYear) {
        return {
            success: false,
            error: `Он ${minYear}-${currentYear} хооронд байх ёстой.`,
        };
    }

    if (!Number.isInteger(m) || m < 1 || m > 12) {
        return { success: false, error: "Сар 1-12 хооронд байх ёстой." };
    }

    const daysInMonth = new Date(y, m, 0).getDate();
    if (!Number.isInteger(d) || d < 1 || d > daysInMonth) {
        return {
            success: false,
            error: `${m}-р сард ${daysInMonth} хоногтой.`,
        };
    }

    try {
        const filterDate = new Date(y, m - 1, d);
        const sqlParam = `${filterDate.getFullYear()}-${String(
            filterDate.getMonth() + 1
        ).padStart(2, "0")}-${String(filterDate.getDate()).padStart(2, "0")}`;

        const result = await homoStatistic.raw(
            "EXEC [dbo].[ServiceByBirth] @Filter = ?",
            [sqlParam]
        );

        const row = getFirstHomoRow(result);
        const count = Number(row.Count ?? row.count ?? row.Pop ?? row.pop ?? 0);

        return { success: true, year: y, month: m, day: d, count };
    } catch (error) {
        console.error("Same day people API error:", error);
        return {
            success: false,
            error: "Өгөгдөл татах үед алдаа гарлаа.",
            details: error.message,
        };
    }
}

export async function fetchTableauTicket(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            query.append(key, String(value));
        }
    });

    const url =
        query.toString().length > 0
            ? `${TABLEAU_REPORT_URL}?${query.toString()}`
            : TABLEAU_REPORT_URL;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
        const response = await fetch(url, {
            cache: "no-store",
            signal: controller.signal,
            headers: { "Cache-Control": "no-cache" },
            dispatcher: insecureTlsAgent,
        });

        let payload;
        try {
            payload = await response.json();
        } catch {
            payload = null;
        }

        if (!response.ok) {
            const message = payload?.error || `Failed to fetch ${url}`;
            throw new Error(message);
        }

        return payload;
    } finally {
        clearTimeout(timeoutId);
    }
}

const ROMAN_MONTHS = [
    "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII",
];

const MONTH_GENITIVE = {
    1: "1 дүгээр",
    2: "2 дугаар",
    3: "3 дугаар",
    4: "4 дүгээр",
    5: "5 дугаар",
    6: "6 дугаар",
    7: "7 дугаар",
    8: "8 дугаар",
    9: "9 дүгээр",
    10: "10 дугаар",
    11: "11 дүгээр",
    12: "12 дугаар",
};

import {
    PRICE_DATA_PRODUCTS,
    PRICE_PRODUCT_BY_CODE,
} from "@/app/lib/commodity-price-products";

function normalizeDbRows(result) {
    if (!result) return [];
    if (Array.isArray(result)) {
        if (Array.isArray(result[0])) return result[0];
        return result;
    }
    if (result.recordset && Array.isArray(result.recordset)) return result.recordset;
    if (result.rows && Array.isArray(result.rows)) return result.rows;
    return [];
}

function formatPeriodDisplay(yearNum, monthNum) {
    const roman = ROMAN_MONTHS[monthNum] || String(monthNum);
    return `${yearNum} - ${roman}`;
}

function formatPeriodLong(yearNum, monthNum) {
    const g = MONTH_GENITIVE[monthNum] || `${monthNum}-р`;
    return `${yearNum} оны ${g} сар`;
}

function formatPriceMnt(value) {
    if (value == null || !Number.isFinite(Number(value))) return null;
    const n = Math.round(Number(value));
    // space as thousand separator: 1 234 567
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function periodKey(year, month) {
    return `${year}-${String(month).padStart(2, "0")}`;
}

function parsePeriodKey(periodCode) {
    if (!periodCode) return null;
    const m = String(periodCode).match(/^(\d{4})-(\d{1,2})$/);
    if (!m) return null;
    const year = Number(m[1]);
    const month = Number(m[2]);
    if (!year || month < 1 || month > 12) return null;
    return { year, month };
}

export async function getCommodityProducts() {
    try {
        const products = [...PRICE_DATA_PRODUCTS]
            .sort((a, b) =>
                a.name.localeCompare(b.name, "mn", { sensitivity: "base" })
            )
            .map((p) => ({
                code: p.code,
                name: p.name,
                unit: p.unit,
            }));
        return { success: true, products };
    } catch (error) {
        console.error("getCommodityProducts error:", error);
        return { success: false, error: "Бүтээгдэхүүний жагсаалт татахад алдаа гарлаа.", products: [] };
    }
}

export async function getCommodityPeriods() {
    try {
        const rows = normalizeDbRows(
            await db("price_data")
                .select("Year as year", "Month as month")
                .orderBy([
                    { column: "Year", order: "desc" },
                    { column: "Month", order: "desc" },
                ])
        );
        return {
            success: true,
            periods: rows.map((r) => {
                const year = Number(r.year ?? r.Year);
                const month = Number(r.month ?? r.Month);
                return {
                    code: periodKey(year, month),
                    label: `${year}-${String(month).padStart(2, "0")}`,
                    year,
                    month,
                    display: formatPeriodDisplay(year, month),
                };
            }),
        };
    } catch (error) {
        console.error("getCommodityPeriods error:", error);
        return { success: false, error: "Хугацааны жагсаалт татахад алдаа гарлаа.", periods: [] };
    }
}

export async function getCommodityPrice({ productCode, periodCode }) {
    if (!productCode || !periodCode) {
        return { success: false, error: "Бүтээгдэхүүн болон хугацаа заавал сонгоно уу." };
    }

    const product = PRICE_PRODUCT_BY_CODE[productCode];
    if (!product) {
        return { success: false, error: "Бүтээгдэхүүн олдсонгүй." };
    }

    const period = parsePeriodKey(periodCode);
    if (!period) {
        return { success: false, error: "Хугацааны формат буруу байна." };
    }

    try {
        // Whitelisted column only — never interpolate untrusted product codes.
        const col = product.code;
        const rows = normalizeDbRows(
            await db.raw(
                `SELECT TOP 1 [Year], [Month], [${col}] AS price
                 FROM [NSOweb].[dbo].[price_data]
                 WHERE [Year] = ? AND [Month] = ?`,
                [period.year, period.month]
            )
        );
        const row = rows[0];
        if (!row || row.price == null) {
            return { success: false, error: "Тухайн хугацаанд үнэ олдсонгүй." };
        }
        const price = Number(row.price);
        if (!Number.isFinite(price)) {
            return { success: false, error: "Тухайн хугацаанд үнэ олдсонгүй." };
        }
        const year = Number(row.Year ?? row.year ?? period.year);
        const month = Number(row.Month ?? row.month ?? period.month);
        return {
            success: true,
            price,
            priceLabel: `${formatPriceMnt(price)} төгрөг`,
            periodCode: periodKey(year, month),
            periodLabel: `${year}-${String(month).padStart(2, "0")}`,
            periodDisplay: formatPeriodDisplay(year, month),
            year,
            month,
            productCode: product.code,
            productName: product.name,
            unit: product.unit,
            productPhrase: product.phrase,
        };
    } catch (error) {
        console.error("getCommodityPrice error:", error);
        return { success: false, error: "Үнэ татахад алдаа гарлаа." };
    }
}

export async function compareCommodityPrices({
    productCode,
    periodFrom,
    periodTo,
}) {
    if (!productCode || !periodFrom || !periodTo) {
        return {
            success: false,
            error: "Бүтээгдэхүүн болон хоёр хугацааг сонгоно уу.",
        };
    }
    if (String(periodFrom) === String(periodTo)) {
        return {
            success: false,
            error: "Харьцуулах хугацаанууд өөр байх ёстой.",
        };
    }

    const parsePeriodOrder = (code) => {
        const m = String(code).match(/^(\d{4})-(\d{1,2})$/);
        if (!m) return null;
        return Number(m[1]) * 12 + Number(m[2]);
    };
    const fromOrder = parsePeriodOrder(periodFrom);
    const toOrder = parsePeriodOrder(periodTo);
    if (fromOrder == null || toOrder == null || toOrder <= fromOrder) {
        return {
            success: false,
            error: "Харьцуулах хугацаа эхний хугацаанаас хойш байх ёстой.",
        };
    }

    try {
        const [fromRes, toRes] = await Promise.all([
            getCommodityPrice({ productCode, periodCode: periodFrom }),
            getCommodityPrice({ productCode, periodCode: periodTo }),
        ]);

        if (!fromRes.success) return fromRes;
        if (!toRes.success) return toRes;

        const priceFrom = fromRes.price;
        const priceTo = toRes.price;
        let percent = null;
        let direction = "өөрчлөгдөөгүй";
        if (priceFrom > 0) {
            percent = ((priceTo - priceFrom) / priceFrom) * 100;
            if (percent > 0.05) direction = "өссөн";
            else if (percent < -0.05) direction = "буурсан";
            else direction = "өөрчлөгдөөгүй";
        }

        const absPercentNum = percent == null ? null : Math.abs(percent);
        const absPercent =
            absPercentNum == null
                ? null
                : absPercentNum.toLocaleString("mn-MN", {
                      maximumFractionDigits: 1,
                      minimumFractionDigits: 0,
                  });

        // өсөлт ≥ 100%: "X дахин их"; otherwise "<100 хувиар өссөн/буурсан"
        const useTimes =
            direction === "өссөн" &&
            absPercentNum != null &&
            absPercentNum >= 100 &&
            priceFrom > 0;
        const timesValue = useTimes ? priceTo / priceFrom : null;
        const timesLabel =
            timesValue == null
                ? null
                : timesValue.toLocaleString("mn-MN", {
                      maximumFractionDigits: 1,
                      minimumFractionDigits: 0,
                  });

        const productPhrase =
            toRes.productPhrase ||
            fromRes.productPhrase ||
            `1 ${toRes.unit || ""} ${(toRes.productName || "").split(",")[0]}-ны`.trim();
        const toLong = formatPeriodLong(toRes.year, toRes.month);
        const fromLong = formatPeriodLong(fromRes.year, fromRes.month);
        const priceToFmt = formatPriceMnt(priceTo);

        let change;
        let suffix;
        if (direction === "өөрчлөгдөөгүй") {
            change = " өөрчлөгдөөгүй";
            suffix = " байна.";
        } else if (useTimes) {
            change = `${timesLabel} дахин өссөн`;
            suffix = " байна.";
        } else {
            change = `${absPercent} хувиар ${direction}`;
            suffix = ` байна.`;
        }

        // e.g. "… 50 хувиар өссөн байна." / "… 2.5 дахин өссөн байна."
        const sentenceParts = {
            prefix: `${productPhrase} үнэ `,
            current: `${toLong}д ${priceToFmt}`,
            mid: " төгрөг болж, ",
            base: `${fromLong}тай`,
            mid2: " харьцуулахад ",
            change,
            suffix,
        };

        return {
            success: true,
            productCode,
            productName: toRes.productName || fromRes.productName,
            from: fromRes,
            to: toRes,
            percent,
            absPercent,
            times: timesValue,
            timesLabel,
            direction,
            sentenceParts,
        };
    } catch (error) {
        console.error("compareCommodityPrices error:", error);
        return { success: false, error: "Харьцуулалт хийхэд алдаа гарлаа." };
    }
}

