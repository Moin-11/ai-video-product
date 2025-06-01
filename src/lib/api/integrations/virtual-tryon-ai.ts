/**
 * Replicate AI Virtual Try-On Integration
 * Streamlined implementation using only Replicate IDM-VTON model
 */
import { logger, createTimer } from '@/lib/utils/logger';

/**
 * Virtual try-on using Replicate IDM-VTON model
 * Uses Next.js API route to handle CORS and server-side API calls
 */
export async function createBudgetVirtualTryOn(
  clothingImageUrl: string,
  modelImageUrl: string,
  clothingType: string
): Promise<string> {
  const timer = createTimer('Replicate virtual try-on');
  
  try {
    logger.info('Starting Replicate virtual try-on generation');
    
    const response = await fetch('/api/virtual-tryon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clothingImageUrl,
        modelImageUrl,
        clothingType
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Replicate API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.imageUrl) {
      throw new Error(result.error || 'No image generated');
    }
    
    logger.info(`Replicate virtual try-on completed in ${result.processingTime}s`);
    timer.stop();
    
    return result.imageUrl;
    
  } catch (error: any) {
    timer.stop();
    logger.error(`Replicate virtual try-on failed: ${error.message}`);
    throw new Error(`Virtual try-on generation failed: ${error.message}`);
  }
}