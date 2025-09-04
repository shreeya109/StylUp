// /lib/outfitBuilder.ts
import { Category, CategorizedResults, OutfitSuggestion, EbayItem} from "./types";



// Generate outfit combinations
export function generateOutfits(topItems: CategorizedResults): OutfitSuggestion[] {
    console.log(topItems);
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
    const outfitItems: EbayItem[] = [];
    let canCreateOutfit = true;

    // Check if we have required items
    template.requires.forEach(category => {
      const categoryItems = topItems[category as keyof CategorizedResults];
      if (categoryItems && categoryItems.length > 0) {
        outfitItems.push(categoryItems[0]); // Take the first item
      } else {
        canCreateOutfit = false;
      }
    });

    // Add optional items if available
    template.optional.forEach(category => {
      const categoryItems = topItems[category as keyof CategorizedResults];
      if (categoryItems && categoryItems.length > 0) {
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