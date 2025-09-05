// lib/types.ts
export type EbayItem = {
    title: string;
    price?: {
      value: string;
      currency: string;
    };
    image?: {
      imageUrl: string;
    };
    webUrl: string;
  };

export type Category = 'top' | 'bottom' | 'footwear' | 'jacket' | 'accessory';

export type CategorizedItem = EbayItem & {
  category: Category;
};

export type OutfitSuggestion = {
  name: string;
  items: EbayItem[];
  totalPrice?: number;
  description: string;
};


export type CategorizedResults = {
  top: EbayItem[];
  bottom: EbayItem[];
  jacket: EbayItem[];
  footwear: EbayItem[];
  accessory: EbayItem[];
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
