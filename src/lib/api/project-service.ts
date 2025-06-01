/**
 * Core project service for handling video generation pipeline
 */
import { v4 as uuidv4 } from "uuid";
import { storage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Project, ProjectStatus, ProjectCreationParams } from "@/lib/types";
import { logger } from "@/lib/utils/logger";
import {
  removeImageBackground,
  generateMarketingScript,
  createCompositeImage,
  fetchImageAsBuffer,
  uploadImageBufferToStorage,
} from "@/lib/api/integrations";
import { getMannequinPhoto, getMannequinPhotoUrl } from "@/lib/api/integrations/mannequin-photos";
import { generateVideoWithFFCreator, checkVideoStatus } from "@/lib/api/integrations/ffcreator-video";
import { generateMarketingScriptWithSemrush, isSemrushAvailable } from "@/lib/api/integrations/semrush-ai";

// Storage key for local project tracking
const STORAGE_KEY = "showreel_projects";

// Save projects to local storage
function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Failed to save projects:", error);
  }
}

// Get projects from local storage
export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const projects = JSON.parse(stored);

    // Parse dates
    return projects.map((project: any) => ({
      ...project,
      createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
      updatedAt: project.updatedAt ? new Date(project.updatedAt) : new Date(),
    }));
  } catch (error) {
    console.error("Failed to parse projects:", error);
    return [];
  }
}

// Get a specific project
export function getProject(id: string): Project | null {
  const projects = getProjects();
  return projects.find((project) => project.id === id) || null;
}

/**
 * Create a new project and initiate the processing pipeline
 */
export async function createProject(
  params: ProjectCreationParams
): Promise<Project> {
  const projectId = uuidv4();
  logger.info(`Creating new project: ${projectId}`);

  try {
    // 1. Upload image to Firebase Storage
    const fileName = `${projectId}_${params.imageFile.name.replace(
      /[^a-zA-Z0-9.]/g,
      "_"
    )}`;
    const storageRef = ref(storage, `projects/${fileName}`);

    await uploadBytes(storageRef, params.imageFile);
    const imageUrl = await getDownloadURL(storageRef);
    logger.info(`Uploaded image to: ${imageUrl}`);

    // 2. Create project object
    const newProject: Project = {
      id: projectId,
      productType: params.productType,
      productName: params.productName,
      productDescription: params.productDescription || "",
      originalImageUrl: imageUrl,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 3. Save to local storage
    const projects = getProjects();
    projects.push(newProject);
    saveProjects(projects);

    // 4. Start processing pipeline
    startProcessing(projectId).catch((error) => {
      logger.error(`Processing error in createProject: ${error.message}`);
      updateProjectStatus(projectId, "error", error.message);
    });

    return newProject;
  } catch (error: any) {
    console.error("Error creating project:", error);
    throw error;
  }
}

/**
 * Update project status
 */
export function updateProjectStatus(
  projectId: string,
  status: ProjectStatus,
  error?: string
): void {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === projectId);

  if (index !== -1) {
    const oldStatus = projects[index].status;

    // Log status change
    if (oldStatus !== status) {
      logger.info(`Project ${projectId} status: ${oldStatus} → ${status}`);
    }

    projects[index] = {
      ...projects[index],
      status,
      ...(error && { error }),
      updatedAt: new Date(),
    };

    saveProjects(projects);
  }
}

/**
 * Update project data fields
 */
export function updateProjectData(
  projectId: string,
  data: Partial<Project>
): void {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === projectId);

  if (index !== -1) {
    projects[index] = {
      ...projects[index],
      ...data,
      updatedAt: new Date(),
    };

    saveProjects(projects);
  }
}

/**
 * Start the video processing pipeline
 *
 * Processing steps:
 * 1. Background removal (ClipDrop)
 * 2. Mannequin generation (DALL-E)
 * 3. Script creation (OpenAI)
 * 4. Video rendering (Runway)
 */
