import { CategorizedResults, OutfitSuggestion, EbayItem } from "./types";

export type OutfitPrefs = {
  targetPalette?: "neutrals" | "brights" | "earth" | "pastels";
  targetVibe?: "formal" | "casual" | "athletic";
  budgetMax?: number;
  maxOutfits?: number;
  topKPerCategory?: number;
  beamWidth?: number;
  allowReuse?: boolean;
};

export type AttrGetter = (
  item: EbayItem
) => { palette?: OutfitPrefs["targetPalette"]; vibe?: OutfitPrefs["targetVibe"] };

const priceOf = (it?: EbayItem): number => {
  if (!it?.price?.value) return 0;
  const v = Number(it.price.value);
  return Number.isFinite(v) ? v : 0;
};

const getItemKey = (item: EbayItem): string => {
  return item.webUrl || (item as any).itemId || `${item.title}-${item.image?.imageUrl}`;
};

function compatibilityPenalty(
  items: Partial<Record<keyof CategorizedResults, EbayItem>>
): number {
  let penalty = 0;

  const top = items.top?.title?.toLowerCase() || "";
  const bottom = items.bottom?.title?.toLowerCase() || "";
  const jacket = items.jacket?.title?.toLowerCase() || "";
  const footwear = items.footwear?.title?.toLowerCase() || "";

  if (jacket && /parka|puffer|snow/.test(jacket) && footwear && /sandal|flip flop/.test(footwear)) penalty += 0.8;
  if (top && /evening|silk blouse|blazer/.test(top) && footwear && /sneaker|running/.test(footwear)) penalty += 0.4;
  if (bottom && /track|jogger|legging/.test(bottom) && footwear && /heel|pump|stiletto/.test(footwear)) penalty += 0.5;

  return penalty;
}

function aestheticsScore(
  items: Partial<Record<keyof CategorizedResults, EbayItem>>,
  prefs: OutfitPrefs,
  getAttrs?: AttrGetter
): number {
  if (!getAttrs) return 0;
  const desiredPalette = prefs.targetPalette;
  const desiredVibe = prefs.targetVibe;

  const parts = Object.values(items).filter(Boolean) as EbayItem[];
  if (parts.length === 0) return 0;

  let paletteScore = 0;
  let vibeScore = 0;
  for (const it of parts) {
    const attrs = getAttrs(it);
    if (desiredPalette && attrs.palette === desiredPalette) paletteScore += 1;
    if (desiredVibe && attrs.vibe === desiredVibe) vibeScore += 1;
  }
  return (paletteScore + vibeScore) / parts.length;
}

function reusePenalty(
  items: Partial<Record<keyof CategorizedResults, EbayItem>>,
  usedByCategory: Map<EbayItem, { count: number; category: keyof CategorizedResults }>
): number {
  let p = 0;
  const weightFor = (cat: keyof CategorizedResults) =>
    cat === "top" ? 0.5 :
    cat === "bottom" ? 0.45 :
    cat === "jacket" ? 0.4 :
    cat === "footwear" ? 0.25 :
    0.2;

  for (const [cat, it] of Object.entries(items) as [keyof CategorizedResults, EbayItem | undefined][]) {
    if (!it) continue;
    const meta = usedByCategory.get(it);
    const prev = meta?.count ?? 0;
    p += Math.min(1, prev * 0.3) * weightFor(cat);
  }
  return p;
}

function outfitName(
  items: Partial<Record<keyof CategorizedResults, EbayItem>>,
  prefs: OutfitPrefs
): string {
  const vibe = prefs.targetVibe ? prefs.targetVibe[0].toUpperCase() + prefs.targetVibe.slice(1) : "Mixed";
  const palette = prefs.targetPalette ? prefs.targetPalette[0].toUpperCase() + prefs.targetPalette.slice(1) : "Varied";
  return `${vibe} • ${palette}`;
}

function outfitDescription(
  items: Partial<Record<keyof CategorizedResults, EbayItem>>
): string {
  const parts: string[] = [];
  if (items.top) parts.push(items.top.title);
  if (items.jacket) parts.push(items.jacket.title);
  if (items.bottom) parts.push(items.bottom.title);
  if (items.footwear) parts.push(items.footwear.title);
  if (items.accessory) parts.push(items.accessory.title);
  return parts.join(" + ");
}

