/**
 * ClipDrop API integration for background removal
 */
import axios from 'axios';
import { logger, createTimer } from '@/lib/utils/logger';

// ClipDrop API endpoint for background removal
const CLIPDROP_API_URL = 'https://clipdrop-api.co/remove-background/v1';

/**
 * Remove background from image using ClipDrop API
 * 
 * @param imageUrl URL of the image to process
 * @returns URL of the processed image with transparent background
 */
export async function removeImageBackground(imageUrl: string): Promise<ArrayBuffer> {
  const timer = createTimer('ClipDrop background removal');
  
  try {
    logger.info('Fetching image for background removal');
    
    // Fetch the image data from URL
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    
    // Send to ClipDrop API
    const formData = new FormData();
    const blob = new Blob([imageResponse.data], { type: 'image/jpeg' });
    formData.append('image_file', blob);
    
    logger.info('Calling ClipDrop API for background removal');
    
    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_CLIPDROP_API_KEY;
    if (!apiKey) {
      throw new Error('ClipDrop API key is not configured');
    }
    
    const response = await axios.post(CLIPDROP_API_URL, formData, {
      headers: {
        'Accept': 'image/png',
        'x-api-key': apiKey
      },
      responseType: 'arraybuffer'
    });
    
    logger.info('Successfully removed background with ClipDrop');
    timer.stop();
    
    return response.data;
  } catch (error: any) {
    const errorMsg = error.response?.data 
      ? `ClipDrop API error: ${Buffer.from(error.response.data).toString()}`
      : `ClipDrop API error: ${error.message}`;
    
    logger.error(errorMsg);
    timer.stop();
    throw new Error(errorMsg);
  }
}