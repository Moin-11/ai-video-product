/**
 * DALL-E API integration for mannequin generation using OpenAI
 */
import { logger, createTimer } from '@/lib/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { storage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import OpenAI from "openai";
import axios from 'axios';

/**
 * Generate a mannequin image using DALL-E 3
 * 
 * @param productType Type of product to generate a mannequin for
 * @param gender Optional gender specification for the mannequin (default: neutral)
 * @returns Promise resolving to mannequin image URL
 */
export async function generateMannequinImage(
  productType: string,
  gender: 'male' | 'female' | 'neutral' = 'neutral'
): Promise<string> {
  const timer = createTimer('DALL-E mannequin generation');
  
  try {
    logger.info(`Requesting mannequin generation for ${productType}`);
    
    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    
    // Initialize OpenAI client with browser permission
    const openai = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
    
    // Create DALL-E prompt based on product type and gender
    const prompt = createMannequinPrompt(productType, gender);
    logger.info(`DALL-E prompt: ${prompt}`);
    
    // Call OpenAI API to generate image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url"
    });
    
    // Extract image URL from response
    const imageUrl = response.data[0].url;
    logger.info(`DALL-E generated image URL: ${imageUrl}`);
    
    // Download image and upload to Firebase Storage for persistent storage
    const response2 = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = response2.data;
    
    // Upload to Firebase
    const fileName = `mannequin_${uuidv4()}.png`;
    const storageRef = ref(storage, `images/${fileName}`);
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    
    await uploadBytes(storageRef, blob);
    const firebaseUrl = await getDownloadURL(storageRef);
    
    logger.info(`Mannequin image stored at: ${firebaseUrl}`);
    timer.stop();
    
    return firebaseUrl;
  } catch (error: any) {
    // Properly handle OpenAI API errors
    const errorMsg = `DALL-E API error: ${error.message}`;
    
    logger.error(errorMsg);
    timer.stop();
    throw new Error(errorMsg);
  }
}

/**
 * Check DALL-E task status - Not needed as DALL-E returns immediately
 * This is kept for compatibility with existing code structure
 */
export async function checkMidjourneyTaskStatus(taskId: string): Promise<any> {
  // This is only for compatibility - DALL-E doesn't use task IDs as it returns image URLs directly
  return {
    id: taskId,
    status: 'completed',
    imageUrl: taskId // For compatibility, we're using the task ID which is actually the image URL
  };
}

// Helper function to create mannequin prompt based on product type
function createMannequinPrompt(productType: string, gender: string): string {
  // Create specific body pose and appearance based on product type
  let specificPose = '';
  
  switch (productType.toLowerCase()) {
    case 't-shirt':
    case 'hoodie':
      specificPose = 'standing straight, arms slightly away from body, front view';
      break;
    case 'tote bag':
      specificPose = 'standing straight, holding a tote bag over the shoulder, front view';
      break;
    case 'mug':
      specificPose = 'sitting at a desk, holding a mug, front view';
      break;
    case 'phone case':
      specificPose = 'holding a phone with the case visible, front view';
      break;
    case 'poster':
      specificPose = 'standing next to a wall with a poster, front view';
      break;
    default:
      specificPose = 'neutral pose, front view';
  }
  
  // Adjust gender description
  const genderDesc = gender === 'male' ? 'male' : gender === 'female' ? 'female' : 'gender-neutral';
  
  // Create full prompt with detailed instructions for DALL-E
  return `A studio photograph of a ${genderDesc} mannequin, ${specificPose}, wearing a plain white ${productType}. High-quality professional lighting with soft shadows, clean minimal white background, photorealistic, detailed, 4K.`;
}