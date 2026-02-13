import { handlers } from "@/lib/auth";

// Force Node.js runtime for NextAuth handlers
// Edge runtime doesn't support MongoDB/Nodemailer dependencies
export const runtime = "nodejs";

export const { GET, POST } = handlers;
