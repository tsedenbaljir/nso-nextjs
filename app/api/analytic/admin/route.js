import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/app/api/auth/adminAuth';
import {
    CACHE_TTL_MS,
    GA_ALL_TIME_START,
    explainGaError,
    getCached,
    isFresh,
    isQuotaBackoff,
    isValidDate,
    mapReportRows,
    mapReportTotals,
    runReport,
    runReportsSequential,
    setCached,
} from '@/app/api/analytic/ga';

export const dynamic = 'force-dynamic';

const SUMMARY_METRICS = [
    { name: 'activeUsers' },
    { name: 'newUsers' },
    { name: 'sessions' },
    { name: 'averageSessionDuration' },
];

const FOOTER_KEY = 'footer:activeUsers';
const inFlight = new Map();

function footerRequest() {
    return {
        metrics: [{ name: 'activeUsers' }],
        dateRanges: [
            { startDate: 'yesterday', endDate: 'today' },
            { startDate: '7daysAgo', endDate: 'today' },
            { startDate: '30daysAgo', endDate: 'today' },
            { startDate: GA_ALL_TIME_START, endDate: 'today' },
        ],
    };
}

function parseSiteTraffic(report) {
    const rows = report?.rows || [];
    const byRange = {};
    rows.forEach((row, i) => {
        const key = row.dimensionValues?.[0]?.value;
        const val = Number(row.metricValues?.[0]?.value);
        if (key) byRange[key] = val;
        byRange[`index_${i}`] = val;
    });
    return {
        today: byRange.date_range_0 ?? byRange.index_3 ?? null,
        week: byRange.date_range_1 ?? byRange.index_2 ?? null,
        month: byRange.date_range_2 ?? byRange.index_1 ?? null,
        total: byRange.date_range_3 ?? byRange.index_0 ?? null,
    };
}

async function getSiteTraffic(force = false) {
    const cached = await getCached(FOOTER_KEY);
    if (!force && isFresh(cached, CACHE_TTL_MS) && cached.payload?.rows) {
        return parseSiteTraffic(cached.payload);
    }
    if (isQuotaBackoff() && cached?.payload?.rows) {
        return parseSiteTraffic(cached.payload);
    }
    if (isQuotaBackoff()) return null;
    const report = await runReport(footerRequest());
    await setCached(FOOTER_KEY, report);
    return parseSiteTraffic(report);
}

function buildRequests(startDate, endDate) {
    const dateRanges = [{ startDate, endDate }];

    return [
        { dateRanges, metrics: SUMMARY_METRICS },
        {
            dateRanges,
            dimensions: [{ name: 'date' }],
            metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }, { name: 'sessions' }],
            orderBys: [{ dimension: { dimensionName: 'date' } }],
            limit: 400,
        },
        {
            dateRanges,
            dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
            metrics: [{ name: 'activeUsers' }],
            orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
            limit: 50,
        },
        {
            dateRanges,
            dimensions: [{ name: 'deviceCategory' }],
            metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
            orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
            limit: 10,
        },
        {
            dateRanges,
            dimensions: [{ name: 'country' }],
            metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
            orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
            limit: 20,
        },
    ];
}

function jsonError(explained, extra = {}) {
    return NextResponse.json(
        {
            status: false,
            code: explained.code,
            title: explained.title,
            message: explained.message,
            ...extra,
        },
        { status: explained.code === 429 ? 429 : 502 }
    );
}

export async function GET(req) {
    try {
        return await handleGet(req);
    } catch (error) {
        console.error('GA admin GET crash:', error);
        return jsonError(explainGaError(error));
    }
}

async function handleGet(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const noCache = searchParams.get('refresh') === '1';

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return NextResponse.json(
            {
                status: false,
                title: 'Хугацаа буруу',
                message: 'Эхлэх болон дуусах огноог YYYY-MM-DD форматаар сонгоно уу.',
            },
            { status: 400 }
        );
    }

    if (startDate > endDate) {
        return NextResponse.json(
            {
                status: false,
                title: 'Хугацаа буруу',
                message: 'Эхлэх хугацаа дуусах хугацаанаас хойш байж болохгүй.',
            },
            { status: 400 }
        );
    }

    if (startDate < GA_ALL_TIME_START) {
        return NextResponse.json(
            {
                status: false,
                title: 'Хугацаа хэт эрт',
                message: `Өгөгдөл ${GA_ALL_TIME_START}-с хойш байна.`,
            },
            { status: 400 }
        );
    }

    const cacheKey = `admin:${startDate}:${endDate}`;
    const cached = await getCached(cacheKey);
    const fresh = isFresh(cached, CACHE_TTL_MS);

    if (!noCache && fresh) {
        return NextResponse.json({ ...cached.payload, cached: true });
    }

    if (isQuotaBackoff() && cached?.payload) {
        const explained = explainGaError({ code: 429, message: 'concurrent' }, { hasCache: true });
        return NextResponse.json({
            ...cached.payload,
            cached: true,
            stale: true,
            warning: explained,
        });
    }

    if (isQuotaBackoff()) {
        return jsonError(explainGaError({ code: 429, message: 'concurrent' }));
    }

    if (inFlight.has(cacheKey)) {
        try {
            const payload = await inFlight.get(cacheKey);
            return NextResponse.json({ ...payload, cached: true });
        } catch (error) {
            if (cached?.payload) {
                const explained = explainGaError(error, { hasCache: true });
                return NextResponse.json({
                    ...cached.payload,
                    cached: true,
                    stale: true,
                    warning: explained,
                });
            }
            return jsonError(explainGaError(error));
        }
    }

    const job = (async () => {
        const reports = await runReportsSequential(buildRequests(startDate, endDate));
        let siteTraffic = null;
        try {
            siteTraffic = await getSiteTraffic(false);
        } catch {
            siteTraffic = null;
        }
        const payload = {
            status: true,
            range: { startDate, endDate },
            summary: mapReportTotals(reports[0]),
            daily: mapReportRows(reports[1]),
            pages: mapReportRows(reports[2]),
            devices: mapReportRows(reports[3]),
            countries: mapReportRows(reports[4]),
            siteTraffic,
        };
        await setCached(cacheKey, payload);
        return payload;
    })();

    inFlight.set(cacheKey, job);
    try {
        const payload = await job;
        return NextResponse.json(payload);
    } catch (error) {
        console.error('GA admin fetch failed:', error);
        if (cached?.payload) {
            const explained = explainGaError(error, { hasCache: true });
            return NextResponse.json({
                ...cached.payload,
                cached: true,
                stale: true,
                warning: explained,
            });
        }
        return jsonError(explainGaError(error));
    } finally {
        inFlight.delete(cacheKey);
    }
}
