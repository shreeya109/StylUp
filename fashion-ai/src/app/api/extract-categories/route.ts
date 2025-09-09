import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";

// If you want Node runtime (recommended when using Buffer):
export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type ColorCat = "neutrals" | "brights" | "earth" | "pastels";
type Formality = "formal" | "casual" | "athletic";
type StructCategory = "top" | "bottom" | "jacket" | "footwear" | "accessory";

function normalizeColorCategory(s: string | undefined): ColorCat | undefined {
  if (!s) return;
  const t = s.toLowerCase();
  if (t.includes("neutral")) return "neutrals";
  if (t.includes("bright")) return "brights";
  if (t.includes("earth") || t.includes("earthy")) return "earth";
  if (t.includes("pastel")) return "pastels";
  return undefined;
}

function normalizeFormality(s: string | undefined): Formality | undefined {
  if (!s) return;
  const t = s.toLowerCase();
  if (t.includes("formal") || t.includes("dress")) return "formal";
  if (t.includes("athlet")) return "athletic";
  if (t.includes("casual") || t.includes("street") || t.includes("everyday")) return "casual";
  return undefined;
}

// title → structural category hint (used as a fallback if the model is uncertain)
function guessCategoryFromTitle(title: string): StructCategory | undefined {
  const t = (title || "").toLowerCase();
  if (/(shoe|sneaker|boot|heel|sandal|loafer|cleat|pump|mule)/.test(t)) return "footwear";
  if (/(jacket|coat|parka|blazer|trench|windbreaker|puffer)/.test(t)) return "jacket";
  if (/(jean|pant|trouser|chino|legging|short|skirt|cargo|culotte)/.test(t)) return "bottom";
  if (/(shirt|tee|t\-shirt|blouse|sweater|hoodie|crewneck|cardigan|tank|top|polo|dress)/.test(t)) return "top";
  if (/(bag|belt|hat|cap|scarf|sunglass|watch|ring|necklace|earring|bracelet|wallet)/.test(t)) return "accessory";
  return undefined;
}

function parseModelText(text: string) {
  // Accepts CSV-ish, bullet-y, or JSON-ish outputs and tries to normalize.
  const raw = (text || "").trim();

  // Quick JSON attempt
  try {
    const j = JSON.parse(raw);
    const colorCategory = normalizeColorCategory(j.colorCategory || j.palette || j.color || j.colors);
    const formality = normalizeFormality(j.formality || j.vibe || j.style);
    const category = (j.category as StructCategory | undefined);
    return { colorCategory, formality, category };
  } catch {
    // Not JSON; continue
  }

  // CSV / bullet styles like: "neutrals, casual, top"
  const parts = raw
    .replace(/\*/g, " ")
    .replace(/\s+/g, " ")
    .split(/[,\n\r|-]+/)
    .map(s => s.trim())
    .filter(Boolean);

  let colorCategory: ColorCat | undefined;
  let formality: Formality | undefined;
  let category: StructCategory | undefined;

  for (const p of parts) {
    const cc = normalizeColorCategory(p);
    if (cc) { colorCategory = cc; continue; }
    const fm = normalizeFormality(p);
    if (fm) { formality = fm; continue; }
    const low = p.toLowerCase();
    if (["top","bottom","jacket","footwear","accessory"].includes(low)) {
      category = low as StructCategory;
    }
  }

  return { colorCategory, formality, category };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const title = (formData.get("title") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString("base64");
    const imageDataUrl = `data:${file.type || "image/jpeg"};base64,${base64Image}`;

    // Prompt model to extract 3 things: palette, formality, and structural category
    const prompt = `
You are a fashion classifier. 
Return a short JSON with keys: colorCategory (one of: neutrals, brights, earth, pastels), 
formality (one of: formal, casual, athletic), and category (one of: top, bottom, jacket, footwear, accessory).
Use both the image and the provided title text for hints. If uncertain, make your best guess.

Example:
{"colorCategory":"neutrals","formality":"casual","category":"top"} 
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt + `\nTitle: ${title}` },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      max_tokens: 120,
    });

    const text = response.choices?.[0]?.message?.content || "";
    const { colorCategory, formality, category } = parseModelText(text);

    // Fallbacks if the model missed something:
    const fallbackCategory = category ?? guessCategoryFromTitle(title);

    if (!colorCategory && !formality && !fallbackCategory) {
      // If truly nothing is parseable, respond gracefully rather than 500
      return NextResponse.json(
        { colorCategory: undefined, formality: undefined, category: fallbackCategory },
        { status: 200 }
      );
    }

    return NextResponse.json({
      colorCategory,
      formality,
      category: fallbackCategory ?? category,
    });
  } catch (err: any) {
    console.error("extract-categories error:", err?.message || err);
    return NextResponse.json(
      { error: "Failed to extract categories" },
      { status: 500 }
    );
  }
}

// Optional: explicit method guard for GET → 405 (Next already does this, but harmless)
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
