/**
 * Static mannequin photo service using curated CC0 stock photos
 * Replaces expensive DALL-E generation with free, high-quality stock images
 */
import { logger, createTimer } from "@/lib/utils/logger";

// Curated CC0 mannequin photos organized by product type
// Using placeholder images from Unsplash for now
const MANNEQUIN_PHOTOS = {
  "t-shirt": [
    {
      id: "tshirt-male-1",
      url: "https://images.unsplash.com/photo-1618886614638-80e3c103d2dc?w=800&h=1200&fit=crop",
      gender: "male",
      pose: "front-facing",
      description: "Male mannequin torso, front view"
    },
    {
      id: "tshirt-female-1", 
      url: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&h=1200&fit=crop",
      gender: "female",
      pose: "front-facing",
      description: "Female mannequin torso, front view"
    },
    {
      id: "tshirt-neutral-1",
      url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1200&fit=crop", 
      gender: "neutral",
      pose: "front-facing",
      description: "Gender-neutral mannequin torso, front view"
    }
  ],
  "hoodie": [
    {
      id: "hoodie-male-1",
      url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1200&fit=crop",
      gender: "male", 
      pose: "front-facing",
      description: "Male mannequin in hoodie pose"
    },
    {
      id: "hoodie-female-1",
      url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1200&fit=crop",
      gender: "female",
      pose: "front-facing", 
      description: "Female mannequin in hoodie pose"
    }
  ],
  "tote bag": [
    {
      id: "bag-display-1",
      url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&h=1200&fit=crop",
      gender: "neutral",
      pose: "hanging",
      description: "Tote bag display stand"
    },
    {
      id: "bag-model-1", 
      url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&h=1200&fit=crop",
      gender: "neutral",
      pose: "shoulder-carry",
      description: "Model carrying tote bag over shoulder"
    }
  ],
  "mug": [
    {
      id: "mug-table-1",
      url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=1200&fit=crop", 
      gender: "neutral",
      pose: "table-display",
      description: "Coffee mug on clean table setup"
    },
    {
      id: "mug-hands-1",
      url: "https://images.unsplash.com/photo-1571079977981-6e155c5559ca?w=800&h=1200&fit=crop",
      gender: "neutral", 
      pose: "hands-holding",
      description: "Hands holding coffee mug"
    }
  ],
  "phone case": [
    {
      id: "phone-display-1",
      url: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=800&h=1200&fit=crop",
      gender: "neutral",
      pose: "stand-display", 
      description: "Phone case on display stand"
    },
    {
      id: "phone-hands-1",
      url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=1200&fit=crop",
      gender: "neutral",
      pose: "hands-holding",
      description: "Hands holding phone with case"
    }
  ],
  "poster": [
    {
      id: "poster-wall-1", 
      url: "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&h=1200&fit=crop",
      gender: "neutral",
      pose: "wall-mounted",
      description: "Poster frame on white wall"
    },
    {
      id: "poster-easel-1",
      url: "https://images.unsplash.com/photo-1569163139394-de4798aa9d7b?w=800&h=1200&fit=crop", 
      gender: "neutral",
      pose: "easel-display",
      description: "Poster on display easel"
    }
  ]
};

// Fallback photos for unknown product types
const FALLBACK_PHOTOS = [
  {
    id: "generic-display-1",
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop",
    gender: "neutral", 
    pose: "table-display",
    description: "Generic product display setup"
  },
  {
    id: "generic-mannequin-1",
    url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1200&fit=crop",
    gender: "neutral",
    pose: "front-facing", 
    description: "Generic mannequin for any product"
  }
];

export interface MannequinPhoto {
  id: string;
  url: string;
  gender: "male" | "female" | "neutral";
  pose: string;
  description: string;
}

/**
 * Get appropriate mannequin photo for product type and gender preference
 * 
 * @param productType Type of product
 * @param gender Preferred gender (defaults to neutral)
 * @returns Selected mannequin photo details
 */
export async function getMannequinPhoto(
  productType: string,
  gender: "male" | "female" | "neutral" = "neutral"
): Promise<MannequinPhoto> {
  const timer = createTimer("Mannequin photo selection");
  
  try {
    logger.info(`Selecting mannequin photo for ${productType}, gender: ${gender}`);
    
    // Normalize product type
    const normalizedType = productType.toLowerCase().trim();
    
    // Get photos for this product type
    const availablePhotos = MANNEQUIN_PHOTOS[normalizedType as keyof typeof MANNEQUIN_PHOTOS] || FALLBACK_PHOTOS;
    
    // Filter by gender preference, fallback to neutral
    let selectedPhoto = availablePhotos.find(photo => photo.gender === gender);
    
    if (!selectedPhoto) {
      // Fallback to neutral gender if preferred not available
      selectedPhoto = availablePhotos.find(photo => photo.gender === "neutral");
    }
    
    if (!selectedPhoto) {
      // Ultimate fallback to first available photo
      selectedPhoto = availablePhotos[0];
    }
    
    if (!selectedPhoto) {
      // Last resort fallback
      selectedPhoto = FALLBACK_PHOTOS[0];
    }
    
    logger.info(`Selected mannequin photo: ${selectedPhoto.id} - ${selectedPhoto.description}`);
    timer.stop();
    
    return selectedPhoto as MannequinPhoto;
    
  } catch (error: any) {
    const errorMsg = `Mannequin photo selection error: ${error.message}`;
    logger.error(errorMsg);
    timer.stop();
    throw new Error(errorMsg);
  }
}

/**
 * Get full URL for mannequin photo (converts relative to absolute URL)
 * 
 * @param photo Mannequin photo object
 * @returns Full URL to the photo
 */
export function getMannequinPhotoUrl(photo: MannequinPhoto): string {
  // In production, this would be your domain + photo.url
  // For development, Next.js serves public files directly
  return photo.url;
}

/**
 * List all available mannequin photos for a product type
 * 
 * @param productType Product type to get photos for
 * @returns Array of available mannequin photos
 */
export function listMannequinPhotos(productType: string): MannequinPhoto[] {
  const normalizedType = productType.toLowerCase().trim();
  return (MANNEQUIN_PHOTOS[normalizedType as keyof typeof MANNEQUIN_PHOTOS] || FALLBACK_PHOTOS) as MannequinPhoto[];
}

/**
 * Get random mannequin photo for variety in video generation
 * 
 * @param productType Product type
 * @param gender Preferred gender
 * @returns Random appropriate mannequin photo
 */
export async function getRandomMannequinPhoto(
  productType: string,
  gender: "male" | "female" | "neutral" = "neutral"
): Promise<MannequinPhoto> {
  const availablePhotos = listMannequinPhotos(productType);
  
  // Filter by gender preference
  const genderFiltered = availablePhotos.filter(photo => 
    photo.gender === gender || photo.gender === "neutral"
  );
  
  const photosToChooseFrom = genderFiltered.length > 0 ? genderFiltered : availablePhotos;
  const randomIndex = Math.floor(Math.random() * photosToChooseFrom.length);
  
  return photosToChooseFrom[randomIndex];
}