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
 * 
 * For now, we're keeping this simple by just using the mannequin image
 * In a production app, we would implement proper image compositing
 * 
 * @param mannequinUrl URL of the mannequin image
 * @param productUrl URL of the transparent product image
 * @returns URL of the composite image
 */
export async function createCompositeImage(
  mannequinUrl: string,
  productUrl: string
): Promise<string> {
  const timer = createTimer('Composite image creation');
  
  try {
    logger.info('Creating composite image from mannequin and product');
    
    // For now, we'll just return the mannequin URL
    // In a real implementation, we would:
    // 1. Download both images
    // 2. Use Canvas API to overlay the transparent product on the mannequin
    // 3. Upload the result to Firebase Storage
    
    logger.info('Composite image creation completed');
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