import { NextResponse } from 'next/server';
import { parse } from 'node-html-parser';

const baseAPI = 'https://data.1212.mn/api/v1';

export async function GET(request) {
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

        const link = `https://data.1212.mn/pxweb/${lng}/NSO/NSO__${decodeURIComponent(sector)}__${decodeURIComponent(subsector)}/${id}`
        const response = await fetch(subtables ? `${link}/${subtables}` : `${link}`);
        if (!response.ok) {
            // throw new Error(`HTTP error! Status: ${response.status}`);
            return NextResponse.json({
                status: false,
                data: [],
                message: "Failed to fetch data"
            });
        }
        const contentType = response.headers.get('Content-Type');
        const metadata = await response.text();

        // If the response is not HTML, return appropriate response
        if (!contentType.includes('text/html')) {
            return NextResponse.json([]);
        }

        // Parse HTML using node-html-parser
        const root = parse(metadata);
        const wrapElement = root.querySelector('#pxwebcontent');

        if (!wrapElement) {
            return NextResponse.json(
                { error: 'Could not find pxwebcontent element' },
                { status: 404 }
            );
        }

        const SelectionPage = wrapElement.querySelector('#SelectionPage');
        if (!SelectionPage) {
            return NextResponse.json(
                { error: 'Could not find SelectionPage element' },
                { status: 404 }
            );
        }

        const footnotesDiv = SelectionPage.querySelector('#ctl00_ContentPlaceHolderMain_divFootnotes');
        if (!footnotesDiv) {
            return NextResponse.json(
                { error: 'Could not find footnotes div' },
                { status: 404 }
            );
        }

        return NextResponse.json({ content: footnotesDiv.innerHTML });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
