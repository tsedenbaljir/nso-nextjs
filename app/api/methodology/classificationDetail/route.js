import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function POST(req) {
    try {
        const body = await req.json();
        const classification_code_id = parseInt(body.id, 10);

        if (!classification_code_id) {
            return NextResponse.json({
                status: false,
                message: "Missing or invalid classification_code_id"
            }, { status: 400 });
        }

        const subTitleQuery = `
            SELECT * 
            FROM classification_code
            WHERE is_current = 1 AND is_secure = 0 AND active = 1 AND deleted IS NULL AND id = ?
        `;
        const subTitleResults = await db.raw(subTitleQuery, [classification_code_id]);
        console.log("subTitleResults", subTitleResults);

        // sub_classification_code_SPS өгөгдлийг авах
        const subClassQuery = `
            SELECT [id], [namemn], [nameen], [code], [active], [status],
                [created_by], [created_date], [last_modified_by], [last_modified_date],
                [classification_code_id], [deleted], [app_order]
            FROM [NSOweb].[dbo].[sub_classification_code_SPS]
            WHERE classification_code_id = ?
        `;
        const subClassResults = await db.raw(subClassQuery, [classification_code_id]);
        console.log("subClassResults", subClassResults);
        
        // meta_data_value өгөгдлийг авах
        const metaQuery = `
            SELECT a.namemn, b.[active], b.[deleted], b.[status], b.[type], b.[last_modified_date],
            	CASE WHEN b.[type] = 'SingleSelect' THEN c.nameen ELSE b.[valueen] END AS [valueen], 
            	CASE WHEN b.[type] = 'SingleSelect' THEN c.namemn ELSE b.[valuemn] END AS [valuemn]
            FROM [NSOweb].[dbo].[meta_data] AS a
            INNER JOIN (
                SELECT 
                    [id], [active], [created_by], [created_date], [deleted], 
                    [last_modified_by], [last_modified_date], [questionnaire_code], 
                    [questionnaire_id], [status], [type], [valueen], [valuemn], 
                    [classification_code_id], [meta_data_id], [questionpool_id]
                FROM [NSOweb].[dbo].[meta_data_value]
                WHERE classification_code_id = ?
            ) AS b ON a.[id] = b.[meta_data_id]
            LEFT JOIN (
                SELECT 
                    [id], [namemn], [nameen], [code], [active], [status], 
                    [created_by], [created_date], [last_modified_by], 
                    [last_modified_date], [classification_code_id], [deleted], [app_order]
                FROM [NSOweb].[dbo].[sub_classification_code_SPS]
            ) AS c ON 
                b.[type] = 'SingleSelect' AND TRY_CAST(b.[valuemn] AS INT) = c.[id]
            ORDER BY b.[meta_data_id]
        `;
        const metaResults = await db.raw(metaQuery, [classification_code_id]);
        console.log("metaResults", metaResults);
        return NextResponse.json({
            status: true,
            data: {
                sub_classifications: subClassResults || [],
                meta_data_values: metaResults || [],
                sub_Title: subTitleResults || []
            },
            message: "Data retrieved successfully"
        });

    } catch (error) {
        console.error('Error fetching classification details:', error);
        return NextResponse.json({
            status: false,
            data: null,
            message: "Internal server error"
        }, { status: 500 });
    }
}
