// File: src/app/api/auth/[...nextauth]/route.ts
// Sets up NextAuth with a custom credentials provider, Prisma user lookup, and JWT/session callbacks.

// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next";
import { authOptions } from "../../../utils/authOptions";

// Initialize and export NextAuth handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
