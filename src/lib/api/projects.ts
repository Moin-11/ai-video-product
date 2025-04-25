import { functions } from "@/firebase/config";
import { httpsCallable } from "firebase/functions";
import { v4 as uuidv4 } from "uuid";
import { Project, ProjectCreationParams } from "@/lib/types";
import { uploadFile, getProjectStoragePath } from "@/lib/storage";
import { logger, logProcessingStep } from "@/lib/utils/logger";

// For Phase 1, we'll use local storage to track projects
const STORAGE_KEY = "showreel_projects";

/**
 * Save projects to local storage
 */
function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    logger.error("Failed to save projects to local storage:", error);
  }
}

/**
 * Load projects from local storage
 */
export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const projects = JSON.parse(stored);
    
    // Ensure dates are properly parsed from JSON
    return projects.map((project: any) => ({
      ...project,
      createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
      updatedAt: project.updatedAt ? new Date(project.updatedAt) : new Date(),
    }));
  } catch (error) {
    logger.error("Failed to parse projects from storage:", error);
    return [];
  }
}

/**
 * Get a specific project by ID
 */
export function getProject(id: string): Project | null {
  const projects = getProjects();
  return projects.find(project => project.id === id) || null;
}

/**
 * Create a new project and start the processing pipeline
 */
export async function createProject(params: ProjectCreationParams): Promise<Project> {
  // Generate a unique ID
  const projectId = uuidv4();
  logger.info(`Creating new project: ${projectId}`);
  
  try {
    // 1. Upload image to Firebase Storage
    const storagePath = getProjectStoragePath(projectId, 'original');
    const imageUrl = await uploadFile(params.imageFile, storagePath);
    
    // 2. Create a new project object
    const newProject: Project = {
      id: projectId,
      productType: params.productType,
      productName: params.productName,
      productDescription: params.productDescription,
      originalImageUrl: imageUrl,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // 3. Save to local storage
    const projects = getProjects();
    projects.push(newProject);
    saveProjects(projects);
    
    // 4. Start the background removal process
    try {
      logProcessingStep(projectId, 'CREATION', 'Project created, starting AI pipeline');
      await startBackgroundRemoval(projectId, imageUrl);
    } catch (error) {
      logger.error(`Failed to start background removal for project ${projectId}:`, error);
      updateProjectStatus(projectId, 'error', "Failed to start processing");
    }
    
    return newProject;
  } catch (error) {
    logger.error(`Failed to create project ${projectId}:`, error);
    throw error;
  }
}

/**
 * Update a project's status
 */
export function updateProjectStatus(projectId: string, status: Project['status'], error?: string): void {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === projectId);
  
  if (index !== -1) {
    const oldStatus = projects[index].status;
    
    // Log status change
    if (oldStatus !== status) {
      logger.info(`Project ${projectId} status changed: ${oldStatus} → ${status}${error ? ` (Error: ${error})` : ''}`);
    }
    
    projects[index] = {
      ...projects[index],
      status,
      ...(error && { error }),
      updatedAt: new Date(),
    };
    
    saveProjects(projects);
  } else {
    logger.error(`Failed to update status for project ${projectId}: Project not found`);
  }
}

/**
 * Start the background removal process
 */
async function startBackgroundRemoval(projectId: string, imageUrl: string): Promise<void> {
  try {
    // Import the service to avoid circular dependencies
    const { removeBackground } = await import('./services');
    
    // In Phase 1, we use a simulated service
    await removeBackground(projectId);
    
    // In Phase 2/3, we'll call the Firebase function:
    // const removeBackgroundFn = httpsCallable(functions, 'removeBackground');
    // await removeBackgroundFn({ projectId, imageUrl });
  } catch (error) {
    console.error("Error in background removal process:", error);
    updateProjectStatus(projectId, 'error', (error as Error).message);
  }
}

/**
 * Update project data (beyond just status)
 */
export function updateProjectData(projectId: string, data: Partial<Project>): void {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === projectId);
  
  if (index !== -1) {
    logger.debug(`Updating project data for ${projectId}`, 
      Object.keys(data).map(key => `${key}: ${typeof data[key as keyof typeof data] === 'object' ? 'object' : 'updated'}`));
    
    projects[index] = {
      ...projects[index],
      ...data,
      updatedAt: new Date(),
    };
    
    saveProjects(projects);
  } else {
    logger.error(`Failed to update data for project ${projectId}: Project not found`);
  }
}