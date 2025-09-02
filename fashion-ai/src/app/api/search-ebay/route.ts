// app/api/search-ebay/route.ts (or pages/api/search-ebay.ts if using Pages router)
import { NextResponse, NextRequest } from "next/server";

const EBAY_ACCESS_TOKEN = process.env.EBAY_ACCESS_TOKEN!;

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Missing search query" }, { status: 400 });
  }
  if (!EBAY_ACCESS_TOKEN) {
    return NextResponse.json({ error: "Missing EBAY_ACCESS_TOKEN" }, { status: 500 });
  }

  // You can tune limit later; 6 is fine for quick UI
  const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(
    query
  )}&limit=6`;

  try {
    const ebayRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!ebayRes.ok) {
      // Keep the client happy with the expected key, even on errors
      return NextResponse.json({ itemSummaries: [] }, { status: ebayRes.status });
    }

    const raw = await ebayRes.json();

    // 🔧 Normalize to the exact shape your UI uses
    const itemSummaries = (raw?.itemSummaries ?? []).map((it: any) => ({
      title: it?.title,
      price: it?.price
        ? { value: String(it.price.value), currency: it.price.currency }
        : undefined,
      image: it?.image?.imageUrl ? { imageUrl: it.image.imageUrl } : undefined,
      // keeping these is harmless and may help later:
      webUrl: it?.itemWebUrl,
      itemId: it?.itemId,
    }));

    return NextResponse.json({ itemSummaries });
  } catch (err: any) {
    return NextResponse.json(
      { itemSummaries: [], error: err?.message ?? "eBay request failed" },
      { status: 500 }
    );
  }
}
