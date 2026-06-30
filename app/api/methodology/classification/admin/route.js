import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';
import { requireAdminApi } from '@/app/api/auth/adminAuth';

export const dynamic = 'force-dynamic';

const TABLE = 'classification_code';

// List (paginated) or fetch single by id
export async function GET(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '0', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search') || '';
    const offset = page * pageSize;

    try {
        if (id) {
            const data = await db(TABLE).where({ id }).first();
            if (!data) {
                return NextResponse.json(
                    { status: false, message: 'Classification not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json({ status: true, data, message: '' });
        }

        const baseQuery = db(TABLE).whereNull('deleted');
        if (search) {
            baseQuery.where((qb) => {
                qb.where('namemn', 'like', `%${search}%`)
                    .orWhere('nameen', 'like', `%${search}%`)
                    .orWhere('code', 'like', `%${search}%`);
            });
        }

        const [{ count }] = await baseQuery.clone().count('id as count');

        const data = await baseQuery
            .clone()
            .orderBy('id')
            .offset(offset)
            .limit(pageSize);

        return NextResponse.json({
            status: true,
            data,
            pagination: {
                page,
                pageSize,
                total: parseInt(count, 10) || 0,
            },
            message: '',
        });
    } catch (error) {
        console.error('Error fetching classification (admin):', error);
        return NextResponse.json(
            { status: false, message: 'Failed to fetch classification' },
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

        const [maxRow] = await db.raw(`SELECT MAX(id) as maxId FROM [NSOweb].[dbo].[${TABLE}]`);
        const newId = (parseInt(maxRow?.maxId) || 0) + 1;

        await db(TABLE).insert({
            id: newId,
            namemn: body.namemn,
            nameen: body.nameen,
            descriptionmn: body.descriptionmn || null,
            descriptionen: body.descriptionen || null,
            code: body.code || null,
            is_current: body.is_current ?? 1,
            is_secure: body.is_secure ?? 0,
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
        console.error('Error creating classification:', error);
        return NextResponse.json(
            { status: false, message: 'Бичлэг нэмэх үед алдаа гарлаа' },
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
                descriptionmn: body.descriptionmn || null,
                descriptionen: body.descriptionen || null,
                code: body.code || null,
                is_current: body.is_current ?? 1,
                is_secure: body.is_secure ?? 0,
                active: body.active ?? 1,
                status: body.status ?? 'A',
                last_modified_by: body.last_modified_by || 'admin',
                last_modified_date: db.fn.now(),
            });

        return NextResponse.json({
            status: true,
            message: 'Амжилттай шинэчлэгдлээ',
        });
    } catch (error) {
        console.error('Error updating classification:', error);
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

        return NextResponse.json({
            status: true,
            message: 'Амжилттай устгалаа',
        });
    } catch (error) {
        console.error('Error deleting classification:', error);
        return NextResponse.json(
            { status: false, message: 'Устгах үед алдаа гарлаа' },
            { status: 500 }
        );
    }
}
