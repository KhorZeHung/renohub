import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getAuthenticatedSession } from "@/lib/auth-utils";
import {
  ALLOWED_IMAGE_TYPES,
  MIME_TO_EXT,
  AllowedImageType,
  deleteUploadSchema,
} from "@/lib/validations/upload";
import { env } from "@/lib/env";

// Get upload directory paths
const UPLOAD_BASE_DIR = path.join(process.cwd(), "public", "uploads");
const AVATARS_DIR = path.join(UPLOAD_BASE_DIR, "avatars");
const LOGOS_DIR = path.join(UPLOAD_BASE_DIR, "logos");
const ITEMS_DIR = path.join(UPLOAD_BASE_DIR, "items");
const LEADS_DIR = path.join(UPLOAD_BASE_DIR, "leads");
const QUOTATIONS_DIR = path.join(UPLOAD_BASE_DIR, "quotations");

/**
 * Ensure upload directories exist
 */
async function ensureUploadDirs() {
  for (const dir of [UPLOAD_BASE_DIR, AVATARS_DIR, LOGOS_DIR, ITEMS_DIR, LEADS_DIR, QUOTATIONS_DIR]) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
}

/**
 * POST /api/upload
 * Upload an image file (avatar or logo)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { session, error } = await getAuthenticatedSession();
    if (error) return error;

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!type || !["avatar", "logo", "item", "lead", "quotation"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'avatar', 'logo', 'item', 'lead', or 'quotation'" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > env.MAX_FILE_SIZE) {
      const maxSizeMB = Math.round(env.MAX_FILE_SIZE / 1024 / 1024);
      return NextResponse.json(
        { error: `File size must be less than ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Ensure upload directories exist
    await ensureUploadDirs();

    // Generate unique filename
    const ext = MIME_TO_EXT[file.type as AllowedImageType];
    const timestamp = Date.now();
    const filename = `${session.user.id}_${timestamp}.${ext}`;

    // Determine target directory based on type
    const targetDir = type === "avatar" ? AVATARS_DIR : type === "logo" ? LOGOS_DIR : type === "lead" ? LEADS_DIR : type === "quotation" ? QUOTATIONS_DIR : ITEMS_DIR;
    const filePath = path.join(targetDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate URL path (relative to public directory)
    const url = `/uploads/${type}s/${filename}`;

    // Return upload result
    return NextResponse.json({
      url,
      filename: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * Delete an uploaded image
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const { session, error } = await getAuthenticatedSession();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = deleteUploadSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { url } = validationResult.data;

    // Validate URL format and extract filename
    const urlPattern = /^\/uploads\/(avatars|logos|items|leads|quotations)\/([^/]+)$/;
    const match = url.match(urlPattern);

    if (!match) {
      return NextResponse.json(
        { error: "Invalid upload URL format" },
        { status: 400 }
      );
    }

    const [, type, filename] = match;

    // Security check: Ensure user can only delete their own uploads
    // Filename format: {userId}_{timestamp}.{ext}
    if (!filename.startsWith(session.user.id)) {
      return NextResponse.json(
        { error: "You can only delete your own uploads" },
        { status: 403 }
      );
    }

    // Construct full file path
    const targetDir = type === "avatars" ? AVATARS_DIR : type === "logos" ? LOGOS_DIR : type === "leads" ? LEADS_DIR : type === "quotations" ? QUOTATIONS_DIR : ITEMS_DIR;
    const filePath = path.join(targetDir, filename);

    // Check if file exists and delete
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete upload error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
