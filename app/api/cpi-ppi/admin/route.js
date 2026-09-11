import { NextResponse } from "next/server";
import { requireAdminApi, getAuthToken } from "@/app/api/auth/adminAuth";
import {
  ensureCpiPpiTables,
  getMonthSheet,
  listMonths,
  listProducts,
  nextMonth,
  seedFromJson,
  upsertMonth,
} from "@/lib/commodity-price-dashboard/cpi-ppi-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = await requireAdminApi(req);
  if (denied) return denied;

  try {
    await ensureCpiPpiTables();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const months = await listMonths();
    const products = await listProducts();

    if (!month) {
      return NextResponse.json({
        status: true,
        data: {
          months,
          products,
          suggestedNext: months.length ? nextMonth(months[months.length - 1]) : null,
        },
      });
    }

    const sheet = await getMonthSheet(month);
    return NextResponse.json({
      status: true,
      data: { ...sheet, months, suggestedNext: months.length ? nextMonth(months[months.length - 1]) : null },
    });
  } catch (error) {
    console.error("[cpi-ppi admin GET]", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Алдаа" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  const denied = await requireAdminApi(req);
  if (denied) return denied;

  try {
    const token = await getAuthToken(req);
    const updatedBy = token?.email || token?.name || "admin";
    const body = await req.json();
    const action = body?.action || "upsert-month";

    if (action === "seed") {
      const result = await seedFromJson(updatedBy);
      return NextResponse.json({
        status: true,
        data: result,
        message: `Seed: ${result.products} бараа, ${result.months} сар`,
      });
    }

    if (action === "upsert-month") {
      if (!body.month) {
        return NextResponse.json({ status: false, message: "Сар шаардлагатай" }, { status: 400 });
      }
      const sheet = await upsertMonth(body.month, body.items || [], updatedBy);
      return NextResponse.json({
        status: true,
        data: sheet,
        message: `${body.month} хадгаллаа`,
      });
    }

    return NextResponse.json({ status: false, message: "Үл мэдэгдэх үйлдэл" }, { status: 400 });
  } catch (error) {
    console.error("[cpi-ppi admin POST]", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Алдаа" },
      { status: 500 },
    );
  }
}
