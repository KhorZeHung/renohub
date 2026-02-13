import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompanyLogo {
  url: string;
  filename: string;
  width?: number;
  height?: number;
}

export interface ICompany extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  contactNumber?: string;
  address?: string;
  website?: string;
  taxRegistrationNumber?: string;
  logo?: ICompanyLogo;
  defaultTerms?: string;
  defaultValidityDays: number;
  defaultTaxRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const companyLogoSchema = new Schema<ICompanyLogo>(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false }
);

const companySchema = new Schema<ICompany>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Company name is required"],
      minlength: [2, "Company name must be at least 2 characters"],
      maxlength: [100, "Company name must be at most 100 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Company email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    contactNumber: {
      type: String,
      trim: true,
      maxlength: [20, "Contact number must be at most 20 characters"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address must be at most 500 characters"],
    },
    website: {
      type: String,
      trim: true,
      maxlength: [200, "Website URL must be at most 200 characters"],
    },
    taxRegistrationNumber: {
      type: String,
      trim: true,
      maxlength: [50, "Tax registration number must be at most 50 characters"],
    },
    logo: {
      type: companyLogoSchema,
      default: null,
    },
    defaultTerms: {
      type: String,
      maxlength: [5000, "Default terms must be at most 5000 characters"],
    },
    defaultValidityDays: {
      type: Number,
      default: 30,
      min: [1, "Validity days must be at least 1"],
      max: [365, "Validity days must be at most 365"],
    },
    defaultTaxRate: {
      type: Number,
      default: 0,
      min: [0, "Tax rate cannot be negative"],
      max: [100, "Tax rate cannot exceed 100%"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development (hot reload)
const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>("Company", companySchema);

export default Company;
