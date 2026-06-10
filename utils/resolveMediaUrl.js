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
