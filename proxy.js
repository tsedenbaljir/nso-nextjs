import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import acceptLanguage from "accept-language";
import { fallbackLng, languages, cookieName } from "@/app/i18n/settings";
import { encodePathname } from "@/utils/resolveMediaUrl";
import { hasAdminRole } from "@/app/api/auth/adminAuth";
import { isAuthRateLimited } from "@/utils/rateLimit";

acceptLanguage.languages(languages);

const ADMIN_API_PATTERN = /^\/api\/(?:.+\/)?admin(?:\/|$)/;
const SENSITIVE_API_PATTERN = /^\/api\/(upload|send-mail|elastic_index)$/;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|assets|favicon.ico|sw.js).*)",
  ],
};

const STATIC_FILE = /\.(ico|png|jpe?g|gif|svg|webp|css|js|mjs|woff2?|ttf|eot|map|txt|xml|json|otf|pdf|docx?|xlsx?|pptx?)$/i;

async function enforceAdminApi(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token) {
    return NextResponse.json(
      { status: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  if (!hasAdminRole(token.role)) {
    return NextResponse.json(
      { status: false, message: "Forbidden" },
      { status: 403 }
    );
  }

  return null;
}

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth") && req.method === "POST") {
    if (isAuthRateLimited(req)) {
      return NextResponse.json(
        { status: false, message: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }
  }

  if (ADMIN_API_PATTERN.test(pathname) || SENSITIVE_API_PATTERN.test(pathname)) {
    const denied = await enforceAdminApi(req);
    if (denied) return denied;
    return NextResponse.next();
  }

  const adminPageMatch = pathname.match(/^\/(mn|en)\/admin(?:\/|$)/);
  if (adminPageMatch) {
    const lng = adminPageMatch[1];
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    if (!token) {
      return NextResponse.redirect(new URL(`/${lng}/login`, req.url));
    }

    if (!hasAdminRole(token.role)) {
      return NextResponse.redirect(new URL(`/${lng}`, req.url));
    }

    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith("/uploads")) {
    const encoded = encodePathname(req.nextUrl.pathname);
    if (encoded !== req.nextUrl.pathname) {
      const url = req.nextUrl.clone();
      url.pathname = encoded;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (STATIC_FILE.test(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (
    req.nextUrl.pathname.indexOf("icon") > -1 ||
    req.nextUrl.pathname.indexOf("chrome") > -1
  ) {
    return NextResponse.next();
  }

  let lng;
  if (req.cookies.has(cookieName)) {
    lng = acceptLanguage.get(req.cookies.get(cookieName)?.value);
  }
  if (!lng) lng = fallbackLng;

  if (
    !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith("/_next") &&
    !req.nextUrl.pathname.startsWith("/api")
  ) {
    return NextResponse.redirect(
      new URL(`/${lng}${req.nextUrl.pathname}`, req.url),
    );
  }

  if (req.headers.has("referer")) {
    const refererUrl = new URL(req.headers.get("referer"));
    const lngInReferer = languages.find((l) =>
      refererUrl.pathname.startsWith(`/${l}`),
    );
    const response = NextResponse.next();
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer);
    return response;
  }

  return NextResponse.next();
}
