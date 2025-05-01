import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import https from 'https';

const writeFile = promisify(fs.writeFile);

export async function POST(req) {
    try {
        const body = await req.json();
        const imageUrl = body.url;

        if (!imageUrl) {
            return NextResponse.json(
                { success: false, message: 'No image URL provided' },
                { status: 400 }
            );
        }

        const imageName = path.basename(new URL(imageUrl).pathname);
        const dirPath = path.join(process.cwd(), 'public', 'uploads', 'images');
        const localPath = path.join(dirPath, imageName);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const buffer = await new Promise((resolve, reject) => {
            https.get(imageUrl, (res) => {
                if (res.statusCode !== 200) {
                    return reject(new Error(`Download failed. Status: ${res.statusCode}`));
                }
                const data = [];
                res.on('data', (chunk) => data.push(chunk));
                res.on('end', () => resolve(Buffer.concat(data)));
                res.on('error', reject);
            }).on('error', reject);
        });

        await writeFile(localPath, buffer);

        return NextResponse.json({
            success: true,
            message: 'Image downloaded and saved.',
            filename: imageName,
            path: `/uploads/images/${imageName}`,
            fullUrl: `/uploads/images/${imageName}`,
        });
    } catch (err) {
        console.error('Download error:', err.message);
        return NextResponse.json(
            { success: false, message: 'Failed to download image', error: err.message },
            { status: 500 }
        );
    }
}
