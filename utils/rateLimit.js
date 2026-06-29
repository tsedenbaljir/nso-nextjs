const buckets = new Map();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function prune(key, now) {
    const entry = buckets.get(key);
    if (!entry) return;
    entry.attempts = entry.attempts.filter((ts) => now - ts < WINDOW_MS);
    if (entry.attempts.length === 0) buckets.delete(key);
}

export function getClientIp(req) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return req.headers.get("x-real-ip") || "unknown";
}

export function isAuthRateLimited(req, identifier = "") {
    const now = Date.now();
    const key = `${getClientIp(req)}:${identifier}`;
    prune(key, now);

    const entry = buckets.get(key) || { attempts: [] };
    if (entry.attempts.length >= MAX_ATTEMPTS) {
        return true;
    }

    entry.attempts.push(now);
    buckets.set(key, entry);
    return false;
}

export function clearAuthRateLimit(req, identifier = "") {
    const key = `${getClientIp(req)}:${identifier}`;
    buckets.delete(key);
}
