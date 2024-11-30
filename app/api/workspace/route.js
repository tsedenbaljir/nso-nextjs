import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '5', 10);
    const language = searchParams.get('language') || 'mn';
    const sort = searchParams.get('sort') || 'created_date';
    const sortDirection = searchParams.get('sortDirection') || 'desc';

    try {
        // Calculate offset for pagination
        const offset = (page - 1) * pageSize;

        // Build base query
        let query = db('job_posting')
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
            .where('language', language);

        // Get total count
        const [{ total }] = await db('job_posting')
            .count('* as total')
            .where('language', language);

        // Add sorting and pagination
        const results = await query
            .orderBy(sort, sortDirection)
            .offset(offset)
            .limit(pageSize);

        // Format response with pagination info
        return NextResponse.json({
            status: true,
            data: results,
            pagination: {
                page,
                pageSize,
                total: parseInt(total || '0', 10),
                totalPages: Math.ceil(total / pageSize)
            },
            message: ""
        });

    } catch (error) {
        console.error('Error fetching job postings:', error);
        return NextResponse.json(
            {
                status: false,
                data: null,
                pagination: {
                    page,
                    pageSize,
                    total: 0,
                    totalPages: 0
                },
                message: "Ажлын байрны мэдээлэл татахад алдаа гарлаа"
            },
            { status: 500 }
        );
    }
} 