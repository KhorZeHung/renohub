import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import { MongoClient } from "mongodb";
import { authConfig } from "./auth.config";

// MongoDB client for Auth.js adapter
const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

/**
 * Full Auth.js configuration with MongoDB adapter
 * This extends the Edge-compatible base config with Node.js-specific features
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Nodemailer({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ email }) {
      // email.verificationRequest is true when sending magic link (not verification)
      if (email?.verificationRequest) {
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      // Add user ID to JWT token when user signs in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID from JWT token to session
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle the callbackUrl passed from signIn
      // If url is a relative path, prepend baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // If url is from the same origin, use it
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  session: {
    // Use JWT strategy for Edge middleware compatibility
    // Database strategy doesn't work with Edge runtime
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV === "development",
});

/**
 * Get the current session on the server
 * Use this in Server Components and API routes
 */
export async function getSession() {
  return await auth();
}

/**
 * Check if the user is authenticated
 * Throws an error if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
