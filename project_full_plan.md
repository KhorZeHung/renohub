# RenoHub PRD - Renovation Contractor Quotation Management System

## Executive Summary

**RenoHub** is a Progressive Web Application (PWA) designed to dramatically reduce quotation creation time for renovation contractors from approximately 1 working day to under 15 minutes. Built with Next.js, MongoDB, Tailwind CSS, Shad/cs and Lucide icons, the application provides a comprehensive solution for managing leads, creating professional quotations, and tracking business performance.

**Core Value Proposition**: Transform the tedious, manual process of creating renovation quotations into a streamlined, repeatable workflow that produces professional, branded documents in minutes rather than hours.

**Target Launch**: Q2 2026 | **Platform**: Web (PWA with offline capabilities) | **Primary User**: Single renovation contractor per instance | **Deployment**: Self-hosted Ubuntu 22.04 VPS

---

## Problem Statement

### Current Pain Points

Renovation contractors currently face significant challenges in quotation management:

1. **Time-Intensive Process**: Creating a single quotation manually takes approximately 8 hours (1 working day), involving gathering client information, calculating material costs, labor estimates, and formatting documents.

2. **Inconsistent Branding**: Without standardized templates, quotations vary in quality and professionalism, potentially affecting client perception and conversion rates.

3. **Data Silos**: Client information, pricing data, and historical quotations exist in disconnected spreadsheets, emails, and paper documents.

4. **No Performance Visibility**: Contractors lack insights into quotation-to-conversion rates, average deal sizes, and lead pipeline health.

5. **Mobile Accessibility Gap**: Field workers cannot create or reference quotations from job sites without returning to their office.

### Solution Overview

RenoHub addresses these challenges by providing:

- **Reusable Items Library**: Pre-configured renovation items with pricing, eliminating repetitive data entry
- **Lead-Centric Workflow**: Organized client management with multiple quotation versions per lead
- **PWA Capabilities**: Offline access and mobile-friendly interface for on-site use
- **Professional PDF Generation**: Branded, consistent quotation documents with one-click generation
- **Business Intelligence Dashboard**: Visual insights into lead pipeline and sales performance

---

## Target Users

### Primary Persona: Josh - Independent Renovation Contractor

**Demographics**:

- Age: 35-55
- Business: Solo practitioner or small team (1-5 employees)
- Annual Revenue: $200K - $2M
- Technical Proficiency: Moderate (comfortable with smartphones and basic business software)
- Primary Device: Smartphone for field work, laptop for office tasks

**Goals**:

- Reduce administrative time to focus on project execution
- Present professional, detailed quotations that win contracts
- Track business performance without complex accounting software
- Access client and quotation information from job sites

**Frustrations**:

- Spending evenings creating quotations instead of resting
- Losing track of follow-ups with potential clients
- Inconsistent pricing leading to margin erosion
- Difficulty remembering past project details for repeat clients

---

## User Stories

### Authentication and Onboarding

| ID     | User Story                                                                           | Acceptance Criteria                                                                 | Priority |
| ------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | -------- |
| US-001 | As a new user, I want to register with my email so I can create an account           | User can enter name and email; receives magic link; account activated on link click | P0       |
| US-002 | As a registered user, I want to log in via magic link                                | User enters email, receives magic link via email, clicks to authenticate            | P0       |
| US-003 | As a new user, I want to set up my company profile so quotations display my branding | User can enter company name, email, phone, upload logo; data persists               | P0       |
| US-004 | As a new user, I want a guided tour so I understand how to use the system            | Interactive walkthrough of dashboard, items library, leads, and quotation creation  | P1       |

### Items Library

| ID     | User Story                                                                                          | Acceptance Criteria                                            | Priority |
| ------ | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------- |
| US-005 | As a contractor, I want to create preset items with pricing so I can quickly add them to quotations | Create item with name, unit, price, description, images, brand | P0       |
| US-006 | As a contractor, I want to edit existing items so I can update pricing                              | All fields editable, changes saved immediately                 | P0       |
| US-007 | As a contractor, I want to delete items I no longer offer                                           | Soft delete with confirmation, item hidden from library        | P1       |
| US-008 | As a contractor, I want to search and filter items so I can find them quickly                       | Search by name, filter by category/brand                       | P1       |
| US-009 | As a contractor, I want to upload multiple images per item so clients see product options           | Up to 5 images per item, drag-and-drop upload                  | P2       |

### Leads Management

| ID     | User Story                                                                                        | Acceptance Criteria                                                         | Priority |
| ------ | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------- |
| US-010 | As a contractor, I want to create leads with client information so I can track potential projects | Create lead with name, contact, email, budget, site address, remark, status | P0       |
| US-011 | As a contractor, I want to update lead status so I can track progress                             | Status options: New, Contacted, Quoted, Negotiating, Won, Lost              | P0       |
| US-012 | As a contractor, I want to view all leads in a list so I can see my pipeline                      | Sortable, filterable list with key info visible                             | P0       |
| US-013 | As a contractor, I want to add notes/remarks to leads so I can remember context                   | Rich text notes with timestamps                                             | P1       |
| US-014 | As a contractor, I want to see all quotations for a lead so I can track versions                  | List of quotations within lead detail view                                  | P0       |

### Quotation Creation

| ID     | User Story                                                                             | Acceptance Criteria                                               | Priority |
| ------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------- |
| US-015 | As a contractor, I want to create quotations within leads so they're linked to clients | Create quotation from lead detail page, auto-populate client info | P0       |
| US-016 | As a contractor, I want to add items from my library to quotations so I save time      | Search/browse items, add with quantity, auto-calculate line total | P0       |
| US-017 | As a contractor, I want to add custom line items so I can include one-off services     | Manual entry of description, quantity, unit price                 | P0       |
| US-018 | As a contractor, I want to apply discounts so I can offer competitive pricing          | Percentage or fixed amount discount at line or document level     | P1       |
| US-019 | As a contractor, I want to add tax calculations so quotations are accurate             | Configurable tax rate, auto-calculated tax amount                 | P0       |
| US-020 | As a contractor, I want to set quotation validity period so clients know urgency       | Configurable days valid, expiry date displayed                    | P1       |
| US-021 | As a contractor, I want to add terms and conditions so legal requirements are met      | Customizable T&C template, editable per quotation                 | P1       |
| US-022 | As a contractor, I want to generate PDF quotations so I can share with clients         | Professional PDF with logo, line items, totals, T&C               | P0       |
| US-023 | As a contractor, I want to email quotations directly so I save time                    | Send PDF as email attachment from within app                      | P2       |

