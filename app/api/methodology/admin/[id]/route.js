import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';
import { checkAdminAuth } from '@/app/api/auth/adminAuth';

export async function DELETE(req, { params }) {
    // Check authentication
    const auth = await checkAdminAuth(req);
    if (!auth.isAuthenticated) {
        return NextResponse.json({
            status: false,
            message: auth.error
        }, { status: 401 });
    }

    try {
        const result = await db('web_1212_methodology')
            .where('id', params.id)
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
        console.error('Error deleting methodology:', error);
        return NextResponse.json({
            status: false,
            message: "Failed to delete methodology: " + error.message
        }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
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
        
        // Prepare update data with audit fields
        const updateData = {
            name: body.name,
            language: body.language,
            published: body.published,
            catalogue_id: body.catalogue_id,
            sector_type: body.sector_type,
            file_info: body.file_info,
            approved_date: body.approved_date,
            last_modified_date: new Date().toISOString(),
            last_modified_by: auth.user.name
        };

        // Remove undefined values
        Object.keys(updateData).forEach(key =>
            updateData[key] === undefined && delete updateData[key]
        );

        // Update the methodology
        const result = await db('web_1212_methodology')
            .where('id', params.id)
            .update(updateData);

        if (result === 0) {
            return NextResponse.json({
                status: false,
                message: "Methodology not found"
            }, { status: 404 });
        }

        // Fetch the updated methodology
        const updatedMethodology = await db('web_1212_methodology')
            .where('id', params.id)
            .first();

        return NextResponse.json({
            status: true,
            data: updatedMethodology,
            message: "Methodology updated successfully"
        });

    } catch (error) {
        console.error('Error updating methodology:', error);
        return NextResponse.json({
            status: false,
            message: "Failed to update methodology: " + error.message
        }, { status: 500 });
    }
}

export async function GET(req, { params }) {
    // Check authentication
    // const auth = await checkAdminAuth(req);
    // if (!auth.isAuthenticated) {
    //     return NextResponse.json({
    //         status: false,
    //         message: auth.error
    //     }, { status: 401 });
    // }

    try {
        const methodology = await db('web_1212_methodology')
            .where('id', params.id)
            .first();

        if (!methodology) {
            return NextResponse.json({
                status: false,
                message: "Methodology not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            status: true,
            data: methodology,
            message: ""
        });

    } catch (error) {
        console.error('Error fetching methodology:', error);
        return NextResponse.json({
            status: false,
            message: "Failed to fetch methodology: " + error.message
        }, { status: 500 });
    }
} 