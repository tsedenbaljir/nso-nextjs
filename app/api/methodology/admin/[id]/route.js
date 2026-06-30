import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

import { requireAdminApi } from '@/app/api/auth/adminAuth';
export async function DELETE(req, props) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    const params = await props.params;
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