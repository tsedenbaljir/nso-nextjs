import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('search') || '';
    const lng = searchParams.get('lng') || 'MN';

    try {
        const response = await axios.get('http://10.0.10.211/services/1212/api/public/job-postings', {
            params: {
                'name.contains': searchTerm,
                'language.equals': lng.toUpperCase(),
                size: 1,
                page: 0,
                sort: 'name,asc'
            },
            validateStatus: function (status) {
                return status >= 200 && status < 300;
            }
        });

        const results = response.data;

        return NextResponse.json({
            status: true,
            data: results[0] || null,
            message: ""
        });

    } catch (error) {
        console.error('Error searching glossary:', error);
        return NextResponse.json(
            {
                status: false,
                data: null,
                message: "Failed to search glossary"
            },
            { status: error.response?.status || 500 }
        );
    }
} 