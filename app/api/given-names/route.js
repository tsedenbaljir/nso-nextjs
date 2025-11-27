import { NextResponse } from "next/server";
import { homoStatistic } from "@/app/api/config/db_csweb.config.js";

const normalizeRows = (result) => {
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

  if (Array.isArray(result?.[0]?.recordset)) {
    return result[0].recordset;
  }

  return [];
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("search") || "").trim();

  try {
    if (query && query.length >= 2) {
      const filter = query.toUpperCase();
      const result = await homoStatistic.raw(
        "EXEC [dbo].[ServiceByGivenName] @Filter = ?",
        [filter]
      );
      const rows = normalizeRows(result);

      if (!rows.length) {
        return NextResponse.json({
          success: false,
          mode: "detail",
          error: `\"${filter}\" нэрийн статистик олдсонгүй.`,
        });
      }

      return NextResponse.json({
        success: true,
        mode: "detail",
        name: filter,
        series: rows.map((row) => ({
          rowNo: row.RowNo ?? row.rowNo ?? null,
          year: row.YearCode ?? row.yearCode ?? null,
          population: row.Pop ?? row.pop ?? 0,
        })),
      });
    }

    const [longResult, commonResult] = await Promise.all([
      homoStatistic.raw("EXEC [dbo].[ServiceByLongGivenName]"),
      homoStatistic.raw("EXEC [dbo].[ServiceByCommonGivenName]"),
    ]);

    const longRows = normalizeRows(longResult);
    const commonRows = normalizeRows(commonResult);

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Given name API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Нэрийн статистик татах үед алдаа гарлаа.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

