import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGIN = "https://data.1212.mn";

function isAllowedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return (
      host === "data.1212.mn" &&
      (u.protocol === "https:" || u.protocol === "http:")
    );
  } catch {
    return false;
  }
}

function normalizeUpstreamUrl(raw: string | null): string | null {
  if (!raw) return null;
  // `request.nextUrl.searchParams.get("url")` is already decoded by Next.js.
  // Some upstream endpoints require reserved chars in path to remain percent-encoded (e.g. "," as "%2C").
  const fixed = raw.replace(/ /g, "%20").replace(/,/g, "%2C");
  try {
    return new URL(fixed).toString();
  } catch {
    return null;
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit & { next?: { revalidate?: number } },
  retries = 3,
  retryOn429 = true
): Promise<Response> {
  let lastRes: Response | null = null;
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(60000) });
    if (res.ok) return res;
    if (res.status === 429 && retryOn429 && i < retries) {
      const delayMs = [2000, 4000, 6000][i] ?? 6000;
      await new Promise((r) => setTimeout(r, delayMs));
      lastRes = res;
      continue;
    }
    if (res.status !== 502 && res.status !== 503) return res;
    lastRes = res;
    if (i < retries) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
  }
  return lastRes!;
}

async function readJsonOrText(res: Response): Promise<unknown> {
  const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
  if (contentType.includes("application/json") || contentType.includes("json-stat")) {
    return res.json();
  }
  return res.text();
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  const url = normalizeUpstreamUrl(rawUrl);
  if (!url || !isAllowedUrl(url)) {
    return NextResponse.json({ error: "Invalid or disallowed URL" }, { status: 400 });
  }
  try {
    const res = await fetchWithRetry(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    const data = await readJsonOrText(res);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Уучлаарай алдаа гарлаа.", details: data },
        { status: res.status }
      );
    }
    if (typeof data === "string") {
      return new NextResponse(data, {
        status: 200,
        headers: { "Content-Type": res.headers.get("content-type") ?? "text/plain; charset=utf-8" },
      });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "Уучлаарай алдаа гарлаа." },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  const url = normalizeUpstreamUrl(rawUrl);
  if (!url || !isAllowedUrl(url)) {
    return NextResponse.json({ error: "Invalid or disallowed URL" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const res = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      next: { revalidate: 3600 },
    });
    const data = await readJsonOrText(res);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Уучлаарай алдаа гарлаа.", details: data },
        { status: res.status }
      );
    }
    if (typeof data === "string") {
      return new NextResponse(data, {
        status: 200,
        headers: { "Content-Type": res.headers.get("content-type") ?? "text/plain; charset=utf-8" },
      });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "Уучлаарай алдаа гарлаа." },
      { status: 502 }
    );
  }
}
