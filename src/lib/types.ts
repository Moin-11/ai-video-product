// Types for the ShowReel application

export type ProjectStatus = 
  | 'pending'              // Initial upload
  | 'processing-background' // Background removal
  | 'processing-mannequin' // Mannequin generation
  | 'processing-script'    // Copy generation
  | 'rendering'           // Video rendering
  | 'complete'            // Processing complete
  | 'error';              // Error occurred

export interface Project {
  id: string;                    // Project ID
  status: ProjectStatus;         // Current processing status
  productType: string;           // Product category
  productName: string;           // Name of product
  productDescription?: string;   // Optional description
  
  // Processing data
  originalImageUrl: string;      // Original upload URL
  transparentImageUrl?: string;  // Background removed image
  mannequinImageUrl?: string;    // Generated mannequin image
  mannequinTaskId?: string;      // Midjourney task ID (legacy)
  mannequinPhotoId?: string;     // CC0 photo ID (new approach)
  compositeImageUrl?: string;    // Product on mannequin composite
  ffcreatorTaskId?: string;      // FFCreator task ID (new approach)
  
  // Generated content
  script?: {
    headline: string;            // Main headline
    bullets: string[];           // Feature bullets
    cta: string;                 // Call to action
    colorPalette: string[];      // Color hex codes
  };
  
  // Video data
  runwayGenerationId?: string;   // Runway task ID
  videoUrl?: string;             // Final video URL
  
  // Metadata
  error?: string;                // Error message if any
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}

// For Phase 1 (minimal version without auth), we'll use a simple project tracking system
export interface ProjectCreationParams {
  productType: string;
  productName: string;
  productDescription?: string;
  imageFile: File;
}