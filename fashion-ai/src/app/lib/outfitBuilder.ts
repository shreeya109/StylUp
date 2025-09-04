// /lib/outfitBuilder.ts

export type EbayItem = {
  title: string;
  price?: {
    value: string;
    currency: string;
  };
  image?: {
    imageUrl: string;
  };
  clipSimilarity?: number;
  itemWebUrl?: string; // eBay link
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

// Extract category from keywords (first word should be category)
export function extractCategory(keywords: string[]): string {
  const validCategories = ['top', 'bottom', 'jacket', 'footwear', 'accessory'];
  
  // First check if any keyword directly starts with a valid category
  for (const keyword of keywords) {
    const firstWord = keyword.toLowerCase().split(' ')[0];
    if (validCategories.includes(firstWord)) {
      return firstWord;
    }
  }
  
  // Fallback category detection based on common clothing terms
  const keywordStr = keywords.join(' ').toLowerCase();
  
  // Check for tops
  if (keywordStr.includes('shirt') || keywordStr.includes('blouse') || keywordStr.includes('top') ||
      keywordStr.includes('tee') || keywordStr.includes('tank') || keywordStr.includes('sweater') ||
      keywordStr.includes('hoodie') || keywordStr.includes('cardigan') || keywordStr.includes('pullover')) {
    return 'top';
  }
  
  // Check for bottoms
  if (keywordStr.includes('pants') || keywordStr.includes('jeans') || keywordStr.includes('skirt') ||
      keywordStr.includes('trouser') || keywordStr.includes('short') || keywordStr.includes('legging') ||
      keywordStr.includes('jogger') || keywordStr.includes('sweatpant')) {
    return 'bottom';
  }
  
  // Check for jackets/outerwear
  if (keywordStr.includes('jacket') || keywordStr.includes('coat') || keywordStr.includes('blazer') ||
      keywordStr.includes('vest') || keywordStr.includes('outerwear') || keywordStr.includes('cardigan')) {
    return 'jacket';
  }
  
  // Check for footwear
  if (keywordStr.includes('shoes') || keywordStr.includes('boots') || keywordStr.includes('sneakers') ||
      keywordStr.includes('sandal') || keywordStr.includes('heel') || keywordStr.includes('loafer') ||
      keywordStr.includes('pump') || keywordStr.includes('oxford') || keywordStr.includes('trainer')) {
    return 'footwear';
  }
  
  // Check for accessories
  if (keywordStr.includes('bag') || keywordStr.includes('watch') || keywordStr.includes('jewelry') ||
      keywordStr.includes('necklace') || keywordStr.includes('bracelet') || keywordStr.includes('earring') ||
      keywordStr.includes('ring') || keywordStr.includes('scarf') || keywordStr.includes('belt') ||
      keywordStr.includes('hat') || keywordStr.includes('cap') || keywordStr.includes('purse')) {
    return 'accessory';
  }
  
  return 'top'; // Default fallback
}

// Categorize eBay results based on their associated keywords
export function categorizeResults(
  results: EbayItem[], 
  allKeywords: string[][]
): CategorizedResults {
  const categorized: CategorizedResults = {
    top: [],
    bottom: [],
    jacket: [],
    footwear: [],
    accessory: []
  };

  results.forEach((item, index) => {
    const keywords = allKeywords[index] || [];
    const category = extractCategory(keywords);
    
    const categorizedItem: CategorizedItem = {
      ...item,
      category
    };

    categorized[category as keyof CategorizedResults].push(categorizedItem);
  });

  return categorized;
}

// Get top items by similarity score for each category
export function getTopItemsByCategory(
  categorized: CategorizedResults, 
  limit: number = 2
): CategorizedResults {
  const result: CategorizedResults = {
    top: [],
    bottom: [],
    jacket: [],
    footwear: [],
    accessory: []
  };

  Object.keys(categorized).forEach(category => {
    const items = categorized[category as keyof CategorizedResults];
    result[category as keyof CategorizedResults] = items
      .sort((a, b) => (b.clipSimilarity || 0) - (a.clipSimilarity || 0))
      .slice(0, limit);
  });

  return result;
}

// Generate outfit combinations
export function generateOutfits(topItems: CategorizedResults): OutfitSuggestion[] {
  const outfits: OutfitSuggestion[] = [];

  // Basic outfit templates
  const outfitTemplates = [
    {
      name: "Casual Day Look",
      requires: ['top', 'bottom', 'footwear'],
      optional: ['accessory'],
      description: "Perfect for everyday comfort and style"
    },
    {
      name: "Layered Style", 
      requires: ['top', 'bottom', 'jacket', 'footwear'],
      optional: ['accessory'],
      description: "Add some layers for versatility"
    },
    {
      name: "Complete Outfit",
      requires: ['top', 'bottom', 'footwear', 'accessory'],
      optional: ['jacket'],
      description: "A fully styled look with all the details"
    },
    {
      name: "Minimalist Look",
      requires: ['top', 'bottom'],
      optional: ['footwear'],
      description: "Keep it simple and clean"
    }
  ];

  outfitTemplates.forEach(template => {
    const outfitItems: CategorizedItem[] = [];
    let canCreateOutfit = true;

    // Check if we have required items
    template.requires.forEach(category => {
      const categoryItems = topItems[category as keyof CategorizedResults];
      if (categoryItems.length > 0) {
        outfitItems.push(categoryItems[0]); // Take the top item
      } else {
        canCreateOutfit = false;
      }
    });

    // Add optional items if available
    template.optional.forEach(category => {
      const categoryItems = topItems[category as keyof CategorizedResults];
      if (categoryItems.length > 0) {
        outfitItems.push(categoryItems[0]);
      }
    });

    if (canCreateOutfit && outfitItems.length >= 2) {
      // Calculate total price
      const totalPrice = outfitItems.reduce((sum, item) => {
        const price = parseFloat(item.price?.value || '0');
        return sum + (isNaN(price) ? 0 : price);
      }, 0);

      outfits.push({
        name: template.name,
        items: outfitItems,
        totalPrice: totalPrice > 0 ? totalPrice : undefined,
        description: template.description
      });
    }
  });

  return outfits;
}