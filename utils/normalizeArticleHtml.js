/**
 * Prepare CMS / Facebook-pasted HTML for client render.
 * - Absolute URLs for /uploads images
 * - referrerPolicy for hotlinked images (fbcdn, etc.)
 */
export function normalizeArticleHtml(html) {
  if (!html || typeof html !== "string") return "";

  const base =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FRONTEND) ||
    (typeof window !== "undefined" ? window.location.origin : "https://www.1212.mn");

  let out = html
    .replace(/(<img\b[^>]*\bsrc=["'])\/uploads\//gi, `$1${base}/uploads/`)
    .replace(/(<img\b[^>]*\bsrc=["'])uploads\//gi, `$1${base}/uploads/`);

  if (!/referrerpolicy=/i.test(out)) {
    out = out.replace(/<img\b/gi, '<img referrerpolicy="no-referrer"');
  }

  return out;
}

export function isHtmlContent(text) {
  return typeof text === "string" && /<[a-z][\s\S]*>/i.test(text);
}
