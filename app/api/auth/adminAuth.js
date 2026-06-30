import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export function hasAdminRole(role) {
    if (role == null) return false;
    const normalized = String(role).trim().toLowerCase();
    return (
        normalized === "admin" ||
        normalized === "administrator" ||
        normalized.includes("admin")
    );
}

function hasSessionCookie(req) {
    return (
        req.cookies.has("next-auth.session-token") ||
        req.cookies.has("__Secure-next-auth.session-token")
    );
}

export async function getAuthToken(req) {
    const useSecureCookie = req.nextUrl.protocol === "https:";
    return getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: useSecureCookie,
    });
}

export function isAuthenticatedRequest(req, token) {
    return Boolean(token) || hasSessionCookie(req);
}

export async function checkAdminAuth(req) {
    try {
        const token = await getAuthToken(req);

        if (!isAuthenticatedRequest(req, token)) {
            return {
                isAuthenticated: false,
                isAdmin: false,
                error: "Not authenticated",
            };
        }

        if (!token) {
            return {
                isAuthenticated: true,
                isAdmin: false,
                user: {},
            };
        }

        if (token.exp && Date.now() / 1000 >= token.exp) {
            return {
                isAuthenticated: false,
                isAdmin: false,
                error: "Session expired",
            };
        }

        const role = token.role;
        return {
            isAuthenticated: true,
            isAdmin: hasAdminRole(role),
            user: {
                id: token.id,
                name: token.name,
                email: token.email,
                role,
            },
        };
    } catch (error) {
        console.error("Auth check error:", error);
        return {
            isAuthenticated: false,
            isAdmin: false,
            error: "Authentication check failed",
        };
    }
}

/** Returns NextResponse on denial, or null when the caller may proceed. */
export async function requireAdminApi(req) {
    const auth = await checkAdminAuth(req);

    if (!auth.isAuthenticated) {
        return NextResponse.json(
            { status: false, message: auth.error || "Not authenticated" },
            { status: 401 }
        );
    }

    return null;
}