### Standalone Quotations

| ID     | User Story                                                                                             | Acceptance Criteria                              | Priority |
| ------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | -------- |
| US-024 | As a contractor, I want to create quick quotations without leads for walk-in requests                  | Full quotation creation without lead association | P1       |
| US-025 | As a contractor, I want standalone quotations to generate PDFs only (not saved) so my data stays clean | PDF generated, no database record created        | P1       |

### Dashboard

| ID     | User Story                                                                    | Acceptance Criteria                                  | Priority |
| ------ | ----------------------------------------------------------------------------- | ---------------------------------------------------- | -------- |
| US-026 | As a contractor, I want to see lead statistics so I understand my pipeline    | Total leads, leads by status, conversion rate        | P0       |
| US-027 | As a contractor, I want to see sales metrics so I track performance           | Total quoted value, won value, average deal size     | P1       |
| US-028 | As a contractor, I want to see recent activity so I know what needs attention | Recent leads, recent quotations, upcoming follow-ups | P1       |

### PWA Features

| ID     | User Story                                                                                | Acceptance Criteria                                | Priority |
| ------ | ----------------------------------------------------------------------------------------- | -------------------------------------------------- | -------- |
| US-029 | As a contractor, I want to install the app on my phone so I can access it easily          | Add to home screen prompt, app icon, splash screen | P1       |
| US-030 | As a contractor, I want to view leads and quotations offline so I can work from job sites | Cached data accessible without internet            | P2       |
| US-031 | As a contractor, I want offline changes to sync when I'm back online                      | Background sync of queued operations               | P2       |

---

## Detailed Feature Specifications

### 1. User Authentication

**Registration Flow**:

1. User visits registration page
2. Enters: Full Name, Email Address
3. System validates email uniqueness
4. System creates user record with `emailVerified: false`
5. System generates secure magic link token (32 bytes, SHA-256 hashed for storage)
6. System sends email with magic link (valid 15 minutes)
7. User clicks link, token verified, `emailVerified: true`
8. User redirected to company configuration page

**Login Flow**:

1. User enters email on login page
2. System verifies email exists and is verified
3. System generates new magic link token
4. System sends email with magic link (valid 15 minutes)
5. User clicks link, session created
6. User redirected to dashboard

**Session Management Strategy**:

1. **Token-Based Authentication**:
   - Access Token: Short-lived JWT (30 minutes)
   - Refresh Token: Long-lived token (30 days), stored in HttpOnly cookie
   - Tokens stored securely: HttpOnly cookies (more secure against XSS)

2. **Sliding Sessions**:
   - `lastActiveAt` timestamp updated only when refresh token is used (not on every request)
   - Session only expires if user is inactive for 30 days straight
   - Access token automatically refreshed using refresh token when expired

3. **Graceful Re-authentication**:
   - When refresh token expires, app detects and shows: "Your session expired. Click here to send a new login link."
   - One click sends magic link, user back in seamlessly

**Security Requirements**:

- Magic link tokens: 32-byte cryptographic randomness
- Token storage: SHA-256 hashed, never stored raw
- Token expiry: 15 minutes
- Single-use enforcement: Token marked used after verification
- Rate limiting: 3 requests per email per minute
- HTTPS required in production
- Refresh tokens rotated on each use (rotation strategy)

### 2. Company Profile

**Required Fields**:
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| Company Name | String | 2-100 chars, required | Displayed on quotations |
| Email | Email | Valid format, required | Contact email on quotations |
| Contact Number | String | 10-15 digits | Phone on quotations |
| Logo | Image | PNG/JPEG, max 2MB, 1080x1080 recommended | Header of quotations |

**Optional Fields**:
| Field | Type | Notes |
|-------|------|-------|
| Address | String | Company address for quotation header |
| Website | URL | Optional company website |
| Tax Registration Number | String | GST/VAT number if applicable |
| Default Terms & Conditions | Text | Pre-filled on new quotations |
| Default Validity Days | Number | Default quotation validity period |

### 3. Dashboard

**Metrics Display**:

**Lead Pipeline Section**:

- Total Leads (all time)
- Leads by Status (pie chart): New, Contacted, Quoted, Negotiating, Won, Lost
- Conversion Rate: (Won / Total) × 100%
- This Month's New Leads

**Sales Performance Section**:

- Total Quoted Value (sum of all quotation totals)
- Won Value (sum of won quotation totals)
- Average Deal Size (Won Value / Won Count)
- Monthly Trend (bar chart, last 6 months)

**Recent Activity Section**:

- Last 5 Leads Created
- Last 5 Quotations Generated
- Leads requiring follow-up (no activity in 7 days)

### 4. Items Library

**Item Schema**:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | String | Yes | 2-200 chars |
| unit | String | Yes | e.g., "sqft", "piece", "hour", "lot" |
| pricePerUnit | Number | Yes | ≥ 0, max 2 decimal places |
| description | String | No | Max 1000 chars |
| brand | String | No | Max 100 chars |
| category | String | No | For filtering |
| images | Array[String] | No | Max 5 URLs |
| isDeleted | Boolean | Yes | Default false, true = soft deleted |

**UI Features**:

- Grid and list view toggle
- Search by name/description
- Filter by category/brand
- Sort by name, price, recently added
- Bulk import via CSV (future enhancement)

### 5. Leads Management

