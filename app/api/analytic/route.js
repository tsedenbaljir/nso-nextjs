import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// Environment variables
const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT;
const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace('', '\n');
const GOOGLE_ANALYTICS_PROPERTY_ID = '315626458';

// In-memory caching
let applicationScopedBean = {
    attribute: null,
    creationTime: 0
};

// Helper function to get a new Google Analytics token
async function getGoogleAnalyticsToken() {
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
    });

    const result = await tokenResponse.json();
    return result.access_token;
}

// Fetch Google Analytics report
async function fetchAnalyticsReport(token) {
    const reportRequest = {
        metrics: [{ name: 'active1DayUsers' }],
        dateRanges: [
            { startDate: 'yesterday', endDate: 'today' },
            { startDate: '7daysAgo', endDate: 'today' },
            { startDate: '30daysAgo', endDate: 'today' },
            { startDate: '2020-01-01', endDate: 'today' }
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
    });

    const result = await response.json();
    return result;
}

export async function GET() {
    const now = Date.now();

    // Check if we need to refresh the token (older than 60 minutes)
    if (!applicationScopedBean.attribute || (applicationScopedBean.creationTime + 6600000) < now) {
        try {
            // Get new token
            const token = await getGoogleAnalyticsToken();

            // Fetch report
            const report = await fetchAnalyticsReport(token);

            // Store report in the applicationScopedBean
            applicationScopedBean.attribute = report;
            applicationScopedBean.creationTime = now;
        } catch (error) {
            console.error('Error fetching Google Analytics report:', error);
            return NextResponse.json({ error: 'Failed to fetch Google Analytics report' }, { status: 500 });
        }
    }

    // Return cached or fresh report
    return NextResponse.json(applicationScopedBean.attribute, { status: 200 });
}
