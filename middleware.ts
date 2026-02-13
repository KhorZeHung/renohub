import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

/**
 * Middleware using Edge-compatible auth config
 * This runs on the Edge runtime, so it cannot use Node.js APIs like MongoDB
 */
export default auth;

export const config = {
  matcher: [
    // Match all routes except static files and api routes
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
