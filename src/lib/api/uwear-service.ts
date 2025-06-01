/**
 * Uwear.ai clone - Virtual try-on service
 * Generates realistic model images from flat-lay clothing photos
 */
import { v4 as uuidv4 } from "uuid";
import { storage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  GenerationProject, 
  GenerationStatus, 
  GenerationRequest,
  ModelOptions,
  BackgroundOptions,
  CameraOptions 
} from "@/lib/types-uwear";
import { logger } from "@/lib/utils/logger";
import { generateAIModel } from "./integrations/ai-model-generator";
import { createBudgetVirtualTryOn } from "./integrations/virtual-tryon-ai";

// Storage key for local project tracking
const STORAGE_KEY = "uwear_projects";

// Professional Model Database - High-quality, diverse, realistic models
const MODEL_DATABASE = {
  female: {
    caucasian: {
      slim: {
        front: [
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=1200&h=1600&fit=crop"
        ],
        angle: [
          "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=1200&h=1600&fit=crop"
        ]
      },
      average: {
        front: [
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&h=1600&fit=crop"
        ],
        angle: [
          "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=1200&h=1600&fit=crop"
        ]
      },
      curvy: {
        front: [
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=1200&h=1600&fit=crop"
        ],
        angle: [
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=1600&fit=crop"
        ]
      }
    },
    african: {
      slim: {
        front: [
          "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=1200&h=1600&fit=crop"
        ],
        angle: [
          "https://images.unsplash.com/photo-1594824020047-3c480ad2a2ab?w=1200&h=1600&fit=crop"
        ]
      },
      average: {
        front: [
          "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1200&h=1600&fit=crop"
        ],
        angle: [
          "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&h=1600&fit=crop"
        ]
      },
      curvy: {
        front: [
          "https://images.unsplash.com/photo-1616847535022-df3b2e76c4c0?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1604608672516-5ba60de8b391?w=1200&h=1600&fit=crop"
        ]
      }
    },
    asian: {
      slim: {
        front: [
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1596913317062-82eb71e44878?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1609595361082-4bbe4d6c5e3c?w=1200&h=1600&fit=crop"
        ],
        angle: [
          "https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=1200&h=1600&fit=crop"
        ]
      },
      average: {
        front: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=1200&h=1600&fit=crop"
        ],
        angle: [
          "https://images.unsplash.com/photo-1606122017369-d782bbb78f32?w=1200&h=1600&fit=crop"
        ]
      }
    },
    hispanic: {
      slim: {
        front: [
          "https://images.unsplash.com/photo-1592124549776-a7f0cc973b24?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1616001618970-2bbbde2f3b13?w=1200&h=1600&fit=crop"
        ]
      },
      average: {
        front: [
          "https://images.unsplash.com/photo-1618835962148-cf177563c6c0?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1581403341630-a6e0b9d2d257?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1592334873219-42ca023e48ce?w=1200&h=1600&fit=crop"
        ]
      }
    }
  },
  male: {
    caucasian: {
      slim: {
        front: [
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1553267751-1c148a7280a1?w=1200&h=1600&fit=crop"
        ],
        angle: [
          "https://images.unsplash.com/photo-1567336273898-ebbf9eb3c3bf?w=1200&h=1600&fit=crop"
        ]
      },
      athletic: {
        front: [
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&h=1600&fit=crop"
        ],
        angle: [
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&h=1600&fit=crop"
        ]
      },
      average: {
        front: [
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200&h=1600&fit=crop"
        ]
      }
    },
    african: {
      athletic: {
        front: [
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1594824020047-3c480ad2a2ab?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1200&h=1600&fit=crop"
        ],
        angle: [
          "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=1200&h=1600&fit=crop"
        ]
      },
      slim: {
        front: [
          "https://images.unsplash.com/photo-1592334873219-42ca023e48ce?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=1200&h=1600&fit=crop"
        ]
      }
    },
    asian: {
      slim: {
        front: [
          "https://images.unsplash.com/photo-1609595361082-4bbe4d6c5e3c?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=1200&h=1600&fit=crop"
        ]
      },
      average: {
        front: [
          "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=1200&h=1600&fit=crop",
          "https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=1200&h=1600&fit=crop"
        ],
        angle: [
          "https://images.unsplash.com/photo-1606122017369-d782bbb78f32?w=1200&h=1600&fit=crop"
        ]
      }
    },
    hispanic: {
      athletic: {
        front: [
          "https://images.unsplash.com/photo-1581403341630-a6e0b9d2d257?w=1200&h=1600&fit=crop"
        ],
        side: [
          "https://images.unsplash.com/photo-1616001618970-2bbbde2f3b13?w=1200&h=1600&fit=crop"
        ]
      },
      average: {
        front: [
          "https://images.unsplash.com/photo-1618835962148-cf177563c6c0?w=1200&h=1600&fit=crop"
        ]
      }
    }
  }
};

