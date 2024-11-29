import { getServerSession } from "next-auth/next";
import { options } from "../[...nextauth]/options";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const session = await getServerSession(options);
        
        if (!session) {
            return new Response(JSON.stringify({ 
                status: false, 
                message: "Not authenticated" 
            }), { status: 401 });
        }

        return new Response(JSON.stringify({
            status: true,
            user: session.user
        }), { status: 200 });

    } catch (error) {
        console.error('Error getting user:', error);
        return new Response(JSON.stringify({ 
            status: false, 
            message: "Server error" 
        }), { status: 500 });
    }
} 