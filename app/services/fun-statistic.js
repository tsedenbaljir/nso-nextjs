"use server";

const FUN_STATISTIC_ENDPOINTS = {
    givenNames: "http://localhost:3000/api/given-names",
    familyNames: "http://localhost:3000/api/family-names",
    historicalNames: "http://localhost:3000/api/historical-names",
    tableauReport: "https://gateway.1212.mn/services/dynamic/api/public/tableau-report",
};

const defaultFetchOptions = {
    cache: "no-store",
};

function appendNoCacheParam(url) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}_=${Date.now()}`;
}

async function fetchJson(url, options = {}) {
    const finalUrl = appendNoCacheParam(url);
    const response = await fetch(finalUrl, {
        ...defaultFetchOptions,
        ...options,
        next: { revalidate: 0, ...(options.next || {}) },
        headers: {
            "Cache-Control": "no-cache",
            ...(options.headers || {}),
        },
    });
    let payload;

    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (!response.ok) {
        const message = payload?.error || `Failed to fetch ${url}`;
        const error = new Error(message);
        error.payload = payload;
        throw error;
    }

    return payload;
}

export async function getGivenNameStatistic(query = "") {
    const trimmed = query.trim();
    const endpoint =
        trimmed.length >= 2
            ? `${FUN_STATISTIC_ENDPOINTS.givenNames}?search=${encodeURIComponent(trimmed)}`
            : FUN_STATISTIC_ENDPOINTS.givenNames;

    return fetchJson(endpoint);
}

export async function getFamilyNameStatistic(query = "") {
    const trimmed = query.trim();
    const endpoint =
        trimmed.length >= 2
            ? `${FUN_STATISTIC_ENDPOINTS.familyNames}?search=${encodeURIComponent(trimmed)}`
            : FUN_STATISTIC_ENDPOINTS.familyNames;

    return fetchJson(endpoint);
}

export async function getHistoricalNames() {
    return fetchJson(FUN_STATISTIC_ENDPOINTS.historicalNames);
}

export async function fetchTableauTicket(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            query.append(key, String(value));
        }
    });

    const url =
        query.toString().length > 0
            ? `${FUN_STATISTIC_ENDPOINTS.tableauReport}?${query.toString()}`
            : FUN_STATISTIC_ENDPOINTS.tableauReport;

    return fetchJson(url);
}

