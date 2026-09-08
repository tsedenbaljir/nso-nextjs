import { NextResponse } from "next/server";
import { getTableauEmbedAuthPayload } from "@/lib/tableau/token";

export const dynamic = "force-dynamic";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username") || undefined;
    const hostHeader =
        req.headers.get("x-forwarded-host") || req.headers.get("host") || undefined;

    try {
        const payload = await getTableauEmbedAuthPayload(username, hostHeader);
        return NextResponse.json(
            {
                token: payload.token,
                serverUrl: payload.serverUrl,
                ...(process.env.NODE_ENV === "development"
                    ? {
                          environment: payload.environment,
                          appName: payload.appName,
                          host: payload.host,
                          envPrefix: payload.envPrefix,
                      }
                    : {}),
            },
            {
                status: 200,
                headers: { "Cache-Control": "no-store" },
            }
        );
    } catch (error) {
        const status = error.message?.includes("тохиргоо дутуу") ? 503 : 500;
        console.error("Tableau token error:", error.message);
        return NextResponse.json({ error: error.message }, { status });
    }
}
