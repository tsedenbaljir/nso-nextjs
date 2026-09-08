import { NextResponse } from "next/server";
import { compareCommodityPrices } from "@/app/services/fun-statistic-actions";

export const dynamic = "force-dynamic";

export async function POST(req) {
    try {
        const body = await req.json().catch(() => ({}));
        const result = await compareCommodityPrices({
            productCode: body.productCode || body.product,
            periodFrom: body.periodFrom || body.from,
            periodTo: body.periodTo || body.to,
        });
        return NextResponse.json(result, {
            status: result.success ? 200 : 400,
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error) {
        console.error("POST /api/commodity-price/compare:", error);
        return NextResponse.json(
            { success: false, error: "Internal error" },
            { status: 500 }
        );
    }
}
