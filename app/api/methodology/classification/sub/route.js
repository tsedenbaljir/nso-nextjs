import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';
import { requireAdminApi } from '@/app/api/auth/adminAuth';

export const dynamic = 'force-dynamic';

const TABLE = 'sub_classification_code';

// List sub-classification codes for a given classification_code_id
export async function GET(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const classificationCodeId = searchParams.get('classification_code_id');

    if (!classificationCodeId) {
        return NextResponse.json(
            { status: false, message: 'classification_code_id is required' },
            { status: 400 }
        );
    }

    try {
        const data = await db(TABLE)
            .where({ classification_code_id: classificationCodeId })
            .whereNull('deleted')
            .orderBy('app_order')
            .orderBy('id');

        return NextResponse.json({ status: true, data, message: '' });
    } catch (error) {
        console.error('Error fetching sub-classification:', error);
        return NextResponse.json(
            { status: false, message: 'Failed to fetch sub-classification' },
            { status: 500 }
        );
    }
}

// Create
export async function POST(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    try {
        const body = await req.json();

        if (!body.classification_code_id) {
            return NextResponse.json(
                { status: false, message: 'classification_code_id is required' },
                { status: 400 }
            );
        }

        const [maxRow] = await db.raw(`SELECT MAX(id) as maxId FROM [NSOweb].[dbo].[${TABLE}]`);
        const newId = (parseInt(maxRow?.maxId) || 0) + 1;

        await db(TABLE).insert({
            id: newId,
            namemn: body.namemn,
            nameen: body.nameen,
            code: body.code || null,
            classification_code_id: body.classification_code_id,
            app_order: body.app_order ?? newId,
            active: body.active ?? 1,
            status: body.status ?? 'A',
            deleted: null,
            created_by: body.created_by || 'admin',
            created_date: db.fn.now(),
            last_modified_by: body.last_modified_by || 'admin',
            last_modified_date: db.fn.now(),
        });

        return NextResponse.json({
            status: true,
            data: { id: newId },
            message: 'Амжилттай нэмэгдлээ',
        });
    } catch (error) {
        console.error('Error creating sub-classification:', error);
        return NextResponse.json(
            { status: false, message: 'Нэмэх үед алдаа гарлаа' },
            { status: 500 }
        );
    }
}

// Update
export async function PUT(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { status: false, message: 'ID is required' },
                { status: 400 }
            );
        }

        await db(TABLE)
            .where({ id })
            .update({
                namemn: body.namemn,
                nameen: body.nameen,
                code: body.code || null,
                app_order: body.app_order ?? null,
                active: body.active ?? 1,
                status: body.status ?? 'A',
                last_modified_by: body.last_modified_by || 'admin',
                last_modified_date: db.fn.now(),
            });

        return NextResponse.json({ status: true, message: 'Амжилттай шинэчлэгдлээ' });
    } catch (error) {
        console.error('Error updating sub-classification:', error);
        return NextResponse.json(
            { status: false, message: 'Засварлах үед алдаа гарлаа' },
            { status: 500 }
        );
    }
}

// Soft delete
export async function DELETE(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { status: false, message: 'ID is required' },
                { status: 400 }
            );
        }

        await db(TABLE)
            .where({ id })
            .update({
                deleted: db.fn.now(),
                active: 0,
                last_modified_by: 'admin',
                last_modified_date: db.fn.now(),
            });

        return NextResponse.json({ status: true, message: 'Амжилттай устгалаа' });
    } catch (error) {
        console.error('Error deleting sub-classification:', error);
        return NextResponse.json(
            { status: false, message: 'Устгах үед алдаа гарлаа' },
            { status: 500 }
        );
    }
}
