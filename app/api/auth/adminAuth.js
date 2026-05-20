import { getToken } from "next-auth/jwt"

export async function checkAdminAuth(req) {
    try {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            secureCookie: process.env.NODE_ENV === 'production'
        })
        
        if (!token) {
            return {
                isAuthenticated: false,
                error: "Not authenticated"
            }
        }

        if (token.exp && Date.now() / 1000 >= token.exp) {
            return {
                isAuthenticated: false,
                error: "Session expired"
            }
        }

        return {
            isAuthenticated: true,
            user: {
                id: token.id,
                name: token.name,
                email: token.email,
                role: token.role
            }
        }
    } catch (error) {
        console.error('Auth check error:', error)
        return {
            isAuthenticated: false,
            error: "Authentication check failed"
        }
    }
} 