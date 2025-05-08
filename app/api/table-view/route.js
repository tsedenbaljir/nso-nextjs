import { NextResponse } from 'next/server';

const baseAPI = 'https://data.1212.mn/api/v1';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const lng = searchParams.get('lng');
        const sector = searchParams.get('sector');
        const subsector = searchParams.get('subsector');
        const id = searchParams.get('id');

        if (!lng || !sector || !subsector || !id) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${baseAPI}/${lng}/NSO/${decodeURIComponent(sector)}/${decodeURIComponent(subsector)}/${id}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': 'a79fb6ab-5953-4c46-a240-a20c2af9150a',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const lng = searchParams.get('lng');
        const sector = searchParams.get('sector');
        const subsector = searchParams.get('subsector');
        const id = searchParams.get('id');

        if (!lng || !sector || !subsector || !id) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const postBody = await request.json();

        const response = await fetch(
            `${baseAPI}/${lng}/NSO/${decodeURIComponent(sector)}/${decodeURIComponent(subsector)}/${id}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': 'a79fb6ab-5953-4c46-a240-a20c2af9150a',
                },
                body: JSON.stringify(postBody),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
} 