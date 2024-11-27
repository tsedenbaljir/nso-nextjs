import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const lng = searchParams.get('lng') || 'MN';
    const sort = searchParams.get('sort') || 'name,asc';
    const sectorType = searchParams.get('sectorType');

    try {
        const params = {
            size: pageSize,
            page: Math.round(page - 1),
            sort: sort,
            total: 0,
            'language.equals': lng.toUpperCase(),
        };

        // Add sectorType filter if provided
        if (sectorType) {
            params['sectorType.equals'] = sectorType;
        }

        const response = await axios.get('http://10.0.10.211/services/1212/api/public/job-postings', {
            params,
            validateStatus: function (status) {
                return status >= 200 && status < 300;
            }
        });

        const totalCount = response.headers['x-total-count'];
        const results = response.data;

        // Format response with pagination info
        const nextResponse = NextResponse.json({
            status: true,
            data: results,
            pagination: {
                page,
                pageSize,
                total: parseInt(totalCount || '0', 10)
            },
            message: ""
        });

        // Set pagination headers
        nextResponse.headers.set('X-Total-Count', totalCount || '0');
        nextResponse.headers.set('X-Page', page.toString());
        nextResponse.headers.set('X-Page-Size', pageSize.toString());

        return nextResponse;

    } catch (error) {
        console.error('Error fetching glossary:', error);
        return NextResponse.json(
            {
                status: false,
                data: null,
                pagination: {
                    page,
                    pageSize,
                    total: 0
                },
                message: "Failed to fetch glossary"
            },
            { status: error.response?.status || 500 }
        );
    }
} 