import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req, { params }) {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language') || 'mn';
    console.log("hii");

    try {
        // Get the job posting
        const result = await db('vw_question_pool_value')
            .select(
                'id',
                'labelmn',
                'labelen',
                'namemn',
                'nameen',
                'last_modified_date',
                'descriptionen',
                'descriptionmn',
                'is_secure',
                'valuemn',
                'valueen',
                'active'
            )
            .where({ id })
            // .first();

        if (!result) {
            return NextResponse.json({
                status: false,
                data: null,
                message: "Мэдээлэл олдсонгүй"
            }, { status: 404 });
        }

        // await db('job_posting')
        //     .where({ id })
        //     .increment('views', 1);

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
                message: "Мета мэдээллийн дэлгэрэнгүй мэдээлэл татахад алдаа гарлаа"
            },
            { status: 500 }
        );
    }
} 