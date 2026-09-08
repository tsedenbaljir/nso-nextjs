import { NextResponse } from "next/server";
import { getCommodityPrice } from "@/app/services/fun-statistic-actions";

export const dynamic = "force-dynamic";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const productCode = searchParams.get("product") || searchParams.get("productCode");
        const periodCode = searchParams.get("period") || searchParams.get("periodCode");
        const result = await getCommodityPrice({ productCode, periodCode });
        const status = result.success ? 200 : result.error?.includes("олдсонгүй") ? 404 : 400;
        return NextResponse.json(result, {
            status: result.success ? 200 : status,
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error) {
        console.error("GET /api/commodity-price/price:", error);
        return NextResponse.json(
            { success: false, error: "Internal error" },
            { status: 500 }
        );
    }
}
