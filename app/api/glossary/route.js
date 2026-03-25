import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sectorType = searchParams.get('sectorType');
    const label = decodeURIComponent(searchParams.get('label') || '');
    const search = searchParams.get('search');
    const lng = searchParams.get('lng') || 'mn';
    const role = searchParams.get('role');

    try {
        const { data, totalCount } = await fetchDataFromDatabase({
            page, pageSize, sectorType, label, search, lng, role
        });
        return NextResponse.json({
            status: true,
            data,
            pagination: {
                page,
                pageSize,
                total: totalCount
            }
        });
    } catch (error) {
        console.error('Error fetching glossary:', error);
        return NextResponse.json({
            status: false,
            message: "Failed to fetch glossary",
            pagination: { page, pageSize, total: 0 },
            data: null
        }, { status: 500 });
    }
}

async function fetchDataFromDatabase({ page, pageSize, sectorType, label, search, lng, role }) {
    const offset = page * pageSize;
    const { whereClause, params } = buildWhereClause(sectorType, label, search, lng, role);

    const countQuery = `
        SELECT COUNT(*) as total
        FROM [NSOweb].[dbo].[web_1212_glossary] wg
        LEFT JOIN [NSOweb].[dbo].[sub_classification_code] scc ON wg.sector_type = scc.code
        WHERE ${whereClause}
    `;
    const totalCount = (await db.raw(countQuery, params))[0]?.total || 0;

    const query = `
        SELECT wg.id, wg.name, wg.sector_type, wg.source, wg.info, wg.published,
            wg.created_by, wg.created_date, wg.last_modified_by, wg.last_modified_date,
            wg.name_eng, wg.source_eng, wg.info_eng,
            scc.namemn as sector_name_mn, scc.nameen as sector_name_en
        FROM [NSOweb].[dbo].[web_1212_glossary] wg
        LEFT JOIN [NSOweb].[dbo].[sub_classification_code] scc ON wg.sector_type = scc.code
        WHERE ${whereClause}
        ORDER BY ${role === "admin" ? 'wg.created_date DESC' : 'wg.name ASC'}
        OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    `;
    const results = await db.raw(query, [...params, offset, pageSize]);

    return { data: results, totalCount };
}

function buildWhereClause(sectorType, label, search, lng, role) {
    let whereConditions = [role === "admin" ? 'wg.published IN (0, 1)' : 'wg.published = 1'];
    const params = [];

    if (sectorType) {
        whereConditions.push('wg.sector_type = ?');
        params.push(sectorType);
    }
    if (label) {
        whereConditions.push('wg.name LIKE ?');
        params.push(`${label}%`);
    }

    if (search) {
        const searchField = lng === 'mn' ? 'wg.name' : 'wg.name_eng';
        const infoField = lng === 'mn' ? 'wg.info' : 'wg.info_eng';
        whereConditions.push(`(${searchField} LIKE ? OR ${infoField} LIKE ?)`);
        const searchPattern = `%${decodeURIComponent(search)}%`;
        params.push(searchPattern, searchPattern);
    }

    return { whereClause: whereConditions.join(' AND '), params };
}
