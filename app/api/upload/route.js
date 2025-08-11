import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Configuration
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

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

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, message: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { success: false, message: 'File type not allowed' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename to prevent conflicts
        const fileExtension = path.extname(file.name);
        const uniqueName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;

        // Use environment variable for upload path or default to public/uploads
        const uploadBase = process.env.UPLOAD_PATH || path.join(process.cwd(), 'public', 'uploads');
        const uploadDir = path.join(uploadBase, new Date().getFullYear().toString(), new Date().getMonth().toString().padStart(2, '0'));
        const filePath = path.join(uploadDir, uniqueName);

        // Create directory structure if it doesn't exist
        await mkdir(uploadDir, { recursive: true });

        // Write the file
        await writeFile(filePath, buffer);

        // Return relative path for database storage
        const relativePath = path.relative(path.join(process.cwd(), 'public'), filePath);

        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully',
            filename: uniqueName,
            originalName: file.name,
            path: `/${relativePath.replace(/\\/g, '/')}`,
            url: `/${relativePath.replace(/\\/g, '/')}`, // Backward compatibility
            fullUrl: `/${relativePath.replace(/\\/g, '/')}`, // Additional compatibility
            size: file.size,
            type: file.type
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to upload file', error: error.message },
            { status: 500 }
        );
    }
}