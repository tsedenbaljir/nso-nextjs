import { NextResponse } from "next/server";
import https from "https";

export const dynamic = "force-dynamic";

const TABLEAU_GATEWAY =
    "https://gateway.1212.mn/services/dynamic/api/public/tableau-report";

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    timeout: 30000,
});

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") || "ViewerUser";

    const url = `${TABLEAU_GATEWAY}?${new URLSearchParams({ key }).toString()}`;

    try {
        const result = await new Promise((resolve, reject) => {
            const reqUrl = new URL(url);
            const options = {
                hostname: reqUrl.hostname,
                path: reqUrl.pathname + reqUrl.search,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache",
                },
                agent: httpsAgent,
                timeout: 30000,
            };

            const request = https.get(options, (res) => {
                let data = "";
                res.on("data", (chunk) => { data += chunk; });
                res.on("end", () => {
                    try {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(JSON.parse(data));
                        } else {
                            reject(new Error(`Gateway HTTP ${res.statusCode}`));
                        }
                    } catch {
                        reject(new Error("Invalid JSON from gateway"));
                    }
                });
            });

            request.on("timeout", () => {
                request.destroy();
                reject(new Error("Gateway timeout"));
            });

            request.on("error", reject);
        });

        return NextResponse.json(result, {
            status: 200,
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error) {
        console.error("Tableau key fetch error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
