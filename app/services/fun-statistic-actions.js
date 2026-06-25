"use server";

import { homoStatistic } from "@/app/api/config/db_csweb.config";
import { setImage, setImage1 } from "@/utils/imageGeneration";

const TABLEAU_REPORT_URL =
    "https://gateway.1212.mn/services/dynamic/api/public/tableau-report";

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

async function getHomoDataFromLegacy(registerNo) {
    const homoNameResult = await homoStatistic.raw(
        "EXEC [dbo].[HomoGetNames] @RegisterNo = ?",
        [registerNo]
    );
    const homoName = getFirstHomoRow(homoNameResult);

    const nameParam =
        homoName.givenName || homoName.name || homoName.Name || "";
    const ageParam = homoName.age || homoName.Age || 0;
    const educationLevelIDParam =
        homoName.educationLevelID ||
        homoName.EducationLevelID ||
        homoName.educationLevel ||
        homoName.EducationLevel ||
        "";
    const employmentStatusIDParam =
        homoName.employmentStatusID ||
        homoName.EmploymentStatusID ||
        homoName.employmentStatus ||
        homoName.EmploymentStatus ||
        0;
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
