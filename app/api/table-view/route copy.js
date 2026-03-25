import { NextResponse } from 'next/server';

const baseAPI = 'https://data.1212.mn/api/v1';

// Helper function to create summary of data
function createSummary(data) {
    if (!data || typeof data !== 'object') {
        return data;
    }

    const summary = { ...data };

    // If there are variables with values, limit them
    if (summary.variables && Array.isArray(summary.variables)) {
        summary.variables = summary.variables.map(variable => {
            if (variable.values && Array.isArray(variable.values)) {
                const originalLength = variable.values.length;
                // Keep only first 3 and last 3 values
                if (originalLength > 6) {
                    const first3 = variable.values.slice(0, 3);
                    const last3 = variable.values.slice(-3);
                    variable.values = [...first3, '...', ...last3];
                    variable.values_summary = `Total ${originalLength} values (showing first 3 and last 3)`;
                }
                
                if (variable.valueTexts && Array.isArray(variable.valueTexts)) {
                    const textsLength = variable.valueTexts.length;
                    if (textsLength > 6) {
                        const first3 = variable.valueTexts.slice(0, 3);
                        const last3 = variable.valueTexts.slice(-3);
                        variable.valueTexts = [...first3, '...', ...last3];
                    }
                }
            }
            return variable;
        });
    }

    // If there's data array, limit it
    if (summary.data && Array.isArray(summary.data)) {
        const originalLength = summary.data.length;
        if (originalLength > 10) {
            summary.data = summary.data.slice(0, 10);
            summary.data_summary = `Total ${originalLength} rows (showing first 10)`;
        }
    }

    return summary;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const lng = searchParams.get('lng');
        const sector = searchParams.get('sector');
        const subsector = searchParams.get('subsector');
        const subtables = searchParams.get('subtables');
        const summary = searchParams.get('summary') === 'true';

        if (!lng || !sector || !subsector || !id) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const response = await fetch(
            subtables ?
                `${baseAPI}/${lng}/NSO/${decodeURIComponent(sector)}/${decodeURIComponent(subsector)}/${subtables}/${id}`
                : `${baseAPI}/${lng}/NSO/${decodeURIComponent(sector)}/${decodeURIComponent(subsector)}/${id}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': 'a79fb6ab-5953-4c46-a240-a20c2af9150a',
                },
            }
        );

        if (!response.ok) {
            // throw new Error('Failed to fetch data');
            return NextResponse.json([]);
        }

        const data = await response.json();
        
        // If summary is requested, return summarized data
        if (summary) {
            const summarizedData = createSummary(data);
            return NextResponse.json(summarizedData);
        }
        
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
        const subtables = searchParams.get('subtables');
        if (!lng || !sector || !subsector || !id) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const postBody = await request.json();
        const response = await fetch(
            subtables ?
                `${baseAPI}/${lng}/NSO/${decodeURIComponent(sector)}/${decodeURIComponent(subsector)}/${subtables}/${id}`
                : `${baseAPI}/${lng}/NSO/${decodeURIComponent(sector)}/${decodeURIComponent(subsector)}/${id}`,
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