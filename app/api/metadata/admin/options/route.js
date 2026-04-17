import { NextResponse } from "next/server";
import { db } from "@/app/api/config/db_csweb.config.js";

export async function GET() {
  try {
    // Дата каталог
    // const catalogues = await db("data_catalogue")
    //   .withSchema("dbo")
    //   .select("id", "namemn", "nameen")
    //   .whereNull("deleted")
    //   .andWhere("active", 1);

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
      // catalogues,
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

    // Use transaction and explicit IDs because question_pool.id is non-IDENTITY
    const createdId = await db.transaction(async (trx) => {
      const [{ maxId }] = await trx('question_pool').withSchema('dbo').max('id as maxId');
      const newId = (BigInt(maxId ?? 0) + 1n).toString();

      await trx('question_pool').withSchema('dbo').insert({
        id: newId,
        namemn,
        nameen,
        type,
        version,
        previous_version: previousVersion,
        active,
        is_current: isCurrent,
        is_secure: isSecure,
        descriptionmn,
        descriptionen,
        status: 1,
        created_by: user,
        created_date: trx.fn.now(),
        last_modified_by: user,
        last_modified_date: trx.fn.now(),
        deleted: 0,
        views: 0,
      });

      if (Array.isArray(metaValues) && metaValues.length > 0) {
        for (const mv of metaValues) {
          const [{ maxId: maxMetaId }] = await trx('meta_data_value').withSchema('dbo').max('id as maxId');
          const newMetaId = (BigInt(maxMetaId ?? 0) + 1n).toString();

          const valueMn = (mv.valuemn ?? '').toString().trim();
          const valueEn = (mv.valueen ?? valueMn).toString().trim();

          await trx('meta_data_value').withSchema('dbo').insert({
            id: newMetaId,
            active: 1,
            type: mv.type || null,
            valuemn: valueMn,
            valueen: valueEn,
            classification_code_id: mv.classification_code_id ?? null,
            meta_data_id: mv.meta_data_id,
            questionpool_id: newId,
            created_by: user,
            created_date: trx.fn.now(),
            deleted: null,
            last_modified_by: user,
            last_modified_date: trx.fn.now(),
          });
        }
      }

      return newId;
    });

    return NextResponse.json({
      status: true,
      data: { id: createdId },
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