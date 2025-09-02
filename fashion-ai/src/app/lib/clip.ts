// /lib/clip.ts
import { pipeline } from "@xenova/transformers";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

// Cache pipeline
let imageEmbedder: any = null;

export async function getCLIPModel() {
  if (!imageEmbedder) {
    imageEmbedder = await pipeline("image-feature-extraction", "Xenova/clip-vit-base-patch32");
  }
  return imageEmbedder;
}

export async function getImageEmbedding(image: string | Blob): Promise<Float32Array> {
  const model = await getCLIPModel();
  
  try {
    // If it's a string (URL), process directly
    if (typeof image === 'string') {
      const output = await model(image, {
        pooling: "mean",
        normalize: true,
      });
      return output.data as Float32Array;
    }
    
    // If it's a Blob, create a temporary file
    if (image instanceof Blob) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Create a temporary file
      const tempFileName = `temp_image_${Date.now()}.jpg`;
      const tempFilePath = join(tmpdir(), tempFileName);
      
      try {
        // Write the buffer to a temporary file
        writeFileSync(tempFilePath, buffer);
        
        // Process the temporary file
        const output = await model(tempFilePath, {
          pooling: "mean",
          normalize: true,
        });
        
        return output.data as Float32Array;
      } finally {
        // Clean up the temporary file
        try {
          unlinkSync(tempFilePath);
        } catch (cleanupError) {
          console.warn("Failed to cleanup temp file:", cleanupError);
        }
      }
    }
    
    throw new Error("Unsupported image type");
    
  } catch (error: any) {
    console.error("Error generating image embedding:", error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
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