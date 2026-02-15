import { NextResponse } from "next/server";
import { db } from '@/app/api/config/db_csweb.config';
import { getAllFileTypeIds } from '@/lib/file-library-ids';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch all files for admin (file_type stores sector id)
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const lng = searchParams.get("lng");
        const searchTerm = searchParams.get("searchTerm") || "";
        const type = searchParams.get("type");
        const published = searchParams.get("published");

        const typeIds = getAllFileTypeIds().map(String);
        const placeholders = typeIds.map(() => "?").join(", ");
        let query = `
            SELECT 
                id,
                name as title,
                language as lng,
                file_type as type,
                file_info,
                file_size as fileSize,
                views as downloads,
                published as isPublic,
                published_date as createdDate,
                created_by,
                created_date,
                last_modified_by,
                last_modified_date,
                info as description
            FROM web_1212_download 
            WHERE file_type IN (${placeholders})
        `;
        const params = [...typeIds];

        if (lng) {
            query += " AND language = ?";
            params.push(lng);
        }

        if (searchTerm) {
            query += " AND (name LIKE ? OR info LIKE ? OR file_type LIKE ?)";
            const searchPattern = `%${searchTerm}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        if (type) {
            query += " AND file_type = ?";
            params.push(type);
        }

        if (published !== null && published !== undefined && published !== '') {
            query += " AND published = ?";
            params.push(parseInt(published));
        }

        query += " ORDER BY published_date DESC";

        // Get all results without pagination
        const result = await db.raw(query, params);
        
        // Ensure we always return an array
        let files = [];
        if (result && result[0] && Array.isArray(result[0])) {
            files = result[0];
        } else if (result && Array.isArray(result)) {
            files = result;
        } else if (result && result[0]) {
            files = [result[0]];
        }

        const total = files.length;

        return NextResponse.json({
            success: true,
            data: files,
        });
    } catch (error) {
        console.error("Error fetching files:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch files" },
            { status: 500 }
        );
    }
}

// POST - Create new file
export async function POST(req) {
    try {
        const body = await req.json();
        const {
            title,
            description,
            type,
            isPublic,
            lng,
            fileInfo,
        } = body;

        // Validate required fields
        if (!title || !type || !lng) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // First, get the next available ID
        const [nextId] = await db.raw("SELECT max(id) as nextId FROM web_1212_download");
        
        const insertResult = await db("web_1212_download").insert({
            id: parseInt(nextId.nextId) + 1 || 1,
            name: title,
            info: description,
            file_type: type,
            language: lng,
            file_info: fileInfo ? JSON.stringify(fileInfo) : null,
            file_size: parseInt(fileInfo?.fileSize || 0),
            views: 0,
            published: isPublic === true ? 1 : 0,
            published_date: new Date(),
            created_by: "admin",
            created_date: new Date(),
            last_modified_by: "admin",
            last_modified_date: new Date(),
        });

        const newFileId = insertResult[0];

        return NextResponse.json({
            success: true,
            data: { id: newFileId },
            message: "File created successfully",
        });
    } catch (error) {
        console.error("Error creating file:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create file" },
            { status: 500 }
        );
    }
}

// PUT - Update file
export async function PUT(req) {
    try {
        const body = await req.json();
        const {
            id,
            title,
            description,
            type,
            lng,
            isPublic,
            fileInfo,
        } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: "File ID is required" },
                { status: 400 }
            );
        }

        const updateData = {
            name: title,
            info: description,
            file_type: type,
            language: lng,
            published: isPublic === true ? 1 : 0,
            last_modified_by: "admin",
            last_modified_date: new Date(),
        };

        // If new file info is provided, update it
        if (fileInfo) {
            updateData.file_info = JSON.stringify(fileInfo);
            updateData.file_size = parseInt(fileInfo.fileSize || 0);
        }

        // Remove undefined values
        Object.keys(updateData).forEach(key =>
            updateData[key] === undefined && delete updateData[key]
        );

        await db("web_1212_download")
            .where({ id })
            .update(updateData);

        return NextResponse.json({
            success: true,
            message: "File updated successfully",
        });
    } catch (error) {
        console.error("Error updating file:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update file" },
            { status: 500 }
        );
    }
}

// DELETE - Delete file
export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "File ID is required" },
                { status: 400 }
            );
        }

        await db("web_1212_download").where({ id }).del();

        return NextResponse.json({
            success: true,
            message: "File deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete file" },
            { status: 500 }
        );
    }
}