**Lead Schema**:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| clientName | String | Yes | 2-100 chars |
| contactNumber | String | Yes | Phone format |
| email | String | No | Valid email format |
| budget | Number | No | ≥ 0 |
| siteAddress | String | No | Max 500 chars |
| remark | String | No | Max 2000 chars |
| status | Enum | Yes | New, Contacted, Quoted, Negotiating, Won, Lost |
| source | String | No | Referral, Website, Walk-in, etc. |

**Lead Status Workflow**:

```
New → Contacted → Quoted → Negotiating → Won
                                      ↘ Lost
```

**Lead-Quotation Status Linkage**:

- When a quotation status changes to "accepted", the associated lead status automatically updates to "Won"
- Only ONE quotation per lead can have status "accepted"
- If a new quotation is accepted, any previously accepted quotation for that lead reverts to "sent" status

### 6. Quotation Creation

**Quotation Structure**:

**Header Section**:

- Company logo, name, contact (from company profile)
- Quotation number (auto-generated: QT-YYYYMM-XXXX)
- Quotation date
- Valid until date
- Client information (from lead or manual entry)

**Line Items Section**:
| Column | Type | Source |
|--------|------|--------|
| Description | String | From item or custom |
| Quantity | Number | User input |
| Unit | String | From item or custom |
| Unit Price | Currency | From item or custom |
| Amount | Currency | Calculated: Qty × Unit Price |

**Totals Section**:

- Subtotal (sum of line amounts)
- Discount (percentage or fixed)
- Taxable Amount (Subtotal - Discount)
- Tax Amount (Taxable × Tax Rate)
- Grand Total (Taxable + Tax)

**Terms Section**:

- Validity period
- Payment terms
- Custom terms and conditions
- Notes/remarks

**Quotation Number Format**: `QT-{YYYYMM}-{sequential 4-digit}`
Example: QT-202602-0042

### 7. PDF Generation

**Technology**: @react-pdf/renderer (server-side generation)

**PDF Layout**:

- A4 format, portrait orientation
- 20mm margins
- Company logo (top-left, 80x40px)
- Company info (top-right)
- "QUOTATION" title with number
- Client details block
- Line items table with alternating row colors
- Totals section (right-aligned)
- Terms and conditions (bottom, smaller font)
- Page numbers (footer, fixed)

**Features**:

- Download as PDF
- Preview in browser
- Email as attachment (Phase 3)

---

## Complete Database Schema

### MongoDB Collections

#### 1. Users Collection

```javascript
// Collection: users
{
  _id: ObjectId,
  name: String,                    // Required, 2-100 chars
  email: String,                   // Required, unique, lowercase
  emailVerified: Date | null,      // Timestamp when verified
  role: String,                    // "owner" (single user system)
  lastActiveAt: Date,              // For sliding session tracking
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.users.createIndex({ email: 1 }, { unique: true })
```

#### 2. Companies Collection

```javascript
// Collection: companies
{
  _id: ObjectId,
  userId: ObjectId,                // Reference to users._id (1:1 relationship)
  name: String,                    // Required, 2-100 chars
  email: String,                   // Required
  contactNumber: String,           // 10-15 chars
  address: String,                 // Optional
  website: String,                 // Optional URL
  taxRegistrationNumber: String,   // Optional
  logo: {
    url: String,                   // Local path: /uploads/logos/{filename}
    filename: String,              // Original filename for reference
    width: Number,
    height: Number
  },
  defaultTerms: String,            // Default T&C for quotations
  defaultValidityDays: Number,     // Default: 30
  defaultTaxRate: Number,          // Default: 0
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.companies.createIndex({ userId: 1 }, { unique: true })
```

#### 3. Items Collection

```javascript
// Collection: items
{
  _id: ObjectId,
  companyId: ObjectId,             // Reference to companies._id
  name: String,                    // Required, 2-200 chars
  unit: String,                    // Required: "sqft", "piece", "hour", "lot", etc.
  pricePerUnit: Decimal128,        // Required, >= 0
  description: String,             // Optional, max 1000 chars
  brand: String,                   // Optional, max 100 chars
  category: String,                // Optional, for filtering
  images: [{
    url: String,                   // Local path: /uploads/items/{filename}
    filename: String,              // Original filename for reference
    order: Number
  }],                              // Max 5 images
  isDeleted: Boolean,               // Default: false, true = soft deleted
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.items.createIndex({ companyId: 1 })
db.items.createIndex({ companyId: 1, isDeleted: 1 })
db.items.createIndex({ companyId: 1, name: "text", description: "text" })
db.items.createIndex({ companyId: 1, category: 1 })
```

#### 4. Leads Collection

```javascript
// Collection: leads
{
  _id: ObjectId,
  companyId: ObjectId,             // Reference to companies._id
  clientName: String,              // Required, 2-100 chars
  contactNumber: String,           // Required
  email: String,                   // Optional
  budget: Decimal128,              // Optional, >= 0
  siteAddress: String,             // Optional
  remark: String,                  // Optional, max 2000 chars
  status: String,                  // Enum: "new", "contacted", "quoted", "negotiating", "won", "lost"
  statusHistory: [{
    status: String,
    changedAt: Date,
    note: String
  }],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.leads.createIndex({ companyId: 1 })
db.leads.createIndex({ companyId: 1, status: 1 })
db.leads.createIndex({ companyId: 1, createdAt: -1 })
db.leads.createIndex({ companyId: 1, clientName: "text" })
```

#### 5. Quotations Collection

