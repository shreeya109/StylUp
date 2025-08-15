import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const ENDPOINT = process.env.EBAY_DELETE_ENDPOINT!;
const VERIFY_TOKEN = process.env.EBAY_VERIFY_TOKEN!;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ENDPOINT || !VERIFY_TOKEN) {
    return res.status(500).json({ error: "Missing env vars" });
  }

  if (req.method === "GET") {
    const challengeCode = String(req.query.challenge_code || "");
    if (!challengeCode) return res.status(400).json({ error: "missing challenge_code" });

    const h = crypto.createHash("sha256");
    h.update(challengeCode);
    h.update(VERIFY_TOKEN);
    h.update(ENDPOINT);
    const challengeResponse = h.digest("hex");
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ challengeResponse });
  }

  if (req.method === "POST") {
    return res.status(204).end();
  }

  return res.status(405).end();
}
