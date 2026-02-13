import { ObjectId } from "mongoose";

// ===========================================
// User Types
// ===========================================

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  contactNumber?: string;
  emailVerified: Date | null;
  role: "owner";
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================================
// Company Types
// ===========================================

export interface CompanyLogo {
  url: string;
  filename: string;
  width?: number;
  height?: number;
}

export interface Company {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  email: string;
  contactNumber: string;
  address?: string;
  website?: string;
  taxRegistrationNumber?: string;
  logo?: CompanyLogo;
  defaultTerms?: string;
  defaultValidityDays: number;
  defaultTaxRate: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================================
// Item Types
// ===========================================

export interface ItemImage {
  url: string;
  filename: string;
  order: number;
}

export interface Item {
  _id: ObjectId;
  companyId: ObjectId;
  name: string;
  unit: string;
  pricePerUnit: number;
  description?: string;
  brand?: string;
  category?: string;
  images: ItemImage[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateItemInput = Omit<Item, "_id" | "companyId" | "createdAt" | "updatedAt" | "isDeleted">;
export type UpdateItemInput = Partial<CreateItemInput>;

// ===========================================
// Lead Types
// ===========================================

export type LeadStatus = "new" | "contacted" | "quoted" | "negotiating" | "won" | "lost";

export interface LeadStatusHistory {
  status: LeadStatus;
  changedAt: Date;
  note?: string;
}

export interface Lead {
  _id: ObjectId;
  companyId: ObjectId;
  clientName: string;
  contactNumber: string;
  email?: string;
  budget?: number;
  siteAddress?: string;
  remark?: string;
  status: LeadStatus;
  statusHistory: LeadStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateLeadInput = Omit<Lead, "_id" | "companyId" | "createdAt" | "updatedAt" | "statusHistory">;
export type UpdateLeadInput = Partial<CreateLeadInput>;

// ===========================================
// Quotation Types
// ===========================================

export type QuotationStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired";

export interface QuotationClient {
  name: string;
  contactNumber: string;
  email?: string;
  address?: string;
}

export interface QuotationCompanySnapshot {
  name: string;
  email: string;
  contactNumber: string;
  address?: string;
  logo?: string;
}

export interface LineItemDiscount {
  type: "percentage" | "fixed";
  value: number;
}

export interface SelectedImage {
  url: string;
  filename: string;
  caption?: string;
}

export interface LineItem {
  id: string;
  itemId?: string | null;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  discount?: LineItemDiscount;
  selectedImages: SelectedImage[];
  availableImages?: ItemImage[];
}

export interface QuotationGroup {
  id: string;
  name: string;
  description?: string;
  order: number;
  lineItems: LineItem[];
  subtotal: number;
}

export interface QuotationDiscount {
  type: "percentage" | "fixed";
  value: number;
  amount: number;
}

export interface Quotation {
  _id: ObjectId;
  companyId: ObjectId;
  leadId?: ObjectId | null;
  quotationNumber: string;
  client: QuotationClient;
  companySnapshot: QuotationCompanySnapshot;
  groups: QuotationGroup[];
  subtotal: number;
  discount?: QuotationDiscount;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  validUntil: Date;
  termsAndConditions?: string;
  notes?: string;
  status: QuotationStatus;
  pdfUrl?: string;
  pdfGeneratedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================================
// API Quotation Response Types (for frontend)
// ===========================================

export interface QuotationResponse {
  id: string;
  quotationNumber: string;
  leadId: string | null;
  client: QuotationClient;
  total: number;
  status: QuotationStatus;
  validUntil: string;
  groupsCount: number;
  totalLineItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationDetailResponse {
  id: string;
  quotationNumber: string;
  leadId: string | null;
  client: QuotationClient;
  companySnapshot: QuotationCompanySnapshot;
  groups: QuotationGroup[];
  subtotal: number;
  discount: QuotationDiscount | null;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  validUntil: string;
  termsAndConditions: string | null;
  notes: string | null;
  status: QuotationStatus;
  pdfUrl: string | null;
  pdfGeneratedAt: string | null;
  isDeleted: boolean;
  groupsCount: number;
  totalLineItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationsListResponse {
  quotations: QuotationResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Input types for creating/updating quotations
export interface LineItemInput {
  id: string;
  itemId?: string | null;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount?: LineItemDiscount;
  selectedImages?: SelectedImage[];
}

export interface GroupInput {
  id: string;
  name: string;
  description?: string;
  order: number;
  lineItems: LineItemInput[];
}

export interface CreateQuotationInput {
  leadId?: string | null;
  client: QuotationClient;
  groups: GroupInput[];
  discount?: {
    type: "percentage" | "fixed";
    value: number;
  };
  taxRate: number;
  validUntil: string;
  termsAndConditions?: string;
  notes?: string;
  status?: QuotationStatus;
}

export type UpdateQuotationInput = Partial<CreateQuotationInput>;

export interface StandaloneSaveInput {
  quotation: CreateQuotationInput;
  createLead: boolean;
  leadId?: string;
  lead?: {
    clientName: string;
    contactNumber: string;
    email: string;
    budget: number;
    siteAddress: string;
    status?: LeadStatus;
    remark?: string;
  };
}

// ===========================================
// Dashboard Types
// ===========================================

export interface DashboardStats {
  totalLeads: number;
  leadsByStatus: Record<LeadStatus, number>;
  conversionRate: number;
  thisMonthLeads: number;
  totalQuotedValue: number;
  wonValue: number;
  averageDealSize: number;
  recentLeads: Lead[];
  recentQuotations: Quotation[];
}

// ===========================================
// API Response Types
// ===========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===========================================
// Form Types
// ===========================================

export interface SelectOption {
  label: string;
  value: string;
}

export const LEAD_STATUS_OPTIONS: SelectOption[] = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Quoted", value: "quoted" },
  { label: "Negotiating", value: "negotiating" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
];

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  quoted: "bg-purple-100 text-purple-700",
  negotiating: "bg-orange-100 text-orange-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

export const QUOTATION_STATUS_OPTIONS: SelectOption[] = [
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Viewed", value: "viewed" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Expired", value: "expired" },
];

export const UNIT_OPTIONS: SelectOption[] = [
  { label: "Square Feet (sqft)", value: "sqft" },
  { label: "Piece", value: "piece" },
  { label: "Hour", value: "hour" },
  { label: "Lot", value: "lot" },
  { label: "Meter", value: "meter" },
  { label: "Set", value: "set" },
  { label: "Unit", value: "unit" },
  { label: "Day", value: "day" },
  { label: "Feet (ft)", value: "ft" },
  { label: "Gallon", value: "gallon" },
  { label: "Point", value: "point" },
];

export const ITEM_CATEGORY_OPTIONS: SelectOption[] = [
  { label: "Flooring", value: "Flooring" },
  { label: "Paint", value: "Paint" },
  { label: "Tiles", value: "Tiles" },
  { label: "Carpentry", value: "Carpentry" },
  { label: "Electrical", value: "Electrical" },
  { label: "Plumbing", value: "Plumbing" },
  { label: "Ceiling", value: "Ceiling" },
  { label: "Hacking", value: "Hacking" },
  { label: "Other", value: "Other" },
];

// ===========================================
// API Item Response Types (for frontend)
// ===========================================

export interface ItemResponse {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  description: string | null;
  brand: string | null;
  category: string | null;
  images: ItemImage[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemsListResponse {
  items: ItemResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===========================================
// API Lead Response Types (for frontend)
// ===========================================

export interface LeadStatusHistoryResponse {
  status: string;
  note?: string;
  changedAt: string;
}

export interface LeadImage {
  url: string;
  filename: string;
  order: number;
}

export interface LeadResponse {
  id: string;
  clientName: string;
  contactNumber: string;
  email: string;
  budget: number;
  siteAddress: string;
  status: LeadStatus;
  remark: string | null;
  images: LeadImage[];
  quotationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeadDetailResponse extends LeadResponse {
  statusHistory: LeadStatusHistoryResponse[];
  isDeleted: boolean;
}

export interface LeadsListResponse {
  leads: LeadResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
