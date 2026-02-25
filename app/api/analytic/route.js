import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

// Environment variables
const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_ANALYTICS_PROPERTY_ID = '315626458';

// In-memory caching
let applicationScopedBean = {
    attribute: null,
    creationTime: 0,
    quotaExhaustedUntil: 0  // Backoff: don't retry GA API until after this timestamp
};

// Prevent concurrent requests from hammering the GA API
let fetchPromise = null;

// Helper function to get a new Google Analytics token
async function getGoogleAnalyticsToken() {
    if (!serviceAccount || !privateKey) {
        throw new Error('Missing GOOGLE_SERVICE_ACCOUNT or GOOGLE_PRIVATE_KEY env vars');
    }
    const now = Math.floor(Date.now() / 1000); // Time in seconds
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
        iss: serviceAccount,
        scope: 'https://www.googleapis.com/auth/analytics.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600, // 1 hour expiration
        iat: now
    };

    const signedToken = jwt.sign(payload, privateKey, { algorithm: 'RS256', header });
    const data = new URLSearchParams();
    data.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    data.append('assertion', signedToken);

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
    },
    { cache: "no-store" });

    const result = await tokenResponse.json();
    if (result.error) {
        throw new Error(result.error_description || result.error || 'Failed to get OAuth token');
    }
    return result.access_token;
}

// Fetch Google Analytics report
async function fetchAnalyticsReport(token) {
    const reportRequest = {
        returnPropertyQuota: true,  // See quota usage (helps avoid 429)
        metrics: [{ name: 'active1DayUsers' }],
        dateRanges: [
            { startDate: 'yesterday', endDate: 'today' },
            { startDate: '7daysAgo', endDate: 'today' },
            { startDate: '30daysAgo', endDate: 'today' },
            { startDate: '365daysAgo', endDate: 'today' }  // Last year (shorter range = fewer quota tokens)
        ]
    };

    const response = await fetch(`https://content-analyticsdata.googleapis.com/v1beta/properties/${GOOGLE_ANALYTICS_PROPERTY_ID}:runReport?alt=json`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportRequest)
    },
    { cache: "no-store" });

    const result = await response.json();
    return result;
}

export async function GET() {
    const now = Date.now();

    // Check if we need to refresh (older than 60 minutes)
    const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes
    const QUOTA_BACKOFF_MS = 55 * 60 * 1000; // Don't retry for 55 min after 429
    const cached = applicationScopedBean.attribute;
    const isStale = (applicationScopedBean.creationTime + CACHE_TTL_MS) < now;
    const hasValidCache = cached && !cached?.error;
    const inQuotaBackoff = now < applicationScopedBean.quotaExhaustedUntil;

    // Skip refresh if we're in 429 backoff period (quota resets ~1 hour)
    if (inQuotaBackoff) {
        if (hasValidCache) {
            return NextResponse.json(applicationScopedBean.attribute, {
                status: 200,
                headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' }
            });
        }
        return NextResponse.json(
            { error: 'Analytics temporarily unavailable', details: 'Quota exhausted, retry later' },
            { status: 503, headers: { 'Cache-Control': 'public, max-age=300' } }
        );
    }

    if (!hasValidCache || isStale) {
        // Deduplicate: only one in-flight request to GA API at a time
        if (!fetchPromise) {
            fetchPromise = (async () => {
                try {
                    const token = await getGoogleAnalyticsToken();
                    return await fetchAnalyticsReport(token);
                } finally {
                    fetchPromise = null;
                }
            })();
        }
        try {
            const report = await fetchPromise;
            // Check if GA API returned an error (e.g. 429 quota exhausted)
            if (report?.error) {
                const { code, message } = report.error;
                console.error('Google Analytics API error:', code, message);
                // 429 = quota exhausted; back off for 55 min before retrying
                if (code === 429) {
                    applicationScopedBean.quotaExhaustedUntil = Date.now() + QUOTA_BACKOFF_MS;
                }
                // Return cached data if available, otherwise 503
                if (hasValidCache) {
                    return NextResponse.json(applicationScopedBean.attribute, {
                        status: 200,
                        headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' }
                    });
                }
                return NextResponse.json(
                    { error: 'Analytics temporarily unavailable', details: message },
                    { status: 503, headers: { 'Cache-Control': 'public, max-age=300' } }
                );
            }
            // Store report in the applicationScopedBean
            applicationScopedBean.attribute = report;
            applicationScopedBean.creationTime = Date.now();
            applicationScopedBean.quotaExhaustedUntil = 0;  // Clear backoff on success
        } catch (error) {
            console.error('Error fetching Google Analytics report:', error);
            return NextResponse.json({ error: 'Failed to fetch Google Analytics report' }, { status: 500 });
        }
    }

    // Return cached report (only if valid)
    const data = applicationScopedBean.attribute;
    if (!data || data?.error) {
        return NextResponse.json(
            { error: 'Analytics temporarily unavailable', details: data?.error?.message },
            { status: 503 }
        );
    }
    return NextResponse.json(data, {
        status: 200,
        headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' }
    });
}
