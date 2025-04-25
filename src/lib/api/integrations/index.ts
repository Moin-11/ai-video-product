/**
 * Export all integration APIs for easier imports
 */

// Export ClipDrop integration
export { removeImageBackground } from './clipdrop';

// Export DALL-E integration for mannequin generation
export { 
  generateMannequinImage, 
  checkMidjourneyTaskStatus  // Kept for backward compatibility
} from './midjourney';

// Export OpenAI integration
export { 
  generateMarketingScript, 
  type Script 
} from './openai';

// Export Runway integration
export { 
  generateVideo, 
  checkRunwayTaskStatus 
} from './runway';

// Export Text Overlay utilities
export { 
  addTextOverlayToVideo, 
  createFFmpegTextCommand 
} from './textOverlay';

// Export Image Processing utilities
export { 
  createCompositeImage, 
  fetchImageAsBuffer,
  uploadImageBufferToStorage
} from './imageProcessing';