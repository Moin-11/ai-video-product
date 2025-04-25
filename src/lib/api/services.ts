/**
 * AI processing services for the video generation pipeline
 */
import { Project, ProjectStatus } from "@/lib/types";
import { getProject, updateProjectData, updateProjectStatus } from "./projects";
import { logger, logProcessingStep, createTimer } from "@/lib/utils/logger";
import { uploadFile, getProjectStoragePath } from "@/lib/storage";
import {
  removeImageBackground,
  generateMannequinImage,
  checkMidjourneyTaskStatus,
  generateMarketingScript,
  generateVideo,
  checkRunwayTaskStatus,
  addTextOverlayToVideo,
  createCompositeImage,
  fetchImageAsBuffer,
} from "./integrations";
import axios from 'axios';
import { getEnvApiMode } from "@/lib/utils/apiMode";

// Simulated time ranges for each step (in ms)
const PROCESS_TIMES = {
  background: { min: 2000, max: 4000 },
  mannequin: { min: 4000, max: 8000 },
  script: { min: 2000, max: 4000 },
  video: { min: 5000, max: 10000 },
};

// Helper to get random time within a range
const getRandomTime = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1) + min);

/**
 * Removes background from the product image
 */
export async function removeBackground(projectId: string): Promise<void> {
  const project = getProject(projectId);
  if (!project) throw new Error("Project not found");

  // Update status to processing
  updateProjectStatus(projectId, "processing-background");
  logProcessingStep(projectId, 'BACKGROUND', 'Starting background removal');
  
  const timer = createTimer(`Background removal for project ${projectId}`);

  try {
    let transparentImageUrl: string;
    
    // Check if we're using real APIs or simulation mode
    const shouldUseRealApis = getEnvApiMode();
    
    if (shouldUseRealApis) {
      // Process with real ClipDrop API
      // Get the image data from the URL
      const imageBuffer = await removeImageBackground(project.originalImageUrl);
      
      // Convert buffer to Blob
      const blob = new Blob([imageBuffer], { type: 'image/png' });
      const file = new File([blob], 'transparent.png', { type: 'image/png' });
      
      // Upload to storage
      const storagePath = getProjectStoragePath(projectId, 'transparent');
      transparentImageUrl = await uploadFile(file, storagePath);
    } else {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, getRandomTime(
        PROCESS_TIMES.background.min, 
        PROCESS_TIMES.background.max
      )));
      
      // For demo, we'll use the same image URL as transparent
      transparentImageUrl = project.originalImageUrl;
    }
    
    // Update project with the transparent image URL
    updateProjectData(projectId, {
      transparentImageUrl,
    });

    logProcessingStep(projectId, 'BACKGROUND', 'Background removal completed');
    timer.stop();

    // Move to next step
    await generateMannequin(projectId);
  } catch (error) {
    logProcessingStep(projectId, 'BACKGROUND', `Error: ${(error as Error).message}`);
    timer.stop();
    throw error;
  }
}

/**
 * Generates a mannequin image using Midjourney (simulated)
 */
export async function generateMannequin(projectId: string): Promise<void> {
  const project = getProject(projectId);
  if (!project) throw new Error("Project not found");

  // Update status to processing
  updateProjectStatus(projectId, "processing-mannequin");
  logProcessingStep(projectId, 'MANNEQUIN', 'Starting mannequin generation');
  
  const timer = createTimer(`Mannequin generation for project ${projectId}`);

  try {
    let mannequinImageUrl: string = '';
    let mannequinTaskId: string = '';
    
    // Check if we're using real APIs or simulation mode
    const shouldUseRealApis = getEnvApiMode();
    
    if (shouldUseRealApis) {
      // Generate mannequin with Midjourney API
      mannequinTaskId = await generateMannequinImage(project.productType);
      
      // Store the task ID for polling
      updateProjectData(projectId, { mannequinTaskId });
      
      // Poll for completion (in production, this would be a Cloud Function with Task Queue)
      // Here we'll use a simple polling mechanism
      const maxPolls = 30;
      const pollInterval = 10000; // 10 seconds
      
      for (let i = 0; i < maxPolls; i++) {
        // Wait before checking
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        // Check status
        const result = await checkMidjourneyTaskStatus(mannequinTaskId);
        
        if (result.status === 'completed' && result.imageUrl) {
          // Download image and upload to our storage
          const imageResponse = await axios.get(result.imageUrl, { responseType: 'arraybuffer' });
          const blob = new Blob([imageResponse.data], { type: 'image/jpeg' });
          const file = new File([blob], 'mannequin.jpg', { type: 'image/jpeg' });
          
          // Upload to storage
          const storagePath = getProjectStoragePath(projectId, 'mannequin');
          mannequinImageUrl = await uploadFile(file, storagePath);
          break;
        } else if (result.status === 'failed') {
          throw new Error(result.error || 'Mannequin generation failed');
        }
        
        // If we've reached the max polls and not completed, throw an error
        if (i === maxPolls - 1) {
          throw new Error('Mannequin generation timed out');
        }
      }
    } else {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, getRandomTime(
        PROCESS_TIMES.mannequin.min, 
        PROCESS_TIMES.mannequin.max
      )));
      
      // Generate placeholder mannequin image URL based on product type
      mannequinImageUrl = getPlaceholderImageForProductType(project.productType);
      mannequinTaskId = `midjourney-task-${Date.now()}`;
    }
    
    // Update project with mannequin data
    updateProjectData(projectId, {
      mannequinImageUrl,
      mannequinTaskId,
    });

    logProcessingStep(projectId, 'MANNEQUIN', 'Mannequin generation completed');
    timer.stop();

    // Move to next step
    await generateScript(projectId);
  } catch (error) {
    logProcessingStep(projectId, 'MANNEQUIN', `Error: ${(error as Error).message}`);
    timer.stop();
    throw error;
  }
}

