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
        const timestamp = Date.now();

        const filePath = path.join(uploadDir, `${timestamp}-${file.name}`);

        // Write the file
        await writeFile(filePath, buffer);

        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully',
            filename: `${timestamp}-${file.name}`,
            url: `/uploads/${timestamp}-${file.name}`,
            path: `/uploads/${timestamp}-${file.name}`,
            fullUrl: `/uploads/${timestamp}-${file.name}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to upload file', error: error.message },
            { status: 500 }
        );
    }
}