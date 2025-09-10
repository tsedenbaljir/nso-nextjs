import { NextResponse } from "next/server";
import { db } from "@/app/api/config/db_csweb.config.js";

export async function GET() {
  try {
    const metaValues = await db("question_pool").select("id", "namemn", "nameen");
    const catalogues = await db("data_catalogue")
      .select("id", "namemn", "nameen", "code")
      .where({ active: 1 })
      .whereNull("deleted");
    const subClassifications = await db("sub_classification_code")
      .select("id", "namemn", "nameen")
      .where({ active: 1, classification_code_id: "8427702" });
    const frequencies = await db("sub_classification_code")
      .select("id", "namemn", "nameen")
      .where({ active: 1, classification_code_id: "833001" });
    const organizations = await db("organizations").select("id", { organization_id: "id" }, "name", "fullname");

    return NextResponse.json({
      status: true,
      data: {
        rows: [],
        metaValues,
        catalogues,
        subClassifications,
        frequencies,
        organizations,
        selectedOrganizationIds: [],
        mdvLatest: {},
      },
      message: "",
    });
  } catch (error) {
    console.error("Options GET error:", error);
    return NextResponse.json({ status: false, data: null, message: "Failed to fetch options" }, { status: 500 });
  }
}
