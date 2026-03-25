import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';
import { checkAdminAuth } from '@/app/api/auth/adminAuth';

export async function GET(req) {
    // Check authentication
    // const auth = await checkAdminAuth(req);
    
    // if (!auth.isAuthenticated) {
    //     return NextResponse.json({
    //         status: false,
    //         message: auth.error
    //     }, { status: 401 });
    // }

    try {
        const results = await db('web_1212_methodology')
            .select('*')
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
        
        // Get the next available ID
        const [nextId] = await db.raw("SELECT max(id) as nextId FROM web_1212_methodology");
        
        // Add the authenticated user's info to the article data
        const articleData = {
            id: parseInt(nextId.nextId) + 1 || 1,
            ...body,
            created_by: auth?.user?.name || "admin",
            last_modified_by: auth?.user?.name || "admin"
        };

        const result = await db('web_1212_methodology').insert(articleData);

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
        const body = await req.json();
        const id = body.id;

        if (!id) {
            return NextResponse.json({
                status: false,
                message: "Methodology ID is required"
            }, { status: 400 });
        }

        const result = await db('web_1212_methodology')
            .where({ id: parseInt(id) })
            .del();

        if (result === 0) {
            return NextResponse.json({
                status: false,
                message: "Methodology not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            status: true,
            message: "Methodology deleted successfully"
        });

    } catch (error) {
        return NextResponse.json({
            status: false,
            message: "Failed to delete methodology: " + error.message
        }, { status: 500 });
    }
}