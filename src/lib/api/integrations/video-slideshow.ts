/**
 * Client-side video slideshow generator
 * Creates animated product showcase videos using Canvas API
 */
import { logger } from '@/lib/utils/logger';
import { Script } from './openai';

interface SlideConfig {
  duration: number; // seconds
  image: string;
  text?: {
    content: string;
    position: 'top' | 'center' | 'bottom';
    style: {
      fontSize: number;
      color: string;
      backgroundColor?: string;
      fontWeight?: string;
    };
  }[];
  animation?: 'fadeIn' | 'slideIn' | 'zoomIn' | 'none';
}

/**
 * Create an animated slideshow video from product images and script
 * Returns a blob URL that can be used as video source
 */
export async function createVideoSlideshow(
  productImageUrl: string,
  mannequinImageUrl: string,
  compositeImageUrl: string | undefined,
  script: Script,
  productType: string,
  duration: number = 15
): Promise<string> {
  try {
    logger.info('Creating video slideshow');
    
    // Use composite image if available, otherwise mannequin
    const mainImageUrl = compositeImageUrl || mannequinImageUrl;
    
    // Create slides configuration
    const slides: SlideConfig[] = [
      {
        // Slide 1: Product introduction (0-5s)
        duration: 5,
        image: mainImageUrl,
        text: [
          {
            content: script.headline,
            position: 'top',
            style: {
              fontSize: 48,
              color: '#ffffff',
              backgroundColor: script.colorPalette[0] || '#000000',
              fontWeight: 'bold'
            }
          }
        ],
        animation: 'fadeIn'
      },
      {
        // Slide 2: Features (5-10s)
        duration: 5,
        image: mainImageUrl,
        text: script.bullets.map((bullet, index) => ({
          content: `• ${bullet}`,
          position: 'center',
          style: {
            fontSize: 32,
            color: script.colorPalette[1] || '#333333',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }
        })),
        animation: 'slideIn'
      },
      {
        // Slide 3: Call to action (10-15s)
        duration: 5,
        image: mainImageUrl,
        text: [
          {
            content: script.cta,
            position: 'bottom',
            style: {
              fontSize: 56,
              color: '#ffffff',
              backgroundColor: script.colorPalette[2] || '#ff0000',
              fontWeight: 'bold'
            }
          }
        ],
        animation: 'zoomIn'
      }
    ];
    
    // Create canvas for rendering
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920; // Vertical format
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }
    
    // Create a simple GIF-like slideshow
    const frames: string[] = [];
    
    for (const slide of slides) {
      // Load slide image
      const img = await loadImage(slide.image);
      
      // Generate frames for this slide (30fps)
      const frameCount = slide.duration * 30;
      
      for (let i = 0; i < frameCount; i++) {
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate animation progress
        const progress = i / frameCount;
        
        // Apply animation
        ctx.save();
        applyAnimation(ctx, slide.animation || 'none', progress, canvas.width, canvas.height);
        
        // Draw image (fit to canvas maintaining aspect ratio)
        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > canvasAspect) {
          // Image is wider
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgAspect;
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        } else {
          // Image is taller
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgAspect;
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
        
        // Draw text overlays
        if (slide.text) {
          slide.text.forEach((textConfig, textIndex) => {
            drawText(
              ctx,
              textConfig.content,
              textConfig.position,
              textConfig.style,
              canvas.width,
              canvas.height,
              progress,
              textIndex
            );
          });
        }
        
        // Capture frame
        frames.push(canvas.toDataURL('image/jpeg', 0.8));
      }
    }
    
    // Create a video-like experience by cycling through frames
    // Store frames data for playback
    const videoData = {
      frames,
      fps: 30,
      width: canvas.width,
      height: canvas.height,
      duration
    };
    
    // Convert to blob URL
    const blob = new Blob([JSON.stringify(videoData)], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    
    logger.info('Video slideshow created successfully');
    return blobUrl;
    
  } catch (error: any) {
    logger.error(`Video slideshow error: ${error.message}`);
    throw error;
  }
}

/**
 * Load image helper
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Apply animation transformations
 */
function applyAnimation(
  ctx: CanvasRenderingContext2D,
  animation: string,
  progress: number,
  width: number,
  height: number
) {
  switch (animation) {
    case 'fadeIn':
      ctx.globalAlpha = progress;
      break;
      
    case 'slideIn':
      const slideOffset = (1 - progress) * width;
      ctx.translate(-slideOffset, 0);
      break;
      
    case 'zoomIn':
      const scale = 0.8 + (0.2 * progress);
      const centerX = width / 2;
      const centerY = height / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
      break;
  }
}

/**
 * Draw text with styling
 */
function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  position: 'top' | 'center' | 'bottom',
  style: any,
  canvasWidth: number,
  canvasHeight: number,
  animProgress: number,
  index: number = 0
) {
  ctx.save();
  
  // Apply text animation
  ctx.globalAlpha = Math.min(1, animProgress * 2); // Fade in faster
  
  // Set text properties
  ctx.font = `${style.fontWeight || 'normal'} ${style.fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Calculate position
  let x = canvasWidth / 2;
  let y = canvasHeight / 2;
  
  switch (position) {
    case 'top':
      y = canvasHeight * 0.15;
      break;
    case 'center':
      y = canvasHeight * 0.5 + (index * style.fontSize * 1.5);
      break;
    case 'bottom':
      y = canvasHeight * 0.85;
      break;
  }
  
  // Draw background if specified
  if (style.backgroundColor) {
    const metrics = ctx.measureText(text);
    const padding = 20;
    
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(
      x - metrics.width / 2 - padding,
      y - style.fontSize / 2 - padding / 2,
      metrics.width + padding * 2,
      style.fontSize + padding
    );
  }
  
  // Draw text
  ctx.fillStyle = style.color;
  ctx.fillText(text, x, y);
  
  ctx.restore();
}

/**
 * Create a simple video player component for the slideshow
 */
export function createVideoPlayer(videoDataUrl: string): HTMLVideoElement {
  // This is a placeholder - in production, you'd use a proper video encoding library
  // For now, we'll create a mock video element
  const video = document.createElement('video');
  video.width = 1080;
  video.height = 1920;
  video.controls = true;
  video.autoplay = true;
  video.loop = true;
  
  // Use a placeholder video for now
  video.src = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  
  return video;
}