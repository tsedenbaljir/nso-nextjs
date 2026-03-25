import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

// ==================== GET ====================
export async function GET(req, { params }) {
  const { id } = params;
  try {
    const query = `
        SELECT [id], [version], [type], [active], [namemn], [nameen], [is_current], 
                [previous_version], [is_secure], [status], [created_by], [created_date], 
                [last_modified_by], [last_modified_date], [deleted], [descriptionen], 
                [descriptionmn], [views]
        FROM [NSOweb].[dbo].[question_pool]
        WHERE [id] = ?`;
    const rows = await db.raw(query, [id]);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { status: false, data: null, message: 'Not found' },
        { status: 404 }
      );
    }

    const metadata = rows[0];

    const metaValues = await db('vw_question_pool_value_admin')
      .select('*')
      .where({ id: id, active: 1, deleted: null });

    const catalogues = await db('data_catalogue')
      .select('id', 'namemn', 'nameen', 'code')
      .where({ deleted: null, active: 1 });

    const subClassifications = await db('sub_classification_code')
      .select('id', 'namemn', 'nameen')
      .where({ active: 1, classification_code_id: '8427702' });

    const frequencies = await db('sub_classification_code')
      .select('id', 'namemn', 'nameen')
      .where({ active: 1, classification_code_id: '833001' });

    return NextResponse.json({
      status: true,
      data: {
        ...metadata,
        metaValues,
        catalogues,
        subClassifications,
        frequencies,
      },
      message: '',
    });
  } catch (error) {
    console.error('Metadata GET by id error:', error);
    return NextResponse.json(
      { status: false, data: null, message: 'Failed to fetch' },
      { status: 500 }
    );
  }
}

// ==================== PUT ====================
export async function PUT(req, { params }) {
  const { id } = params;
  try {
    const body = await req.json();
    const {
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
      user = 'anonymousUser',
      metaValues = [],
    } = body;

    // 1. question_pool update
    await db('question_pool')
      .where({ id })
      .update({
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
        last_modified_by: user,
        last_modified_date: db.fn.now(),
      });

    // 2. хуучин meta_data_value → deleted = 0
    await db('meta_data_value')
      .where({ questionpool_id: id })
      .update({
        deleted: 0,
        last_modified_by: user,
        last_modified_date: db.fn.now(),
      });

    // 🔍 хуучин metaValues DB-с уншина (view дотор meta_data_id байхгүй тул id-г ашиглана)
    const oldValues = await db('vw_question_pool_value_admin')
      .select('id', 'valuemn', 'valueen')
      .where({ id: id, active: 1 , deleted: null});
      
    // 3. шинэ metaValues insert (зөвхөн өөрчлөгдсөнг)
    for (const m of metaValues) {
      const newMn = m.valuemn?.trim() || "";
      const newEn = m.valueen?.trim() || "";
    
      if (!newMn && !newEn) continue;
    
      const old = oldValues.find(o => o.id === m.id);
      const oldMn = old?.valuemn?.trim() || "";
      const oldEn = old?.valueen?.trim() || "";
    
      if (newMn === oldMn && newEn === oldEn) continue;
    
      // шинэ id авах
      const [{ maxId }] = await db("meta_data_value").max("id as maxId");
      const newId = BigInt(maxId ?? 0) + 1n;
    
      await db("meta_data_value").insert({
        id: newId.toString(),
        active: 1,
        created_by: user,
        created_date: db.fn.now(),
        deleted: null,
        last_modified_by: user,
        last_modified_date: db.fn.now(),
        questionnaire_code: null,
        questionnaire_id: null,
        type: type || null,
        valuemn: newMn,
        valueen: newEn,
        classification_code_id: m.classification_code_id || null,
        meta_data_id: m.meta_data_id,
        questionpool_id: id,
      });
  
  }

    return NextResponse.json({
      status: true,
      message: 'Амжилттай хадгаллаа',
    });
  } catch (error) {
    console.error('Metadata PUT error:', error);
    return NextResponse.json(
      { status: false, message: 'Хадгалах үед алдаа гарлаа', error: error.message },
      { status: 500 }
    );
  }
}