```javascript
// Collection: quotations
{
  _id: ObjectId,
  companyId: ObjectId,             // Reference to companies._id
  leadId: ObjectId | null,         // Reference to leads._id (null for standalone)
  quotationNumber: String,         // Format: QT-YYYYMM-XXXX

  // Client Info (denormalized for historical accuracy)
  client: {
    name: String,
    contactNumber: String,
    email: String,
    address: String
  },

  // Company Info Snapshot (denormalized)
  companySnapshot: {
    name: String,
    email: String,
    contactNumber: String,
    address: String,
    logo: String
  },

  // Line Items
  lineItems: [{
    itemId: ObjectId | null,       // Reference if from library, null if custom
    description: String,
    quantity: Decimal128,
    unit: String,
    unitPrice: Decimal128,
    amount: Decimal128,            // quantity * unitPrice
    discount: {
      type: String,                // "percentage" or "fixed"
      value: Decimal128
    }
  }],

  // Calculations
  subtotal: Decimal128,
  discount: {
    type: String,                  // "percentage" or "fixed"
    value: Decimal128,
    amount: Decimal128             // Calculated discount amount
  },
  taxableAmount: Decimal128,
  taxRate: Decimal128,             // Percentage
  taxAmount: Decimal128,
  total: Decimal128,

  // Metadata
  validUntil: Date,
  termsAndConditions: String,
  notes: String,
  status: String,                  // "draft", "sent", "viewed", "accepted", "rejected", "expired"
                                   // NOTE: Only ONE quotation per lead can have status "accepted"
                                   // When quotation status changes to "accepted", lead status auto-updates to "won"

  // PDF Generation
  pdfUrl: String,                  // Generated PDF storage URL
  pdfGeneratedAt: Date,

  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.quotations.createIndex({ companyId: 1 })
db.quotations.createIndex({ companyId: 1, leadId: 1 })
db.quotations.createIndex({ companyId: 1, quotationNumber: 1 }, { unique: true })
db.quotations.createIndex({ companyId: 1, createdAt: -1 })
db.quotations.createIndex({ companyId: 1, status: 1 })
```

#### 6. Verification Tokens Collection

```javascript
// Collection: verification_tokens
{
  _id: ObjectId,
  identifier: String,              // Email address
  token: String,                   // SHA-256 hashed token
  expires: Date,                   // Token expiry timestamp
  type: String,                    // "magic-link" or "email-verification"
  used: Boolean,                   // Single-use enforcement
  usedAt: Date | null
}

// Indexes
db.verification_tokens.createIndex({ token: 1 })
db.verification_tokens.createIndex({ identifier: 1 })
db.verification_tokens.createIndex({ expires: 1 }, { expireAfterSeconds: 0 }) // TTL index
```

#### 7. Sessions Collection (if using database sessions)

```javascript
// Collection: sessions
{
  _id: ObjectId,
  sessionToken: String,            // Unique session identifier
  userId: ObjectId,                // Reference to users._id
  expires: Date,
  createdAt: Date
}

// Indexes
db.sessions.createIndex({ sessionToken: 1 }, { unique: true })
db.sessions.createIndex({ userId: 1 })
db.sessions.createIndex({ expires: 1 }, { expireAfterSeconds: 0 })
```

### Entity Relationship Diagram (Text)

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    Users    │──1:1──│   Companies  │──1:N──│    Items    │
└─────────────┘       └──────────────┘       └─────────────┘
                             │
                             │ 1:N
                             ▼
                      ┌─────────────┐
                      │    Leads    │
                      └─────────────┘
                             │
                             │ 1:N
                             ▼
                      ┌─────────────┐
                      │ Quotations  │
                      └─────────────┘

┌───────────────────┐       ┌─────────────┐
│VerificationTokens │       │  Sessions   │
└───────────────────┘       └─────────────┘
        │                         │
        └────────── Users ────────┘
```

---

## System Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser/PWA)                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │   Next.js   │  │  React-PDF  │  │  IndexedDB  │  │   Service   ││
│  │  App Router │  │   Viewer    │  │   (idb)     │  │   Worker    ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           NGINX (Reverse Proxy)                     │
│              SSL Termination | Caching | Security Headers           │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER (PM2 + Node.js)                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │  API Routes │  │   Auth.js   │  │ Server      │  │ React-PDF   ││
│  │  (REST)     │  │  (NextAuth) │  │ Components  │  │ Renderer    ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    MongoDB      │ │  Local Storage  │ │     Resend      │
│    Atlas        │ │  (public/uploads)│ │    (Email)      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Deployment Architecture (Ubuntu 22.04 VPS)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Ubuntu 22.04 VPS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    NGINX (Port 80/443)                       │   │
│  │  - SSL termination (Let's Encrypt)                          │   │
│  │  - Reverse proxy to localhost:3000                          │   │
│  │  - Static file caching                                       │   │
│  │  - Security headers                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    PM2 Process Manager                       │   │
│  │  - Auto-restart on crash                                     │   │
│  │  - Zero-downtime reloads                                     │   │
│  │  - Cluster mode (optional)                                   │   │
│  │  - Log management                                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Next.js Application (Port 3000)                 │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │   │
│  │  │  /public/    │  │  /api/       │  │  /app/       │       │   │
│  │  │  uploads/    │  │  routes      │  │  pages       │       │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │       MongoDB Atlas           │
              │   (Cloud-hosted database)     │
              └───────────────────────────────┘
```

### Technology Stack Justification

| Technology              | Purpose              | Justification                                                                        |
| ----------------------- | -------------------- | ------------------------------------------------------------------------------------ |
| **Next.js 14+**         | Full-stack framework | Server components for performance, API routes, built-in PWA support, excellent DX    |
| **MongoDB Atlas**       | Database             | Flexible schema for quotations, native JSON support, free tier for MVP, easy scaling |
| **Tailwind CSS**        | Styling              | Rapid UI development, consistent design system, small bundle size                    |
| **shadcn/ui**           | UI Components        | High-quality, accessible components built on Radix UI, fully customizable            |
| **Lucide Icons**        | Iconography          | Modern icon set, tree-shakeable, consistent with Tailwind aesthetic                  |
| **Auth.js**             | Authentication       | Magic link support, MongoDB adapter, industry-standard security                      |
| **@react-pdf/renderer** | PDF Generation       | React-native approach, server-side rendering, professional output                    |
| **Local File Storage**  | Image Storage        | Self-hosted, no external dependencies, served via Next.js/Nginx                      |
| **Resend**              | Email Service        | Modern API, reliable delivery, 100 free emails/day                                   |
| **Serwist**             | PWA/Service Worker   | Official Next.js recommendation, active maintenance                                  |
| **PM2**                 | Process Manager      | Auto-restart, zero-downtime reloads, clustering, production-ready                    |
| **Nginx**               | Reverse Proxy        | SSL termination, caching, security headers, load balancing                           |
| **Let's Encrypt**       | SSL Certificates     | Free, auto-renewal, industry standard                                                |

