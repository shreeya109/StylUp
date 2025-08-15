import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

const ENDPOINT = process.env.EBAY_DELETE_ENDPOINT!;
const VERIFY_TOKEN = process.env.EBAY_VERIFY_TOKEN!;

export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get("challenge_code") ?? "";
  if (!code || !ENDPOINT || !VERIFY_TOKEN) {
    return NextResponse.json({ error: "bad config" }, { status: 400 });
  }
  const h = crypto.createHash("sha256");
  h.update(code); h.update(VERIFY_TOKEN); h.update(ENDPOINT);
  return NextResponse.json({ challengeResponse: h.digest("hex") });
}

export async function POST() { return new NextResponse(null, { status: 204 }); }
