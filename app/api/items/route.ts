import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Item } from "@/lib/models";
import { getAuthenticatedSessionWithCompany } from "@/lib/auth-utils";
import { itemCreateSchema, itemQuerySchema } from "@/lib/validations/item";

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
 * GET /api/items
 * List all items with pagination, search, and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and company setup
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryResult = itemQuerySchema.safeParse({
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      active: searchParams.get("active") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      sort: searchParams.get("sort") || undefined,
      order: searchParams.get("order") || undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const { search, category, active, page, limit, sort, order } = queryResult.data;

    // Connect to database
    await connectToDatabase();

    // Build query
    const query: Record<string, unknown> = {
      companyId: company._id,
      isDeleted: !active,
    };

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Count total documents
    const total = await Item.countDocuments(query);

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Build sort object
    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sort || "createdAt"] = order === "asc" ? 1 : -1;

    // Fetch items
    const items = await Item.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform items
    const transformedItems = items.map(transformItem);

    return NextResponse.json({
      items: transformedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get items error:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/items
 * Create a new item
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and company setup
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = itemCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const itemData = validationResult.data;

    // Connect to database
    await connectToDatabase();

    // Create new item
    const newItem = new Item({
      ...itemData,
      companyId: company._id,
      isDeleted: false,
    });

    await newItem.save();

    // Transform and return
    const itemResponse = transformItem(newItem.toObject());

    return NextResponse.json({ item: itemResponse }, { status: 201 });
  } catch (error) {
    console.error("Create item error:", error);

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
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
