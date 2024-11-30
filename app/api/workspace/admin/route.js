import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';
import { checkAdminAuth } from '@/app/api/auth/adminAuth';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language') || 'mn';

    try {
        const results = await db('job_posting')
            .select('*')
            .where('language', language)
            .orderBy('created_date', 'desc');

        return NextResponse.json({
            status: true,
            data: results,
            message: ""
        });

    } catch (error) {
        console.error('Error fetching job postings:', error);
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

export async function POST(req) {
    try {
        const auth = await checkAdminAuth(req);
        if (!auth.isAuthenticated) {
            return NextResponse.json(
                {
                    status: false,
                    message: auth.message
                },
                { status: 401 }
            );
        }

        const data = await req.json();
        const userName = auth.user?.name;
        
        if (!userName) {
            return NextResponse.json(
                {
                    status: false,
                    message: "Хэрэглэгч олдсонгүй"
                },
                { status: 400 }
            );
        }

        // Add created_date and other metadata
        const now = new Date().toISOString();
        const jobData = {
            name: data.name,
            body: data.body,
            location: data.location,
            language: data.language,
            created_date: now,
            last_modified_date: now,
            created_by: userName,
            last_modified_by: userName,
            views: 0
        };

        const [id] = await db('job_posting').insert([jobData]);

        return NextResponse.json({
            status: true,
            data: { id },
            message: "Ажлын байр амжилттай нэмэгдлээ"
        });

    } catch (error) {
        console.error('Error creating job posting:', error);
        return NextResponse.json(
            {
                status: false,
                data: null,
                message: "Ажлын байр нэмэхэд алдаа гарлаа: " + error.message
            },
            { status: 500 }
        );
    }
} 