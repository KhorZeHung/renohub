import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Item } from "@/lib/models";
import {
  getAuthenticatedSessionWithCompany,
  validateOwnership,
} from "@/lib/auth-utils";
import { itemUpdateSchema } from "@/lib/validations/item";

/**
 * Transform Item document to API response format
 */
function transformItem(item: {
  _id: mongoose.Types.ObjectId;
  name: string;
  unit: string;
  pricePerUnit: number;
  description?: string;
  brand?: string;
  category?: string;
  images: Array<{ url: string; filename: string; order: number }>;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: item._id.toString(),
    name: item.name,
    unit: item.unit,
    pricePerUnit: item.pricePerUnit,
    description: item.description || null,
    brand: item.brand || null,
    category: item.category || null,
    images: item.images || [],
    isDeleted: item.isDeleted,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/**
 * Validate ObjectId format
 */
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/items/[id]
 * Get a single item by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }

    // Check authentication and company setup
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    // Connect to database
    await connectToDatabase();

    // Find item
    const item = await Item.findById(id).lean();

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Validate ownership
    if (!validateOwnership(item.companyId, company._id)) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Transform and return
    const itemResponse = transformItem(item);

    return NextResponse.json({ item: itemResponse });
  } catch (error) {
    console.error("Get item error:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/items/[id]
 * Update an item
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }

    // Check authentication and company setup
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();

    // Check if body is empty
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const validationResult = itemUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Connect to database
    await connectToDatabase();

    // Find item first to validate ownership
    const existingItem = await Item.findById(id).lean();

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Validate ownership
    if (!validateOwnership(existingItem.companyId, company._id)) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Update item
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedItem) {
      return NextResponse.json(
        { error: "Failed to update item" },
        { status: 500 }
      );
    }

    // Transform and return
    const itemResponse = transformItem(updatedItem);

    return NextResponse.json({ item: itemResponse });
  } catch (error) {
    console.error("Update item error:", error);

    // Handle mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const errors: Record<string, string[]> = {};
      for (const [field, err] of Object.entries(error.errors)) {
        errors[field] = [err.message];
      }
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/items/[id]
 * Soft delete an item (sets isDeleted to true)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }

    // Check authentication and company setup
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    // Connect to database
    await connectToDatabase();

    // Find item first to validate ownership
    const existingItem = await Item.findById(id).lean();

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Validate ownership
    if (!validateOwnership(existingItem.companyId, company._id)) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Soft delete (set isDeleted to true)
    await Item.findByIdAndUpdate(id, { $set: { isDeleted: true } });

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete item error:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
