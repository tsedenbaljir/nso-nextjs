import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { db } from '@/app/api/config/db_csweb.config.js';
import { requireAdminApi } from '@/app/api/auth/adminAuth';

export const dynamic = 'force-dynamic';

const TABLE = 'classification_code';

const ALLOWED = {
    excel: {
        ext: new Set(['xlsx', 'xls']),
        message: 'Зөвхөн .xlsx эсвэл .xls файл оруулна уу',
        defaultMedia: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        success: 'Excel файл амжилттай хадгаллаа',
    },
    pdf: {
        ext: new Set(['pdf']),
        message: 'Зөвхөн .pdf файл оруулна уу',
        defaultMedia: 'application/pdf',
        success: 'PDF файл амжилттай хадгаллаа',
    },
    tushaal: {
        // Тушаал: common document types
        ext: new Set(['pdf', 'doc', 'docx', 'xlsx', 'xls', 'jpg', 'jpeg', 'png']),
        message: 'Тушаалын файлын төрөл зөвшөөрөгдөөгүй (pdf, doc, docx, xlsx гэх мэт)',
        defaultMedia: 'application/octet-stream',
        success: 'Тушаалын файл амжилттай хадгаллаа',
    },
};

function parseFileInfo(raw) {
    if (!raw) return null;
    try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
        return null;
    }
}

/** Support legacy single excel object and { excel, pdf, tushaal } */
function normalizeFilesBundle(raw) {
    const empty = { excel: null, pdf: null, tushaal: null };
    const parsed = parseFileInfo(raw);
    if (!parsed) return empty;

    if (
        parsed.excel !== undefined ||
        parsed.pdf !== undefined ||
        parsed.tushaal !== undefined
    ) {
        return {
            excel: parsed.excel || null,
            pdf: parsed.pdf || null,
            tushaal: parsed.tushaal || null,
        };
    }
    // Legacy: single excel at root
    if (parsed.pathName) {
        return { excel: parsed, pdf: null, tushaal: null };
    }
    return empty;
}

function resolveUploadPath(fileInfo) {
    if (!fileInfo?.pathName) return null;
    const relative = String(fileInfo.pathName).replace(/^\/+/, '').replace(/^uploads\//, '');
    return path.join(process.cwd(), 'public', 'uploads', relative);
}

async function removeFileIfExists(fileInfo) {
    const filePath = resolveUploadPath(fileInfo);
    if (filePath && existsSync(filePath)) {
        try {
            await unlink(filePath);
        } catch (e) {
            console.warn('Could not remove classification file:', e.message);
        }
    }
}

function normalizeType(type) {
    const t = String(type || 'excel').toLowerCase();
    if (t === 'pdf' || t === 'excel' || t === 'tushaal') return t;
    return null;
}

// Upload: formData.file, formData.id, formData.type = excel|pdf|tushaal
export async function POST(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const id = formData.get('id');
        const type = normalizeType(formData.get('type'));

        if (!id) {
            return NextResponse.json(
                { status: false, message: 'ID is required' },
                { status: 400 }
            );
        }

        if (!type) {
            return NextResponse.json(
                { status: false, message: 'type must be excel, pdf, or tushaal' },
                { status: 400 }
            );
        }

        if (!file || typeof file === 'string') {
            return NextResponse.json(
                { status: false, message: 'Файл сонгоно уу' },
                { status: 400 }
            );
        }

        const rule = ALLOWED[type];
        const originalName = file.name || `classification-${type}`;
        const extension = originalName.split('.').pop()?.toLowerCase() || '';
        if (!rule.ext.has(extension)) {
            return NextResponse.json(
                { status: false, message: rule.message },
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

        const bundle = normalizeFilesBundle(existing.file_info);
        if (bundle[type]) {
            await removeFileIfExists(bundle[type]);
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
            mediaType: file.type || rule.defaultMedia,
            downloads: 0,
            isPublic: true,
            createdDate: new Date().toISOString(),
            kind: type,
        };

        bundle[type] = fileInfo;

        await db(TABLE)
            .where({ id })
            .update({
                file_info: JSON.stringify(bundle),
                last_modified_by: 'admin',
                last_modified_date: db.fn.now(),
            });

        return NextResponse.json({
            status: true,
            data: fileInfo,
            files: bundle,
            message: rule.success,
        });
    } catch (error) {
        console.error('Error uploading classification file:', error);
        return NextResponse.json(
            { status: false, message: 'Файл хуулахад алдаа гарлаа' },
            { status: 500 }
        );
    }
}

// Remove: ?id=&type=excel|pdf|tushaal
export async function DELETE(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const type = normalizeType(searchParams.get('type') || 'excel');

        if (!id) {
            return NextResponse.json(
                { status: false, message: 'ID is required' },
                { status: 400 }
            );
        }

        if (!type) {
            return NextResponse.json(
                { status: false, message: 'type must be excel, pdf, or tushaal' },
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

        const bundle = normalizeFilesBundle(existing.file_info);
        if (bundle[type]) {
            await removeFileIfExists(bundle[type]);
            bundle[type] = null;
        }

        const bothEmpty = !bundle.excel && !bundle.pdf && !bundle.tushaal;

        await db(TABLE)
            .where({ id })
            .update({
                file_info: bothEmpty ? null : JSON.stringify(bundle),
                last_modified_by: 'admin',
                last_modified_date: db.fn.now(),
            });

        return NextResponse.json({
            status: true,
            files: bothEmpty ? { excel: null, pdf: null, tushaal: null } : bundle,
            message: 'Файл амжилттай устгалаа',
        });
    } catch (error) {
        console.error('Error deleting classification file:', error);
        return NextResponse.json(
            { status: false, message: 'Файл устгахад алдаа гарлаа' },
            { status: 500 }
        );
    }
}
