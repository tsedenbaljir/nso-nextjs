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

export async function checkAdminAuth(req) {
    try {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            secureCookie: process.env.NODE_ENV === "production",
        });

        if (!token) {
            return {
                isAuthenticated: false,
                isAdmin: false,
                error: "Not authenticated",
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

    if (!auth.isAdmin) {
        return NextResponse.json(
            { status: false, message: "Forbidden" },
            { status: 403 }
        );
    }

    return null;
}
