import { v2 as cloudinary } from "cloudinary";
import { getAuthUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["application/pdf"];

export async function POST(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) return errorResponse("No file provided", 400);

    if (!ALLOWED_TYPES.includes(file.type))
      return errorResponse("Only PDF files are allowed", 400);

    if (file.size > MAX_FILE_SIZE)
      return errorResponse("File too large. Max size is 5MB", 400);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "careerhub-cvs",
      resource_type: "raw", // "raw" = non-image files like PDF, stored as-is
    });

    return successResponse({ url: result.secure_url }, 200);
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error uploading file");
  }
}