### Next.js Project Structure

```
RenoHub/
├── app/
│   ├── (auth)/                    # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── verify/
│   │   │   └── page.tsx
│   │   └── layout.tsx             # Auth layout (no sidebar)
│   │
│   ├── (dashboard)/               # Protected route group
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── items/
│   │   │   ├── page.tsx           # Items list
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Edit item
│   │   ├── leads/
│   │   │   ├── page.tsx           # Leads list
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Lead detail
│   │   │       └── quotations/
│   │   │           └── new/
│   │   │               └── page.tsx
│   │   ├── quotations/
│   │   │   ├── page.tsx           # All quotations
│   │   │   ├── standalone/
│   │   │   │   └── page.tsx       # Standalone quotation creator
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # View quotation
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx           # Company settings
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │   └── layout.tsx             # Dashboard layout with sidebar
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── items/
│   │   │   ├── route.ts           # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       └── route.ts       # GET, PUT, DELETE
│   │   ├── leads/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── quotations/
│   │   │   ├── route.ts
│   │   │   ├── standalone/
│   │   │   │   └── route.ts       # Generate PDF only
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── pdf/
│   │   │           └── route.ts   # Generate/download PDF
│   │   ├── upload/
│   │   │   ├── route.ts           # Image upload handler (local storage)
│   │   │   └── [filename]/
│   │   │       └── route.ts       # Delete uploaded file
│   │   └── dashboard/
│   │       └── stats/
│   │           └── route.ts       # Dashboard statistics
│   │
│   ├── offline/
│   │   └── page.tsx               # Offline fallback
│   ├── sw.ts                      # Service worker source
│   ├── manifest.ts                # PWA manifest
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing/redirect
│   └── globals.css
│
├── components/
│   ├── ui/                        # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── forms/
│   │   ├── item-form.tsx
│   │   ├── lead-form.tsx
│   │   ├── quotation-form.tsx
│   │   └── company-form.tsx
│   ├── quotation/
│   │   ├── line-item-row.tsx
│   │   ├── totals-section.tsx
│   │   ├── pdf-preview.tsx
│   │   └── quotation-pdf.tsx      # React-PDF template
│   ├── dashboard/
│   │   ├── stats-card.tsx
│   │   ├── lead-pipeline-chart.tsx
│   │   └── recent-activity.tsx
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── mobile-nav.tsx
│   │   └── page-header.tsx
│   ├── pwa/
│   │   ├── install-prompt.tsx
│   │   ├── offline-indicator.tsx
│   │   └── update-prompt.tsx
│   └── tour/
│       └── guided-tour.tsx
│
├── lib/
│   ├── db.ts                      # MongoDB client singleton
│   ├── auth.ts                    # Auth.js configuration
│   ├── validations/
│   │   ├── item.ts                # Zod schemas
│   │   ├── lead.ts
│   │   └── quotation.ts
│   ├── utils.ts                   # Utility functions
│   ├── offline-storage.ts         # IndexedDB helpers
│   └── pdf/
│       └── generate-quotation.ts  # PDF generation logic
│
├── hooks/
│   ├── use-items.ts               # SWR hook for items
│   ├── use-leads.ts
│   ├── use-quotations.ts
│   ├── use-online-status.ts
│   └── use-company.ts
│
├── types/
│   ├── item.ts
│   ├── lead.ts
│   ├── quotation.ts
│   └── company.ts
│
├── public/
│   ├── sw.js                      # Generated service worker
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   └── apple-touch-icon.png
│   └── fonts/
│       └── ...
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

---

## API Endpoints Documentation

### Authentication

| Method | Endpoint                  | Description       | Request Body                | Response               |
| ------ | ------------------------- | ----------------- | --------------------------- | ---------------------- |
| POST   | `/api/auth/register`      | Register new user | `{ name, email, password }` | `{ success, message }` |
| POST   | `/api/auth/[...nextauth]` | NextAuth handlers | Varies                      | Session/Token          |

### Company

| Method | Endpoint       | Description         | Auth     | Request/Response |
| ------ | -------------- | ------------------- | -------- | ---------------- |
| GET    | `/api/company` | Get company profile | Required | Company object   |
| PUT    | `/api/company` | Update company      | Required | Updated company  |

### Items

| Method | Endpoint          | Description      | Auth     | Notes                                         |
| ------ | ----------------- | ---------------- | -------- | --------------------------------------------- |
| GET    | `/api/items`      | List all items   | Required | Supports `?search=`, `?category=`, `?active=` |
| POST   | `/api/items`      | Create item      | Required | Returns created item                          |
| GET    | `/api/items/[id]` | Get single item  | Required |                                               |
| PUT    | `/api/items/[id]` | Update item      | Required |                                               |
| DELETE | `/api/items/[id]` | Soft delete item | Required | Sets `isDeleted: false`                       |

### Leads

| Method | Endpoint          | Description              | Auth     | Notes                           |
| ------ | ----------------- | ------------------------ | -------- | ------------------------------- |
| GET    | `/api/leads`      | List all leads           | Required | Supports `?status=`, `?search=` |
| POST   | `/api/leads`      | Create lead              | Required |                                 |
| GET    | `/api/leads/[id]` | Get lead with quotations | Required | Includes quotation list         |
| PUT    | `/api/leads/[id]` | Update lead              | Required |                                 |
| DELETE | `/api/leads/[id]` | Delete lead              | Required | Cascade deletes quotations      |

### Quotations

| Method | Endpoint                     | Description             | Auth     | Notes                |
| ------ | ---------------------------- | ----------------------- | -------- | -------------------- |
| GET    | `/api/quotations`            | List all quotations     | Required | Supports filtering   |
| POST   | `/api/quotations`            | Create quotation        | Required | Requires `leadId`    |
| GET    | `/api/quotations/[id]`       | Get quotation           | Required |                      |
| PUT    | `/api/quotations/[id]`       | Update quotation        | Required |                      |
| DELETE | `/api/quotations/[id]`       | Delete quotation        | Required |                      |
| GET    | `/api/quotations/[id]/pdf`   | Download PDF            | Required | Returns PDF buffer   |
| POST   | `/api/quotations/standalone` | Generate standalone PDF | Required | No save, returns PDF |

### Dashboard

| Method | Endpoint               | Description              | Auth     |
| ------ | ---------------------- | ------------------------ | -------- |
| GET    | `/api/dashboard/stats` | Get dashboard statistics | Required |

### Uploads

| Method | Endpoint                 | Description  | Auth     | Notes                    |
| ------ | ------------------------ | ------------ | -------- | ------------------------ |
| POST   | `/api/upload`            | Upload image | Required | Returns local file path  |
| DELETE | `/api/upload/[filename]` | Delete image | Required | Removes file from server |

**Upload Directory Structure**:

```
public/
└── uploads/
    ├── logos/          # Company logos
    ├── items/          # Item images
    └── temp/           # Temporary uploads (cleaned periodically)