function scoreOutfit(
  items: Partial<Record<keyof CategorizedResults, EbayItem>>,
  prefs: OutfitPrefs,
  usedByCategory: Map<EbayItem, { count: number; category: keyof CategorizedResults }>,
  getAttrs?: AttrGetter
): number {
  const pieces = Object.values(items).filter(Boolean) as EbayItem[];

  const coverage = (pieces.length / 5) * 1.5;

  const total = pieces.reduce((s, it) => s + priceOf(it), 0);
  let priceFit = 1;
  if (prefs.budgetMax && total > prefs.budgetMax) {
    const over = (total - prefs.budgetMax) / prefs.budgetMax;
    priceFit = Math.max(0, 1 - Math.min(1, over));
  }

  const aes = aestheticsScore(items, prefs, getAttrs);
  const compat = 1 - Math.min(1, compatibilityPenalty(items));
  const variety = 1 - Math.min(1, reusePenalty(items, usedByCategory));

  return (
    1.2 * coverage +
    1.0 * priceFit +
    0.9 * aes +
    0.8 * compat +
    1.1 * variety
  );
}

function topK<T>(arr: T[], k: number): T[] {
  return arr.slice(0, Math.max(1, k));
}

export function generateOutfits(
  categorized: CategorizedResults,
  prefs: OutfitPrefs = {},
  getAttrs?: AttrGetter
): OutfitSuggestion[] {
  const {
    targetPalette,
    targetVibe,
    budgetMax,
    maxOutfits = 8,
    topKPerCategory = 6,
    beamWidth = 40,
    allowReuse = false,
  } = prefs;
  console.log("CATEGORIZED", categorized)

  const pools: Partial<Record<keyof CategorizedResults, EbayItem[]>> = {
    top: topK(categorized.top, (prefs.topKPerCategory ?? 6) + 2),
    bottom: topK(categorized.bottom, (prefs.topKPerCategory ?? 6) + 2),
    jacket: topK(categorized.jacket, (prefs.topKPerCategory ?? 6) + 1),
    footwear: topK(categorized.footwear, prefs.topKPerCategory ?? 6),
    accessory: topK(categorized.accessory, prefs.topKPerCategory ?? 6),
  };

  const usedByCategory = new Map<EbayItem, { count: number; category: keyof CategorizedResults }>();
  const globalUsedItems = new Set<string>();

  const order: (keyof CategorizedResults)[] = ["top", "bottom", "jacket", "footwear", "accessory"];

  const chosen: OutfitSuggestion[] = [];

  for (let outfitIndex = 0; outfitIndex < maxOutfits; outfitIndex++) {
    type PartialOutfit = { pick: Partial<Record<keyof CategorizedResults, EbayItem>>; score: number };
    let beam: PartialOutfit[] = [{ pick: {}, score: 0 }];

    for (const cat of order) {
      const candidates = pools[cat] || [];
      if (candidates.length === 0) continue;

      const nextBeam: PartialOutfit[] = [];
      for (const state of beam) {
        for (const item of candidates) {
          if (!allowReuse && globalUsedItems.has(getItemKey(item))) {
            continue;
          }

          const pick = { ...state.pick, [cat]: item };
          const score = scoreOutfit(
            pick,
            { targetPalette, targetVibe, budgetMax, maxOutfits, topKPerCategory, beamWidth, allowReuse },
            usedByCategory,
            getAttrs
          );
          nextBeam.push({ pick, score });
        }
      }
      nextBeam.sort((a, b) => b.score - a.score);
      beam = nextBeam.slice(0, beamWidth);
    }

    beam.sort((a, b) => b.score - a.score);

    let foundValidOutfit = false;
    for (const state of beam) {
      const items = Object.values(state.pick).filter(Boolean) as EbayItem[];
      if (items.length < 3) continue;

      if (!allowReuse) {
        const hasUsedItem = items.some(item => globalUsedItems.has(getItemKey(item)));
        if (hasUsedItem) continue;
      }

      const totalPrice = items.reduce((sum, it) => sum + priceOf(it), 0);
      const suggestion: OutfitSuggestion = {
        name: outfitName(state.pick, { targetPalette, targetVibe }),
        description: outfitDescription(state.pick),
        items,
        totalPrice,
      };

      chosen.push(suggestion);

      for (const [catKey, itm] of Object.entries(state.pick) as [string, EbayItem | undefined][]) {
        if (!itm) continue;
        const cat = catKey as keyof CategorizedResults;
        const prev = usedByCategory.get(itm)?.count ?? 0;
        usedByCategory.set(itm, { count: prev + 1, category: cat });
        
        if (!allowReuse) {
          globalUsedItems.add(getItemKey(itm));
        }
      }

      foundValidOutfit = true;
      break;
    }

    if (!foundValidOutfit) {
      break;
    }
  }

  return chosen;
}