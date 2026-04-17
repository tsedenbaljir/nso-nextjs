import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';
import { checkAdminAuth } from '@/app/api/auth/adminAuth';
import dayjs from 'dayjs';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const q = decodeURIComponent(searchParams.get('q') || '').trim();

    const offset = page * pageSize;

    let poolFilter = `WHERE [active] = 1`;
    if (q) {
      poolFilter += ` AND (
        [label] LIKE N'%${q}%' OR
        [label_en] LIKE N'%${q}%' OR
        [descriptionmn] LIKE N'%${q}%' OR
        [descriptionen] LIKE N'%${q}%'
      )`;
    }

    const query = `
      SELECT [id]
          ,[common_code_id]
          ,[code]
          ,[before_version]
          ,[version]
          ,[label_en] as name_eng
          ,[label] as name
          ,[description]
          ,[start_date]
          ,[end_date]
          ,[published]
          ,[active]
          ,[last_version]
          ,[is_secret]
          ,[created_by]
          ,[created_date]
          ,[last_modified_by]
          ,[last_modified_date]
          ,[form_status]
          ,[observe_interval]
          ,[descriptionen]
          ,[descriptionmn]
          ,[organization_ids]
          ,[approved_date]
          ,[views]
      FROM [NSOweb].[dbo].[dynamic_object]
      ${poolFilter}
      ORDER BY created_date DESC
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    `;

    const results = await db.raw(query, [offset, pageSize]);

    const countQuery = `SELECT COUNT(*) as total FROM [NSOweb].[dbo].[dynamic_object] ${poolFilter}`;
    const countRows = await db.raw(countQuery);
    const total = Array.isArray(countRows)
      ? (countRows[0]?.total ?? 0)
      : (countRows?.total ?? 0);

    return NextResponse.json({
      status: true,
      data: results,
      pagination: { page, pageSize, total },
      message: ''
    });
  } catch (error) {
    console.error('Metadata GET error:', error);
    return NextResponse.json(
      { status: false, data: null, message: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}

// ==================== POST ====================
export async function POST(req) {
  const auth = await checkAdminAuth(req);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ status: false, message: auth.error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      namemn,
      nameen,
      type = "indicator",
      active,
      isSecure,
      organizations = [],
      data_catalogue_ids = [],
      user = auth?.user?.name || "anonymousUser",
      last_modified_by = auth?.user?.name || "anonymousUser",
      metaValues = [],
      file,
      // file2,
      originalUploadFile,
      // originalUploadFile2,
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

    const [{ nextId: nextDoId }] = await db("dynamic_object").select(
      db.raw("ISNULL(MAX(CAST(id AS BIGINT)), 0) + 1 AS nextId")
    );
    const newId = String(nextDoId);

    await db.transaction(async (trx) => {
      // Insert attachment records if provided
      const insertAttachment = async (attachmentName, originalName, language) => {
        if (!attachmentName) return;
        const [{ nextId }] = await trx("metadata_value_attachment").select(
          trx.raw("ISNULL(MAX(CAST(id AS BIGINT)), 0) + 1 AS nextId")
        );

        if (language === "mn") {
          metaValues.push({
            meta_data_id: 3235261,
            valuemn: nextId,
            valueen: null,
          })
        }
        // if (language === "en") {
        //   metaValues.push({
        //     meta_data_id: 3235261,
        //     valueen: nextId,
        //   })
        // }

        await trx("metadata_value_attachment").insert({
          id: String(nextId),
          classification_code_id: null,
          document_id: newId,
          folder_id: null,
          attachment_id: null,
          attachment_name: String(attachmentName),
          original_name: String(originalName || attachmentName),
          created_by: auth?.user?.name || "anonymousUser",
          created_date: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          meta_data_id: 3235261,
        });
      };

      if (file) {
        await insertAttachment(file, originalUploadFile, "mn");
      }
      // if (file2) {
      //   await insertAttachment(file2, originalUploadFile2, "en");
      // }

      const orgCsv = (organizations || [])
        .map((x) => String(x).trim())
        .filter(Boolean)
        .join(",");

      // Create dynamic_object
      await trx("dynamic_object").insert({
        id: newId,
        label: namemn ?? null,
        label_en: nameen ?? null,
        is_secret: typeof isSecure === "boolean" ? (isSecure ? 1 : 0) : 0,
        active: typeof active === "boolean" ? (active ? 1 : 0) : 1,
        organization_ids: orgCsv || null,
        created_by: auth?.user?.name || "anonymousUser",
        created_date: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        last_modified_by: auth?.user?.name || "anonymousUser",
        last_modified_date: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      });

      // Link catalogues if provided
      if (Array.isArray(data_catalogue_ids) && data_catalogue_ids.length) {
        const rows = (data_catalogue_ids || [])
          .map((x) => Number(x))
          .filter((n) => !isNaN(n))
          .map((cid) => ({ question_pool_id: newId, data_catalogue_id: cid }));
        if (rows.length) {
          await trx("question_pool_data_catalogue").insert(rows);
        }
      }

      // Insert meta_data_value rows
      for (const m of metaValues || []) {
        if (!m?.meta_data_id) continue;
        const metaId = Number(m.meta_data_id);
        // let newMn = toNN(m.valuemn);
        // let newEn = toNN(m.valueen);
        let newMn = m.valuemn;
        let newEn = m.valueen;
        // if (newMn && newMn.includes(",")) newMn = normalizeJoined(newMn);
        // if (newEn && newEn.includes(",")) newEn = normalizeJoined(newEn);

        const [{ nextId }] = await trx("meta_data_value").select(
          trx.raw("ISNULL(MAX(CAST(id AS BIGINT)), 0) + 1 AS nextId")
        );

        const row = {
          id: String(nextId),
          active: 1,
          created_by: auth?.user?.name || "anonymousUser",
          created_date: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          deleted: null,
          last_modified_by: auth?.user?.name || "anonymousUser",
          last_modified_date: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          questionnaire_code: null,
          questionnaire_id: newId,
          status: null,
          type: type ?? "indicator",
          valuemn: newMn,
          valueen: newEn,
          classification_code_id: null,
          meta_data_id: metaId,
          questionpool_id: newId,
        };

        // NOTE: Do not set attachment_name, column does not exist.
        // Filenames for FORM_NAME (3235261) are already carried via valuemn/valueen.

        await trx("meta_data_value").insert(row);
      }
    });

    return NextResponse.json({ status: true, id: "newId", message: "Амжилттай хадгаллаа" });
  } catch (error) {
    console.error("Metadata POST error:", error);
    return NextResponse.json(
      { status: false, message: "Хадгалах үед алдаа гарлаа", error: String(error?.message || error) },
      { status: 500 }
    );
  }
}
