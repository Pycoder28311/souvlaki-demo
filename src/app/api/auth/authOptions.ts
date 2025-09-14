import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });

        if (user) {
          // Compare the entered password with the hashed password
          const isPasswordValid = await bcrypt.compare(
            credentials?.password || "",
            user.password
          );

          if (isPasswordValid) {
            // Return the user object if authentication is successful
            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name || "",
            };
          }
        }
        return null;
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin", // Custom sign-in page
    signOut: "/auth/signout", // Custom sign-out page
    error: "/auth/error", // Custom error page
  },
  secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET,
  debug: true,
};
