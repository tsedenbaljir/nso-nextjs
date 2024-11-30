import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req, { params }) {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language') || 'mn';

    try {
        // Get the job posting
        const result = await db('job_posting')
            .select(
                'id',
                'name',
                'body',
                'file_name',
                'file_size',
                'views',
                'location',
                'created_by',
                'created_date',
                'last_modified_by',
                'last_modified_date',
                'language'
            )
            .where({ id, language })
            .first();

        if (!result) {
            return NextResponse.json({
                status: false,
                data: null,
                message: "Мэдээлэл олдсонгүй"
            }, { status: 404 });
        }

        // Update views count
        await db('job_posting')
            .where({ id })
            .increment('views', 1);

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
                message: "Ажлын байрны дэлгэрэнгүй мэдээлэл татахад алдаа гарлаа"
            },
            { status: 500 }
        );
    }
} 