import mongoose, { Schema, Document, Model } from "mongoose";

export interface IItemImage {
  url: string;
  filename: string;
  order: number;
}

export interface IItem extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  name: string;
  unit: string;
  pricePerUnit: number;
  description?: string;
  brand?: string;
  category?: string;
  images: IItemImage[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const itemImageSchema = new Schema<IItemImage>(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const itemSchema = new Schema<IItem>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },
    name: {
      type: String,
      required: [true, "Item name is required"],
      minlength: [2, "Item name must be at least 2 characters"],
      maxlength: [200, "Item name must be at most 200 characters"],
      trim: true,
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      minlength: [1, "Unit must be at least 1 character"],
      maxlength: [50, "Unit must be at most 50 characters"],
      trim: true,
    },
    pricePerUnit: {
      type: Number,
      required: [true, "Price per unit is required"],
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description must be at most 1000 characters"],
      trim: true,
    },
    brand: {
      type: String,
      maxlength: [100, "Brand must be at most 100 characters"],
      trim: true,
    },
    category: {
      type: String,
      maxlength: [100, "Category must be at most 100 characters"],
      trim: true,
    },
    images: {
      type: [itemImageSchema],
      default: [],
      validate: {
        validator: function (val: IItemImage[]) {
          return val.length <= 5;
        },
        message: "Maximum 5 images allowed",
      },
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
itemSchema.index({ companyId: 1 });
itemSchema.index({ companyId: 1, isDeleted: 1 });
itemSchema.index({ companyId: 1, category: 1 });
itemSchema.index(
  { companyId: 1, name: "text", description: "text" },
  {
    weights: { name: 10, description: 5 },
    name: "item_text_search"
  }
);

// Prevent model recompilation in development (hot reload)
const Item: Model<IItem> =
  mongoose.models.Item || mongoose.model<IItem>("Item", itemSchema);

export default Item;
