import { NextResponse } from "next/server";
import {
  assembleCpiPpiFile,
  ensureCpiPpiTables,
  listMonths,
} from "@/lib/commodity-price-dashboard/cpi-ppi-db";
import staticJson from "@/lib/commodity-price-dashboard/cpi-vs-ppi.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public CPI/PPI series for the commodity dashboard. */
export async function GET() {
  try {
    await ensureCpiPpiTables();
    const months = await listMonths();
    if (!months.length) {
      return NextResponse.json(staticJson, {
        headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
      });
    }
    const data = await assembleCpiPpiFile();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("[cpi-ppi GET]", error);
    return NextResponse.json(staticJson, {
      headers: { "Cache-Control": "public, max-age=30" },
    });
  }
}
