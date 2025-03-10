import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';


export async function POST(req) {
    const {id} = await req.json();

    try {
        const selectQuery = `
            SELECT 
                m.[id],
                m.[code],
                m.[active],
                mdv.[valueen] AS dataValueEn,
                mdv.[valuemn] AS dataValueMn,
                m.[nameen],
                m.[namemn],
                m.[data_value] AS dataValueIdEn,
                m.[data_value] AS dataValueIdMn
            FROM 
                [meta_data] m
            JOIN 
                [meta_data_value] mdv ON m.id = mdv.meta_data_id
            WHERE 
                mdv.questionpool_id = ${id}
        `;
        
        const result = await db.raw(selectQuery);

        return new Response(
            JSON.stringify({
                status: true,
                data: result,
                message: "Data fetched successfully"
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error inserting data:', error);
        return new Response(
            JSON.stringify({
                status: false,
                message: "Failed to insert data",
                error: error.message
            }),
            { status: 500 }
        );
    }
}