import { NextResponse } from "next/server";
import { db } from "@/app/api/config/db_csweb.config.js";
import { checkAdminAuth } from '@/app/api/auth/adminAuth';
import dayjs from 'dayjs';

async function getLatestMdvMap(questionnaireId) {
  const rows = await db("meta_data_value")
    .select("meta_data_id", "valuemn", "valueen", "last_modified_date")
    .where({ questionnaire_id: questionnaireId, active: 1 })
    .whereNull("deleted")
    .orderBy("last_modified_date", "desc");

  const map = {};
  for (const r of rows) {
    if (!(r.meta_data_id in map)) {
      map[r.meta_data_id] = { valuemn: r.valuemn, valueen: r.valueen };
    }
  }
  return map;
}

async function getCatalogueIdsStr(questionPoolId) {
  const rows = await db("question_pool_data_catalogue")
    .select("data_catalogue_id")
    .where({ question_pool_id: questionPoolId });
  if (!rows?.length) return "";
  return rows.map((r) => String(r.data_catalogue_id)).join(", ");
}

async function tryView(query, id) {
  try {
    const res = await db.raw(query, [id]);
    const arr = Array.isArray(res) ? res : res?.[0]?.recordset || res?.recordset || [];
    return Array.isArray(arr) ? arr : [];
  } catch (_) {
    return [];
  }
}

// ==================== GET ====================
export async function GET(req, { params }) {
  const { id } = params;
  const qpOrQnrId = String(id);

  try {
    const mdvLatest = await getLatestMdvMap(qpOrQnrId);

    const Q1 = `
      SELECT [id],
        [data_catalogue_ids],
        [data_catalogue_names_mn],
        [data_catalogue_names_en],
        [type],
        [labelmn],
        [labelen],
        [namemn],
        [nameen],
        [last_modified_date],
        [descriptionen],
        [descriptionmn],
        [is_secure],
        [valuemn],
        [valueen],
        [meta_data_id],
        [app_order],
        [deleted],
        [active],
        [organization_id],
        [organization_name],
        [organization_fullname]
      FROM [NSOweb].[dbo].[vw_question_pool_value_admin]
      WHERE [id] = ?;
    `;
    let rows = await tryView(Q1, qpOrQnrId);

    if (!rows.length) {
      const Q2 = `
        SELECT [id], [meta_data_id], [label] AS [labelmn], [label_en] AS [labelen],
          [namemn], [nameen], [attachment_name],
          [data_catalogue_id] AS data_catalogue_ids,
          [data_catalogue_mn] AS data_catalogue_names_mn,
          [data_catalogue_en] AS data_catalogue_names_en,
          [valuemn], [valueen], [last_modified_date], [is_secret], [active],
          CAST(NULL AS INT) AS [organization_id],
          CAST(NULL AS NVARCHAR(200)) AS [organization_name],
          CAST(NULL AS NVARCHAR(400)) AS [organization_fullname]
        FROM [NSOweb].[dbo].[vw_meta_data_value_admin]
        WHERE [id] = ?;
      `;
      rows = await tryView(Q2, qpOrQnrId);
    }

    if (!rows.length) {
      const link = await db("meta_data_value")
        .where({ questionnaire_id: qpOrQnrId })
        .whereNull("deleted")
        .orderBy("last_modified_date", "desc")
        .first("questionpool_id");

      if (link?.questionpool_id) {
        rows = await tryView(Q1, String(link.questionpool_id));
        if (!rows.length) {
          const Q2b = `
            SELECT [id], [meta_data_id], [label] AS [labelmn], [label_en] AS [labelen],
              [namemn], [nameen], [attachment_name],
              [data_catalogue_id] AS data_catalogue_ids,
              [data_catalogue_mn] AS data_catalogue_names_mn,   -- ✅ Зөв бичвэр
              [data_catalogue_en] AS data_catalogue_names_en,
              [valuemn], [valueen], [last_modified_date], [is_secret], [active],
              CAST(NULL AS INT) AS [organization_id],
              CAST(NULL AS NVARCHAR(200)) AS [organization_name],
              CAST(NULL AS NVARCHAR(400)) AS [organization_fullname]
            FROM [NSOweb].[dbo].[vw_meta_data_value_admin]
            WHERE [id] = ?;
          `;
          rows = await tryView(Q2b, String(link.questionpool_id));
        }
      }
    }

    if (!rows.length) {
      const qp = await db("dynamic_object")
        .where({ id: qpOrQnrId })
        .first([
          "id",
          { labelmn: "label" },
          { labelen: "label_en" },
          "type",
          "last_modified_date",
          "descriptionmn",
          "descriptionen",
          { is_secret: "is_secret" },
          "active",
          { organization_ids: "organization_ids" },
        ]);

      const dcIdsStr = await getCatalogueIdsStr(qpOrQnrId);

      rows = [
        {
          id: qp?.id ?? qpOrQnrId,
          data_catalogue_ids: dcIdsStr,
          data_catalogue_names_mn: null,
          data_catalogue_names_en: null,
          type: qp?.type ?? "indicator",
          labelmn: qp?.labelmn ?? "",
          labelen: qp?.labelen ?? "",
          namemn: null,
          nameen: null,
          last_modified_date: qp?.last_modified_date ?? null,
          descriptionen: qp?.descriptionen ?? null,
          descriptionmn: qp?.descriptionmn ?? null,
          is_secure: qp?.is_secret ?? 0,
          valuemn: null,
          valueen: null,
          meta_data_id: null,
          app_order: null,
          deleted: null,
          active: qp?.active ?? 1,
          organization_id: null,
          organization_name: null,
          organization_fullname: null,
        },
      ];
    }

    const selectedOrganizationIds = Array.from(
      new Set(
        rows
          .map((r) => r.organization_id)
          .filter((v) => v !== null && v !== undefined)
          .map(Number)
      )
    );

    let organizations = await db("organizations").select("id", { organization_id: "id" }, "name", "fullname");

    // const orgMap = new Map((organizations || []).map((o) => [Number(o.organization_id ?? o.id), o]));
    // for (const r of rows) {
    //   if (r.organization_id != null) {
    //     const key = Number(r.organization_id);
    //     if (!orgMap.has(key)) {
    //       orgMap.set(key, {
    //         id: key,
    //         organization_id: key,
    //         name: r.organization_name || "",
    //         fullname: r.organization_fullname || "",
    //       });
    //     }
    //   }
    // }
    // organizations = Array.from(orgMap.values());

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

    return NextResponse.json({
      status: true,
      data: {
        rows,
        metaValues,
        catalogues,
        subClassifications,
        frequencies,
        organizations,
        selectedOrganizationIds,
        mdvLatest,
      },
      message: "",
    });
  } catch (error) {
    console.error("Metadata GET by id error:", error);
    return NextResponse.json(
      { status: false, data: null, message: "Failed to fetch", error: String(error?.message || error) },
      { status: 500 }
    );
  }
}

