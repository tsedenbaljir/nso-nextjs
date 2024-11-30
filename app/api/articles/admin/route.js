import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';
import { checkAdminAuth } from '@/app/api/auth/adminAuth';

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
        const results = await db('web_1212_content')
            .select('*')
            .where('content_type', 'NSONEWS')
            .whereIn('news_type', ['LATEST', 'MEDIA', 'TENDER', 'TRANNEWS'])
            .orderBy('created_date', 'desc');

        return NextResponse.json({
            status: true,
            data: results,
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