import { storage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { logger, createTimer } from "@/lib/utils/logger";

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
  file: File,
  path: string
): Promise<string> {
  const timer = createTimer(`Upload to ${path}`);
  try {
    logger.info(`Uploading file to ${path}`);
    
    // Clean the filename to be storage-friendly
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const storageRef = ref(storage, `${path}/${cleanFileName}`);
    
    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const url = await getDownloadURL(storageRef);
    
    logger.info(`File uploaded successfully to ${path}`);
    timer.stop();
    
    return url;
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Error uploading file to ${path}: ${errorMessage}`);
    timer.stop();
    throw error;
  }
}

/**
 * For Phase 1 when we might not use Firebase Storage,
 * this gets a data URL for local preview/testing
 */
export async function getLocalFileDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Generate a unique storage path for a project asset
 */
export function getProjectStoragePath(
  projectId: string, 
  assetType: 'original' | 'transparent' | 'mannequin' | 'video'
): string {
  return `projects/${projectId}/${assetType}`;
}