// Save projects to local storage
function saveProjects(projects: GenerationProject[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Failed to save projects:", error);
  }
}

// Get projects from local storage
export function getProjects(): GenerationProject[] {
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
export function getProject(id: string): GenerationProject | null {
  const projects = getProjects();
  return projects.find((project) => project.id === id) || null;
}

/**
 * Create a new generation project
 */
export async function createGenerationProject(
  request: GenerationRequest
): Promise<GenerationProject> {
  const projectId = uuidv4();
  logger.info(`Creating new generation project: ${projectId}`);
  
  try {
    // Upload clothing image to Firebase Storage
    const clothingFileName = `${projectId}_clothing_${request.clothingImage.name}`;
    const clothingRef = ref(storage, `uwear/${clothingFileName}`);
    
    await uploadBytes(clothingRef, request.clothingImage);
    const clothingImageUrl = await getDownloadURL(clothingRef);
    
    // Upload template image if provided
    let templateImageUrl;
    if (request.templateImage) {
      const templateFileName = `${projectId}_template_${request.templateImage.name}`;
      const templateRef = ref(storage, `uwear/${templateFileName}`);
      
      await uploadBytes(templateRef, request.templateImage);
      templateImageUrl = await getDownloadURL(templateRef);
    }
    
    // Create project object
    const newProject: GenerationProject = {
      id: projectId,
      status: "pending",
      clothingImageUrl,
      clothingType: request.clothingType as any,
      modelOptions: request.modelOptions,
      backgroundOptions: request.backgroundOptions,
      cameraOptions: request.cameraOptions,
      templateImageUrl,
      customInstructions: request.customInstructions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Save to local storage
    const projects = getProjects();
    projects.push(newProject);
    saveProjects(projects);
    
    // Start processing
    startProcessing(projectId, request).catch((error) => {
      logger.error(`Processing error: ${error.message}`);
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
function updateProjectStatus(
  projectId: string,
  status: GenerationStatus,
  error?: string
): void {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === projectId);
  
  if (index !== -1) {
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
 * Update project data
 */
function updateProjectData(
  projectId: string,
  data: Partial<GenerationProject>
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
 * Build intelligent prompt for AI model generation
 */
function buildIntelligentPrompt(
  options: ModelOptions, 
  clothingType: string, 
  cameraAngle: string = 'front',
  customInstructions?: string
): string {
  // Smart defaults based on clothing type for optimal ecommerce results
  const clothingContext: { [key: string]: string } = {
    'tshirt': 'casual confident pose, upper body focus, showing torso area clearly',
    'dress': 'elegant standing pose, full body, graceful posture, showing dress silhouette',
    'jacket': 'confident business pose, slight angle, showing jacket details', 
    'hoodie': 'casual relaxed pose, showing hoodie fit and style',
    'pants': 'standing pose, full body, showing leg silhouette and fit',
    'jeans': 'casual standing pose, full body, showing denim fit',
    'skirt': 'elegant standing pose, showing skirt length and style',
    'shirt': 'professional pose, upper body focus, showing shirt details',
    'blouse': 'professional elegant pose, showing blouse style and fit',
    'shorts': 'casual standing pose, showing shorts fit and style'
  };

  // Camera angle optimization for ecommerce
  const angleContext: { [key: string]: string } = {
    'front': 'straight front view, facing camera directly',
    'side': 'clean side profile, showing garment silhouette',
    '45-degree': 'three-quarter angle view, dynamic professional pose',
    'angle': 'slight angle turn, showcasing garment details',
    'back': 'back view pose, showing rear garment details'
  };

  // Build photorealistic prompt optimized for RealVisXL - emphasize clothing and professional context
  const basePrompt = `photorealistic professional fashion model, ${options.gender} ${options.ethnicity} person, ${options.age} years old, ${options.bodyType} body type, wearing business casual clothing, ${clothingContext[clothingType] || 'confident standing pose'}, ${angleContext[cameraAngle] || 'front facing'}, fully clothed, professional attire, clean minimal white backdrop, commercial fashion photography, ecommerce product photography, fashion catalog photo, high quality photo, detailed realistic skin, natural lighting, professional model pose, shot with 85mm lens, soft studio lighting, fashion photography, sharp focus, 8k resolution`;
  
  // Add custom instructions naturally if provided
  if (customInstructions?.trim()) {
    return `${basePrompt}, ${customInstructions.trim()}`;
  }
  
  return basePrompt;
}

/**
 * Select appropriate model photo based on options with pose/angle support
 */
function selectModelPhoto(options: ModelOptions, cameraAngle: string = 'front'): string {
  const { gender, ethnicity, bodyType } = options;
  
  // Map camera angles to pose categories
  const poseMap: { [key: string]: string } = {
    'front': 'front',
    'side': 'side', 
    '45-degree': 'angle',
    'back': 'side', // Use side for back view
    'angle': 'angle'
  };
  
  const targetPose = poseMap[cameraAngle] || 'front';
  
  try {
    // Navigate the nested structure safely
    const genderDb = (MODEL_DATABASE as any)[gender] || MODEL_DATABASE.female;
    const ethnicityDb = (genderDb as any)[ethnicity] || (genderDb as any).caucasian || Object.values(genderDb)[0];
    const bodyTypeDb = (ethnicityDb as any)[bodyType] || (ethnicityDb as any).average || (ethnicityDb as any).slim || Object.values(ethnicityDb)[0];
    
    // Try to get the specific pose
    let posePhotos = (bodyTypeDb as any)[targetPose];
    
    // Fallback to other poses if target pose not available
    if (!posePhotos || posePhotos.length === 0) {
      const availablePoses = Object.keys(bodyTypeDb);
      for (const pose of ['front', 'angle', 'side']) {
        if (availablePoses.includes(pose) && bodyTypeDb[pose]?.length > 0) {
          posePhotos = bodyTypeDb[pose];
          break;
        }
      }
    }
    
    // Return random photo from selected pose
    if (posePhotos && posePhotos.length > 0) {
      const selectedPhoto = posePhotos[Math.floor(Math.random() * posePhotos.length)];
      logger.info(`Selected ${gender} ${ethnicity} ${bodyType} model in ${targetPose} pose`);
      return selectedPhoto;
    }
  } catch (error) {
    logger.error('Error in model selection:', error);
  }
  
  // Ultimate fallback - high quality default
  return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=1600&fit=crop";
}

/**
 * Start the virtual try-on processing pipeline
 */
async function startProcessing(
  projectId: string,
  request: GenerationRequest
): Promise<void> {
  const startTime = Date.now();
  
  try {
    const project = getProject(projectId);
    if (!project) {
      logger.error(`Project ${projectId} not found`);
      return;
    }
    
    // Update status to processing
    updateProjectStatus(projectId, "processing");
    logger.info(`Starting virtual try-on generation for ${projectId}`);
    
    // Step 1: Generate AI model or use template
    let modelImageUrl: string = "";
    
    if (project.templateImageUrl) {
      // Use uploaded template
      modelImageUrl = project.templateImageUrl;
      logger.info("Using custom template image");
    } else {
      // Generate AI model using intelligent prompting
      try {
        logger.info("Generating AI model with custom parameters");
        
        const modelPrompt = buildIntelligentPrompt(
          project.modelOptions,
          project.clothingType,
          project.cameraOptions.angle,
          project.customInstructions
        );
        
        logger.info(`AI Model Prompt: ${modelPrompt}`);
        
        // Try multiple models for best photorealistic results - STATE-OF-THE-ART first
        const modelPriority = ['flux-ultra', 'flux-pro', 'juggernaut'];
        
        for (const modelType of modelPriority) {
          try {
            logger.info(`Attempting AI model generation with ${modelType}`);
            
            modelImageUrl = await generateAIModel({
              prompt: modelPrompt,
              aspectRatio: project.cameraOptions.zoom === 'full-body' ? '3:4' : '1:1',
              model: modelType as any
            });
            
            logger.info(`Successfully generated model with ${modelType}`);
            break; // Success, exit the loop
            
          } catch (modelError: any) {
            logger.error(`${modelType} failed: ${modelError.message}`);
            
            if (modelType === modelPriority[modelPriority.length - 1]) {
              // This is the last model, re-throw the error
              throw modelError;
            }
            // Continue to next model
          }
        }
        
        logger.info("AI model generation completed successfully");
        
      } catch (aiModelError: any) {
        logger.error(`AI model generation failed: ${aiModelError.message}`);
        logger.info("Falling back to curated model database");
        
        // Fallback to static model selection
        modelImageUrl = selectModelPhoto(project.modelOptions, project.cameraOptions.angle);
        logger.info(`Fallback: Selected model photo based on options and camera angle: ${project.cameraOptions.angle}`);
      }
    }
    
    // Step 2: Create virtual try-on using Replicate AI
    const generatedImageUrl = await createBudgetVirtualTryOn(
      project.clothingImageUrl,
      modelImageUrl,
      project.clothingType
    );
    
    logger.info("Replicate virtual try-on completed successfully");
    
    // Update project with generated image
    updateProjectData(projectId, { 
      generatedImageUrl,
      processingTime: (Date.now() - startTime) / 1000
    });
    
    // Step 3: Apply enhancements if requested
    if (request.enhance) {
      updateProjectStatus(projectId, "enhancing");
      
      // Simulate enhancement (in real app, would use AI enhancement)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      updateProjectData(projectId, {
        enhancedImageUrl: generatedImageUrl // For now, same as generated
      });
    }
    
    // Step 4: Generate video if requested
    if (request.generateVideo) {
      // Simulate video generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      updateProjectData(projectId, {
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      });
    }
    
    // Mark as complete
    updateProjectStatus(projectId, "complete");
    logger.info(`Virtual try-on completed for ${projectId}`);
    
  } catch (error: any) {
    logger.error(`Processing error: ${error.message}`);
    updateProjectStatus(projectId, "error", error.message);
  }
}

/**
 * Get background URL from options
 */
function getBackgroundUrl(options: BackgroundOptions): string {
  // Import BACKGROUND_PRESETS
  const { BACKGROUND_PRESETS } = require("@/lib/types-uwear");
  
  if (options.customUrl) {
    return options.customUrl;
  }
  
  if (options.preset) {
    const preset = BACKGROUND_PRESETS.find((p: any) => p.id === options.preset);
    if (preset) return preset.url;
  }
  
  // Default white background
  return "https://images.unsplash.com/photo-1565766736122-de5ccdb3b3bb?w=1200";
}

/**
 * Generate multiple variations
 */
export async function generateVariations(
  projectId: string,
  count: number = 4
): Promise<string[]> {
  const project = getProject(projectId);
  if (!project) throw new Error("Project not found");
  
  const variations: string[] = [];
  
  // Generate variations with different models
  for (let i = 0; i < count; i++) {
    // Randomly modify model options
    const modifiedOptions = {
      ...project.modelOptions,
      // Random variations in pose, etc.
    };
    
    const modelPhoto = selectModelPhoto(modifiedOptions);
    variations.push(modelPhoto);
  }
  
  return variations;
}