import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req:NextRequest) {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
        return NextResponse.json({error: "No image uploaded"}, {status: 400})
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString("base64")
    const imageDataUrl = `data:${file.type};base64,${base64Image}`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
            {
            role: "user",
            content: [
            {
            type: "text",
            text: "You are a fashion stylist. List 3-5 fashion-related keywords (e.g. ‘leather jacket’, ‘white sneakers’, ‘oversized hoodie’) you observe in this image. Be concise. Only focus on the main piece of clothing visible in the image. Make sure the structure of the response is a list. List items should just be words wihout any special characters. The first word should be the category of the item which can be one of the following - top, bottom, footwear, jacket, accessory"
            },
            {
            type: "image_url",
            image_url: { url: imageDataUrl }
            }
            ]
            }
            ],
            max_tokens: 100
        });

        const raw = response.choices[0].message.content || "";
        const keywords = raw
        .split(/,|\n|\r|\*/)
        .map((k) => k.trim())
        .filter(Boolean);
        console.log(keywords)

        return NextResponse.json({ keywords });
        } catch (err) {
        console.error("OpenAI error:", err);
        return NextResponse.json({ error: "Failed to extract keywords" }, { status: 500 });
        }
    }
    