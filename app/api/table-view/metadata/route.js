import { NextResponse } from 'next/server';
import { parse } from 'node-html-parser';
import { Agent } from 'undici';

const insecure = new Agent({ connect: { rejectUnauthorized: false } });

function emptyMetadataResponse() {
    return NextResponse.json({ content: '' });
}

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

        const decodedSector = decodeURIComponent(sector);
        const decodedSubsector = decodeURIComponent(subsector);
        const link = subtables
            ? `https://data.1212.mn/pxweb/${lng}/NSO/NSO__${decodedSector}__${decodedSubsector}__${subtables}/${id}`
            : `https://data.1212.mn/pxweb/${lng}/NSO/NSO__${decodedSector}__${decodedSubsector}/${id}`;

        const response = await fetch(link, { dispatcher: insecure });
        if (!response.ok) {
            return emptyMetadataResponse();
        }

        const contentType = response.headers.get('Content-Type') ?? '';
        const metadata = await response.text();

        if (!contentType.includes('text/html')) {
            return emptyMetadataResponse();
        }

        const root = parse(metadata);
        const wrapElement = root.querySelector('#pxwebcontent');
        if (!wrapElement) {
            return emptyMetadataResponse();
        }

        const SelectionPage = wrapElement.querySelector('#SelectionPage');
        if (!SelectionPage) {
            return emptyMetadataResponse();
        }

        const footnotesDiv = SelectionPage.querySelector('#ctl00_ContentPlaceHolderMain_divFootnotes');
        if (!footnotesDiv) {
            return emptyMetadataResponse();
        }

        return NextResponse.json({ content: footnotesDiv.innerHTML });
    } catch (error) {
        console.error('Error fetching table metadata:', error);
        return emptyMetadataResponse();
    }
}