```

---

## User Flow Diagrams

### Registration and Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEW USER REGISTRATION FLOW                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Landing    │────▶│  Register    │────▶│   Check      │────▶│  Verify      │
│    Page      │     │    Form      │     │    Email     │     │   Email      │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                            │                                         │
                            │ Submit                                  │ Click Link
                            ▼                                         ▼
                     ┌──────────────┐                          ┌──────────────┐
                     │  Send Magic  │                          │   Account    │
                     │    Link      │                          │   Verified   │
                     └──────────────┘                          └──────────────┘
                                                                      │
                                                                      ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Dashboard   │◀────│   Guided     │◀────│   Company    │◀────│   Setup      │
│   (Home)     │     │    Tour      │     │   Profile    │     │   Complete   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### Quotation Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         QUOTATION CREATION FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Leads     │────▶│    Lead      │────▶│   Create     │
│    List      │     │   Detail     │     │  Quotation   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    │                            │                            │
                    ▼                            ▼                            ▼
             ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
             │  Add Items   │           │ Add Custom   │           │   Apply      │
             │ from Library │           │  Line Item   │           │  Discount    │
             └──────────────┘           └──────────────┘           └──────────────┘
                    │                            │                            │
                    └────────────────────────────┼────────────────────────────┘
                                                 │
                                                 ▼
                                         ┌──────────────┐
                                         │   Review     │
                                         │   Totals     │
                                         └──────────────┘
                                                 │
                                                 ▼
                                         ┌──────────────┐
                                         │  Add Terms   │
                                         │ & Validity   │
                                         └──────────────┘
                                                 │
                         ┌───────────────────────┼───────────────────────┐
                         │                       │                       │
                         ▼                       ▼                       ▼
                  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
                  │  Save Draft  │       │  Generate    │       │    Send      │
                  │              │       │     PDF      │       │    Email     │
                  └──────────────┘       └──────────────┘       └──────────────┘
```

### Guided Tour Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GUIDED TOUR SEQUENCE                              │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1                Step 2                Step 3                Step 4
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Welcome    │────▶│  Dashboard   │────▶│    Items     │────▶│    Leads     │
│   Message    │     │   Overview   │     │   Library    │     │    Page      │
│              │     │              │     │              │     │              │
│ "Hi Josh!"   │     │ "Your stats  │     │ "Create      │     │ "Track your  │
│              │     │  appear here"│     │  preset items"│     │  clients"    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │   Create     │
                                                               │  Quotation   │
                                                               │              │
                                                               │ "Generate    │
                                                               │  quotes fast"│
                                                               └──────────────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │    Tour      │
                                                               │  Complete!   │
                                                               └──────────────┘
