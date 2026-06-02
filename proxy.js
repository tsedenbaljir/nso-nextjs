import { NextResponse } from "next/server";
import acceptLanguage from "accept-language";
import { fallbackLng, languages, cookieName } from "@/app/i18n/settings";

acceptLanguage.languages(languages);

export const config = {
  // matcher: '/:lng*'
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)"],
};
// Only skip app routes for real static assets (not .px data ids in dynamic paths)
const STATIC_FILE = /\.(ico|png|jpe?g|gif|svg|webp|css|js|mjs|woff2?|ttf|eot|map|txt|xml|json|otf|pdf|docx?|xlsx?|pptx?)$/i;

export function proxy(req) {
  if (req.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Uploaded files live in public/uploads — must not get /mn prefix
  if (req.nextUrl.pathname.startsWith("/uploads")) {
    return NextResponse.next();
  }

  if (STATIC_FILE.test(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  if (
    req.nextUrl.pathname.indexOf("icon") > -1 ||
    req.nextUrl.pathname.indexOf("chrome") > -1
  )
    return NextResponse.next();
  let lng;
  if (req.cookies.has(cookieName))
    lng = acceptLanguage.get(req.cookies.get(cookieName)?.value);
  // if (!lng) lng = acceptLanguage.get(req.headers.get("Accept-Language"));
  if (!lng) lng = fallbackLng;
  // Redirect if lng in path is not supported
  if (
    !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith("/_next")
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