// ==================== PUT ====================
export async function PUT(req, { params }) {
  const { id } = params;
  const auth = await checkAdminAuth(req);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ status: false, message: auth.error }, { status: 401 });
  }
  const actor = auth.user?.name || "anonymousUser";

  try {
    const body = await req.json();
    const {
      namemn,
      nameen,
      type = "indicator",
      active,
      isSecure,
      organizations = [],
      metaValues = [],
      file,
      // file2,
      originalUploadFile,
      // originalUploadFile2,
      oldUploadFile,
      // oldUploadFile2,
    } = body;

    const normalizeJoined = (val) => {
      if (val == null) return "";
      const s = String(val).trim();
      if (!s.includes(",")) return s;
      const set = new Set(
        s
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      );
      return Array.from(set)
        .sort((a, b) => (a > b ? 1 : a < b ? -1 : 0))
        .join(",");
    };

    const toNN = (s) => (s == null ? "" : String(s).trim());

    await db.transaction(async (trx) => {
      const metaValuesArr = Array.isArray(metaValues) ? [...metaValues] : [];
      // Merge duplicate meta entries by meta_data_id so we write exactly one row per meta
      const mergedByMeta = new Map();
      for (const m of metaValuesArr) {
        if (!m?.meta_data_id) continue;
        const key = Number(m.meta_data_id);
        if (!Number.isFinite(key)) continue;
        const prev = mergedByMeta.get(key) || { meta_data_id: key, valuemn: "", valueen: "" };
        const mn = toNN(m.valuemn);
        const en = toNN(m.valueen);
        if (mn) prev.valuemn = mn;
        if (en) prev.valueen = en;
        mergedByMeta.set(key, prev);
      }
      const mergedMetaValues = Array.from(mergedByMeta.values());

      // Insert attachment records if provided
      const insertAttachment = async (attachmentName, originalName, language, oldAttachmentName) => {
        if (!attachmentName) return;

        // if (language === "mn" && oldAttachmentName) {
        await trx("metadata_value_attachment").update({
          original_name: originalName,
          attachment_name: attachmentName,
          created_by: actor
        }).where({ attachment_name: oldAttachmentName });

        // } 
        // else {
        //   await trx("metadata_value_attachment").where({ attachment_name: oldAttachmentName, created_by: actor }).update({
        //     attachment_name: attachmentName,
        //     original_name: originalName,
        //   });
        // }
      };

      if (file) {
        await insertAttachment(file, originalUploadFile, "mn", oldUploadFile);
      }
      // if (file2) {
      //   await insertAttachment(file2, originalUploadFile2, "en", oldUploadFile2);
      // }

      const orgCsv = (organizations || [])
        .map((x) => String(x).trim())
        .filter(Boolean)
        .join(",");

      const prev = await trx("dynamic_object")
        .where({ id })
        .first([
          "label",
          "label_en",
          "is_secret",
          "active",
          "organization_ids",
          "descriptionmn",
          "descriptionen",
        ]);

      await trx("dynamic_object")
        .update({
          label: namemn ?? prev?.label ?? null,
          label_en: nameen ?? prev?.label_en ?? null,
          is_secret: typeof isSecure === "boolean" ? (isSecure ? 1 : 0) : prev?.is_secret ?? 0,
          active: typeof active === "boolean" ? (active ? 1 : 0) : prev?.active ?? 1,
          organization_ids: orgCsv || prev?.organization_ids || null,
          last_modified_by: actor,
          last_modified_date: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        })
        .where({ id })
        .catch(() => { });

      const curRows = await trx("meta_data_value")
        .select("meta_data_id", "valuemn", "valueen")
        .where({ questionnaire_id: id, active: 1 })
        .whereNull("deleted")
        .orderBy("last_modified_date", "desc");

      const curMap = new Map();
      for (const r of curRows) if (!curMap.has(r.meta_data_id)) curMap.set(r.meta_data_id, r);

      for (const m of mergedMetaValues) {
        if (!m?.meta_data_id) continue;
        const metaId = Number(m.meta_data_id);

        let newMn = toNN(m.valuemn);
        let newEn = toNN(m.valueen);

        if (newMn && newMn.includes(",")) newMn = normalizeJoined(newMn);
        if (newEn && newEn.includes(",")) newEn = normalizeJoined(newEn);

        const old = curMap.get(metaId);
        const oldMn = old?.valuemn == null ? "" : String(old.valuemn).trim();
        const oldEn = old?.valueen == null ? "" : String(old.valueen).trim();
        const oldMnN = oldMn && oldMn.includes(",") ? normalizeJoined(oldMn) : oldMn;
        const oldEnN = oldEn && oldEn.includes(",") ? normalizeJoined(oldEn) : oldEn;

        const changed = newMn !== oldMnN || newEn !== oldEnN;
        if (!changed) continue;

        // хуучныг идэвхгүй/устгасан тэмдэглэлтэй болгоно (view-ээс давхцахгүй)
        await trx("meta_data_value")
          .update({
            active: 0,
            deleted: 1,
            last_modified_by: actor,
            last_modified_date: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          })
          // .where({ questionnaire_id: id, meta_data_id: metaId, active: 1 })
          .where(function () {
            this.where({ questionnaire_id: id }).orWhere({ questionpool_id: id });
          })
          .andWhere({ meta_data_id: metaId, active: 1 })
          .whereNull("deleted");

        const [{ nextId }] = await trx("meta_data_value").select(
          trx.raw("ISNULL(MAX(CAST(id AS BIGINT)), 0) + 1 AS nextId")
        );

        await trx("meta_data_value").insert({
          id: String(nextId),
          active: 1,
          created_by: actor,
          created_date: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          deleted: null,
          last_modified_by: actor,
          last_modified_date: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          questionnaire_code: null,
          questionnaire_id: id,
          status: null,
          type: type ?? "indicator",
          valuemn: newMn,
          valueen: newEn,
          classification_code_id: null,
          meta_data_id: metaId,
          questionpool_id: id,
        });
      }
    });

    return NextResponse.json({ status: true, message: "Амжилттай хадгаллаа" });
  } catch (error) {
    console.error("Metadata PUT error:", error);
    return NextResponse.json(
      { status: false, message: "Хадгалах үед алдаа гарлаа", error: String(error?.message || error) },
      { status: 500 }
    );
  }
}

// ==================== DELETE (soft deactivate) ====================
export async function DELETE(req, { params }) {
  const auth = await checkAdminAuth(req);
  if (!auth.isAuthenticated) {
    return NextResponse.json({
      status: false,
      message: auth.error
    }, { status: 401 });
  }
  const { id } = params;
  try {
    await db("dynamic_object")
      .where({ id: String(id) })
      .update({ active: 0, last_modified_date: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'), last_modified_by: auth?.user?.name || "anonymousUser" })
      .catch(() => { });

    return NextResponse.json({ status: true, message: "Идэвхгүй болгов" });
  } catch (error) {
    console.error("Metadata DELETE error:", error);
    return NextResponse.json(
      { status: false, message: "Идэвхгүй болгох үед алдаа гарлаа", error: String(error?.message || error) },
      { status: 500 }
    );
  }
}