/**
 * Generates marketing copy using GPT (simulated)
 */
export async function generateScript(projectId: string): Promise<void> {
  const project = getProject(projectId);
  if (!project) throw new Error("Project not found");

  // Update status to processing
  updateProjectStatus(projectId, "processing-script");
  logProcessingStep(projectId, 'SCRIPT', 'Starting marketing script generation');
  
  const timer = createTimer(`Script generation for project ${projectId}`);

  try {
    let script;
    
    // Check if we're using real APIs or simulation mode
    const shouldUseRealApis = getEnvApiMode();
    
    if (shouldUseRealApis) {
      // Generate marketing script with GPT-4o-mini
      script = await generateMarketingScript({
        productName: project.productName,
        productType: project.productType,
        productDescription: project.productDescription
      });
    } else {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, getRandomTime(
        PROCESS_TIMES.script.min, 
        PROCESS_TIMES.script.max
      )));
      
      // Generate placeholder script based on product type
      script = getPlaceholderScriptForProduct(project.productName, project.productType);
    }
    
    // Update project with script data
    updateProjectData(projectId, { script });

    logProcessingStep(projectId, 'SCRIPT', 'Marketing script generation completed');
    timer.stop();

    // Move to next step
    await processVideo(projectId);
  } catch (error) {
    logProcessingStep(projectId, 'SCRIPT', `Error: ${(error as Error).message}`);
    timer.stop();
    throw error;
  }
}

/**
 * Generates video using Runway (simulated)
 */
export async function processVideo(projectId: string): Promise<void> {
  const project = getProject(projectId);
  if (!project) throw new Error("Project not found");

  // Make sure we have all required assets
  if (!project.mannequinImageUrl || !project.transparentImageUrl || !project.script) {
    throw new Error("Missing required assets for video generation");
  }

  // Update status to rendering
  updateProjectStatus(projectId, "rendering");
  logProcessingStep(projectId, 'VIDEO', 'Starting video generation');
  
  const timer = createTimer(`Video generation for project ${projectId}`);

  try {
    let videoUrl: string = '';
    let runwayGenerationId: string = '';
    
    // Check if we're using real APIs or simulation mode
    const shouldUseRealApis = getEnvApiMode();
    
    if (shouldUseRealApis) {
      // First, create composite image of product on mannequin
      const compositeImageUrl = await createCompositeImage(
        project.mannequinImageUrl,
        project.transparentImageUrl
      );
      
      // Generate video with Runway
      runwayGenerationId = await generateVideo(compositeImageUrl, project.productType);
      
      // Store the task ID for polling
      updateProjectData(projectId, { runwayGenerationId });
      
      // Poll for completion (in production, this would be a Cloud Function with Task Queue)
      // Here we'll use a simple polling mechanism
      const maxPolls = 30;
      const pollInterval = 15000; // 15 seconds
      
      for (let i = 0; i < maxPolls; i++) {
        // Wait before checking
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        // Check status
        const result = await checkRunwayTaskStatus(runwayGenerationId);
        
        if (result.status === 'COMPLETED' && result.videoUrl) {
          // Get the raw video
          let rawVideoUrl = result.videoUrl;
          
          // Add text overlays to the video
          videoUrl = await addTextOverlayToVideo(rawVideoUrl, project.script);
          break;
        } else if (result.status === 'FAILED') {
          throw new Error(result.error || 'Video generation failed');
        }
        
        // If we've reached the max polls and not completed, throw an error
        if (i === maxPolls - 1) {
          throw new Error('Video generation timed out');
        }
      }
    } else {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, getRandomTime(
        PROCESS_TIMES.video.min, 
        PROCESS_TIMES.video.max
      )));
      
      // Use a placeholder video URL
      videoUrl = getPlaceholderVideoForProductType(project.productType);
      runwayGenerationId = `runway-task-${Date.now()}`;
    }
    
    // Update project with video data
    updateProjectData(projectId, {
      videoUrl,
      runwayGenerationId,
    });

    logProcessingStep(projectId, 'VIDEO', 'Video generation completed');
    timer.stop();

    // Complete the project
    updateProjectStatus(projectId, "complete");
    logProcessingStep(projectId, 'COMPLETE', 'Project completed successfully');
  } catch (error) {
    logProcessingStep(projectId, 'VIDEO', `Error: ${(error as Error).message}`);
    timer.stop();
    throw error;
  }
}

