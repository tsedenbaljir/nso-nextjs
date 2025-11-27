import { NextResponse } from "next/server";
import { homoStatistic } from "@/app/api/config/db_csweb.config.js";

const extractRows = (result) => {
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

  if (result.recordsets && Array.isArray(result.recordsets) && result.recordsets.length) {
    return result.recordsets[0];
  }

  if (result.rows && Array.isArray(result.rows)) {
    return result.rows;
  }

  if (Array.isArray(result?.[0]?.recordset)) {
    return result[0].recordset;
  }

  return [];
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawSearch = (searchParams.get("search") || "").trim();

  try {
    if (rawSearch && rawSearch.length >= 2) {
      const searchUpper = rawSearch.toUpperCase();
      const result = await homoStatistic.raw(
        "EXEC [dbo].[ServiceByFamilyName1] @Filter = ?",
        [searchUpper]
      );
      const rows = extractRows(result);

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: `\"${searchUpper}\" гэсэн ургийн овог олдсонгүй.`,
          mode: "aimag",
        });
      }

      const total = rows.reduce(
        (sum, row) => sum + Number(row?.Pop || row?.pop || 0),
        0
      );

      return NextResponse.json({
        success: true,
        mode: "aimag",
        familyName: searchUpper,
        total,
        regions: rows.map((row) => ({
          rowNo: row.RowNo ?? row.rowNo ?? null,
          name: row.AimagName || row.aimagName || "",
          population: row.Pop || row.pop || 0,
        })),
      });
    }

    const result = await homoStatistic.raw("EXEC [dbo].[ServiceByFamilyName]");
    const rows = extractRows(result);

    return NextResponse.json({
      success: true,
      mode: "top",
      families: rows.map((row) => ({
        rowNo: row.RowNo ?? row.rowNo ?? null,
        name: row.FamilyName || row.familyName || "",
        population: row.Pop || row.pop || 0,
      })),
    });
  } catch (error) {
    console.error("Family name API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Өгөгдөл татахад алдаа гарлаа.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

