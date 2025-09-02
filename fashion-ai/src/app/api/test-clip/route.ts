// app/api/test-clip/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getImageEmbedding } from "../../lib/clip";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
    }

    const embedding = await getImageEmbedding(imageUrl);
    return NextResponse.json({ embedding: Array.from(embedding) });
  } catch (err) {
    console.error("CLIP test error:", err);
    return NextResponse.json({ error: "Failed to generate embedding" }, { status: 500 });
  }
}
