// lib/types.ts
export type EbayItem = {
  title: string;
  price?: { value: string; currency: string };
  image?: { imageUrl: string };
  webUrl?: string;
  itemId?: string;
};

export type SearchEbayResponse = { itemSummaries: EbayItem[] };

export type ExtractKeywordsResponse =
  | { keywords: string[] }
  | { error: string };

export type ClipDebug = {
  uploadedImages: number;
  validInspiration: number;
  totalItems: number;
  validEbayEmbeddings: number;
  scoreStats?: { min: number; max: number; avg: number };
  positionChanges: number;
  failedEbayUrls?: string[];
  rerankEffectiveness?: number;
};

export type ClipRerankResponse = {
  items: EbayItem[];
  debug: ClipDebug;
};
