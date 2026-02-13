import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible Auth.js configuration
 * This config is used in middleware (Edge runtime) where Node.js APIs are not available
 * It contains only the configuration, no adapters or Node.js-specific code
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // Define protected routes
      const isProtectedRoute =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/items") ||
        nextUrl.pathname.startsWith("/leads") ||
        nextUrl.pathname.startsWith("/settings");

      // Define auth routes (login, register, etc.)
      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register") ||
        nextUrl.pathname.startsWith("/verify");

      // Setup page is special - requires auth but not company
      const isSetupRoute = nextUrl.pathname.startsWith("/setup");

      // Redirect unauthenticated users from protected routes
      if (isProtectedRoute && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      // Redirect authenticated users from auth routes to dashboard
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Setup route requires authentication
      if (isSetupRoute && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Providers are added in the full auth.ts config
};
