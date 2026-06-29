import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

import { checkAdminAuth, requireAdminApi } from '@/app/api/auth/adminAuth';
export async function GET(req, props) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    const params = await props.params;
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language') || 'mn';

    try {
        const result = await db('job_posting')
            .select('*')
            .where({ id, language })
            .first();

        if (!result) {
            return NextResponse.json({
                status: false,
                data: null,
                message: "Мэдээлэл олдсонгүй"
            }, { status: 404 });
        }

        return NextResponse.json({
            status: true,
            data: result,
            message: ""
        });

    } catch (error) {
        console.error('Error fetching job posting:', error);
        return NextResponse.json(
            {
                status: false,
                data: null,
                message: "Ажлын байрны мэдээлэл татахад алдаа гарлаа"
            },
            { status: 500 }
        );
    }
}

export async function PUT(req, props) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    const params = await props.params;
    const { id } = params;

    try {
        const auth = await checkAdminAuth(req);
        const data = await req.json();
        
        // Update last_modified_date and last_modified_by
        const updateData = {
            ...data,
            last_modified_date: new Date().toISOString(),
            last_modified_by: auth.user.name
        };

        await db('job_posting')
            .where({ id })
            .update(updateData);

        return NextResponse.json({
            status: true,
            message: "Ажлын байр амжилттай шинэчлэгдлээ"
        });

    } catch (error) {
        console.error('Error updating job posting:', error);
        return NextResponse.json(
            {
                status: false,
                message: "Ажлын байр шинэчлэхэд алдаа гарлаа: " + error.message
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req, props) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    const params = await props.params;
    const { id } = params;

    try {
        await checkAdminAuth(req);

        await db('job_posting')
            .where({ id })
            .delete();

        return NextResponse.json({
            status: true,
            message: "Ажлын байр амжилттай устгагдлаа"
        });

    } catch (error) {
        console.error('Error deleting job posting:', error);
        return NextResponse.json(
            {
                status: false,
                message: "Ажлын байр устгахад алдаа гарлаа: " + error.message
            },
            { status: 500 }
        );
    }
} 