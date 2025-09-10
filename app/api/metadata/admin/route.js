import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';
import { checkAdminAuth } from '@/app/api/auth/adminAuth';

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
        [namemn] LIKE N'%${q}%' OR
        [nameen] LIKE N'%${q}%' OR
        [descriptionmn] LIKE N'%${q}%' OR
        [descriptionen] LIKE N'%${q}%'
      )`;
    }

    const query = `
      SELECT [id], [version], [type], [active], [namemn], [nameen],
             [is_current], [previous_version], [is_secure], [status],
             [created_by], [created_date], [last_modified_by], [last_modified_date],
             [deleted], [descriptionen], [descriptionmn], [views]
      FROM [NSOweb].[dbo].[question_pool]
      ${poolFilter}
      ORDER BY [id] ASC
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    `;

    const results = await db.raw(query, [offset, pageSize]);

    const countQuery = `SELECT COUNT(*) as total FROM [NSOweb].[dbo].[question_pool] ${poolFilter}`;
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

export async function POST(req) {
    const auth = await checkAdminAuth(req);
    if (!auth.isAuthenticated) {
        return NextResponse.json({ status: false, message: auth.error }, { status: 401 });
    }

    try {
        const body = await req.json();
        // Expecting body to contain question_pool fields and optional meta_data_value array
        const {
            namemn,
            nameen,
            descriptionmn,
            descriptionen,
            is_secure = 0,
            active = 1,
            metaValues = []
        } = body;

        // Insert into question_pool
        const insertPoolQuery = `
            INSERT INTO [NSOweb].[dbo].[question_pool]
            ([version],[type],[active],[namemn],[nameen],[is_current],[previous_version],[is_secure],[status],[created_by],[created_date],[last_modified_by],[last_modified_date],[deleted],[descriptionen],[descriptionmn],[views])
            VALUES ('1','indicator',?, ?, ?, 1, NULL, ?, 1, ?, GETDATE(), ?, GETDATE(), 0, ?, ?, 0);
            SELECT SCOPE_IDENTITY() AS id;`;

        const creator = auth.user.name || 'admin';
        const poolRes = await db.raw(insertPoolQuery, [active, namemn, nameen, is_secure, creator, creator, descriptionen || null, descriptionmn || null]);
        const newId = Array.isArray(poolRes) ? poolRes[0]?.id || poolRes[0] : poolRes?.id;

        // Insert meta_data_value
        if (Array.isArray(metaValues) && metaValues.length > 0) {
            for (const mv of metaValues) {
                await db('meta_data_value').insert({
                    active: 1,
                    type: mv.type || null,
                    valueen: mv.valueen ?? null,
                    valuemn: mv.valuemn ?? null,
                    classification_code_id: mv.classification_code_id ?? null,
                    meta_data_id: mv.meta_data_id,
                    questionpool_id: newId
                });
            }
        }

        return NextResponse.json({ status: true, data: { id: newId }, message: 'Created' });
    } catch (error) {
        console.error('Metadata POST error:', error);
        return NextResponse.json({ status: false, message: 'Failed to create metadata' }, { status: 500 });
    }
}

export async function PUT(req) {
    const auth = await checkAdminAuth(req);
    if (!auth.isAuthenticated) {
        return NextResponse.json({ status: false, message: auth.error }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            id,
            namemn,
            nameen,
            descriptionmn,
            descriptionen,
            is_secure,
            active,
            metaValues = []
        } = body;

        await db('question_pool')
            .withSchema('dbo')
            .where({ id })
            .update({
                namemn,
                nameen,
                descriptionmn,
                descriptionen,
                is_secure,
                active,
                last_modified_by: auth.user.name || 'admin',
                last_modified_date: db.raw('GETDATE()')
            });

        // For simplicity, delete and re-insert meta_data_value for this questionpool_id
        await db('meta_data_value').withSchema('dbo').where({ questionpool_id: id }).del();

        if (Array.isArray(metaValues) && metaValues.length > 0) {
            for (const mv of metaValues) {
                await db('meta_data_value').insert({
                    active: 1,
                    type: mv.type || null,
                    valueen: mv.valueen ?? null,
                    valuemn: mv.valuemn ?? null,
                    classification_code_id: mv.classification_code_id ?? null,
                    meta_data_id: mv.meta_data_id,
                    questionpool_id: id
                });
            }
        }

        return NextResponse.json({ status: true, message: 'Updated' });
    } catch (error) {
        console.error('Metadata PUT error:', error);
        return NextResponse.json({ status: false, message: 'Failed to update metadata' }, { status: 500 });
    }
}


