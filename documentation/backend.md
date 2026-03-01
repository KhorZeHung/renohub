# RenoHub Backend API Documentation

## Table of Contents

- [Authentication](#authentication)
- [User](#user)
- [Company](#company)
- [Items](#items)
- [Leads](#leads)
- [Quotations](#quotations)
- [Dashboard](#dashboard)
- [Upload](#upload)
- [Validation Schemas](#validation-schemas)
- [Database Models](#database-models)
- [Authentication & Authorization](#authentication--authorization)
- [Conventions](#conventions)

---

## Dashboard

### GET /api/dashboard

**Purpose:** Returns aggregated stats, recent leads, recent quotations, and pipeline counts for the authenticated company's dashboard.

**Authentication:** Required (session cookie)

**Request:** No body or query params.

**Response:**

```json
{
  "stats": {
    "totalLeads": 12,
    "quotationsSent": 7,
    "wonValue": 45000,
    "conversionRate": 25
  },
  "recentLeads": [
    {
      "id": "string",
      "clientName": "string",
      "status": "new | contacted | quoted | negotiating | won | lost",
      "budget": 15000,
      "createdAt": "ISO date"
    }
  ],
  "recentQuotations": [
    {
      "id": "string",
      "quotationNumber": "string",
      "clientName": "string",
      "total": 12500,
      "status": "draft | sent | viewed | accepted | rejected | expired",
      "createdAt": "ISO date"
    }
  ],
  "pipeline": {
    "new": 3,
    "contacted": 2,
    "quoted": 4,
    "negotiating": 1,
    "won": 1,
    "lost": 1
  }
}
```

| Status | Description         | Body                          |
| ------ | ------------------- | ----------------------------- |
| 200    | Success             | Dashboard data (see above)    |
| 401    | Not authenticated   | `{ error: string }`           |
| 500    | Server error        | `{ error: string }`           |

**Notes:**
- All queries are scoped to the authenticated company via `companyId`.
- `wonValue` is the sum of `total` from quotations with `status: "accepted"`.
- `quotationsSent` counts quotations with status `sent`, `viewed`, `accepted`, `rejected`, or `expired`.
- `conversionRate` is `wonLeads / totalLeads * 100` (integer percentage).
- `recentLeads` and `recentQuotations` return the 5 most recently created documents.

---

## Authentication

### POST /api/auth/register

**Purpose:** Register a new user and send a magic link for verification.

**Authentication:** None

**Rate Limit:** 3 requests per minute per email

**Request Body:**

```json
{
  "name": "string (2-100 chars, required)",
  "email": "string (valid email, required)"
}
```

**Validation:** `registerSchema` (`lib/validations/auth.ts`)

| Field | Type   | Rules                    |
| ----- | ------ | ------------------------ |
| name  | string | Required, 2-100 chars    |
| email | string | Required, valid email    |

**Responses:**

| Status | Description              | Body                                                        |
| ------ | ------------------------ | ----------------------------------------------------------- |
| 201    | Success                  | `{ success: true, message: "Verification email sent..." }`  |
| 400    | Validation error         | `{ error: string, details: object }`                        |
| 409    | Email already exists     | `{ error: "Email already exists", code: "EMAIL_EXISTS" }`   |
| 429    | Rate limit exceeded      | `{ error: string, retryAfter: number }`                     |

**Behavior:**
1. Validates request body against `registerSchema`
2. Checks in-memory rate limit (3/min per email)
3. Checks if user already exists and is verified
4. Creates or updates user record in the database
5. Triggers magic link email via NextAuth

---

### GET/POST /api/auth/[...nextauth]

**Purpose:** NextAuth.js catch-all handler for authentication flows.

**Runtime:** Node.js (forced, not Edge)

**Handles:**
- Magic link sign-in and callback
- Session management (JWT-based)
- Sign-out

---

## User

### GET /api/user

**Purpose:** Get the current authenticated user's profile.

**Authentication:** Required (`getAuthenticatedSession`)

**Request:** No body or query parameters.

**Response (200):**

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "image": "string | null",
  "contactNumber": "string | null",
  "emailVerified": "Date | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Error Responses:**

| Status | Description      |
| ------ | ---------------- |
| 401    | Not authenticated |
| 404    | User not found    |
| 500    | Server error      |

---

### PUT /api/user

**Purpose:** Update the current user's profile.

**Authentication:** Required

**Request Body:**

```json
{
  "name": "string (2-100 chars, optional)",
  "contactNumber": "string | null (max 20 chars, optional)",
  "image": "string | null (optional)"
}
```

**Validation:** `userUpdateSchema` (`lib/validations/user.ts`)

| Field         | Type          | Rules                          |
| ------------- | ------------- | ------------------------------ |
| name          | string?       | 2-100 chars                    |
| contactNumber | string\|null? | Max 20 chars, empty → null     |
| image         | string\|null? | URL string or null             |

**Response (200):** Same shape as GET /api/user.

**Error Responses:**

| Status | Description       |
| ------ | ----------------- |
| 400    | Validation error  |
| 401    | Not authenticated |
| 404    | User not found    |
| 500    | Server error      |

---

### POST /api/user/change-email

**Purpose:** Request an email change. Updates the email immediately, resets verification, and sends a magic link.

**Authentication:** Required

**Request Body:**

```json
{
  "newEmail": "string (valid email, required)"
}
```

**Validation:** `changeEmailSchema` (`lib/validations/user.ts`)

| Field    | Type   | Rules                 |
| -------- | ------ | --------------------- |
| newEmail | string | Required, valid email |

**Response (200):**

```json
{
  "message": "string"
}
```

**Error Responses:**

| Status | Description           |
| ------ | --------------------- |
| 400    | Validation error      |
| 401    | Not authenticated     |
| 409    | Email already in use  |
| 500    | Server error          |

---

## Company

### GET /api/company

**Purpose:** Get the current user's company profile.

**Authentication:** Required

**Request:** No body or query parameters.

**Response (200):**

```json
{
  "id": "string",
  "userId": "string",
  "name": "string",
  "email": "string",
  "contactNumber": "string | null",
  "address": "string | null",
  "website": "string | null",
  "taxRegistrationNumber": "string | null",
  "logo": {
    "url": "string",
    "filename": "string",
    "width": "number (optional)",
    "height": "number (optional)"
  },
  "defaultTerms": "string | null",
  "defaultValidityDays": "number",
  "defaultTaxRate": "number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Error Responses:**

| Status | Description       |
| ------ | ----------------- |
| 401    | Not authenticated |
| 404    | Company not found |
| 500    | Server error      |

---

### PUT /api/company

**Purpose:** Create or update the company profile.

**Authentication:** Required

**Request Body:**

```json
{
  "name": "string (2-100 chars, required)",
  "email": "string (valid email, required)",
  "contactNumber": "string | null (max 20, optional)",
  "address": "string | null (max 500, optional)",
  "website": "string | null (must start with http/https, optional)",
  "taxRegistrationNumber": "string | null (max 50, optional)",
  "logo": {
    "url": "string",
    "filename": "string",
    "width": "number (optional)",
    "height": "number (optional)"
  },
  "defaultTerms": "string | null (max 5000, optional)",
  "defaultValidityDays": "number (1-365, default: 30, optional)",
  "defaultTaxRate": "number (0-100, default: 0, optional)"
}
```

**Validation:** `companyUpdateSchema` (`lib/validations/company.ts`)

| Field                 | Type          | Rules                                      |
| --------------------- | ------------- | ------------------------------------------ |
| name                  | string        | Required, 2-100 chars                      |
| email                 | string        | Required, valid email                      |
| contactNumber         | string\|null? | Max 20 chars, empty → null                 |
| address               | string\|null? | Max 500 chars, empty → null                |
| website               | string\|null? | Must start with http:// or https://        |
| taxRegistrationNumber | string\|null? | Max 50 chars, empty → null                 |
| logo                  | object\|null? | `{ url, filename, width?, height? }`       |
| defaultTerms          | string\|null? | Max 5000 chars, empty → null               |
| defaultValidityDays   | number?       | 1-365, default 30                          |
| defaultTaxRate        | number?       | 0-100, default 0                           |

**Responses:**

| Status | Description         | Body                          |
| ------ | ------------------- | ----------------------------- |
| 200    | Updated existing    | Company object (same as GET)  |
| 201    | Created new         | Company object (same as GET)  |
| 400    | Validation error    | `{ error, details }`          |
| 401    | Not authenticated   | `{ error }`                   |
| 500    | Server error        | `{ error }`                   |

---

### PATCH /api/company

**Purpose:** Partial update of the company profile (alias for PUT).

**Authentication:** Required

Same behavior as PUT /api/company.

---

## Items

### GET /api/items

**Purpose:** List all items with pagination, search, and filtering.

**Authentication:** Required + Company setup

**Query Parameters:**

```
?search=string&category=string&active=true&page=1&limit=20&sort=createdAt&order=desc
```

**Validation:** `itemQuerySchema` (`lib/validations/item.ts`)

| Parameter | Type    | Default     | Rules                                                            |
| --------- | ------- | ----------- | ---------------------------------------------------------------- |
| search    | string? | —           | Free text search on item name/description                        |
| category  | string? | —           | Filter by category                                               |
| active    | boolean | true        | When true, filters out soft-deleted items (isDeleted=false)      |
| page      | number  | 1           | Page number                                                      |
| limit     | number  | 20          | Items per page, max 100                                          |
| sort      | string  | "createdAt" | One of: name, pricePerUnit, category, createdAt, updatedAt      |
| order     | string  | "desc"      | "asc" or "desc"                                                  |

**Response (200):**

```json
{
  "items": [
    {
      "id": "string",
      "companyId": "string",
      "name": "string",
      "unit": "string",
      "pricePerUnit": "number",
      "description": "string | null",
      "brand": "string | null",
      "category": "string | null",
      "images": [{ "url": "string", "filename": "string", "order": "number" }],
      "isDeleted": "boolean",
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number",
    "hasNext": "boolean",
    "hasPrev": "boolean"
  }
}
```

**Error Responses:**

| Status | Description       |
| ------ | ----------------- |
| 400    | Invalid query     |
| 401    | Not authenticated |
| 500    | Server error      |

---

### POST /api/items

**Purpose:** Create a new item.

**Authentication:** Required + Company setup

**Request Body:**

```json
{
  "name": "string (2-200 chars, required)",
  "unit": "string (1-50 chars, required)",
  "pricePerUnit": "number (>= 0, 2 decimal places, required)",
  "description": "string | null (max 1000, optional)",
  "brand": "string | null (max 100, optional)",
  "category": "string | null (max 100, optional)",
  "images": [
    { "url": "string", "filename": "string", "order": "number" }
  ]
}
```

**Validation:** `itemCreateSchema` (`lib/validations/item.ts`)

| Field        | Type          | Rules                                  |
| ------------ | ------------- | -------------------------------------- |
| name         | string        | Required, 2-200 chars                  |
| unit         | string        | Required, 1-50 chars                   |
| pricePerUnit | number        | Required, >= 0, rounded to 2 decimals  |
| description  | string\|null? | Max 1000 chars, empty → null           |
| brand        | string\|null? | Max 100 chars, empty → null            |
| category     | string\|null? | Max 100 chars, empty → null            |
| images       | array?        | Max 5 items, each `{ url, filename, order }` |

**Response (201):**

```json
{
  "item": { /* ItemResponse */ }
}
```

**Error Responses:**

| Status | Description       |
| ------ | ----------------- |
| 400    | Validation error  |
| 401    | Not authenticated |
| 500    | Server error      |

---

### GET /api/items/[id]

**Purpose:** Get a single item by ID.

**Authentication:** Required + Company setup

**Path Parameter:** `id` — MongoDB ObjectId

**Ownership Check:** Item must belong to the user's company.

**Response (200):**

```json
{
  "item": { /* ItemResponse */ }
}
```

**Error Responses:**

| Status | Description        |
| ------ | ------------------ |
| 400    | Invalid ObjectId   |
| 401    | Not authenticated  |
| 404    | Item not found     |
| 500    | Server error       |

---

### PUT /api/items/[id]

**Purpose:** Update an item.

**Authentication:** Required + Company setup

**Path Parameter:** `id` — MongoDB ObjectId

**Ownership Check:** Item must belong to the user's company.

**Request Body:** Partial — at least one field required.

```json
{
  "name": "string (2-200 chars, optional)",
  "unit": "string (1-50 chars, optional)",
  "pricePerUnit": "number (>= 0, optional)",
  "description": "string | null (optional)",
  "brand": "string | null (optional)",
  "category": "string | null (optional)",
  "images": [{ "url": "string", "filename": "string", "order": "number" }]
}
```

**Validation:** `itemUpdateSchema` (`lib/validations/item.ts`)

**Response (200):**

```json
{
  "item": { /* ItemResponse */ }
}
```

**Error Responses:**

| Status | Description       |
| ------ | ----------------- |
| 400    | Validation error  |
| 401    | Not authenticated |
| 404    | Item not found    |
| 500    | Server error      |

---

### DELETE /api/items/[id]

**Purpose:** Soft-delete an item (sets `isDeleted: true`).

**Authentication:** Required + Company setup

**Path Parameter:** `id` — MongoDB ObjectId

**Ownership Check:** Item must belong to the user's company.

**Response (200):**

```json
{
  "message": "Item deleted successfully"
}
```

**Error Responses:**

| Status | Description       |
| ------ | ----------------- |
| 400    | Invalid ObjectId  |
| 401    | Not authenticated |
| 404    | Item not found    |
| 500    | Server error      |

---

## Leads

### GET /api/leads

**Purpose:** List all leads with pagination, search, and filtering.

**Authentication:** Required + Company setup

**Query Parameters:**

```
?search=string&status=new&page=1&limit=20&sort=createdAt&order=desc
```

**Validation:** `leadQuerySchema` (`lib/validations/lead.ts`)

| Parameter | Type    | Default     | Rules                                                              |
| --------- | ------- | ----------- | ------------------------------------------------------------------ |
| search    | string? | —           | Searches clientName, email, siteAddress                            |
| status    | string? | —           | One of: new, contacted, quoted, negotiating, won, lost             |
| page      | number  | 1           | Page number                                                        |
| limit     | number  | 20          | Items per page, max 100                                            |
| sort      | string  | "createdAt" | One of: clientName, budget, status, createdAt, updatedAt           |
| order     | string  | "desc"      | "asc" or "desc"                                                    |

**Response (200):**

```json
{
  "leads": [
    {
      "id": "string",
      "companyId": "string",
      "clientName": "string",
      "contactNumber": "string",
      "email": "string",
      "budget": "number",
      "siteAddress": "string",
      "status": "string",
      "remark": "string | null",
      "images": [{ "url": "string", "filename": "string", "order": "number" }],
      "isDeleted": "boolean",
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number",
    "hasNext": "boolean",
    "hasPrev": "boolean"
  }
}
```

**Error Responses:**

| Status | Description       |
| ------ | ----------------- |
| 400    | Invalid query     |
| 401    | Not authenticated |
| 500    | Server error      |

---

### POST /api/leads

**Purpose:** Create a new lead.

**Authentication:** Required + Company setup

**Request Body:**

```json
{
  "clientName": "string (2-100 chars, required)",
  "contactNumber": "string (8-20 chars, required)",
  "email": "string (valid email, required)",
  "budget": "number (>= 0, required)",
  "siteAddress": "string (5-500 chars, required)",
  "status": "string (LeadStatus, required)",
  "remark": "string | null (max 2000, optional)",
  "images": [
    { "url": "string", "filename": "string", "order": "number" }
  ]
}
```

**Validation:** `leadCreateSchema` (`lib/validations/lead.ts`)

| Field         | Type          | Rules                                              |
| ------------- | ------------- | -------------------------------------------------- |
| clientName    | string        | Required, 2-100 chars                              |
| contactNumber | string        | Required, 8-20 chars                               |
| email         | string        | Required, valid email                              |
| budget        | number        | Required, >= 0                                     |
| siteAddress   | string        | Required, 5-500 chars                              |
| status        | LeadStatus    | Required, one of: new, contacted, quoted, negotiating, won, lost |
| remark        | string\|null? | Max 2000 chars, empty → null                       |
| images        | array?        | Max 5 items, each `{ url, filename, order }`       |

**Behavior:** Creates an initial entry in `statusHistory` with the provided status.

**Response (201):**

```json
{
  "lead": { /* LeadResponse */ }
}
```

**Error Responses:**

| Status | Description       |
| ------ | ----------------- |
| 400    | Validation error  |
| 401    | Not authenticated |
| 500    | Server error      |

---

### GET /api/leads/[id]

**Purpose:** Get a single lead by ID, including status history.

**Authentication:** Required + Company setup

**Path Parameter:** `id` — MongoDB ObjectId

**Ownership Check:** Lead must belong to the user's company.

**Response (200):**

```json
{
  "lead": {
    "id": "string",
    "companyId": "string",
    "clientName": "string",
    "contactNumber": "string",
    "email": "string",
    "budget": "number",
    "siteAddress": "string",
    "status": "string",
    "remark": "string | null",
    "images": [{ "url": "string", "filename": "string", "order": "number" }],
    "statusHistory": [
      {
        "status": "string",
        "note": "string | null",
        "changedAt": "Date"
      }
    ],
    "isDeleted": "boolean",
    "createdAt": "Date",
    "updatedAt": "Date"
  }
}
```

**Error Responses:**

| Status | Description       |
| ------ | ----------------- |
| 400    | Invalid ObjectId  |
| 401    | Not authenticated |
| 404    | Lead not found    |
| 500    | Server error      |

---

### PUT /api/leads/[id]

**Purpose:** Update a lead. Does **not** track status changes in history — use PATCH `/api/leads/[id]/status` for that.

**Authentication:** Required + Company setup

**Path Parameter:** `id` — MongoDB ObjectId

**Ownership Check:** Lead must belong to the user's company.

**Restriction:** Cannot update soft-deleted leads.

**Request Body:** Partial — at least one field required.

```json
{
  "clientName": "string (optional)",
  "contactNumber": "string (optional)",
  "email": "string (optional)",
  "budget": "number (optional)",
  "siteAddress": "string (optional)",
  "remark": "string | null (optional)",
  "images": [{ "url": "string", "filename": "string", "order": "number" }]
}
```

**Validation:** `leadUpdateSchema` (`lib/validations/lead.ts`)

**Response (200):**

```json
{
  "lead": { /* LeadDetailResponse (includes statusHistory) */ }
}
```

**Error Responses:**

| Status | Description       |
| ------ | ----------------- |
| 400    | Validation error  |
| 401    | Not authenticated |
| 404    | Lead not found    |
| 500    | Server error      |

---

### DELETE /api/leads/[id]

**Purpose:** Soft-delete a lead (sets `isDeleted: true`).

**Authentication:** Required + Company setup

**Path Parameter:** `id` — MongoDB ObjectId

**Ownership Check:** Lead must belong to the user's company.

**Response (200):**

```json
{
  "message": "Lead deleted successfully"
}
```

**Error Responses:**

| Status | Description       |
| ------ | ----------------- |
| 400    | Invalid ObjectId  |
| 401    | Not authenticated |
| 404    | Lead not found    |
| 500    | Server error      |

---

### PATCH /api/leads/[id]/status

**Purpose:** Update a lead's status with history tracking.

**Authentication:** Required + Company setup

**Path Parameter:** `id` — MongoDB ObjectId

**Ownership Check:** Lead must belong to the user's company.

**Request Body:**

```json
{
  "status": "string (LeadStatus, required)",
  "note": "string | null (max 500, optional)"
}
```

**Validation:** `leadStatusUpdateSchema` (`lib/validations/lead.ts`)

| Field  | Type          | Rules                                              |
| ------ | ------------- | -------------------------------------------------- |
| status | LeadStatus    | Required, one of: new, contacted, quoted, negotiating, won, lost |
| note   | string\|null? | Max 500 chars, empty → null                        |

**Behavior:**
- Appends an entry to `statusHistory` array with `{ status, note, changedAt }`
- Prevents duplicate consecutive status updates (same status as current)

**Response (200):**

```json
{
  "lead": { /* LeadDetailResponse */ }
}
```

**Error Responses:**

| Status | Description                 |
| ------ | --------------------------- |
| 400    | Validation error / same status |
| 401    | Not authenticated           |
| 404    | Lead not found              |
| 500    | Server error                |

---

## Quotations

### GET /api/quotations

**Purpose:** List all quotations with pagination, search, and filtering.

**Authentication:** Required + Company setup

**Query Parameters:**

```
?search=string&status=draft&leadId=string&page=1&limit=20&sort=createdAt&order=desc
```

**Validation:** `quotationQuerySchema` (`lib/validations/quotation.ts`)

| Parameter | Type    | Default     | Rules                                                                      |
| --------- | ------- | ----------- | -------------------------------------------------------------------------- |
| search    | string? | —           | Searches quotationNumber, client.name                                      |
| status    | string? | —           | One of: draft, sent, viewed, accepted, rejected, expired                   |
| leadId    | string? | —           | MongoDB ObjectId, filter by associated lead                                |
| page      | number  | 1           | Page number                                                                |
| limit     | number  | 20          | Items per page, max 100                                                    |
| sort      | string  | "createdAt" | One of: quotationNumber, total, validUntil, status, createdAt, updatedAt   |
| order     | string  | "desc"      | "asc" or "desc"                                                            |

**Response (200):**

```json
{
  "quotations": [
    {
      "id": "string",
      "companyId": "string",
      "leadId": "string | null",
      "quotationNumber": "string",
      "client": {
        "name": "string",
        "contactNumber": "string",
        "email": "string | undefined",
        "address": "string | null"
      },
      "subtotal": "number",
      "discount": {
        "type": "percentage | fixed",
        "value": "number",
        "amount": "number"
      },
      "taxableAmount": "number",
      "taxRate": "number",
      "taxAmount": "number",
      "total": "number",
      "validUntil": "Date",
      "status": "string",
      "isDeleted": "boolean",
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number",
    "hasNext": "boolean",
    "hasPrev": "boolean"
  }
}
```

**Error Responses:**

| Status | Description       |
| ------ | ----------------- |
| 400    | Invalid query     |
| 401    | Not authenticated |
| 500    | Server error      |

---

### POST /api/quotations

**Purpose:** Create a new quotation.

**Authentication:** Required + Company setup

**Request Body:**

```json
{
  "leadId": "string | null (optional)",
  "client": {
    "name": "string (2-100 chars, required)",
    "contactNumber": "string (8-20 chars, required)",
    "email": "string (optional)",
    "address": "string | null (max 500, optional)"
  },
  "groups": [
    {
      "id": "string (required)",
      "name": "string (1-200 chars, required)",
      "description": "string | null (max 1000, optional)",
      "order": "number (>= 0, required)",
      "lineItems": [
        {
          "id": "string (required)",
          "itemId": "string | null (optional)",
          "description": "string (1-500 chars, required)",
          "quantity": "number (>= 0.01, required)",
          "unit": "string (1-50 chars, required)",
          "unitPrice": "number (>= 0, required)",
          "amount": "number (calculated, required)",
          "discount": {
            "type": "percentage | fixed",
            "value": "number"
          },
          "selectedImages": [
            { "url": "string", "filename": "string", "caption": "string (optional)" }
          ]
        }
      ],
      "subtotal": "number (calculated, required)"
    }
  ],
  "discount": {
    "type": "percentage | fixed",
    "value": "number"
  },
  "taxRate": "number (0-100, required)",
  "validUntil": "string (ISO date, required)",
  "termsAndConditions": "string | null (max 5000, optional)",
  "notes": "string | null (max 2000, optional)",
  "status": "string (QuotationStatus, default: 'draft', optional)"
}
```

**Validation:** `quotationCreateSchema` (`lib/validations/quotation.ts`)

| Field              | Type          | Rules                                                      |
| ------------------ | ------------- | ---------------------------------------------------------- |
| leadId             | string\|null? | Valid ObjectId                                             |
| client             | object        | Required: `{ name, contactNumber, email?, address? }`      |
| groups             | array         | Min 1 group, each with min 1 lineItem                     |
| discount           | object?       | `{ type: "percentage"\|"fixed", value: number }`           |
| taxRate            | number        | 0-100                                                      |
| validUntil         | string        | ISO date string                                            |
| termsAndConditions | string\|null? | Max 5000 chars                                             |
| notes              | string\|null? | Max 2000 chars                                             |
| status             | string?       | Default "draft"                                            |

**Behavior:**
- Auto-generates quotation number in format `Q-YYYYMM-NNNN` (sequential per company/month)
- Processes groups and calculates subtotal, discount amount, taxable amount, tax amount, and total
- Creates a company snapshot (stores company name, email, etc. at creation time)
- Verifies `leadId` belongs to the same company if provided

**Response (201):**

```json
{
  "quotation": { /* QuotationDetailResponse (includes groups, companySnapshot) */ }
}
```

**Error Responses:**

| Status | Description                       |
| ------ | --------------------------------- |
| 400    | Validation error                  |
| 401    | Not authenticated                 |
| 409    | Quotation number conflict (retry) |
| 500    | Server error                      |

---

### GET /api/quotations/[id]

**Purpose:** Get a single quotation by ID.

**Authentication:** Required + Company setup

**Path Parameter:** `id` — MongoDB ObjectId

**Ownership Check:** Quotation must belong to the user's company.

**Response (200):**

```json
{
  "quotation": {
    "id": "string",
    "companyId": "string",
    "leadId": "string | null",
    "quotationNumber": "string",
    "client": { "name": "string", "contactNumber": "string", "email": "string", "address": "string | null" },
    "companySnapshot": { "name": "string", "email": "string", "contactNumber": "string", "address": "string", "logo": "object | null" },
    "groups": [
      {
        "id": "string",
        "name": "string",
        "description": "string | null",
        "order": "number",
        "lineItems": [
          {
            "id": "string",
            "itemId": "string | null",
            "description": "string",
            "quantity": "number",
            "unit": "string",
            "unitPrice": "number",
            "amount": "number",
            "discount": { "type": "string", "value": "number" },
            "selectedImages": [{ "url": "string", "filename": "string", "caption": "string" }]
          }
        ],
        "subtotal": "number"
      }
    ],
    "subtotal": "number",
    "discount": { "type": "string", "value": "number", "amount": "number" },
    "taxableAmount": "number",
    "taxRate": "number",
    "taxAmount": "number",
    "total": "number",
    "validUntil": "Date",
    "termsAndConditions": "string | null",
    "notes": "string | null",
    "status": "string",
    "pdfUrl": "string | null",
    "pdfGeneratedAt": "Date | null",
    "isDeleted": "boolean",
    "createdAt": "Date",
    "updatedAt": "Date"
  }
}
```

**Error Responses:**

| Status | Description          |
| ------ | -------------------- |
| 400    | Invalid ObjectId     |
| 401    | Not authenticated    |
| 404    | Quotation not found  |
| 500    | Server error         |

---

### PUT /api/quotations/[id]

**Purpose:** Update a quotation.

**Authentication:** Required + Company setup

**Path Parameter:** `id` — MongoDB ObjectId

**Ownership Check:** Quotation must belong to the user's company.

**Restrictions:**
- Cannot update soft-deleted quotations
- Cannot edit quotations with `accepted` status

**Request Body:** Partial — same shape as POST, at least one field required.

**Validation:** `quotationUpdateSchema` (`lib/validations/quotation.ts`)

**Behavior:** Recalculates subtotal, discount, tax, and total if `groups`, `discount`, or `taxRate` change.

**Response (200):**

```json
{
  "quotation": { /* QuotationDetailResponse */ }
}
```

**Error Responses:**

| Status | Description                      |
| ------ | -------------------------------- |
| 400    | Validation error / is accepted   |
| 401    | Not authenticated                |
| 404    | Quotation not found              |
| 500    | Server error                     |

---

### DELETE /api/quotations/[id]

**Purpose:** Soft-delete a quotation (sets `isDeleted: true`).

**Authentication:** Required + Company setup

**Path Parameter:** `id` — MongoDB ObjectId

**Ownership Check:** Quotation must belong to the user's company.

**Response (200):**

```json
{
  "success": true
}
```

**Error Responses:**

| Status | Description          |
| ------ | -------------------- |
| 400    | Invalid ObjectId     |
| 401    | Not authenticated    |
| 404    | Quotation not found  |
| 500    | Server error         |

---

### PATCH /api/quotations/[id]/status

**Purpose:** Update a quotation's status, with automatic lead status updates.

**Authentication:** Required + Company setup

**Path Parameter:** `id` — MongoDB ObjectId

**Ownership Check:** Quotation must belong to the user's company.

**Request Body:**

```json
{
  "status": "string (QuotationStatus, required)"
}
```

**Validation:** `quotationStatusUpdateSchema` (`lib/validations/quotation.ts`)

| Field  | Type             | Rules                                                      |
| ------ | ---------------- | ---------------------------------------------------------- |
| status | QuotationStatus  | Required, one of: draft, sent, viewed, accepted, rejected, expired |

**Special Behavior (when status = "accepted" and `leadId` exists):**
1. Demotes any other `accepted` quotations for the same lead to `sent`
2. Updates the associated lead's status to `won`
3. Adds a status history entry to the lead

**Response (200):**

```json
{
  "quotation": { /* QuotationDetailResponse */ },
  "leadUpdated": "boolean"
}
```

**Error Responses:**

| Status | Description          |
| ------ | -------------------- |
| 400    | Validation error     |
| 401    | Not authenticated    |
| 404    | Quotation not found  |
| 500    | Server error         |

---

### GET /api/quotations/[id]/pdf

**Purpose:** Generate and stream a PDF for a quotation.

**Authentication:** Required + Company setup

**Path Parameter:** `id` — MongoDB ObjectId

**Ownership Check:** Quotation must belong to the user's company.

**Response Headers:**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="{quotationNumber}.pdf"
Cache-Control: no-cache, no-store, must-revalidate
```

**Response:** Binary PDF file stream.

**Behavior:** Uses `@react-pdf/renderer` to generate the PDF server-side.

**Error Responses:**

| Status | Description          |
| ------ | -------------------- |
| 400    | Invalid ObjectId     |
| 401    | Not authenticated    |
| 404    | Quotation not found  |
| 500    | Server error         |

---

### POST /api/quotations/public/pdf

**Purpose:** Generate a PDF for a free-tier public quotation. No authentication required.

**Authentication:** None (public endpoint)

**Request Body:**

```json
{
  "company": {
    "name": "string (required, 1-200 chars)",
    "email": "string (optional)",
    "contactNumber": "string (optional, max 20 chars)",
    "address": "string (optional, max 500 chars)"
  },
  "client": {
    "name": "string (2-100 chars)",
    "contactNumber": "string (8-20 chars)",
    "email": "string (optional)",
    "address": "string (optional)"
  },
  "groups": [/* same structure as standaloneQuotationSchema */],
  "discount": { "type": "percentage|fixed", "value": "number" },
  "taxRate": "number (0-100)",
  "validUntil": "string (ISO date)",
  "termsAndConditions": "string (optional)",
  "notes": "string (optional)"
}
```

**Validation:** `publicQuotationSchema` (`lib/validations/quotation.ts`)

**Behavior:**
- No database access required — company info comes from the request body
- Generates a temporary quotation number
- Processes groups and calculates all totals
- Renders PDF with `showBranding: true` (adds "Generated by RenoHub" footer)
- Returns the PDF immediately without persisting

**Response:** Binary PDF file stream (same headers as GET /api/quotations/[id]/pdf).

**Error Responses:**

| Status | Description      |
| ------ | ---------------- |
| 400    | Validation error |
| 500    | Server error     |

---

### POST /api/quotations/standalone

**Purpose:** Generate a PDF for a quotation without saving to the database.

**Authentication:** Required + Company setup

**Request Body:** Same as POST /api/quotations but **without** `status` field.

**Validation:** `standaloneQuotationSchema` (`lib/validations/quotation.ts`)

**Behavior:**
- Generates a temporary quotation number
- Processes groups and calculates all totals
- Returns the PDF immediately without persisting

**Response:** Binary PDF file stream (same headers as GET /api/quotations/[id]/pdf).

**Error Responses:**

| Status | Description       |
| ------ | ----------------- |
| 400    | Validation error  |
| 401    | Not authenticated |
| 500    | Server error      |

---

### POST /api/quotations/standalone/save

**Purpose:** Save a standalone quotation to the database, with optional lead creation.

**Authentication:** Required + Company setup

**Request Body:**

```json
{
  "quotation": {
    /* Same as standaloneQuotationSchema */
  },
  "createLead": "boolean (required)",
  "leadId": "string | null (optional, used when createLead=false)",
  "lead": {
    "clientName": "string (2-100 chars)",
    "contactNumber": "string (8-20 chars)",
    "email": "string (optional)",
    "budget": "number (>= 0)",
    "siteAddress": "string | null (max 500, optional)",
    "status": "LeadStatus",
    "remark": "string | null (max 2000, optional)"
  }
}
```

**Validation:** `standaloneSaveSchema` (`lib/validations/quotation.ts`)

**Behavior:**
- If `createLead: true` — creates a new lead from `lead` data, then creates the quotation linked to it
- If `createLead: false` — links quotation to the existing `leadId`
- Quotation is created with `draft` status

**Response (201):**

```json
{
  "quotation": { /* QuotationDetailResponse */ },
  "lead": { /* LeadResponse */ }
}
```

**Error Responses:**

| Status | Description                       |
| ------ | --------------------------------- |
| 400    | Validation error                  |
| 401    | Not authenticated                 |
| 409    | Quotation number conflict (retry) |
| 500    | Server error                      |

---

## Upload

### POST /api/upload

**Purpose:** Upload an image file.

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type   | Rules                                      |
| ----- | ------ | ------------------------------------------ |
| file  | File   | Required, JPEG/PNG/WebP, max 5MB           |
| type  | string | Required, one of: avatar, logo, item, lead |

**Validation:** File type checked against `ALLOWED_IMAGE_TYPES`, file size against `MAX_FILE_SIZE` (5MB default). Type validated against `uploadSchema` (`lib/validations/upload.ts`).

**Behavior:**
- Generates a unique filename: `{userId}_{timestamp}.{ext}`
- Stores file at `/public/uploads/{type}s/{filename}`
- Creates the upload directory if it doesn't exist

**Response (200):**

```json
{
  "url": "/uploads/avatars/userId_1234567890.jpg",
  "filename": "original-filename.jpg"
}
```

**Error Responses:**

| Status | Description                    |
| ------ | ------------------------------ |
| 400    | No file / invalid type / too large |
| 401    | Not authenticated              |
| 500    | Server error                   |

---

### DELETE /api/upload

**Purpose:** Delete an uploaded image file.

**Authentication:** Required

**Request Body:**

```json
{
  "url": "string (format: /uploads/{avatars|logos|items|leads}/{filename})"
}
```

**Validation:** `deleteUploadSchema` (`lib/validations/upload.ts`)

| Field | Type   | Rules                                                              |
| ----- | ------ | ------------------------------------------------------------------ |
| url   | string | Required, must match pattern `/uploads/{type}/{filename}`          |

**Security:** Validates that the `userId` embedded in the filename matches the authenticated user — users can only delete their own uploads.

**Response (200):**

```json
{
  "success": true
}
```

**Error Responses:**

| Status | Description                     |
| ------ | ------------------------------- |
| 400    | Validation error / invalid URL  |
| 401    | Not authenticated               |
| 403    | Not authorized (not your file)  |
| 500    | Server error                    |

---

## Validation Schemas

All schemas use **Zod** and are located in `lib/validations/`.

| File              | Schemas                                                                 |
| ----------------- | ----------------------------------------------------------------------- |
| `auth.ts`         | `registerSchema`, `loginSchema`, `verifySchema`                         |
| `user.ts`         | `userUpdateSchema`, `changeEmailSchema`                                 |
| `company.ts`      | `companySchema`, `companyUpdateSchema`, `companySetupSchema`            |
| `item.ts`         | `itemCreateSchema`, `itemUpdateSchema`, `itemQuerySchema`               |
| `lead.ts`         | `leadCreateSchema`, `leadUpdateSchema`, `leadStatusUpdateSchema`, `leadQuerySchema` |
| `quotation.ts`    | `quotationCreateSchema`, `quotationUpdateSchema`, `quotationStatusUpdateSchema`, `quotationQuerySchema`, `standaloneQuotationSchema`, `standaloneSaveSchema` |
| `upload.ts`       | `uploadSchema`, `deleteUploadSchema`                                    |

**Common transforms applied across schemas:**
- Empty strings → `null` for optional string fields
- Numbers rounded to 2 decimal places where applicable
- Query parameter strings coerced to numbers/booleans

---

## Database Models

All models use **Mongoose** and are in `lib/models/`.

| Model      | Collection  | Key Fields                                                                |
| ---------- | ----------- | ------------------------------------------------------------------------- |
| User       | users       | name, email (unique), emailVerified, image, contactNumber, role           |
| Company    | companies   | userId (unique ref→User), name, email, logo, defaults (terms, tax, validity) |
| Item       | items       | companyId (ref→Company), name, unit, pricePerUnit, images[], isDeleted    |
| Lead       | leads       | companyId, clientName, contactNumber, email, budget, status, statusHistory[], images[], isDeleted |
| Quotation  | quotations  | companyId, leadId?, quotationNumber (unique per company), client, groups[], totals, status, isDeleted |

---

## Authentication & Authorization

### Middleware (`middleware.ts`)
- Runs on Edge runtime via `lib/auth.config.ts`
- Protects all routes except: `/api`, `/_next/static`, `/_next/image`, `/favicon.ico`, `*.png`
- Unauthenticated users are redirected to `/login`

### Auth Helper Functions (`lib/auth-utils.ts`)

**For Server Components (page-level):**

| Function                 | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `requireAuthOrRedirect`  | Redirects to /login if not authenticated         |
| `requireCompanySetup`    | Redirects to /setup if no company profile exists |
| `getSessionWithCompany`  | Returns session + company data                   |

**For API Routes:**

| Function                              | Returns                                    |
| ------------------------------------- | ------------------------------------------ |
| `getAuthenticatedSession`             | `{ session, error }` — error is a Response |
| `getAuthenticatedSessionWithCompany`  | `{ session, company, error }`              |
| `validateOwnership(resourceId, userId)` | Boolean ownership check                  |

### Multi-Tenant Isolation
Every resource query is scoped by `companyId`. The `validateOwnership` helper ensures a resource's `companyId` matches the requesting user's company before returning data.

---

## Conventions

| Convention              | Details                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| **Multi-tenancy**       | All resources scoped to `companyId`; ownership validated on every request |
| **Soft deletes**        | Items, Leads, Quotations use `isDeleted` flag instead of hard deletes    |
| **ID transformation**   | MongoDB `_id` (ObjectId) → `id` (string) in all API responses           |
| **Error format**        | `{ error: string, details?: object, code?: string }`                     |
| **Pagination format**   | `{ page, limit, total, totalPages, hasNext, hasPrev }`                   |
| **Rate limiting**       | In-memory rate limiter on `/api/auth/register` (3 req/min per email)     |
| **Status history**      | Leads track all status changes with timestamp and optional note          |
| **Quotation numbers**   | Auto-generated as `Q-YYYYMM-NNNN`, unique per company per month         |
| **Company snapshots**   | Quotations store company info at creation time for historical accuracy    |
| **File naming**         | Uploads use `{userId}_{timestamp}.{ext}` for uniqueness and ownership    |
| **Null coercion**       | Empty strings in optional fields are transformed to `null` by Zod        |
