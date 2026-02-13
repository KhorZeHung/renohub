import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeadStatusHistory {
  status: string;
  note?: string;
  changedAt: Date;
}

export interface ILeadImage {
  url: string;
  filename: string;
  order: number;
}

export interface ILead extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  clientName: string;
  contactNumber: string;
  email: string;
  budget: number;
  siteAddress: string;
  status: "new" | "contacted" | "quoted" | "negotiating" | "won" | "lost";
  remark?: string;
  images: ILeadImage[];
  statusHistory: ILeadStatusHistory[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const leadStatusHistorySchema = new Schema<ILeadStatusHistory>(
  {
    status: { type: String, required: true },
    note: { type: String },
    changedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const leadSchema = new Schema<ILead>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },
    clientName: {
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
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: [0, "Budget cannot be negative"],
    },
    siteAddress: {
      type: String,
      required: [true, "Site address is required"],
      minlength: [5, "Site address must be at least 5 characters"],
      maxlength: [500, "Site address must be at most 500 characters"],
      trim: true,
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["new", "contacted", "quoted", "negotiating", "won", "lost"],
        message: "Invalid status value",
      },
      default: "new",
    },
    remark: {
      type: String,
      maxlength: [2000, "Remark must be at most 2000 characters"],
      trim: true,
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          filename: { type: String, required: true },
          order: { type: Number, required: true, default: 0 },
        },
      ],
      default: [],
    },
    statusHistory: {
      type: [leadStatusHistorySchema],
      default: [],
    },
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
leadSchema.index({ companyId: 1 });
leadSchema.index({ companyId: 1, isDeleted: 1 });
leadSchema.index({ companyId: 1, status: 1 });
leadSchema.index(
  { companyId: 1, clientName: "text", siteAddress: "text", email: "text" },
  {
    weights: { clientName: 10, email: 5, siteAddress: 3 },
    name: "lead_text_search",
  }
);

// Prevent model recompilation in development (hot reload)
const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", leadSchema);

export default Lead;
