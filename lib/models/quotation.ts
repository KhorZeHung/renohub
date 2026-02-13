import mongoose, { Schema, Document, Model } from "mongoose";

// Selected image for attachment
export interface ISelectedImage {
  url: string;
  filename: string;
  caption?: string;
}

// Line item discount
export interface ILineItemDiscount {
  type: "percentage" | "fixed";
  value: number;
}

// Line item within a group
export interface ILineItem {
  id: string;
  itemId?: mongoose.Types.ObjectId | null;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  discount?: ILineItemDiscount;
  selectedImages: ISelectedImage[];
}

// Group of line items
export interface IQuotationGroup {
  id: string;
  name: string;
  description?: string;
  order: number;
  lineItems: ILineItem[];
  subtotal: number;
}

// Client info (denormalized)
export interface IQuotationClient {
  name: string;
  contactNumber: string;
  email?: string;
  address?: string;
}

// Company snapshot (denormalized)
export interface IQuotationCompanySnapshot {
  name: string;
  email: string;
  contactNumber: string;
  address?: string;
  logo?: string;
}

// Document-level discount
export interface IQuotationDiscount {
  type: "percentage" | "fixed";
  value: number;
  amount: number;
}

export interface IQuotation extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId | null;
  quotationNumber: string;
  client: IQuotationClient;
  companySnapshot: IQuotationCompanySnapshot;
  groups: IQuotationGroup[];
  subtotal: number;
  discount?: IQuotationDiscount;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  validUntil: Date;
  termsAndConditions?: string;
  notes?: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired";
  pdfUrl?: string;
  pdfGeneratedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Selected image schema
const selectedImageSchema = new Schema<ISelectedImage>(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    caption: { type: String, maxlength: 200 },
  },
  { _id: false }
);

// Line item discount schema
const lineItemDiscountSchema = new Schema<ILineItemDiscount>(
  {
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// Line item schema
const lineItemSchema = new Schema<ILineItem>(
  {
    id: { type: String, required: true },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      default: null,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [1, "Description must be at least 1 character"],
      maxlength: [500, "Description must be at most 500 characters"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.01, "Quantity must be at least 0.01"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      minlength: [1, "Unit must be at least 1 character"],
      maxlength: [50, "Unit must be at most 50 characters"],
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    discount: lineItemDiscountSchema,
    selectedImages: {
      type: [selectedImageSchema],
      default: [],
      validate: {
        validator: function (v: ISelectedImage[]) {
          return v.length <= 5;
        },
        message: "Maximum 5 images can be selected per line item",
      },
    },
  },
  { _id: false }
);

// Group schema
const groupSchema = new Schema<IQuotationGroup>(
  {
    id: { type: String, required: true },
    name: {
      type: String,
      required: [true, "Group name is required"],
      minlength: [1, "Group name must be at least 1 character"],
      maxlength: [200, "Group name must be at most 200 characters"],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Group description must be at most 1000 characters"],
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: [0, "Order must be at least 0"],
      default: 0,
    },
    lineItems: {
      type: [lineItemSchema],
      required: true,
      validate: {
        validator: function (v: ILineItem[]) {
          return v.length >= 1;
        },
        message: "Group must have at least 1 line item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
  },
  { _id: false }
);

// Client schema
const clientSchema = new Schema<IQuotationClient>(
  {
    name: {
      type: String,
      required: [true, "Client name is required"],
      minlength: [2, "Client name must be at least 2 characters"],
      maxlength: [100, "Client name must be at most 100 characters"],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      minlength: [8, "Contact number must be at least 8 characters"],
      maxlength: [20, "Contact number must be at most 20 characters"],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    address: {
      type: String,
      maxlength: [500, "Address must be at most 500 characters"],
      trim: true,
    },
  },
  { _id: false }
);

// Company snapshot schema
const companySnapshotSchema = new Schema<IQuotationCompanySnapshot>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true },
    address: { type: String },
    logo: { type: String },
  },
  { _id: false }
);

// Quotation discount schema
const quotationDiscountSchema = new Schema<IQuotationDiscount>(
  {
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// Main quotation schema
const quotationSchema = new Schema<IQuotation>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },
    quotationNumber: {
      type: String,
      required: [true, "Quotation number is required"],
      trim: true,
    },
    client: {
      type: clientSchema,
      required: [true, "Client information is required"],
    },
    companySnapshot: {
      type: companySnapshotSchema,
      required: [true, "Company snapshot is required"],
    },
    groups: {
      type: [groupSchema],
      required: true,
      validate: {
        validator: function (v: IQuotationGroup[]) {
          return v.length >= 1;
        },
        message: "Quotation must have at least 1 group",
      },
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
    discount: quotationDiscountSchema,
    taxableAmount: {
      type: Number,
      required: [true, "Taxable amount is required"],
      min: [0, "Taxable amount cannot be negative"],
    },
    taxRate: {
      type: Number,
      required: [true, "Tax rate is required"],
      min: [0, "Tax rate cannot be negative"],
      max: [100, "Tax rate cannot exceed 100%"],
    },
    taxAmount: {
      type: Number,
      required: [true, "Tax amount is required"],
      min: [0, "Tax amount cannot be negative"],
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total cannot be negative"],
    },
    validUntil: {
      type: Date,
      required: [true, "Valid until date is required"],
    },
    termsAndConditions: {
      type: String,
      maxlength: [5000, "Terms and conditions must be at most 5000 characters"],
    },
    notes: {
      type: String,
      maxlength: [2000, "Notes must be at most 2000 characters"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["draft", "sent", "viewed", "accepted", "rejected", "expired"],
        message: "Invalid status value",
      },
      default: "draft",
    },
    pdfUrl: { type: String },
    pdfGeneratedAt: { type: Date },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
quotationSchema.index({ companyId: 1 });
quotationSchema.index({ companyId: 1, isDeleted: 1 });
quotationSchema.index({ companyId: 1, status: 1 });
quotationSchema.index({ companyId: 1, leadId: 1 });
quotationSchema.index({ companyId: 1, quotationNumber: 1 }, { unique: true });
quotationSchema.index({ companyId: 1, createdAt: -1 });
quotationSchema.index(
  { companyId: 1, quotationNumber: "text", "client.name": "text" },
  {
    weights: { quotationNumber: 10, "client.name": 5 },
    name: "quotation_text_search",
  }
);

// Prevent model recompilation in development (hot reload)
const Quotation: Model<IQuotation> =
  mongoose.models.Quotation ||
  mongoose.model<IQuotation>("Quotation", quotationSchema);

export default Quotation;
