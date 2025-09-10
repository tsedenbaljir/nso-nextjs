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
            ORDER BY [id] DESC
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
        const {
            namemn,
            nameen,
            descriptionmn,
            descriptionen,
            is_secure = 0,
            active = 1,
            version = '1',
            is_current = 1,
            type = 'indicator',
            metaValues = []
        } = body;

        const creator = auth.user.name || 'admin';

        const resultId = await db.transaction(async (trx) => {
            // Generate new question_pool id explicitly (table id is not IDENTITY)
            const [{ maxId }] = await trx('question_pool').withSchema('dbo').max('id as maxId');
            const newIdBig = BigInt(maxId ?? 0) + 1;
            const newId = newIdBig.toString();

            // Insert into question_pool with explicit id
            await trx('question_pool').withSchema('dbo').insert({
                id: newId,
                version: version,
                type: type,
                active,
                namemn,
                nameen,
                is_current,
                previous_version: null,
                is_secure,
                status: 1,
                created_by: creator,
                created_date: trx.fn.now(),
                last_modified_by: creator,
                last_modified_date: trx.fn.now(),
                deleted: 0,
                descriptionen: descriptionen ?? null,
                descriptionmn: descriptionmn ?? null,
                views: 0,
            });

            // Insert meta_data_value rows if provided
            if (Array.isArray(metaValues) && metaValues.length > 0) {
                for (const mv of metaValues) {
                    const [{ maxId: maxMetaId }] = await trx('meta_data_value').max('id as maxId');
                    const newMetaId = (BigInt(maxMetaId ?? 0) + 1n).toString();
                    const valueMn = (mv.valuemn ?? '').toString().trim();
                    const valueEn = (mv.valueen ?? valueMn).toString().trim();

                    await trx('meta_data_value').withSchema('dbo').insert({
                        id: newMetaId,
                        active: 1,
                        type: mv.type || null,
                        valueen: valueEn,
                        valuemn: valueMn,
                        classification_code_id: mv.classification_code_id ?? null,
                        meta_data_id: mv.meta_data_id,
                        questionpool_id: newId,
                        created_by: creator,
                        created_date: trx.fn.now(),
                        deleted: null,
                        last_modified_by: creator,
                        last_modified_date: trx.fn.now(),
                    });
                }
            }

            return newId;
        });

        return NextResponse.json({ status: true, data: { id: resultId }, message: 'Created' });
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
            version,
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
                version,
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
                    valueen: mv.valueen ?? '',
                    valuemn: mv.valuemn ?? '',
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


