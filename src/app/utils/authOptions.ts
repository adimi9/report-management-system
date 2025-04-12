// src/app/utils/authOptions.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../lib/prisma";"; // adjust path based on your structure
import { comparePasswords } from "../api/utils";
import { UserRole } from "@prisma/client";

// NextAuth Configuration
export const authOptions: NextAuthOptions = {
  providers: [
    // --- Credentials Provider ---
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<"email" | "password", string> | undefined) {
        try {
          console.log("Authorize function called with credentials:", credentials);

          if (!credentials?.email || !credentials?.password) {
            console.log("Credentials missing.");
            return null;
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          console.log("User found:", user);

          if (user && (await comparePasswords(credentials.password, user.password))) {
            console.log("Password verified.");
            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }

          console.log("Invalid credentials.");
          return null;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // --- JWT Callback ---
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (dbUser?.id) {
          token.id = dbUser.id.toString();
          token.role = dbUser.role;
        }
      }
      return token;
    },

    // --- Session Callback ---
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
