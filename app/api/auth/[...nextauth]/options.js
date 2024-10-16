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
          
          const foundUser = await users.raw(`
            SELECT [username], [password] 
            FROM [user] 
            WHERE [username] = '${credentials.name}' AND [password] = '${credentials.password}'
          `, []);
          
            console.log(foundUser);
            
          // const foundUser = await users.raw(`CALL GetOperatorLogin('${credentials.name}','${credentials.password}')`,
          //   []);
          if (foundUser.length > 0) {
            return { name: foundUser };
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
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      return token;
    },
    async session({ session, token }) {
      return session;
    },
  },
};
