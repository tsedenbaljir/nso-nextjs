const { data1212 } = require("../config/db_csweb.config");
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET method - accepts remotePath as query parameter
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const remotePath = searchParams.get("remotePath");

        if (!remotePath) {
            return NextResponse.json(
                { error: "remotePath parameter is required" },
                { status: 400 }
            );
        }

        const results = await data1212("UserTables")
            .select(
                "id",
                "ldap_user",
                "table_name",
                "remote_path",
                "file_name",
                "salbar_name",
                "ModifiedDate",
                "order_number"
            )
            .where("remote_path", "like", `%${decodeURIComponent(remotePath)}%`)
            .orderBy("order_number", "asc")
            .limit(1000);

        return NextResponse.json({
            success: true,
            data: results,
            count: results.length,
        });
    } catch (error) {
        console.error("Error fetching tables:", error);
        return NextResponse.json(
            { error: "Failed to fetch data", details: error.message },
            { status: 500 }
        );
    }
}
