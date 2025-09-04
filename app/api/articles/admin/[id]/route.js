import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';
import { checkAdminAuth } from '@/app/api/auth/adminAuth';

export async function DELETE(req, { params }) {
    // Check authentication
    // const auth = await checkAdminAuth(req);
    // if (!auth.isAuthenticated) {
    //     return NextResponse.json({
    //         status: false,
    //         message: auth.error
    //     }, { status: 401 });
    // }

    try {
        await db('web_1212_content')
            .where('id', params.id)
            .delete();

        return NextResponse.json({
            status: true,
            message: "Article deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting article:', error);
        return NextResponse.json({
            status: false,
            message: "Failed to delete article: " + error.message
        }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    // Check authentication
    // const auth = await checkAdminAuth(req);
    // if (!auth.isAuthenticated) {
    //     return NextResponse.json({
    //         status: false,
    //         message: auth.error
    //     }, { status: 401 });
    // }

    try {
        const body = await req.json();
        
        // Prepare update data with audit fields
        const updateData = {
            name: body.name,
            body: body.body,
            language: body.language,
            published: body.published,
            news_type: body.news_type,
            published_date: body.published_date,
            header_image: body.header_image,
            last_modified_date: new Date().toISOString(),
            last_modified_by: auth.user.name // Use authenticated user's ID
        };

        // Update the article
        await db('web_1212_content')
            .where('id', params.id)
            .update(updateData);

        // Fetch the updated article
        const updatedArticle = await db('web_1212_content')
            .where('id', params.id)
            .first();

        return NextResponse.json({
            status: true,
            data: updatedArticle,
            message: "Article updated successfully"
        });

    } catch (error) {
        console.error('Error updating article:', error);
        return NextResponse.json({
            status: false,
            message: "Failed to update article: " + error.message
        }, { status: 500 });
    }
}

// Add GET endpoint for fetching single article
export async function GET(req, { params }) {
    // Check authentication
    const auth = await checkAdminAuth(req);
    if (!auth.isAuthenticated) {
        return NextResponse.json({
            status: false,
            message: auth.error
        }, { status: 401 });
    }

    try {
        const article = await db('web_1212_content')
            .where('id', params.id)
            .first();

        if (!article) {
            return NextResponse.json({
                status: false,
                message: "Article not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            status: true,
            data: article,
            message: ""
        });

    } catch (error) {
        console.error('Error fetching article:', error);
        return NextResponse.json({
            status: false,
            message: "Failed to fetch article: " + error.message
        }, { status: 500 });
    }
} 