import { NextResponse } from "next/server";
import { getCommodityProducts } from "@/app/services/fun-statistic-actions";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const result = await getCommodityProducts();
        const status = result.success ? 200 : 500;
        return NextResponse.json(result, {
            status,
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error) {
        console.error("GET /api/commodity-price/products:", error);
        return NextResponse.json(
            { success: false, error: "Internal error", products: [] },
            { status: 500 }
        );
    }
}
