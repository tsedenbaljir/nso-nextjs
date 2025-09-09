import { NextResponse } from "next/server";
import { db } from "@/app/api/config/db_csweb.config.js";

export async function GET() {
  try {
    // Дата каталог
    const catalogues = await db("data_catalogue")
      .withSchema("dbo")
      .select("id", "namemn", "nameen")
      .whereNull("deleted")
      .andWhere("active", 1);

    // Салбар (classification_code_id = 8427702)
    const sectors = await db("sub_classification_code")
      .withSchema("dbo")
      .select("id", "namemn", "nameen")
      .where("active", 1)
      .andWhere("classification_code_id", 8427702);

    // Давтамж (classification_code_id = 833001)
    const frequencies = await db("sub_classification_code")
      .withSchema("dbo")
      .select("id", "namemn", "nameen")
      .where("active", 1)
      .andWhere("classification_code_id", 833001);

    return NextResponse.json({
      status: true,
      catalogues,
      subClassifications: sectors,
      frequencies,
    });
  } catch (error) {
    console.error("Options API error:", error);
    return NextResponse.json(
      { status: false, message: "Failed to fetch options" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      namemn,
      nameen,
      type = "indicator",
      version = "1",
      previousVersion = null,
      active = 1,
      isCurrent = 1,
      isSecure = 0,
      descriptionmn = null,
      descriptionen = null,
      user = "anonymousUser",
      metaValues = [],
    } = body;

    // 1. question_pool-д INSERT
    const insertPoolQuery = `
      INSERT INTO [NSOweb].[dbo].[question_pool]
      ([namemn], [nameen], [type], [version], [previous_version],
       [active], [is_current], [is_secure],
       [descriptionmn], [descriptionen],
       [status], [created_by], [created_date],
       [last_modified_by], [last_modified_date], [deleted], [views])
      VALUES (?, ?, ?, ?, ?,
              ?, ?, ?,
              ?, ?,
              1, ?, GETDATE(),
              ?, GETDATE(), 0, 0);
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const poolRes = await db.raw(insertPoolQuery, [
      namemn,
      nameen,
      type,
      version,
      previousVersion,
      active,
      isCurrent,
      isSecure,
      descriptionmn,
      descriptionen,
      user,
      user,
    ]);

    // шинэ question_pool id
    const newId = Array.isArray(poolRes)
      ? poolRes[0]?.id || poolRes[0]
      : poolRes?.id;

    // 2. meta_data_value-д INSERT
    if (Array.isArray(metaValues) && metaValues.length > 0) {
      for (const mv of metaValues) {
        // хамгийн сүүлийн id олоод +1 хийж шинээр id өгнө
        const [{ maxId }] = await db("meta_data_value").max("id as maxId");
        const newMetaId = BigInt(maxId ?? 0) + 1n;

        await db("meta_data_value").withSchema("dbo").insert({
          id: newMetaId.toString(),
          active: 1,
          type: mv.type || null,
          valuemn: mv.valuemn ?? null,
          valueen: mv.valueen ?? null,
          classification_code_id: mv.classification_code_id ?? null,
          meta_data_id: mv.meta_data_id,
          questionpool_id: newId,
          created_by: user,
          created_date: db.fn.now(),
          deleted: null,
          last_modified_by: user,
          last_modified_date: db.fn.now(),
        });
      }
    }

    return NextResponse.json({
      status: true,
      data: { id: newId },
      message: "Амжилттай бүртгэлээ",
    });
  } catch (error) {
    console.error("Metadata POST error:", error);
    return NextResponse.json(
      { status: false, message: "Бүртгэх үед алдаа гарлаа", error: error.message },
      { status: 500 }
    );
  }
}