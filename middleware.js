import { NextResponse } from "next/server";
import acceptLanguage from "accept-language";
import { fallbackLng, languages, cookieName } from "@/app/i18n/settings";

acceptLanguage.languages(languages);

export const config = {
  // matcher: '/:lng*'
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)"],
};
const PUBLIC_FILE = /\.(.*)$/;
export function middleware(req) {
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    PUBLIC_FILE.test(req.nextUrl.pathname)
  ) {
    return;
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

// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";

// export async function middleware(req) {
//   const pathname = req.nextUrl.pathname;
//   const protectedPaths = [
//     "/dashboard", "/bonus", "/users"
//   ];

//   var fr;
//   for (let i = 0; i < protectedPaths.length; i++) {
//     const element = protectedPaths[i];
//     fr = 0;
//     if (pathname.match(element) || pathname === "/") {
//       if (!pathname.match("/login")) {
//         fr = 1;
//         break;
//       }
//     }
//   }
  
//   const res = NextResponse.next();
//   if (fr) {
//     const token = await getToken({ req });
//     console.log(token);
//     if (!token) {
//       // console.log(token.name[0].OPERATORROLE);
//       const url = new URL(`/login`, req.url);
//       url.searchParams.set("callbackUrl", pathname);
//       return NextResponse.redirect(url);
//     } 
//     // else {
//     //   if (parseInt(token.name[0].OPERATORROLE) !== 1) {
//     //     const url = new URL(`/bonus`, req.url);
//     //     url.searchParams.set("callbackUrl", pathname);
//     //     return NextResponse.redirect(url);
//     //   }
//     // }
//   }
//   return res;
// }

