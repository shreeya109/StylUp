import { NextResponse, NextRequest } from "next/server";

const EBAY_ACCESS_TOKEN = process.env.EBAY_ACCESS_TOKEN!;

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query) return NextResponse.json({error: "Missing search query"}, {status: 400});

  const ebayRes = await fetch(
    `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=6`,
    {
      headers: {
        Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await ebayRes.json();
  return NextResponse.json(data);
}