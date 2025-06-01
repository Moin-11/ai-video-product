/**
 * Image processing utilities
 */
import axios from 'axios';
import { logger, createTimer } from '@/lib/utils/logger';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/config";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a composite image by overlaying a product on a mannequin
 * This is a placeholder that returns the mannequin URL
 * Actual compositing happens client-side with Canvas API
 * 
 * @param mannequinUrl URL of the mannequin image
 * @param productUrl URL of the transparent product image
 * @returns URL of the composite image (for now, just mannequin)
 */
export async function createCompositeImage(
  mannequinUrl: string,
  productUrl: string
): Promise<string> {
  const timer = createTimer('Composite image creation');
  
  try {
    logger.info('Creating composite image from mannequin and product');
    
    // Note: Actual compositing is done client-side in project-service.ts
    // using the Canvas API for better performance and no server costs
    // This function is kept for backward compatibility
    
    logger.info('Returning mannequin URL for compositing');
    timer.stop();
    
    return mannequinUrl;
  } catch (error: any) {
    const errorMsg = `Composite image error: ${error.message}`;
    logger.error(errorMsg);
    timer.stop();
    throw new Error(errorMsg);
  }
}

/**
 * Fetch an image and convert to array buffer for processing
 * 
 * @param imageUrl URL of the image to fetch
 * @returns ArrayBuffer of the image data
 */
export async function fetchImageAsBuffer(imageUrl: string): Promise<ArrayBuffer> {
  try {
    logger.debug(`Fetching image from: ${imageUrl}`);
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    
    return response.data;
  } catch (error: any) {
    const errorMsg = `Image fetch error: ${error.message}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Upload an ArrayBuffer as an image to Firebase Storage
 * 
 * @param buffer Image data as ArrayBuffer
 * @param fileType MIME type of the image
 * @param prefix Optional prefix for the filename
 * @returns URL of the uploaded image
 */
export async function uploadImageBufferToStorage(
  buffer: ArrayBuffer,
  fileType: string = 'image/png',
  prefix: string = 'processed'
): Promise<string> {
  try {
    logger.debug('Uploading image buffer to Firebase Storage');
    
    const fileName = `${prefix}_${uuidv4()}.${fileType.split('/')[1]}`;
    const storageRef = ref(storage, `images/${fileName}`);
    const blob = new Blob([buffer], { type: fileType });
    
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    
    logger.debug(`Uploaded image to ${url}`);
    return url;
  } catch (error: any) {
    const errorMsg = `Upload error: ${error.message}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
}