import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  emailVerified: Date | null;
  image?: string;
  contactNumber?: string;
  role: "owner";
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be at most 100 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    contactNumber: {
      type: String,
      trim: true,
      maxlength: [20, "Contact number must be at most 20 characters"],
    },
    role: {
      type: String,
      enum: ["owner"],
      default: "owner",
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to update lastActiveAt
userSchema.pre("save", function (next) {
  if (this.isModified("emailVerified") && this.emailVerified) {
    this.lastActiveAt = new Date();
  }
  next();
});

// Prevent model recompilation in development (hot reload)
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
