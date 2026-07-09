import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { db } from '@/app/api/config/db_csweb.config.js';
import { requireAdminApi } from '@/app/api/auth/adminAuth';

export const dynamic = 'force-dynamic';

const TABLE = 'classification_code';
const ALLOWED_EXT = new Set(['xlsx', 'xls']);

function parseFileInfo(raw) {
    if (!raw) return null;
    try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
        return null;
    }
}

function resolveUploadPath(fileInfo) {
    if (!fileInfo?.pathName) return null;
    const relative = String(fileInfo.pathName).replace(/^\/+/, '').replace(/^uploads\//, '');
    return path.join(process.cwd(), 'public', 'uploads', relative);
}

// Upload Excel for a classification
export async function POST(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const id = formData.get('id');

        if (!id) {
            return NextResponse.json(
                { status: false, message: 'ID is required' },
                { status: 400 }
            );
        }

        if (!file || typeof file === 'string') {
            return NextResponse.json(
                { status: false, message: 'Excel файл сонгоно уу' },
                { status: 400 }
            );
        }

        const originalName = file.name || 'classification.xlsx';
        const extension = originalName.split('.').pop()?.toLowerCase() || '';
        if (!ALLOWED_EXT.has(extension)) {
            return NextResponse.json(
                { status: false, message: 'Зөвхөн .xlsx эсвэл .xls файл оруулна уу' },
                { status: 400 }
            );
        }

        const existing = await db(TABLE).where({ id }).first();
        if (!existing) {
            return NextResponse.json(
                { status: false, message: 'Classification not found' },
                { status: 404 }
            );
        }

        const oldInfo = parseFileInfo(existing.file_info);
        if (oldInfo) {
            const oldPath = resolveUploadPath(oldInfo);
            if (oldPath && existsSync(oldPath)) {
                try {
                    await unlink(oldPath);
                } catch (e) {
                    console.warn('Could not remove old classification file:', e.message);
                }
            }
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const storedName = `${Date.now()}-${originalName.replace(/[^\w.\-()+\sа-яА-ЯөүёӨҮЁ]/g, '_')}`;
        const filePath = path.join(uploadDir, storedName);
        await writeFile(filePath, buffer);

        const fileInfo = {
            originalName,
            pathName: storedName,
            fileSize: file.size || buffer.length,
            extension,
            mediaType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            downloads: 0,
            isPublic: true,
            createdDate: new Date().toISOString(),
        };

        await db(TABLE)
            .where({ id })
            .update({
                file_info: JSON.stringify(fileInfo),
                last_modified_by: 'admin',
                last_modified_date: db.fn.now(),
            });

        return NextResponse.json({
            status: true,
            data: fileInfo,
            message: 'Excel файл амжилттай хадгаллаа',
        });
    } catch (error) {
        console.error('Error uploading classification excel:', error);
        return NextResponse.json(
            { status: false, message: 'Файл хуулахад алдаа гарлаа' },
            { status: 500 }
        );
    }
}

// Remove uploaded Excel
export async function DELETE(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { status: false, message: 'ID is required' },
                { status: 400 }
            );
        }

        const existing = await db(TABLE).where({ id }).first();
        if (!existing) {
            return NextResponse.json(
                { status: false, message: 'Classification not found' },
                { status: 404 }
            );
        }

        const fileInfo = parseFileInfo(existing.file_info);
        if (fileInfo) {
            const filePath = resolveUploadPath(fileInfo);
            if (filePath && existsSync(filePath)) {
                try {
                    await unlink(filePath);
                } catch (e) {
                    console.warn('Could not remove classification file:', e.message);
                }
            }
        }

        await db(TABLE)
            .where({ id })
            .update({
                file_info: null,
                last_modified_by: 'admin',
                last_modified_date: db.fn.now(),
            });

        return NextResponse.json({
            status: true,
            message: 'Файл амжилттай устгалаа',
        });
    } catch (error) {
        console.error('Error deleting classification excel:', error);
        return NextResponse.json(
            { status: false, message: 'Файл устгахад алдаа гарлаа' },
            { status: 500 }
        );
    }
}
