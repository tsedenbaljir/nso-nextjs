import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: "No file received." },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Get file extension
        const originalName = file.name;
        const extension = path.extname(originalName);

        // Create unique filename
        const timestamp = Date.now();
        const fileName = `${timestamp}${extension}`;

        // Define path to save file
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const filePath = path.join(uploadDir, fileName);

        // Write the file
        await writeFile(filePath, buffer);

        // Return the file information
        return NextResponse.json({
            message: 'File uploaded successfully',
            fileName: fileName,
            filePath: `${fileName}`,
            url: `${fileName}`
        }, { status: 200 });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