// Helper functions for placeholder content

function getPlaceholderImageForProductType(productType: string): string {
  const placeholders: Record<string, string> = {
    "t-shirt": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
    "hoodie": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop",
    "tote bag": "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&h=600&fit=crop",
    "mug": "https://images.unsplash.com/photo-1577937217765-4ad6898c539d?w=600&h=600&fit=crop", 
    "phone case": "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&h=600&fit=crop",
    "poster": "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=600&h=600&fit=crop"
  };

  return placeholders[productType] || "https://via.placeholder.com/600x600?text=Product";
}

function getPlaceholderVideoForProductType(productType: string): string {
  // For demo purposes, we'll use the same sample video
  // In production, this would be a dynamically rendered video from Runway
  return "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
}

function getPlaceholderScriptForProduct(productName: string, productType: string): Project["script"] {
  // Generate headlines based on product type
  const headlines: Record<string, string> = {
    "t-shirt": "Style Meets Comfort",
    "hoodie": "Cozy Redefined",
    "tote bag": "Carry With Confidence",
    "mug": "Elevate Your Morning Ritual",
    "phone case": "Protection With Style",
    "poster": "Make A Statement"
  };

  // Generate product-specific bullets
  const bullets: Record<string, string[]> = {
    "t-shirt": [
      "Premium soft cotton fabric",
      "Versatile design for any outfit",
      "Durable & long-lasting quality"
    ],
    "hoodie": [
      "Ultra-soft inner lining",
      "Perfect for all seasons",
      "Spacious pockets & adjustable hood"
    ],
    "tote bag": [
      "Sturdy construction for heavy loads",
      "Eco-friendly sustainable materials",
      "Stylish design for any occasion"
    ],
    "mug": [
      "Temperature-retention technology",
      "Comfortable ergonomic handle",
      "Dishwasher & microwave safe"
    ],
    "phone case": [
      "Military-grade drop protection",
      "Slim profile fits perfectly in hand",
      "Premium materials that won't yellow"
    ],
    "poster": [
      "Museum-quality archival paper",
      "Vibrant colors that won't fade",
      "Makes a perfect statement piece"
    ]
  };

  // Generate CTA based on product type
  const ctas: Record<string, string> = {
    "t-shirt": "Shop Now",
    "hoodie": "Stay Cozy",
    "tote bag": "Carry Better",
    "mug": "Elevate Your Day",
    "phone case": "Protect In Style",
    "poster": "Decorate Now"
  };

  // Generate color palette
  const colorPalettes: Record<string, string[]> = {
    "t-shirt": ["#3B82F6", "#1E40AF", "#DBEAFE"],
    "hoodie": ["#6366F1", "#4338CA", "#E0E7FF"],
    "tote bag": ["#10B981", "#065F46", "#D1FAE5"],
    "mug": ["#F59E0B", "#B45309", "#FEF3C7"],
    "phone case": ["#8B5CF6", "#6D28D9", "#EDE9FE"],
    "poster": ["#EC4899", "#BE185D", "#FCE7F3"]
  };

  return {
    headline: headlines[productType] || `Premium ${productName}`,
    bullets: bullets[productType] || [
      "High-quality craftsmanship",
      "Designed to impress",
      "Perfect for everyday use"
    ],
    cta: ctas[productType] || "Get Yours Today",
    colorPalette: colorPalettes[productType] || ["#3B82F6", "#1E40AF", "#DBEAFE"]
  };
}