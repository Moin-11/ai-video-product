/**
 * Test helpers for development - these are only available in development mode
 */
import { v4 as uuidv4 } from "uuid";
import { Project, ProjectStatus } from "../types";
import { getProjects, updateProjectData } from "@/lib/api/projects";
import { logger } from "./logger";

// Sample product types
const PRODUCT_TYPES = ["t-shirt", "hoodie", "tote bag", "mug", "phone case", "poster"];

// Sample product names
const PRODUCT_NAMES = [
  "Premium Cotton T-Shirt",
  "Soft Hoodie",
  "Eco Canvas Tote",
  "Ceramic Coffee Mug",
  "Durable Phone Case",
  "Art Print Poster"
];

// Sample image URLs
const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
  "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600",
  "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600"
];

/**
 * Generate a mock project with specified status
 */
export function createMockProject(status: ProjectStatus = "pending"): Project {
  const id = uuidv4();
  const productTypeIndex = Math.floor(Math.random() * PRODUCT_TYPES.length);
  const productType = PRODUCT_TYPES[productTypeIndex];
  const productName = PRODUCT_NAMES[productTypeIndex];
  const imageUrl = SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
  
  const project: Project = {
    id,
    productType,
    productName,
    productDescription: `A high-quality ${productType} for any occasion.`,
    originalImageUrl: imageUrl,
    transparentImageUrl: status !== "pending" ? imageUrl : undefined,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Add status-specific properties
  if (["processing-mannequin", "processing-script", "rendering", "complete"].includes(status)) {
    project.mannequinImageUrl = `https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=600`;
    project.mannequinTaskId = `midjourney-task-${id}`;
  }
  
  if (["processing-script", "rendering", "complete"].includes(status)) {
    project.script = {
      headline: "Premium Quality Design",
      bullets: [
        "Exceptional comfort",
        "Premium materials",
        "Perfect fit for any style"
      ],
      cta: "Get Yours Today",
      colorPalette: ["#3b82f6", "#1e40af", "#dbeafe"]
    };
  }
  
  if (["rendering", "complete"].includes(status)) {
    project.runwayGenerationId = `runway-task-${id}`;
  }
  
  if (status === "complete") {
    project.videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  }
  
  if (status === "error") {
    project.error = "Simulated processing error";
  }
  
  return project;
}

/**
 * Add a mock project to local storage
 */
export function addMockProjectToStorage(status: ProjectStatus = "pending"): Project {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Mock projects can only be added in development mode");
  }
  
  const mockProject = createMockProject(status);
  const projects = getProjects();
  projects.push(mockProject);
  
  // Save to local storage if in browser
  if (typeof window !== "undefined") {
    localStorage.setItem("showreel_projects", JSON.stringify(projects));
    logger.info(`Added mock project to local storage: ${mockProject.id} (${status})`);
  }
  
  return mockProject;
}

/**
 * Fast-forward a project to complete status
 */
export function fastForwardProject(projectId: string): void {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Project fast-forward is only available in development mode");
  }
  
  const mockProjectData = createMockProject("complete");
  
  // Copy relevant fields to the existing project
  updateProjectData(projectId, {
    status: "complete",
    transparentImageUrl: mockProjectData.transparentImageUrl,
    mannequinImageUrl: mockProjectData.mannequinImageUrl,
    mannequinTaskId: mockProjectData.mannequinTaskId,
    script: mockProjectData.script,
    runwayGenerationId: mockProjectData.runwayGenerationId,
    videoUrl: mockProjectData.videoUrl,
  });
  
  logger.info(`Fast-forwarded project ${projectId} to 'complete' status`);
}