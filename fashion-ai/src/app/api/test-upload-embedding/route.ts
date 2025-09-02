// /app/api/test-upload-embedding/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getImageEmbedding } from "../../lib/clip";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No valid image file received" }, { status: 400 });
    }

    const embedding = await getImageEmbedding(file);
    return NextResponse.json({ embedding: Array.from(embedding) }); // Truncate for debug
  } catch (err: any) {
    console.error("Embedding upload error:", err);
    return NextResponse.json({ error: "Failed to embed uploaded image" }, { status: 500 });
  }
}
