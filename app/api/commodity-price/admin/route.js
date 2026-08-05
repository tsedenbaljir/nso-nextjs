import { NextResponse } from "next/server";
import { db } from "@/app/api/config/db_csweb.config.js";
import { requireAdminApi } from "@/app/api/auth/adminAuth";
import {
    PRICE_DATA_PRODUCTS,
    PRICE_DATA_TABLE,
    PRICE_PRODUCT_CODES,
    pickPricesFromBody,
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

function parseYearMonth(yearRaw, monthRaw) {
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    if (!Number.isInteger(year) || year < 1900 || year > 2100) return null;
    if (!Number.isInteger(month) || month < 1 || month > 12) return null;
    return { year, month };
}

function mapRow(row) {
    const year = Number(row.Year ?? row.year);
    const month = Number(row.Month ?? row.month);
    const out = {
        id: `${year}-${String(month).padStart(2, "0")}`,
        year,
        month,
    };
    for (const code of PRICE_PRODUCT_CODES) {
        const v = row[code];
        out[code] = v == null || v === "" ? null : Number(v);
    }
    return out;
}

function productColumnSql() {
    return PRICE_PRODUCT_CODES.map((c) => `[${c}]`).join(", ");
}

/** GET list or single row: ?year=&month= | ?page=&pageSize=&filterYear= */
export async function GET(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    try {
        const { searchParams } = new URL(req.url);
        const yearQ = searchParams.get("year");
        const monthQ = searchParams.get("month");

        // Single row
        if (yearQ != null && monthQ != null) {
            const ym = parseYearMonth(yearQ, monthQ);
            if (!ym) {
                return NextResponse.json(
                    { status: false, message: "Он, сар буруу байна." },
                    { status: 400 }
                );
            }
            const rows = normalizeDbRows(
                await db.raw(
                    `SELECT [Year], [Month], ${productColumnSql()}
                     FROM ${PRICE_DATA_TABLE}
                     WHERE [Year] = ? AND [Month] = ?`,
                    [ym.year, ym.month]
                )
            );
            if (!rows[0]) {
                return NextResponse.json(
                    { status: false, message: "Бичлэг олдсонгүй." },
                    { status: 404 }
                );
            }
            return NextResponse.json({
                status: true,
                data: mapRow(rows[0]),
                products: PRICE_DATA_PRODUCTS,
            });
        }

        const page = Math.max(0, Number(searchParams.get("page") || 0));
        const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 15)));
        const filterYear = searchParams.get("filterYear");
        const offset = page * pageSize;

        const where = [];
        const params = [];
        if (filterYear) {
            const y = Number(filterYear);
            if (Number.isInteger(y)) {
                where.push("[Year] = ?");
                params.push(y);
            }
        }
        const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

        const countRows = normalizeDbRows(
            await db.raw(
                `SELECT COUNT(*) AS total FROM ${PRICE_DATA_TABLE} ${whereSql}`,
                params
            )
        );
        const total = Number(countRows[0]?.total ?? countRows[0]?.Total ?? 0);

        const listParams = [...params, offset, pageSize];
        const rows = normalizeDbRows(
            await db.raw(
                `SELECT [Year], [Month], ${productColumnSql()}
                 FROM ${PRICE_DATA_TABLE}
                 ${whereSql}
                 ORDER BY [Year] DESC, [Month] DESC
                 OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`,
                listParams
            )
        );

        return NextResponse.json({
            status: true,
            data: rows.map(mapRow),
            products: PRICE_DATA_PRODUCTS,
            pagination: {
                page,
                pageSize,
                total,
            },
        });
    } catch (error) {
        console.error("commodity-price admin GET error:", error);
        return NextResponse.json(
            { status: false, message: "Жагсаалт татахад алдаа гарлаа." },
            { status: 500 }
        );
    }
}

