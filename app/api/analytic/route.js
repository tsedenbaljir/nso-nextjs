import { NextResponse } from 'next/server';
import {
    CACHE_TTL_MS,
    GA_ALL_TIME_START,
    explainGaError,
    getCached,
    isFresh,
    isQuotaBackoff,
    runReport,
    setCached,
} from '@/app/api/analytic/ga';

export const dynamic = 'force-dynamic';

const ALL_TIME_START = GA_ALL_TIME_START;
const FOOTER_KEY = 'footer:activeUsers';
let fetchPromise = null;

function footerRequest() {
    return {
        metrics: [{ name: 'activeUsers' }],
        dateRanges: [
            { startDate: 'yesterday', endDate: 'today' },
            { startDate: '7daysAgo', endDate: 'today' },
            { startDate: '30daysAgo', endDate: 'today' },
            { startDate: ALL_TIME_START, endDate: 'today' },
        ],
    };
}

export async function GET() {
    const cached = await getCached(FOOTER_KEY);
    if (isFresh(cached, CACHE_TTL_MS) && cached.payload && !cached.payload.error) {
        return NextResponse.json(cached.payload, {
            status: 200,
            headers: { 'Cache-Control': 'public, max-age=1800, s-maxage=1800' },
        });
    }

    if (isQuotaBackoff() && cached?.payload && !cached.payload.error) {
        return NextResponse.json(cached.payload, {
            status: 200,
            headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' },
        });
    }

    if (isQuotaBackoff()) {
        const explained = explainGaError({ code: 429, message: 'concurrent' });
        return NextResponse.json(
            { error: explained.title, details: explained.message },
            { status: 503, headers: { 'Cache-Control': 'public, max-age=300' } }
        );
    }

    if (!fetchPromise) {
        fetchPromise = (async () => {
            try {
                return await runReport(footerRequest());
            } finally {
                fetchPromise = null;
            }
        })();
    }

    try {
        const report = await fetchPromise;
        await setCached(FOOTER_KEY, report);
        return NextResponse.json(report, {
            status: 200,
            headers: { 'Cache-Control': 'public, max-age=1800, s-maxage=1800' },
        });
    } catch (error) {
        console.error('Error fetching Google Analytics report:', error);
        if (cached?.payload && !cached.payload.error) {
            return NextResponse.json(cached.payload, {
                status: 200,
                headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' },
            });
        }
        const explained = explainGaError(error);
        return NextResponse.json(
            { error: explained.title, details: explained.message },
            { status: 503, headers: { 'Cache-Control': 'public, max-age=300' } }
        );
    }
}
