import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';
import { getAllFileTypeIds } from '@/lib/file-library-ids';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const lng = searchParams.get('lng');
    const type = searchParams.get('type');
    const sub = searchParams.get('sub');
    const searchTerm = searchParams.get('searchTerm');

    try {
        let baseQuery = `
            SELECT * FROM web_1212_download
            WHERE language = ?
            AND published = 1
        `;
        const queryParams = [lng];

        if (type === "all" || type === "0") {
            const ids = getAllFileTypeIds().map(String);
            const placeholders = ids.map(() => "?").join(", ");
            baseQuery += ` AND file_type IN (${placeholders})`;
            queryParams.push(...ids);
        } else {
            baseQuery += ` AND file_type = ?`;
            queryParams.push(String(type));
        }

        if (sub?.trim()) {
            const subVal = sub.trim();
            const safeVal = subVal.replace(/["%_]/g, ""); // safe for LIKE and JSON pattern
            baseQuery += ` AND (
                JSON_VALUE(CAST(file_info AS NVARCHAR(MAX)), '$.sub') = ?
                OR JSON_VALUE(CAST(file_info AS NVARCHAR(MAX)), '$.subYear') = ?
                OR (file_info IS NOT NULL AND (file_info LIKE ? OR file_info LIKE ?))
            )`;
            const likeSubYear = `%"subYear":"${safeVal}"%`;
            const likeSub = `%"sub":"${safeVal}"%`;
            queryParams.push(subVal, subVal, likeSubYear, likeSub);
        }

        if (searchTerm?.trim()) {
            baseQuery += ` AND name LIKE ?`;
            queryParams.push(`%${searchTerm.trim()}%`);
        }

        baseQuery += ` ORDER BY published_date DESC`;

        const raw = await db.raw(baseQuery, queryParams);
        let data = [];
        if (raw?.[0] && Array.isArray(raw[0])) {
            data = raw[0];
        } else if (Array.isArray(raw)) {
            data = raw;
        } else if (raw?.[0]) {
            data = [raw[0]];
        }

        return NextResponse.json({
            status: true,
            data,
            message: ""
        });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({
            status: false,
            data: null,
            message: "Internal server error"
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { id } = body;

        if (id == null || id === "") {
            return NextResponse.json(
                { status: false, message: "id is required" },
                { status: 400 }
            );
        }

        // Update view count when user views/downloads the file (save the hit)
        const raw = await db.raw(
            `UPDATE web_1212_download 
             SET views = COALESCE(CAST(views AS INT), 0) + 1 
             WHERE id = ?`,
            [id]
        );
        const result = Array.isArray(raw) ? raw[0] : raw;
        const affected = result?.affectedRows ?? result?.rowCount ?? 0;

        return NextResponse.json({
            status: true,
            message: affected ? "Saved" : "No record updated",
        });
    } catch (error) {
        console.error("Error saving view count:", error);
        return NextResponse.json(
            { status: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