async function startProcessing(projectId: string): Promise<void> {
  try {
    // Get project data
    const project = getProject(projectId);
    if (!project) {
      logger.error(`Project ${projectId} not found`);
      return;
    }

    // Step 1: Background Removal with ClipDrop
    updateProjectStatus(projectId, "processing-background");
    logger.info(`Starting background removal for ${projectId}`);

    try {
      // Use ClipDrop API to remove background
      const transparentImageBuffer = await removeImageBackground(
        project.originalImageUrl
      );

      // Upload transparent image to Firebase Storage
      const transparentFileName = `${projectId}_transparent.png`;
      const transparentRef = ref(storage, `projects/${transparentFileName}`);
      const transparentBlob = new Blob([transparentImageBuffer], {
        type: "image/png",
      });

      await uploadBytes(transparentRef, transparentBlob);
      const transparentImageUrl = await getDownloadURL(transparentRef);

      // Update project with transparent image URL
      updateProjectData(projectId, { transparentImageUrl });
      logger.info(`Background removal completed for ${projectId}`);
    } catch (error: any) {
      logger.error(`Background removal error: ${error.message}`);
      updateProjectStatus(
        projectId,
        "error",
        `Background removal failed: ${error.message}`
      );
      return;
    }

    // Refresh project data
    const updatedProject = getProject(projectId);
    if (!updatedProject || !updatedProject.transparentImageUrl) {
      logger.error(
        `Project data missing after background removal for ${projectId}`
      );
      updateProjectStatus(
        projectId,
        "error",
        "Project data missing after background removal"
      );
      return;
    }

    // Step 2: Mannequin Photo Selection (Budget-friendly approach)
    updateProjectStatus(projectId, "processing-mannequin");
    logger.info(`Selecting mannequin photo for ${projectId}`);

    try {
      // Get appropriate mannequin photo from curated CC0 collection
      const mannequinPhoto = await getMannequinPhoto(updatedProject.productType);
      const mannequinImageUrl = getMannequinPhotoUrl(mannequinPhoto);

      // Update project with mannequin image URL
      updateProjectData(projectId, { 
        mannequinImageUrl,
        mannequinPhotoId: mannequinPhoto.id 
      });
      logger.info(`Mannequin photo selected for ${projectId}: ${mannequinPhoto.description}`);
    } catch (error: any) {
      logger.error(`Mannequin photo selection error: ${error.message}`);
      updateProjectStatus(
        projectId,
        "error",
        `Mannequin photo selection failed: ${error.message}`
      );
      return;
    }

    // Refresh project data again
    const projectWithMannequin = getProject(projectId);
    if (!projectWithMannequin || !projectWithMannequin.mannequinImageUrl) {
      logger.error(
        `Project data missing after mannequin generation for ${projectId}`
      );
      updateProjectStatus(
        projectId,
        "error",
        "Project data missing after mannequin generation"
      );
      return;
    }

    // Step 3: Script Generation with Fallback (OpenAI → Semrush)
    updateProjectStatus(projectId, "processing-script");
    logger.info(`Starting script generation for ${projectId}`);

    try {
      let script;
      
      // Try OpenAI first (primary service)
      try {
        script = await generateMarketingScript({
          productName: projectWithMannequin.productName,
          productType: projectWithMannequin.productType,
          productDescription: projectWithMannequin.productDescription,
        });
        logger.info(`Script generated with OpenAI for ${projectId}`);
      } catch (openaiError: any) {
        logger.warn(`OpenAI failed: ${openaiError.message}, trying Semrush fallback`);
        
        // Fallback to Semrush AI if available
        if (isSemrushAvailable()) {
          script = await generateMarketingScriptWithSemrush({
            productName: projectWithMannequin.productName,
            productType: projectWithMannequin.productType,
            productDescription: projectWithMannequin.productDescription,
          });
          logger.info(`Script generated with Semrush AI for ${projectId}`);
        } else {
          throw new Error("Both OpenAI and Semrush AI are unavailable");
        }
      }

      // Update project with script
      updateProjectData(projectId, { script });
      logger.info(`Script generation completed for ${projectId}`);
    } catch (error: any) {
      logger.error(`Script generation error: ${error.message}`);
      updateProjectStatus(
        projectId,
        "error",
        `Script generation failed: ${error.message}`
      );
      return;
    }

    // Refresh project data again
    const projectWithScript = getProject(projectId);
    if (!projectWithScript || !projectWithScript.script) {
      logger.error(
        `Project data missing after script generation for ${projectId}`
      );
      updateProjectStatus(
        projectId,
        "error",
        "Project data missing after script generation"
      );
      return;
    }

    // Step 4: Use mannequin image directly (Canvas compositing removed)
    const compositeImageUrl = projectWithScript.mannequinImageUrl || "";
    
    // Note: Canvas compositing has been removed in favor of AI-based virtual try-on
    // For the Uwear.ai clone functionality, use uwear-service.ts instead
    logger.info(`Using mannequin image directly for ${projectId}`);
    
    if (!compositeImageUrl) {
      throw new Error("Missing mannequin image for composite creation");
    }

    // Step 5: Video Rendering with FFCreator (Budget-friendly approach)
    updateProjectStatus(projectId, "rendering");
    logger.info(`Starting video rendering for ${projectId}`);

    try {
      // Generate video with FFCreator
      const taskId = await generateVideoWithFFCreator({
        productImageUrl: projectWithScript.transparentImageUrl || projectWithScript.originalImageUrl,
        mannequinImageUrl: projectWithScript.mannequinImageUrl || "",
        compositeImageUrl: compositeImageUrl,
        script: projectWithScript.script,
        productType: projectWithScript.productType,
        duration: 15
      });
      
      updateProjectData(projectId, { ffcreatorTaskId: taskId });

      // Check video status (FFCreator is much faster than Runway)
      const videoResult = await checkVideoStatus(taskId);
      
      if (videoResult.status === "completed" && videoResult.videoUrl) {
        // Update project with video URL
        updateProjectData(projectId, { videoUrl: videoResult.videoUrl });
        logger.info(`Video rendering completed for ${projectId}`);

        // Mark as complete
        updateProjectStatus(projectId, "complete");
        return;
      } else if (videoResult.status === "failed") {
        throw new Error(
          `Video generation failed: ${videoResult.error || "Unknown error"}`
        );
      } else {
        // If still processing, set up polling (though FFCreator should be immediate)
        logger.info(`Video still processing for ${projectId}, status: ${videoResult.status}`);
        updateProjectStatus(projectId, "rendering");
      }
    } catch (error: any) {
      logger.error(`Video rendering error: ${error.message}`);
      updateProjectStatus(
        projectId,
        "error",
        `Video rendering failed: ${error.message}`
      );
      return;
    }
  } catch (error: any) {
    logger.error(`Processing error: ${error.message}`);
    updateProjectStatus(projectId, "error", error.message);
  }
}
