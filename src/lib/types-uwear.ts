// Uwear.ai clone types - Virtual try-on for fashion

export type GenerationStatus = 
  | 'pending'              // Initial upload
  | 'processing'           // AI model generation
  | 'enhancing'           // Optional enhancement step
  | 'complete'            // Generation complete
  | 'error';              // Error occurred

export interface ModelOptions {
  ethnicity: 'caucasian' | 'african' | 'asian' | 'hispanic' | 'middle-eastern' | 'mixed';
  bodyType: 'slim' | 'athletic' | 'average' | 'curvy' | 'plus-size';
  age: 'young' | 'middle-aged' | 'mature';
  gender: 'female' | 'male';
  hairColor?: 'blonde' | 'brunette' | 'black' | 'red' | 'gray';
  pose?: 'standing' | 'walking' | 'sitting' | 'dynamic';
}

export interface BackgroundOptions {
  type: 'studio' | 'outdoor' | 'urban' | 'lifestyle' | 'custom';
  preset?: string; // Preset background ID
  customUrl?: string; // Custom background URL
}

export interface CameraOptions {
  angle: 'front' | 'side' | 'back' | '45-degree' | 'angle';
  zoom: 'full-body' | 'half-body' | 'close-up' | 'three-quarter';
  pose?: 'standing' | 'walking' | 'casual' | 'professional';
}

export interface GenerationProject {
  id: string;
  status: GenerationStatus;
  
  // Input
  clothingImageUrl: string;      // Flat-lay or mannequin photo
  clothingType: 'tshirt' | 'dress' | 'pants' | 'jacket' | 'skirt' | 'hoodie' | 'shirt' | 'other';
  
  // Model configuration
  modelOptions: ModelOptions;
  backgroundOptions: BackgroundOptions;
  cameraOptions: CameraOptions;
  
  // Template (optional)
  templateImageUrl?: string;     // User's own model template
  customInstructions?: string;   // User's custom style preferences
  
  // Output
  generatedImageUrl?: string;    // AI-generated model image
  enhancedImageUrl?: string;     // Enhanced version
  upscaledImageUrl?: string;     // Upscaled version
  videoUrl?: string;             // Short video version
  
  // Metadata
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  processingTime?: number;       // Time in seconds
}

export interface GenerationRequest {
  clothingImage: File;
  clothingType: string;
  modelOptions: ModelOptions;
  backgroundOptions: BackgroundOptions;
  cameraOptions: CameraOptions;
  templateImage?: File;
  customInstructions?: string;
  generateVideo?: boolean;
  enhance?: boolean;
  upscale?: boolean;
}

// Demo items for free testing
export interface DemoItem {
  id: string;
  name: string;
  type: string;
  imageUrl: string;
  thumbnailUrl: string;
}

// Preset options
export const MODEL_PRESETS = {
  ethnicities: [
    { value: 'caucasian', label: 'Caucasian' },
    { value: 'african', label: 'African' },
    { value: 'asian', label: 'Asian' },
    { value: 'hispanic', label: 'Hispanic' },
    { value: 'middle-eastern', label: 'Middle Eastern' },
    { value: 'mixed', label: 'Mixed' }
  ],
  bodyTypes: [
    { value: 'slim', label: 'Slim' },
    { value: 'athletic', label: 'Athletic' },
    { value: 'average', label: 'Average' },
    { value: 'curvy', label: 'Curvy' },
    { value: 'plus-size', label: 'Plus Size' }
  ],
  ages: [
    { value: 'young', label: '18-25' },
    { value: 'middle-aged', label: '26-40' },
    { value: 'mature', label: '40+' }
  ],
  poses: [
    { value: 'standing', label: 'Standing' },
    { value: 'walking', label: 'Walking' },
    { value: 'sitting', label: 'Sitting' },
    { value: 'dynamic', label: 'Dynamic' }
  ]
};

export const BACKGROUND_PRESETS = [
  { id: 'studio-white', name: 'White Studio', type: 'studio', url: 'https://images.unsplash.com/photo-1565766736122-de5ccdb3b3bb?w=1200' },
  { id: 'studio-gray', name: 'Gray Studio', type: 'studio', url: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=1200' },
  { id: 'outdoor-park', name: 'City Park', type: 'outdoor', url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=1200' },
  { id: 'outdoor-beach', name: 'Beach', type: 'outdoor', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200' },
  { id: 'urban-street', name: 'Urban Street', type: 'urban', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200' },
  { id: 'lifestyle-cafe', name: 'Coffee Shop', type: 'lifestyle', url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1200' }
];

export const DEMO_ITEMS: DemoItem[] = [
  {
    id: 'demo-tshirt-1',
    name: 'Classic White T-Shirt',
    type: 'tshirt',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200'
  },
  {
    id: 'demo-dress-1',
    name: 'Summer Floral Dress',
    type: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200'
  },
  {
    id: 'demo-hoodie-1',
    name: 'Casual Hoodie',
    type: 'hoodie',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200'
  }
];