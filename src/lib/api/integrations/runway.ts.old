/**
 * Runway API integration for video generation
 */
import axios from 'axios';
import { logger, createTimer } from '@/lib/utils/logger';

// Runway API endpoints
const RUNWAY_API_BASE = 'https://api.runwayml.com/v1';
const RUNWAY_GENERATION_URL = `${RUNWAY_API_BASE}/generationJob`;

// Interface for the Runway result data
interface RunwayResult {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  videoUrl?: string;
  error?: string;
}

/**
 * Generate a video using Runway Gen-2
 * 
 * @param imageUrl URL of the composite product image
 * @param productType Type of product for prompt optimization
 * @returns Promise resolving to generation ID for polling
 */
export async function generateVideo(imageUrl: string, productType: string): Promise<string> {
  const timer = createTimer('Runway video generation');
  
  try {
    logger.info(`Requesting video generation for ${productType}`);
    
    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_RUNWAY_API_KEY;
    if (!apiKey) {
      throw new Error('Runway API key is not configured');
    }
    
    // Fetch the image for base64 encoding
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBase64 = Buffer.from(imageResponse.data).toString('base64');
    
    // Create Runway prompt based on product type
    const prompt = createVideoPrompt(productType);
    
    // Call Runway API to initiate generation
    const response = await axios.post(RUNWAY_GENERATION_URL, {
      model: 'runway/gen-2',
      parameters: {
        prompt,
        image: `data:image/jpeg;base64,${imageBase64}`,
        mode: 'video',
        num_frames: 120,  // 5 seconds at 24 fps
        fps: 24,
        guidance_scale: 12,
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const generationId = response.data.id;
    logger.info(`Runway generation initiated: ${generationId}`);
    timer.stop();
    
    return generationId;
  } catch (error: any) {
    const errorMsg = error.response?.data
      ? `Runway API error: ${JSON.stringify(error.response.data)}`
      : `Runway API error: ${error.message}`;
    
    logger.error(errorMsg);
    timer.stop();
    throw new Error(errorMsg);
  }
}

/**
 * Check the status of a Runway generation job
 * 
 * @param generationId The ID of the Runway generation job to check
 * @returns Job status and video URL if completed
 */
export async function checkRunwayTaskStatus(generationId: string): Promise<RunwayResult> {
  try {
    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_RUNWAY_API_KEY;
    if (!apiKey) {
      throw new Error('Runway API key is not configured');
    }
    
    logger.debug(`Checking Runway task status: ${generationId}`);
    
    // Call Runway API to check status
    const response = await axios.get(`${RUNWAY_GENERATION_URL}/${generationId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const result = response.data;
    logger.debug(`Runway task ${generationId} status: ${result.status}`);
    
    return {
      id: generationId,
      status: result.status,
      videoUrl: result.status === 'COMPLETED' ? result.output.video_url : undefined,
      error: result.status === 'FAILED' ? result.error || 'Task failed' : undefined
    };
  } catch (error: any) {
    const errorMsg = error.response?.data
      ? `Runway status check error: ${JSON.stringify(error.response.data)}`
      : `Runway status check error: ${error.message}`;
    
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
}

// Helper function to create video prompt based on product type
function createVideoPrompt(productType: string): string {
  // Customize prompt based on product type
  switch (productType.toLowerCase()) {
    case 't-shirt':
    case 'hoodie':
      return 'Professional fashion advertisement featuring the product with elegant movement, clean studio background, premium quality, smooth camera motion';
    
    case 'tote bag':
      return 'Lifestyle product advertisement showing the bag being used, premium quality, elegant movement, clean background, smooth camera motion';
    
    case 'mug':
      return 'Premium lifestyle advertisement featuring the product in use, steam rising, warm lighting, elegant movements, smooth camera motion';
    
    case 'phone case':
      return 'Tech product advertisement showing the phone case from multiple angles, elegant lighting, premium quality, smooth camera motion';
    
    case 'poster':
      return 'Home decor advertisement featuring the poster in an elegant interior, soft lighting, premium quality, smooth camera motion';
    
    default:
      return 'Professional product advertisement featuring the item with elegant movement, clean studio background, premium quality, smooth camera motion';
  }
}