/** POST — insert new Year+Month row */
export async function POST(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    try {
        const body = await req.json();
        const ym = parseYearMonth(body.year, body.month);
        if (!ym) {
            return NextResponse.json(
                { status: false, message: "Он, сар заавал бөглөнө үү." },
                { status: 400 }
            );
        }

        const existing = normalizeDbRows(
            await db.raw(
                `SELECT TOP 1 [Year] FROM ${PRICE_DATA_TABLE} WHERE [Year] = ? AND [Month] = ?`,
                [ym.year, ym.month]
            )
        );
        if (existing[0]) {
            return NextResponse.json(
                {
                    status: false,
                    message: `${ym.year} оны ${ym.month}-р сарын өгөгдөл аль хэдийн байна.`,
                },
                { status: 400 }
            );
        }

        const prices = pickPricesFromBody(body);
        const cols = ["[Year]", "[Month]", ...PRICE_PRODUCT_CODES.map((c) => `[${c}]`)];
        const placeholders = cols.map(() => "?").join(", ");
        const values = [
            ym.year,
            ym.month,
            ...PRICE_PRODUCT_CODES.map((c) => prices[c]),
        ];

        await db.raw(
            `INSERT INTO ${PRICE_DATA_TABLE} (${cols.join(", ")}) VALUES (${placeholders})`,
            values
        );

        return NextResponse.json({
            status: true,
            message: "Амжилттай нэмэгдлээ",
            data: { year: ym.year, month: ym.month },
        });
    } catch (error) {
        console.error("commodity-price admin POST error:", error);
        return NextResponse.json(
            { status: false, message: "Нэмэх үед алдаа гарлаа." },
            { status: 500 }
        );
    }
}

/** PUT — update prices (and optionally keep year/month as key) */
export async function PUT(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    try {
        const body = await req.json();
        const ym = parseYearMonth(body.year, body.month);
        if (!ym) {
            return NextResponse.json(
                { status: false, message: "Он, сар заавал бөглөнө үү." },
                { status: 400 }
            );
        }

        const existing = normalizeDbRows(
            await db.raw(
                `SELECT TOP 1 [Year] FROM ${PRICE_DATA_TABLE} WHERE [Year] = ? AND [Month] = ?`,
                [ym.year, ym.month]
            )
        );
        if (!existing[0]) {
            return NextResponse.json(
                { status: false, message: "Бичлэг олдсонгүй." },
                { status: 404 }
            );
        }

        const prices = pickPricesFromBody(body);
        const setSql = PRICE_PRODUCT_CODES.map((c) => `[${c}] = ?`).join(", ");
        const values = [
            ...PRICE_PRODUCT_CODES.map((c) => prices[c]),
            ym.year,
            ym.month,
        ];

        await db.raw(
            `UPDATE ${PRICE_DATA_TABLE}
             SET ${setSql}
             WHERE [Year] = ? AND [Month] = ?`,
            values
        );

        return NextResponse.json({
            status: true,
            message: "Амжилттай шинэчлэгдлээ",
        });
    } catch (error) {
        console.error("commodity-price admin PUT error:", error);
        return NextResponse.json(
            { status: false, message: "Шинэчлэх үед алдаа гарлаа." },
            { status: 500 }
        );
    }
}

/** DELETE — ?year=&month= */
export async function DELETE(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    try {
        const { searchParams } = new URL(req.url);
        const ym = parseYearMonth(searchParams.get("year"), searchParams.get("month"));
        if (!ym) {
            return NextResponse.json(
                { status: false, message: "Он, сар заавал шаардлагатай." },
                { status: 400 }
            );
        }

        await db.raw(
            `DELETE FROM ${PRICE_DATA_TABLE} WHERE [Year] = ? AND [Month] = ?`,
            [ym.year, ym.month]
        );

        return NextResponse.json({
            status: true,
            message: "Амжилттай устгалаа",
        });
    } catch (error) {
        console.error("commodity-price admin DELETE error:", error);
        return NextResponse.json(
            { status: false, message: "Устгах үед алдаа гарлаа." },
            { status: 500 }
        );
    }
}
