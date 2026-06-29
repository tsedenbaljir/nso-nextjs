import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "@/app/api/config/db_csweb.config.js";
import { ADMIN_SESSION_MAX_AGE } from "@/app/api/auth/sessionConfig";
import { fallbackLng } from "@/app/i18n/settings";

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
          const username = credentials?.name?.trim();
          const password = credentials?.password?.trim();

          if (!username || !password) {
            return null;
          }

          const user = await db("user")
            .where("username", username)
            .first();

          if (!user) {
            return null;
          }

          const storedPassword = user.password || "";
          const isBcryptHash = storedPassword.startsWith("$2");
          const passwordValid = isBcryptHash
            ? await bcrypt.compare(password, storedPassword)
            : password === storedPassword;

          if (!passwordValid) {
            return null;
          }
          // if (!isBcryptHash) {
          //   const hashedPassword = await bcrypt.hash(credentials.password, 10);
          //   await db("user").where({ id: user.id }).update({ password: hashedPassword });
          // }
          return {
            id: user.id,
            name: user.username,
            role: user.Roles,
          };
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
    signIn: `/${fallbackLng}/login`,
  },
  session: {
    strategy: "jwt",
    maxAge: ADMIN_SESSION_MAX_AGE,
  },
  jwt: {
    maxAge: ADMIN_SESSION_MAX_AGE,
  },
  secret: process.env.NEXTAUTH_SECRET
};
