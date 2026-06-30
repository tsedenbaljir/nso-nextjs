const MEDIA_BASE = "https://www.1212.mn";

function encodePathname(pathname) {
    return pathname
        .split("/")
        .map((segment) => {
            if (!segment) return "";
            try {
                return encodeURIComponent(decodeURIComponent(segment));
            } catch {
                return encodeURIComponent(segment);
            }
        })
        .join("/");
}

function decodeQueryParam(value) {
    if (!value) return value;
    let decoded = value;
    for (let i = 0; i < 3; i++) {
        try {
            const next = decodeURIComponent(decoded);
            if (next === decoded) break;
            decoded = next;
        } catch {
            break;
        }
    }
    return decoded;
}

/** Decode then encode — avoids double-encoding path/query segments */
export function encodeQueryParam(value) {
    if (!value) return "";
    return encodeURIComponent(decodeQueryParam(value));
}

export { encodePathname, decodeQueryParam };

/** Encode upload/file URLs so commas, spaces, etc. work with nginx static serving */
export function resolveMediaUrl(src) {
    if (!src) return "";

    if (src.startsWith("http://") || src.startsWith("https://")) {
        const url = new URL(src);
        url.pathname = encodePathname(url.pathname);
        return url.href;
    }

    const path = src.startsWith("/") ? src : `/uploads/${src}`;
    return `${MEDIA_BASE}${encodePathname(path)}`;
}
