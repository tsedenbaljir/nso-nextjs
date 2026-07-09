import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';
import { requireAdminApi } from '@/app/api/auth/adminAuth';

export const dynamic = 'force-dynamic';

const VALUE_TABLE = 'meta_data_value';
const FIELD_TABLE = 'meta_data';

// List general-info values for a classification_code_id (+ available meta_data fields)
export async function GET(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const classificationCodeId = searchParams.get('classification_code_id');

    try {
        // Field dictionary (always available for the add dropdown)
        const fields = await db(FIELD_TABLE)
            .select('id', 'namemn', 'nameen')
            .orderBy('id');

        if (!classificationCodeId) {
            return NextResponse.json({ status: true, data: [], fields, message: '' });
        }

        const data = await db({ v: VALUE_TABLE })
            .leftJoin({ m: FIELD_TABLE }, 'm.id', 'v.meta_data_id')
            .where('v.classification_code_id', classificationCodeId)
            .whereNull('v.deleted')
            .select(
                'v.id',
                'v.meta_data_id',
                'v.valuemn',
                'v.valueen',
                'v.type',
                'v.active',
                'v.last_modified_date',
                'm.namemn as field_namemn',
                'm.nameen as field_nameen'
            )
            .orderBy('v.meta_data_id');

        return NextResponse.json({ status: true, data, fields, message: '' });
    } catch (error) {
        console.error('Error fetching classification general info:', error);
        return NextResponse.json(
            { status: false, message: 'Failed to fetch general info' },
            { status: 500 }
        );
    }
}

// Create a general-info value
export async function POST(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    try {
        const body = await req.json();

        if (!body.classification_code_id || !body.meta_data_id) {
            return NextResponse.json(
                { status: false, message: 'classification_code_id and meta_data_id are required' },
                { status: 400 }
            );
        }

        const [maxRow] = await db.raw(`SELECT MAX(id) as maxId FROM [NSOweb].[dbo].[${VALUE_TABLE}]`);
        const newId = (parseInt(maxRow?.maxId) || 0) + 1;

        await db(VALUE_TABLE).insert({
            id: newId,
            active: 1,
            type: body.type || 'Text',
            valuemn: (body.valuemn ?? '').toString(),
            valueen: (body.valueen ?? body.valuemn ?? '').toString(),
            classification_code_id: body.classification_code_id,
            meta_data_id: body.meta_data_id,
            questionpool_id: null,
            created_by: body.created_by || 'admin',
            created_date: db.fn.now(),
            deleted: null,
            last_modified_by: body.last_modified_by || 'admin',
            last_modified_date: db.fn.now(),
        });

        return NextResponse.json({
            status: true,
            data: { id: newId },
            message: 'Амжилттай нэмэгдлээ',
        });
    } catch (error) {
        console.error('Error creating general info:', error);
        return NextResponse.json(
            { status: false, message: 'Нэмэх үед алдаа гарлаа' },
            { status: 500 }
        );
    }
}

// Update a general-info value
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

        const updates = {
            valuemn: (body.valuemn ?? '').toString(),
            valueen: (body.valueen ?? '').toString(),
            last_modified_by: body.last_modified_by || 'admin',
            last_modified_date: db.fn.now(),
        };
        if (body.meta_data_id) updates.meta_data_id = body.meta_data_id;
        if (body.type) updates.type = body.type;

        await db(VALUE_TABLE).where({ id }).update(updates);

        return NextResponse.json({ status: true, message: 'Амжилттай шинэчлэгдлээ' });
    } catch (error) {
        console.error('Error updating general info:', error);
        return NextResponse.json(
            { status: false, message: 'Засварлах үед алдаа гарлаа' },
            { status: 500 }
        );
    }
}

// Soft delete a general-info value
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

        await db(VALUE_TABLE)
            .where({ id })
            .update({
                deleted: 1,
                active: 0,
                last_modified_by: 'admin',
                last_modified_date: db.fn.now(),
            });

        return NextResponse.json({ status: true, message: 'Амжилттай устгалаа' });
    } catch (error) {
        console.error('Error deleting general info:', error);
        return NextResponse.json(
            { status: false, message: 'Устгах үед алдаа гарлаа' },
            { status: 500 }
        );
    }
}
