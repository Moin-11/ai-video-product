/**
 * Export all integration APIs for easier imports
 * Updated for budget-optimized architecture
 */

// Export ClipDrop integration (background removal)
export { removeImageBackground } from './clipdrop';

// Export budget-friendly mannequin photos (replaces DALL-E)
export { 
  getMannequinPhoto, 
  getMannequinPhotoUrl,
  listMannequinPhotos,
  getRandomMannequinPhoto,
  type MannequinPhoto
} from './mannequin-photos';

// Export OpenAI integration with fallback
export { 
  generateMarketingScript, 
  type Script 
} from './openai';

// Export Semrush AI fallback
export {
  generateMarketingScriptWithSemrush,
  isSemrushAvailable,
  getSemrushRemainingRequests,
  resetSemrushUsage
} from './semrush-ai';

// Export FFCreator video generation (replaces Runway)
export {
  generateVideoWithFFCreator,
  checkVideoStatus,
  createVideoTemplate,
  generateVideoPreview,
  type VideoGenerationParams,
  type VideoGenerationResult
} from './ffcreator-video';

// Legacy services removed - use FFCreator instead
// export { generateVideo, checkRunwayTaskStatus } from './runway';

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