import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';
import { checkAdminAuth } from '@/app/api/auth/adminAuth';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '0', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
        const label = decodeURIComponent(searchParams.get('label') || '');

        const offset = page * pageSize;

        let poolFilter = `WHERE [active] = 1`;
        if (label) {
            poolFilter += ` AND [namemn] LIKE N'${label}%'`;
        }

        const query = `
            SELECT a.[id], a.[labelmn], a.[labelen], a.[last_modified_date], a.[descriptionen], a.[descriptionmn], a.[is_secure], 
            CASE WHEN c.[namemn] = N'Салбар' THEN e.[namemn] WHEN c.[namemn] = N'Үзүүлэлтийг тооцох давтамж' THEN d.[namemn] WHEN c.[namemn] = N'Үзүүлэлтийг татах холбоос' THEN null ELSE b.[valuemn] END AS [valuemn], 
            CASE WHEN c.[namemn] = N'Салбар' THEN e.[nameen] WHEN c.[namemn] = N'Үзүүлэлтийг тооцох давтамж' THEN d.[nameen] WHEN c.[namemn] = N'Үзүүлэлтийг татах холбоос' THEN null ELSE b.[valueen] END AS [valueen],
            c.[namemn] as meta_name_mn, c.[nameen] as meta_name_en, c.[id] as meta_id, c.[app_order], a.[active]
            FROM (
                SELECT [id], [namemn] AS [labelmn], [nameen] AS [labelen], [last_modified_date], [descriptionen], [descriptionmn], [is_secure], [active]
                FROM [NSOweb].[dbo].[question_pool]
                ${poolFilter}
            ) AS a
            LEFT JOIN (
                SELECT [id], [active], [type], [valueen], [valuemn], [classification_code_id], [meta_data_id], [questionpool_id]
                FROM [NSOweb].[dbo].[meta_data_value]
                WHERE [active] = 1 AND [meta_data_id] <> 8718114
            ) AS b ON a.[id] = b.[questionpool_id]
            LEFT JOIN (
                SELECT [id], [namemn], [nameen], [app_order]
                FROM [NSOweb].[dbo].[meta_data]
                WHERE [active] = 1
            ) AS c ON b.[meta_data_id] = c.[id]
            LEFT JOIN (
                SELECT  [id], [namemn], [nameen]
                FROM [NSOweb].[dbo].[sub_classification_code]
                WHERE [active] = 1
            ) AS d ON TRY_CAST(b.[valuemn] AS INT) = d.[id]
            LEFT JOIN (
                SELECT  [id], [namemn], [nameen]
                FROM [NSOweb].[dbo].[sub_classification_code]
                WHERE [active] = 1
            ) AS e ON TRY_CAST(b.[valuemn] AS INT) = e.[id]
            ORDER BY TRY_CAST(c.[app_order] AS INT) ASC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`;

        const results = await db.raw(query, [offset, pageSize]);

        const countQuery = `SELECT COUNT(*) as total FROM [NSOweb].[dbo].[question_pool] ${poolFilter}`;
        const countRows = await db.raw(countQuery);
        const total = Array.isArray(countRows) ? (countRows[0]?.total ?? 0) : (countRows?.total ?? 0);

        return NextResponse.json({ status: true, data: results, pagination: { page, pageSize, total }, message: '' });
    } catch (error) {
        console.error('Metadata GET error:', error);
        return NextResponse.json({ status: false, data: null, message: 'Failed to fetch metadata' }, { status: 500 });
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


