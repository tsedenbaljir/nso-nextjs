import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'No file uploaded' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        // Generate timestamped filename
        const originalName = file.name || 'upload';
        const ext = path.extname(originalName);
        const baseName = path.basename(originalName, ext);
        const safeBaseName = baseName.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const timestamp = Date.now();
        const generatedName = `${safeBaseName}-${timestamp}${ext}`;
        const filePath = path.join(uploadDir, generatedName);

        // Write the file
        await writeFile(filePath, buffer);

        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully',
            url: `/uploads/${generatedName}`,
            path: `/uploads/${generatedName}`,
            fullUrl: `/uploads/${generatedName}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to upload file', error: error.message },
            { status: 500 }
        );
    }
}