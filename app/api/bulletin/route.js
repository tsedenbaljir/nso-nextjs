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
        // First, get the maximum ID from the table
        const [maxIdResult] = await db('web_1212_content')
            .max('id as maxId');

        const newId = (parseInt(maxIdResult.maxId) || 0) + 1;
        // Add the authenticated user's info to the article data
        const articleData = {
            id: newId,
            ...body
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

export async function PUT(req) {
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
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({
                status: false,
                message: "ID is required for update"
            }, { status: 400 });
        }

        // Update the article
        const result = await db('web_1212_content')
            .where('id', id)
            .update({
                ...updateData,
                last_modified_by: 'anonymousUser',
                last_modified_date: new Date().toISOString()
            });

        if (result === 0) {
            return NextResponse.json({
                status: false,
                message: "Article not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            status: true,
            data: result,
            message: "Article updated successfully"
        });

    } catch (error) {
        return NextResponse.json({
            status: false,
            message: "Failed to update article: " + error.message
        }, { status: 500 });
    }
}

export async function DELETE(req) {
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
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                status: false,
                message: "ID is required for deletion"
            }, { status: 400 });
        }

        // Delete the article
        const result = await db('web_1212_content')
            .where('id', id)
            .del();

        if (result === 0) {
            return NextResponse.json({
                status: false,
                message: "Article not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            status: true,
            data: result,
            message: "Article deleted successfully"
        });

    } catch (error) {
        return NextResponse.json({
            status: false,
            message: "Failed to delete article: " + error.message
        }, { status: 500 });
    }
}