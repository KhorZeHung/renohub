# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture Overview

RenoHub is a quotation management SaaS for renovation contractors built with Next.js 16 (App Router), React 19, TypeScript, MongoDB/Mongoose, and NextAuth v5 (magic link authentication).

### Directory Structure

- `app/` - Next.js App Router pages and API routes
  - `(auth)/` - Authentication pages (login, register, verify, setup)
  - `(dashboard)/` - Protected dashboard routes (items, leads, quotations, settings)
  - `api/` - API route handlers
- `lib/` - Business logic, database, auth, utilities
  - `models/` - Mongoose schemas
  - `validations/` - Zod validation schemas
- `components/` - React components
  - `ui/` - shadcn/ui base components
- `types/` - TypeScript type definitions

### Authentication Architecture

**Split auth config for Edge runtime compatibility:**
- `lib/auth.config.ts` - Edge-compatible config (used by middleware)
- `lib/auth.ts` - Full config with MongoDB adapter (used by server components/API routes)
- `middleware.ts` - Must import from `auth.config.ts`, not `auth.ts`. Must use `export default auth` pattern (not destructured export like `export const { auth: middleware }`)

The Edge runtime cannot use Node.js modules like `crypto` (used by MongoDB). Never import `auth.ts` in middleware.

### Multi-Tenant Pattern

Every resource is scoped to a company. The ownership chain is:
```
User (1) → Company (1) → Resources (many)
```

API routes must:
1. Call `getAuthenticatedSession()` to verify auth
2. Filter queries by `companyId`
3. Use `validateOwnership()` for resource access checks

### API Route Pattern

```typescript
// Standard protected API route structure
export async function GET(request: Request) {
  const { session, errorResponse } = await getAuthenticatedSession();
  if (errorResponse) return errorResponse;

  // Validate with Zod, query with Mongoose
  // Transform _id to id for response
}
```

### Form Validation

Uses React Hook Form + Zod. Schemas are in `lib/validations/`.

### Key Utilities

- `lib/utils.ts` - `cn()` for Tailwind classes, `formatCurrency()`, `formatDate()`, `generateQuotationNumber()`
- `lib/rate-limit.ts` - In-memory rate limiter (3 requests/minute per identifier)
- `lib/db.ts` - MongoDB connection with global caching for dev hot reload

## Environment Variables

Required in `.env.local`:
- `MONGODB_URI` - MongoDB connection string
- `AUTH_SECRET`, `AUTH_URL` - NextAuth config
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` - Email for magic links
- `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL` - App config

## Key Patterns

- Server Components by default; use `"use client"` only for interactive elements
- MongoDB ObjectId transformed to string `id` in API responses
- Path alias: `@/*` maps to project root
- UI components use shadcn/ui (new-york style) with Tailwind CSS 4

## Front end design
- always create skeleton in the same pages, for loading states
- always create loading states for api calls
- always check for components that exists and can be reused, before creating a new one. 
- always prioritize mobile or tablet view first
- always make mobile responsive design
- always prioritize shadcn/ui components
- do not display or show Object ID return from API 


## Backend Patterns
- always return user friendly error messages
- always add new added API into /documentation/backend.md