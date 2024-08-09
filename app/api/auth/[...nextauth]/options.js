import CredentialsProvider from "next-auth/providers/credentials";
import { users } from "@/app/api/config/db_csweb.config";

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
      async authorize(credentials, req) {
        try {
          const foundUser = await users.raw("CALL GetOperatorLogin(?,?)",
            [credentials.name, credentials.password]);
          if (foundUser[0][1].length > 0) {
            return { name: foundUser[0][1][0] };
          }
        } catch (error) {
          console.log(error);
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: "@dmindata",
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      // console.log("back", user);
      // if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      // if (session?.user) session.user.role = token.role;
      return session;
    },
  },
};
