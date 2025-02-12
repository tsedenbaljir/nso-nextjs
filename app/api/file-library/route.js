import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const lng = searchParams.get('lng');
    const type = searchParams.get('type');
    try {
        let query = '';
        if (type === "all") {
            query = ` language = '${lng}' and published = 1 and file_type in( 
                'nso-magazine'
                , 'magazine'
                , 'census'
                , 'survey'
                , 'infographic'
                , 'weekprice'
                , 'foreigntrade'
                , 'presentation'
                , 'bulletin'
                , 'annual'
                , 'livingstandart'
                , 'agricultural_census'
                , 'enterprise_census'
                , 'livestock_census'
                , 'pahc')
            `;
        } else {
            query = ` language = '${lng}' and published = 1 and file_type = '${type}'`
        }
        const results = await db.raw(`
            SELECT * FROM web_1212_download
            WHERE ${query}
            order by published_date desc
        `, []);
            console.log(results);
            
        return NextResponse.json({
            status: true,
            data: results,
            message: ""
        });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({
            status: false,
            data: null,
            message: "Internal server error"
        }, { status: 500 });
    }
}
