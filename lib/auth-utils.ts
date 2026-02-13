import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { connectToDatabase } from "./db";
import { Company, type ICompany } from "./models";
import mongoose from "mongoose";

/**
 * Extended session type with company information
 */
export interface SessionWithCompany {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  company?: {
    id: string;
    name: string;
  } | null;
  expires: string;
}

/**
 * Get the current user's company ID from the database.
 * Returns null if no company is found.
 *
 * @param userId - The user's ID
 * @returns Company ID or null
 */
export async function getCompanyId(
  userId: string
): Promise<mongoose.Types.ObjectId | null> {
  await connectToDatabase();

  const company = await Company.findOne(
    { userId: new mongoose.Types.ObjectId(userId) },
    { _id: 1 }
  ).lean();

  return company?._id || null;
}

/**
 * Get the current user's full company profile.
 * Returns null if no company is found.
 *
 * @param userId - The user's ID
 * @returns Company document or null
 */
export async function getCompany(userId: string): Promise<ICompany | null> {
  await connectToDatabase();

  const company = await Company.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  });

  return company;
}

/**
 * Check if a user has completed company setup.
 *
 * @param userId - The user's ID
 * @returns Boolean indicating if company exists
 */
export async function hasCompanySetup(userId: string): Promise<boolean> {
  const companyId = await getCompanyId(userId);
  return companyId !== null;
}

/**
 * Require authentication and return session.
 * Redirects to login page if not authenticated.
 * Use this in Server Components.
 *
 * @returns The authenticated session
 */
export async function requireAuthOrRedirect() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}

/**
 * Require authentication and company setup.
 * Redirects to login if not authenticated.
 * Redirects to setup if company not configured.
 * Use this in protected Server Components.
 *
 * @returns The authenticated session
 */
export async function requireCompanySetup() {
  const session = await requireAuthOrRedirect();

  const hasCompany = await hasCompanySetup(session.user.id);

  if (!hasCompany) {
    redirect("/setup");
  }

  return session;
}

/**
 * Get session with company information.
 * Useful for pages that need both user and company data.
 *
 * @returns Session with optional company data
 */
export async function getSessionWithCompany(): Promise<SessionWithCompany | null> {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  const company = await getCompany(session.user.id);

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    },
    company: company
      ? {
          id: company._id.toString(),
          name: company.name,
        }
      : null,
    expires: session.expires,
  };
}

/**
 * Validate that the authenticated user owns a specific resource.
 * Use this in API routes to prevent cross-tenant access.
 *
 * @param resourceCompanyId - The company ID of the resource
 * @param userCompanyId - The company ID of the authenticated user
 * @returns Boolean indicating ownership
 */
export function validateOwnership(
  resourceCompanyId: string | mongoose.Types.ObjectId,
  userCompanyId: string | mongoose.Types.ObjectId
): boolean {
  const resourceId =
    typeof resourceCompanyId === "string"
      ? resourceCompanyId
      : resourceCompanyId.toString();
  const userId =
    typeof userCompanyId === "string"
      ? userCompanyId
      : userCompanyId.toString();

  return resourceId === userId;
}

/**
 * API route helper to get authenticated session or return error response.
 * Use this in API routes.
 *
 * @returns Object with session or error response
 */
export async function getAuthenticatedSession(): Promise<
  | { session: NonNullable<Awaited<ReturnType<typeof getSession>>>; error: null }
  | { session: null; error: Response }
> {
  const session = await getSession();

  if (!session?.user?.id) {
    return {
      session: null,
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  return { session, error: null };
}

/**
 * API route helper to get session with company.
 * Returns error if not authenticated or company not set up.
 *
 * @returns Object with session, company, or error response
 */
export async function getAuthenticatedSessionWithCompany(): Promise<
  | {
      session: NonNullable<Awaited<ReturnType<typeof getSession>>>;
      company: ICompany;
      error: null;
    }
  | { session: null; company: null; error: Response }
> {
  const { session, error } = await getAuthenticatedSession();

  if (error) {
    return { session: null, company: null, error };
  }

  const company = await getCompany(session.user.id);

  if (!company) {
    return {
      session: null,
      company: null,
      error: new Response(
        JSON.stringify({ error: "Company profile not set up" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      ),
    };
  }

  return { session, company, error: null };
}
