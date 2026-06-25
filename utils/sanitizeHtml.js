import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(html) {
    if (html == null || html === "") return "";
    return DOMPurify.sanitize(String(html));
}
