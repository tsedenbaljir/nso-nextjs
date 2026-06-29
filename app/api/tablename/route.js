import { NextResponse } from "next/server";
import { fetchTablenameIndexData } from "@/app/api/lib/tablenameIndexData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tableName = await fetchTablenameIndexData();
    return NextResponse.json({ response: tableName });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