```

---

## PWA Implementation Details

### Web App Manifest

```typescript
// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RenoHub - Quotation Management",
    short_name: "RenoHub",
    description: "Create professional renovation quotations in minutes",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb", // Blue-600
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/dashboard.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/screenshots/mobile.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  };
}
```

### Service Worker Configuration (Serwist)

```typescript
// next.config.ts
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist({
  // Next.js config
});
```

```typescript
// app/sw.ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "serwist";
import {
  Serwist,
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // API calls - Network first with cache fallback
    {
      urlPattern: /^\/api\/(items|leads|quotations)/,
      handler: new NetworkFirst({
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
      }),
    },
    // Images - Cache first
    {
      urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
      handler: new CacheFirst({
        cacheName: "images",
      }),
    },
    // Static assets - Stale while revalidate
    {
      urlPattern: /\.(js|css|woff2?)$/,
      handler: new StaleWhileRevalidate({
        cacheName: "static-resources",
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
```

### Offline Data Storage

```typescript
// lib/offline-storage.ts
import { get, set, del } from "idb-keyval";

export interface PendingQuotation {
  id: string;
  data: QuotationFormData;
  createdAt: Date;
  synced: boolean;
}

export async function savePendingQuotation(
  data: QuotationFormData,
): Promise<string> {
  const id = crypto.randomUUID();
  const pending = (await get<PendingQuotation[]>("pending-quotations")) || [];
  pending.push({ id, data, createdAt: new Date(), synced: false });
  await set("pending-quotations", pending);
  return id;
}

export async function getPendingQuotations(): Promise<PendingQuotation[]> {
  return (await get<PendingQuotation[]>("pending-quotations")) || [];
}

export async function syncPendingQuotations(): Promise<void> {
  const pending = await getPendingQuotations();
  for (const item of pending.filter((p) => !p.synced)) {
    try {
      await fetch("/api/quotations", {
        method: "POST",
        body: JSON.stringify(item.data),
      });
      item.synced = true;
    } catch (error) {
      console.error("Sync failed for", item.id);
    }
  }
  await set("pending-quotations", pending);
}
```

### Install Prompt Component

```typescript
// components/pwa/install-prompt.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-lg p-4 border z-50">
      <button onClick={() => setShowPrompt(false)} className="absolute top-2 right-2">
        <X className="h-4 w-4" />
      </button>
      <h3 className="font-semibold flex items-center gap-2">
        <Download className="h-5 w-5" />
        Install RenoHub
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        Install for quick access and offline support
      </p>
      <button
        onClick={handleInstall}
        className="mt-3 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        Install App
      </button>
    </div>
  );
}
```

---

## Security Considerations

### Authentication Security

1. **Magic Link Tokens**
   - Generated with `crypto.randomBytes(32)` (256-bit entropy)
   - Stored as SHA-256 hash, never raw
   - 15-minute expiration
   - Single-use enforcement
   - Rate limited: 3 requests per email per minute

2. **Session Management**
   - Access Token: Short-lived JWT (30 minutes)
   - Refresh Token: Long-lived (30 days), stored in HttpOnly cookie
   - Sliding session: `lastActiveAt` updated only on refresh token use (reduces DB load)
   - Session expires after 30 days of inactivity
   - HttpOnly, Secure, SameSite=Strict cookies
   - Refresh token rotation on each use

### Authorization

1. **Middleware Protection**

   ```typescript
   // middleware.ts
   export { auth as middleware } from "@/lib/auth";

   export const config = {
     matcher: ["/(dashboard|api)/:path*"],
   };
   ```

2. **Resource Ownership Verification**
   - All API routes verify `companyId` matches authenticated user
   - No cross-tenant data access possible

### Data Protection

1. **Input Validation**
   - Zod schemas for all API inputs
   - Server-side validation always
   - Sanitize user inputs for XSS prevention

2. **File Upload Security**
   - File type validation (PNG, JPEG, WebP only)
   - File size limits (2MB for logos, 5MB for item images)
   - Unique filename generation (timestamp + random string)
   - Files stored in `public/uploads/` with proper permissions
   - Nginx configured to prevent script execution in upload directories
   - MIME type verification on server side

3. **Database Security**
   - MongoDB Atlas with IP allowlist
   - Encrypted at rest and in transit
   - Read/write user with minimal permissions

### Security Headers

```typescript
// next.config.ts
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];
```

---

## Deployment Guide (Ubuntu 22.04 VPS)

### Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Install Nginx and Certbot
sudo apt install nginx certbot python3-certbot-nginx -y

# Install PM2 globally
sudo npm install -g pm2
```

### Application Deployment

```bash
# Create application directory
mkdir -p ~/www && cd ~/www
git clone <your-repo-url> RenoHub
cd RenoHub

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
nano .env.local  # Edit with production values

# Build for production
npm run build

# Create upload directories
mkdir -p public/uploads/logos public/uploads/items

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 startup systemd
pm2 save
```

### PM2 Ecosystem Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "RenoHub",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "500M",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/RenoHub
upstream RenoHub_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Client upload size
    client_max_body_size 10M;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        proxy_pass http://RenoHub_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location /_next/static/ {
        proxy_pass http://RenoHub_backend;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }

    # Prevent script execution in uploads
    location /uploads/ {
        location ~ \.(php|js|html)$ { deny all; }
    }
}
```

### SSL Certificate Setup

```bash
# Obtain certificate
sudo certbot certonly --nginx -d yourdomain.com

# Enable site
sudo ln -s /etc/nginx/sites-available/RenoHub /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Update/Deployment Script

```bash
#!/bin/bash
# deploy.sh
cd ~/www/RenoHub
git pull origin main
npm install
npm run build
pm2 reload RenoHub
```

---

## Development Phases

### Phase 1: Foundation and Authentication (2 weeks)

**Objective**: Establish project infrastructure and user authentication system

| Task                                          | Complexity | Duration | Dependencies |
| --------------------------------------------- | ---------- | -------- | ------------ |
| Project setup (Next.js, Tailwind, TypeScript) | Low        | 0.5 days | None         |
| MongoDB Atlas setup and connection            | Low        | 0.5 days | None         |
| Environment configuration                     | Low        | 0.5 days | Task 1, 2    |
| Auth.js integration with MongoDB adapter      | Medium     | 1 day    | Task 3       |
| Magic link email provider setup (Resend)      | Medium     | 1 day    | Task 4       |
| Registration page UI                          | Medium     | 1 day    | Task 4       |
| Login page UI                                 | Low        | 0.5 days | Task 4       |
| Email verification flow                       | Medium     | 1 day    | Task 5       |
| Company profile setup page                    | Medium     | 1.5 days | Task 8       |
| Protected route middleware                    | Low        | 0.5 days | Task 4       |
| Basic UI components (Button, Input, Card)     | Medium     | 1 day    | Task 1       |
| Testing and bug fixes                         | Medium     | 1 day    | All          |

**Deliverables**:

- Working registration with magic link verification
- Company profile creation form
- Protected dashboard placeholder
- Base UI component library

**Milestone Criteria**: New user can register, verify email, and access protected dashboard

---

### Phase 2: Core Features (3 weeks)

**Objective**: Implement items library, leads management, and dashboard

| Task                                | Complexity | Duration | Dependencies |
| ----------------------------------- | ---------- | -------- | ------------ |
| Items collection schema and indexes | Low        | 0.5 days | Phase 1      |
| Items CRUD API routes               | Medium     | 1.5 days | Task 1       |
| Items list page with search/filter  | Medium     | 1.5 days | Task 2       |
| Item form (create/edit)             | Medium     | 1 day    | Task 2       |
| Local file upload for item images   | Medium     | 1 day    | Task 4       |
| Leads collection schema and indexes | Low        | 0.5 days | Phase 1      |
| Leads CRUD API routes               | Medium     | 1.5 days | Task 6       |
| Leads list page with status filters | Medium     | 1.5 days | Task 7       |
| Lead detail page                    | Medium     | 1 day    | Task 7       |
| Lead form (create/edit)             | Medium     | 1 day    | Task 7       |
| Dashboard statistics API            | Medium     | 1 day    | Task 2, 7    |
| Dashboard UI with charts            | High       | 2 days   | Task 11      |
| Sidebar navigation                  | Medium     | 1 day    | Phase 1      |
| Responsive layout adjustments       | Medium     | 1 day    | Task 13      |
| Testing and bug fixes               | Medium     | 1.5 days | All          |

