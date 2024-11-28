import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Use synchronous file operations instead of promises
export async function POST(req) {
    try {
        const data = await req.formData();
        const file = data.get('file');

        if (!file) {
            return NextResponse.json({ 
                success: false, 
                message: "No file received." 
            }, { 
                status: 400 
            });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const originalName = file.name;
        const extension = path.extname(originalName);
        const fileName = `${timestamp}${extension}`;

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Write file synchronously
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);

        // Return success response
        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully',
            fileName: fileName,
            filePath: `${fileName}`,
            url: `${fileName}`
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ 
            success: false, 
            message: "Error uploading file." 
        }, { 
            status: 500 
        });
    }
}