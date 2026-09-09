import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';

const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export const GA_PROPERTY_ID =
    process.env.GOOGLE_ANALYTICS_PROPERTY_ID || '315626458';

export const GA_ALL_TIME_START =
    process.env.GOOGLE_ANALYTICS_ALL_TIME_START || '2015-08-14';

export const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
export const QUOTA_BACKOFF_MS = 15 * 60 * 1000; // wait 15 min after 429

const CACHE_FILE = path.join(process.cwd(), '.next', 'cache', 'ga-analytics.json');

let tokenCache = { token: null, expiresAt: 0 };
let quotaBackoffUntil = 0;
let memoryCache = new Map();
let queue = Promise.resolve();
let fileCacheLoaded = false;

export function isQuotaBackoff() {
    return Date.now() < quotaBackoffUntil;
}

export function quotaRetryAfterMs() {
    return Math.max(0, quotaBackoffUntil - Date.now());
}

export function markQuotaExhausted() {
    quotaBackoffUntil = Date.now() + QUOTA_BACKOFF_MS;
}

export function clearQuotaBackoff() {
    quotaBackoffUntil = 0;
}

export function explainGaError(error, { hasCache = false } = {}) {
    const raw = String(
        error?.message || error?.statusMessage || error || ''
    );
    const code = Number(error?.code || error?.status || 0);
    const concurrent =
        /concurrent/i.test(raw) || /fewer requests concurrently/i.test(raw);
    const quota =
        code === 429 ||
        /quota/i.test(raw) ||
        /resource.*exhausted/i.test(raw) ||
        /rate.?limit/i.test(raw);

    if (concurrent) {
        return {
            code: 429,
            title: 'Хэт олон зэрэгцээ хүсэлт',
            message:
                'Google Analytics нэгэн зэрэг хэт олон хүсэлт хүлээн авсан тул түр хаалаа. ' +
                (hasCache
                    ? 'Сүүлд хадгалсан тоог харуулж байна. 10–15 минутын дараа дахин оролдоно уу.'
                    : '10–15 минут хүлээгээд «Сэргээх» дарна уу. Энэ хугацаанд дахин дахин дарж болохгүй.'),
        };
    }

    if (quota) {
        return {
            code: 429,
            title: 'Хүсэлтийн хязгаар дүүрсэн',
            message:
                'Google Analytics-н өдрийн/цагийн квот дууссан. ' +
                (hasCache
                    ? 'Хадгалсан өгөгдлийг харуулж байна. Дараа дахин оролдоно уу.'
                    : '15–60 минутын дараа дахин оролдоно уу.'),
        };
    }

    return {
        code: code || 502,
        title: 'Өгөгдөл татахад алдаа гарлаа',
        message: raw
            ? `Google Analytics холбогдож чадсангүй. ${raw}`
            : 'Google Analytics-с өгөгдөл татаж чадсангүй. Сүлжээ эсвэл эрхийг шалгана уу.',
    };
}

async function loadFileCache() {
    if (fileCacheLoaded) return;
    fileCacheLoaded = true;
    try {
        const raw = await readFile(CACHE_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
            for (const [key, entry] of Object.entries(parsed)) {
                if (entry?.payload) memoryCache.set(key, entry);
            }
        }
    } catch {
        // first run or missing file
    }
}

async function persistFileCache() {
    try {
        await mkdir(path.dirname(CACHE_FILE), { recursive: true });
        const obj = {};
        for (const [key, entry] of memoryCache.entries()) {
            obj[key] = entry;
        }
        await writeFile(CACHE_FILE, JSON.stringify(obj));
    } catch (err) {
        console.warn('GA cache write failed:', err.message);
    }
}

export async function getCached(key) {
    await loadFileCache();
    return memoryCache.get(key) || null;
}

export async function setCached(key, payload) {
    await loadFileCache();
    memoryCache.set(key, { time: Date.now(), payload });
    persistFileCache();
}

export function isFresh(entry, ttl = CACHE_TTL_MS) {
    return Boolean(entry?.payload && Date.now() - entry.time < ttl);
}

/** Serialize all GA HTTP calls so we never hit concurrent-request quota. */
function enqueue(task) {
    const run = queue.then(task, task);
    queue = run.then(
        () => undefined,
        () => undefined
    );
    return run;
}

export async function getAnalyticsToken() {
    if (!serviceAccount || !privateKey) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT эсвэл GOOGLE_PRIVATE_KEY тохируулаагүй байна.');
    }

    const now = Math.floor(Date.now() / 1000);
    if (tokenCache.token && now < tokenCache.expiresAt - 60) {
        return tokenCache.token;
    }

    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
        iss: serviceAccount,
        scope: 'https://www.googleapis.com/auth/analytics.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
    };

    const signedToken = jwt.sign(payload, privateKey, { algorithm: 'RS256', header });
    const body = new URLSearchParams();
    body.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    body.append('assertion', signedToken);

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        cache: 'no-store',
    });

    const result = await response.json();
    if (result.error) {
        throw new Error(result.error_description || result.error || 'Failed to get OAuth token');
    }

    tokenCache = { token: result.access_token, expiresAt: now + 3500 };
    return result.access_token;
}

export async function runReport(request) {
    return enqueue(async () => {
        if (isQuotaBackoff()) {
            const err = new Error('Exhausted concurrent requests quota.');
            err.code = 429;
            throw err;
        }

        const token = await getAnalyticsToken();
        const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${GA_PROPERTY_ID}:runReport`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
                cache: 'no-store',
            }
        );

        const text = await response.text();
        let result = {};
        try {
            result = text ? JSON.parse(text) : {};
        } catch {
            const err = new Error('Google Analytics хоосон хариу буцаалаа.');
            err.code = response.status || 502;
            throw err;
        }
        if (result?.error) {
            const err = new Error(result.error.message || 'GA error');
            err.code = result.error.code;
            err.status = result.error.status;
            if (result.error.code === 429 || /quota|concurrent/i.test(err.message)) {
                markQuotaExhausted();
            }
            throw err;
        }
        clearQuotaBackoff();
        return result;
    });
}

/** Run reports one after another — never concurrently. */
export async function runReportsSequential(requests) {
    const reports = [];
    for (const request of requests) {
        reports.push(await runReport(request));
    }
    return reports;
}

/** GA4 report rows -> plain objects keyed by dimension/metric names. */
export function mapReportRows(report) {
    if (!report?.rows?.length) return [];
    const dimensionNames = (report.dimensionHeaders || []).map((h) => h.name);
    const metricNames = (report.metricHeaders || []).map((h) => h.name);

    return report.rows.map((row) => {
        const item = {};
        dimensionNames.forEach((name, i) => {
            item[name] = row.dimensionValues?.[i]?.value ?? null;
        });
        metricNames.forEach((name, i) => {
            const raw = row.metricValues?.[i]?.value;
            const num = Number(raw);
            item[name] = Number.isFinite(num) ? num : 0;
        });
        return item;
    });
}

export function mapReportTotals(report) {
    const rows = mapReportRows(report);
    return rows[0] || {};
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(value) {
    if (!DATE_PATTERN.test(String(value || ''))) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime());
}