**Deliverables**:

- Full items library with CRUD operations
- Complete leads management
- Dashboard with key metrics
- Responsive navigation

**Milestone Criteria**: User can manage items and leads, view dashboard statistics

---

### Phase 3: Quotation Creation and PDF (3 weeks)

**Objective**: Implement quotation creation workflow and PDF generation

| Task                                    | Complexity | Duration | Dependencies          |
| --------------------------------------- | ---------- | -------- | --------------------- |
| Quotations collection schema            | Medium     | 0.5 days | Phase 2               |
| Quotation number generation logic       | Low        | 0.5 days | Task 1                |
| Quotations CRUD API routes              | High       | 2 days   | Task 1                |
| Quotation form UI                       | High       | 2.5 days | Task 3                |
| Line items component (add from library) | High       | 2 days   | Task 4, Phase 2 items |
| Custom line item entry                  | Medium     | 1 day    | Task 5                |
| Discount and tax calculations           | Medium     | 1.5 days | Task 5, 6             |
| React-PDF quotation template            | High       | 2.5 days | Task 7                |
| PDF generation API route                | Medium     | 1.5 days | Task 8                |
| PDF preview component                   | Medium     | 1 day    | Task 9                |
| PDF download functionality              | Low        | 0.5 days | Task 9                |
| Standalone quotation flow               | Medium     | 1.5 days | Task 4-11             |
| Quotation list page                     | Medium     | 1 day    | Task 3                |
| Testing and bug fixes                   | High       | 2 days   | All                   |

**Deliverables**:

- Complete quotation creation within leads
- Professional PDF generation
- Standalone quotation creator
- Quotation management views

**Milestone Criteria**: User can create quotations, generate and download PDFs

---

### Phase 4: PWA and Polish (2 weeks)

**Objective**: Implement PWA features and finalize user experience

| Task                                | Complexity | Duration | Dependencies |
| ----------------------------------- | ---------- | -------- | ------------ |
| Serwist/PWA configuration           | Medium     | 1 day    | Phase 1-3    |
| Service worker caching strategy     | Medium     | 1 day    | Task 1       |
| Web app manifest                    | Low        | 0.5 days | Task 1       |
| PWA icons and splash screens        | Low        | 0.5 days | Task 3       |
| Install prompt component            | Medium     | 1 day    | Task 1       |
| Offline indicator component         | Low        | 0.5 days | Task 1       |
| IndexedDB offline storage           | High       | 1.5 days | Task 2       |
| Background sync for offline changes | High       | 1.5 days | Task 7       |
| Guided tour implementation          | Medium     | 1.5 days | Phase 2-3    |
| Form validation improvements        | Medium     | 1 day    | All forms    |
| Error handling and toasts           | Medium     | 1 day    | All features |
| Performance optimization            | Medium     | 1 day    | All          |
| Final testing (all browsers)        | High       | 1.5 days | All          |
| Documentation                       | Low        | 0.5 days | All          |

**Deliverables**:

- Installable PWA with offline support
- Guided onboarding tour
- Polished error handling
- Production-ready application

**Milestone Criteria**: App installable, works offline, provides smooth user experience

---

## Future Enhancements

### Phase 5 Candidates (Post-Launch)

1. **Email Integration**
   - Send quotations directly via email
   - Email templates customization
   - Delivery tracking

2. **Client Portal**
   - Unique link for clients to view quotations
   - Online acceptance with e-signature
   - Comment/feedback mechanism

3. **Quotation Templates**
   - Save quotations as templates
   - Quick create from templates

4. **Advanced Analytics**
   - Win/loss analysis
   - Average response time
   - Revenue forecasting

5. **Multi-Currency Support**
   - Currency selection per quotation
   - Exchange rate integration

6. **Bulk Operations**
   - CSV import for items
   - Bulk lead import
   - Export to accounting software

7. **Integrations**
   - QuickBooks/Xero integration
   - Calendar integration for follow-ups
   - WhatsApp sharing

8. **AI Enhancements**
   - Smart pricing suggestions
   - Quotation content generation
   - Lead scoring

---

## Success Metrics

### Primary Metrics

| Metric                  | Target                  | Measurement Method                |
| ----------------------- | ----------------------- | --------------------------------- |
| Quotation Creation Time | < 15 minutes            | Time from start to PDF generation |
| User Adoption           | 80% feature utilization | Analytics on feature usage        |
| Quotation Volume        | 3x increase             | Before/after comparison           |
| Error Rate              | < 1%                    | Error logging and monitoring      |

### Secondary Metrics

| Metric              | Target      | Notes                             |
| ------------------- | ----------- | --------------------------------- |
| PWA Install Rate    | > 30%       | Users who install the app         |
| Offline Usage       | > 10%       | Sessions with offline activity    |
| Return User Rate    | > 70%       | Weekly active users / Total users |
| Page Load Time      | < 2 seconds | Core Web Vitals                   |
| PDF Generation Time | < 3 seconds | Server-side rendering             |

### User Satisfaction

| Metric                  | Target   | Method                  |
| ----------------------- | -------- | ----------------------- |
| Task Completion Rate    | > 95%    | User testing            |
| User Satisfaction Score | > 4.5/5  | In-app feedback         |
| Support Tickets         | < 5/week | Support system tracking |

---

## Conclusion

This PRD provides a comprehensive blueprint for building RenoHub, a quotation management system that will transform how renovation contractors create and manage quotations. By following the phased development approach and adhering to the technical specifications outlined, developers can implement a robust, scalable, and user-friendly application.

The key success factors are:

1. **Speed**: Reducing quotation creation from 1 day to 15 minutes
2. **Professionalism**: Consistent, branded PDF output
3. **Accessibility**: PWA capabilities for mobile and offline use
4. **Simplicity**: Intuitive UI designed for non-technical users

With the detailed database schemas, API specifications, and user flows provided, this document serves as a complete reference for implementation, allowing any developer to understand the full scope and begin building phase by phase.
