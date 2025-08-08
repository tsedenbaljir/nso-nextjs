import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';
import { checkAdminAuth } from '@/app/api/auth/adminAuth';

export const dynamic = "force-dynamic";
export async function GET(req) {
    // Check authentication
    const auth = await checkAdminAuth(req);
    
    if (!auth.isAuthenticated) {
        return NextResponse.json({
            status: false,
            message: auth.error
        }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 0;
        const pageSize = parseInt(searchParams.get('pageSize')) || 10;
        const offset = page * pageSize;

        // Get total count
        const totalCount = await db('web_1212_content')
            .where('content_type', 'NSONEWS')
            .whereIn('news_type', ['FUTURE'])
            .count('* as total')
            .first();

        // Get paginated results
        const results = await db('web_1212_content')
            .select('*')
            .where('content_type', 'NSONEWS')
            .whereIn('news_type', ['FUTURE'])
            .orderBy('created_date', 'desc')
            .limit(pageSize)
            .offset(offset);
        
        return NextResponse.json({
            status: true,
            data: results,
            pagination: {
                total: totalCount.total,
                page: page + 1,
                pageSize: pageSize,
                totalPages: Math.ceil(totalCount.total / pageSize)
            },
            message: ""
        });

    } catch (error) {
        return NextResponse.json({
            status: false,
            data: null,
            message: "Failed to fetch articles: " + error.message
        }, { status: 500 });
    }
}

export async function POST(req) {
    // Check authentication
    const auth = await checkAdminAuth(req);
    
    if (!auth.isAuthenticated) {
        return NextResponse.json({
            status: false,
            message: auth.error
        }, { status: 401 });
    }

    try {
        const body = await req.json();
        
        // Add the authenticated user's info to the article data
        const articleData = {
            ...body,
            created_by: auth.user.name,
            last_modified_by: auth.user.name
        };

        const result = await db('web_1212_content').insert(articleData);

        return NextResponse.json({
            status: true,
            data: result,
            message: "Article created successfully"
        });

    } catch (error) {
        return NextResponse.json({
            status: false,
            message: "Failed to create article: " + error.message
        }, { status: 500 });
    }
}