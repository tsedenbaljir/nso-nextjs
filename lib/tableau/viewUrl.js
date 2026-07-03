const TABLEAU_SERVER_URL =
    process.env.NEXT_PUBLIC_TABLEAU_SERVER_URL ||
    process.env.TABLEAU_SERVER_URL ||
    "https://tableau.1212.mn";

export function getTableauServerUrl() {
    return TABLEAU_SERVER_URL.replace(/\/$/, "");
}

export function toTableauViewUrl(path) {
    if (!path) return "";
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${getTableauServerUrl()}${normalized}`;
}
