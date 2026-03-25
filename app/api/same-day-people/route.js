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

const getFirstRow = (result) => {
  const rows = normalizeRows(result);
  return rows[0] || {};
};

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const year = Number(body.year);
    const month = Number(body.month);
    const day = Number(body.day);

    const currentYear = new Date().getFullYear();
    const minYear = 1900;

    if (!Number.isInteger(year) || year < minYear || year > currentYear) {
      return NextResponse.json(
        {
          success: false,
          error: `Он ${minYear}-${currentYear} хооронд байх ёстой.`,
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return NextResponse.json(
        {
          success: false,
          error: "Сар 1-12 хооронд байх ёстой.",
        },
        { status: 400 }
      );
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    if (!Number.isInteger(day) || day < 1 || day > daysInMonth) {
      return NextResponse.json(
        {
          success: false,
          error: `${month}-р сард ${daysInMonth} хоногтой.`,
        },
        { status: 400 }
      );
    }

    const filterDate = new Date(year, month - 1, day);
    const sqlParam = `${filterDate.getFullYear()}-${String(
      filterDate.getMonth() + 1
    ).padStart(2, "0")}-${String(filterDate.getDate()).padStart(2, "0")}`;

    const result = await homoStatistic.raw(
      "EXEC [dbo].[ServiceByBirth] @Filter = ?",
      [sqlParam]
    );

    const row = getFirstRow(result);
    const count = Number(row.Count ?? row.count ?? row.Pop ?? row.pop ?? 0);

    return NextResponse.json({
      success: true,
      year,
      month,
      day,
      count,
    });
  } catch (error) {
    console.error("Same day people API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Өгөгдөл татах үед алдаа гарлаа.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

