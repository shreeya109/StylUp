// /app/api/clip-rerank/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getImageEmbedding } from "../../lib/clip";

// Cosine similarity function
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Calculate position changes between original and reranked arrays
function calculatePositionChanges<T>(original: T[], reranked: T[]): number {
  let changes = 0;
  const originalMap = new Map(original.map((item, index) => [item, index]));
  
  reranked.forEach((item, newIndex) => {
    const originalIndex = originalMap.get(item);
    if (originalIndex !== undefined && originalIndex !== newIndex) {
      changes++;
    }
  });
  
  return changes;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Get uploaded image (single file)
    const imageFile = formData.get('image') as File;
    
    // Get eBay items
    const ebayItemsStr = formData.get('ebayItems') as string;
    if (!ebayItemsStr) {
      return NextResponse.json({ error: "Missing ebayItems" }, { status: 400 });
    }
    
    const ebayItems = JSON.parse(ebayItemsStr);
    
    if (!imageFile || !ebayItems?.length) {
      return NextResponse.json({ error: "Missing image or eBay items" }, { status: 400 });
    }

    console.log(`CLIP reranking: Using inspiration image, ${ebayItems.length} eBay items`);

    // Debug info object
    const debugInfo = {
      uploadedImages: 1,
      validInspiration: 0,
      totalItems: ebayItems.length,
      validEbayEmbeddings: 0,
      failedEbayUrls: [] as string[],
      scoreStats: { min: 0, max: 0, avg: 0 },
      positionChanges: 0,
      rerankEffectiveness: 0
    };

    // Step 1: Process the inspiration image
    let inspirationEmbedding: Float32Array;
    try {
      inspirationEmbedding = await getImageEmbedding(imageFile);
      debugInfo.validInspiration = 1;
    } catch (error) {
      console.error("Failed to process inspiration image:", error);
      return NextResponse.json({ 
        error: "Failed to process inspiration image" 
      }, { status: 400 });
    }

    // Step 2: Process eBay items and calculate similarities
    const scoredResults = [];
    const allScores: number[] = [];

    for (const item of ebayItems) {
      const imageUrl = item.image?.imageUrl || item.imageUrl || item.image;
      
      if (!imageUrl) {
        console.warn(`Skipping item "${item.title}" - no image URL`);
        continue;
      }

      try {
        const itemEmbedding = await getImageEmbedding(imageUrl);
        const similarity = cosineSimilarity(inspirationEmbedding, itemEmbedding);
        
        scoredResults.push({
          item: item,
          similarity: similarity
        });
        
        allScores.push(similarity);
        debugInfo.validEbayEmbeddings++;
        
      } catch (error) {
        console.warn(`Failed to process eBay item "${item.title}":`, error);
        debugInfo.failedEbayUrls.push(imageUrl);
      }
    }

    if (scoredResults.length === 0) {
      return NextResponse.json({
        items: ebayItems, // Return original items
        debug: debugInfo
      });
    }

    // Step 3: Sort by similarity (descending - highest similarity first)
    const originalOrder = ebayItems.slice();
    scoredResults.sort((a, b) => b.similarity - a.similarity);
    const rerankedItems = scoredResults.map(({ item }) => item);

    // Step 4: Calculate debug statistics
    if (allScores.length > 0) {
      debugInfo.scoreStats.min = Math.min(...allScores);
      debugInfo.scoreStats.max = Math.max(...allScores);
      debugInfo.scoreStats.avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    }

    debugInfo.positionChanges = calculatePositionChanges(originalOrder, rerankedItems);
    debugInfo.rerankEffectiveness = debugInfo.positionChanges / Math.max(originalOrder.length, 1) * 100;

    console.log(`CLIP rerank complete: ${debugInfo.validEbayEmbeddings}/${debugInfo.totalItems} items processed`);
    console.log(`Score range: ${debugInfo.scoreStats.min.toFixed(4)} - ${debugInfo.scoreStats.max.toFixed(4)}`);
    console.log(`Position changes: ${debugInfo.positionChanges} (${debugInfo.rerankEffectiveness.toFixed(1)}% effectiveness)`);

    return NextResponse.json({
      items: rerankedItems,
      debug: debugInfo
    });

  } catch (error: any) {
    console.error("CLIP rerank error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
}