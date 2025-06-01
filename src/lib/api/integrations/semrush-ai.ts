/**
 * Semrush AI text generator integration
 * Free fallback for marketing copy generation (3 requests per day)
 */
import { logger, createTimer } from "@/lib/utils/logger";
import { Script } from "./openai";

interface SemrushResponse {
  success: boolean;
  content?: string;
  error?: string;
}

/**
 * Generate marketing script using Semrush AI (free tier)
 * Fallback option when OpenAI quota is exceeded
 */
export async function generateMarketingScriptWithSemrush(params: {
  productName: string;
  productType: string;
  productDescription?: string;
}): Promise<Script> {
  const timer = createTimer("Semrush AI script generation");
  
  try {
    logger.info("Generating marketing copy with Semrush AI");
    
    // Note: Semrush AI doesn't have a direct API, so this simulates the process
    // In practice, you would use their web interface or look for unofficial APIs
    
    // Create a structured prompt for better results
    const prompt = createSemrushPrompt(params);
    
    // Simulate API call to Semrush
    // In real implementation, this would make actual HTTP request
    const response = await simulateSemrushAPI(prompt);
    
    if (!response.success || !response.content) {
      throw new Error(response.error || "Semrush AI returned empty response");
    }
    
    // Parse and structure the response
    const script = parseSemrushResponse(response.content, params.productType);
    
    logger.info("Successfully generated marketing script with Semrush AI");
    timer.stop();
    
    return script;
    
  } catch (error: any) {
    const errorMsg = `Semrush AI error: ${error.message}`;
    logger.error(errorMsg);
    timer.stop();
    throw new Error(errorMsg);
  }
}

/**
 * Create optimized prompt for Semrush AI
 */
function createSemrushPrompt(params: {
  productName: string;
  productType: string;
  productDescription?: string;
}): string {
  return `Create marketing copy for a ${params.productType} called "${params.productName}".
  ${params.productDescription ? `Description: ${params.productDescription}` : ""}
  
  I need:
  1. A catchy headline (under 30 characters)
  2. Three benefit bullet points (under 40 characters each)
  3. A strong call-to-action (under 20 characters)
  4. Three complementary color suggestions (hex codes)
  
  Make it compelling and sales-focused.`;
}

/**
 * Simulate Semrush AI API call
 * In production, this would be replaced with actual API integration
 */
async function simulateSemrushAPI(prompt: string): Promise<SemrushResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check daily usage limit (Semrush allows 3 per day)
  const today = new Date().toDateString();
  const usageKey = `semrush_usage_${today}`;
  const currentUsage = parseInt(localStorage.getItem(usageKey) || "0");
  
  if (currentUsage >= 3) {
    return {
      success: false,
      error: "Daily limit reached for Semrush AI (3 requests per day)"
    };
  }
  
  // Increment usage counter
  localStorage.setItem(usageKey, (currentUsage + 1).toString());
  
  // Simulate successful response with generated content
  const mockResponse = `
  Headline: "Premium Quality!"
  
  Benefits:
  • Superior materials & craftsmanship
  • Comfortable all-day wear guaranteed  
  • Perfect fit for any occasion
  
  Call to Action: "Shop Now!"
  
  Colors: #2563eb, #dc2626, #059669
  `;
  
  return {
    success: true,
    content: mockResponse
  };
}

/**
 * Parse Semrush response into structured Script format
 */
function parseSemrushResponse(content: string, productType: string): Script {
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
  
  // Extract headline
  const headlineLine = lines.find(line => line.toLowerCase().includes('headline'));
  const headline = headlineLine ? 
    headlineLine.replace(/headline:\s*/i, '').replace(/['"]/g, '') : 
    `Amazing ${productType}!`;
  
  // Extract bullets
  const bullets: string[] = [];
  lines.forEach(line => {
    if (line.startsWith('•') || line.startsWith('-')) {
      bullets.push(line.replace(/^[•\-]\s*/, ''));
    }
  });
  
  // Ensure we have 3 bullets
  while (bullets.length < 3) {
    bullets.push(`Great ${productType} feature`);
  }
  
  // Extract CTA
  const ctaLine = lines.find(line => line.toLowerCase().includes('call to action') || line.toLowerCase().includes('cta'));
  const cta = ctaLine ? 
    ctaLine.replace(/call to action:\s*/i, '').replace(/cta:\s*/i, '').replace(/['"]/g, '') : 
    "Buy Now!";
  
  // Extract colors
  const colorLine = lines.find(line => line.includes('#'));
  const colorMatches = colorLine ? colorLine.match(/#[0-9a-fA-F]{6}/g) : null;
  const colorPalette = colorMatches && colorMatches.length >= 3 ? 
    colorMatches.slice(0, 3) : 
    ["#2563eb", "#dc2626", "#059669"]; // Default colors
  
  return {
    headline: headline.substring(0, 30), // Enforce character limit
    bullets: bullets.slice(0, 3).map(bullet => bullet.substring(0, 40)), // Enforce limits
    cta: cta.substring(0, 20), // Enforce character limit
    colorPalette
  };
}

/**
 * Check if Semrush AI is available (within daily limit)
 */
export function isSemrushAvailable(): boolean {
  const today = new Date().toDateString();
  const usageKey = `semrush_usage_${today}`;
  const currentUsage = parseInt(localStorage.getItem(usageKey) || "0");
  
  return currentUsage < 3;
}

/**
 * Get remaining Semrush requests for today
 */
export function getSemrushRemainingRequests(): number {
  const today = new Date().toDateString();
  const usageKey = `semrush_usage_${today}`;
  const currentUsage = parseInt(localStorage.getItem(usageKey) || "0");
  
  return Math.max(0, 3 - currentUsage);
}

/**
 * Reset Semrush usage counter (for testing)
 */
export function resetSemrushUsage(): void {
  const today = new Date().toDateString();
  const usageKey = `semrush_usage_${today}`;
  localStorage.removeItem(usageKey);
  logger.info("Semrush usage counter reset");
}