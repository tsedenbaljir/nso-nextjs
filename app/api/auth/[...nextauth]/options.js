import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/app/api/config/db_csweb.config.js";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    "please provide process.env.NEXTAUTH_SECRET environment variable"
  );
}

export const options = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: {
          label: "name:",
          type: "text",
          placeholder: "your-name",
        },
        password: {
          label: "password:",
          type: "password",
          placeholder: "your-password",
        },
      },
      async authorize(credentials) {
        
        try {
          const user = await db("user")
            .where("username", credentials.name)
            .first();
          
          if (!user) {
            return null;
          }

          if (credentials.password === user.password) {
            return {
              id: user.id,
              name: user.username,
              email: user.email,
              role: user.role
            };
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/admin/dashboard",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET
};
