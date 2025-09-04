// lib/types.ts
export type EbayItem = {
  title: string;
  price?: { value: string; currency: string };
  image?: { imageUrl: string };
  webUrl?: string;
  itemId?: string;
  clipSimilarity?: number;
};

export type CategorizedItem = EbayItem & {
  category: string;
};

export type OutfitSuggestion = {
  name: string;
  items: CategorizedItem[];
  totalPrice?: number;
  description: string;
};

export type CategorizedResults = {
  top: CategorizedItem[];
  bottom: CategorizedItem[];
  jacket: CategorizedItem[];
  footwear: CategorizedItem[];
  accessory: CategorizedItem[];
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
