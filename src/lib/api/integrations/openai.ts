/**
 * OpenAI API integration for marketing copy generation
 */
import { logger, createTimer } from '@/lib/utils/logger';
import OpenAI from "openai";

// Interface for script generation parameters
interface ScriptParams {
  productName: string;
  productType: string;
  productDescription?: string;
}

// Interface for the generated script
export interface Script {
  headline: string;
  bullets: string[];
  cta: string;
  colorPalette: string[];
}

/**
 * Generate marketing script using GPT-4o-mini
 * 
 * @param params Product information for script generation
 * @returns Generated marketing script
 */
export async function generateMarketingScript(params: ScriptParams): Promise<Script> {
  const timer = createTimer('OpenAI script generation');
  
  try {
    logger.info('Generating marketing copy with GPT-4o-mini');
    
    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    
    // Initialize OpenAI client with browser permission
    const openai = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
    
    // Create prompt for GPT
    const prompt = createScriptPrompt(params);
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional marketing copywriter specializing in short, impactful product video scripts.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500,
    });
    
    // Parse the response JSON
    const scriptContent = JSON.parse(response.choices[0].message.content);
    
    // Validate script structure
    validateScript(scriptContent);
    
    logger.info('Successfully generated marketing script');
    timer.stop();
    
    return scriptContent;
  } catch (error: any) {
    // Properly handle OpenAI API errors
    const errorMsg = `OpenAI API error: ${error.message}`;
    
    logger.error(errorMsg);
    timer.stop();
    throw new Error(errorMsg);
  }
}

// Helper function to create prompt for script generation
function createScriptPrompt(params: ScriptParams): string {
  return `Write a video script for a ${params.productType} product named "${params.productName}". 
  ${params.productDescription ? `Product description: ${params.productDescription}` : ''}
  
  Format your response as JSON with these exact keys:
  - headline: A catchy headline (max 30 chars)
  - bullets: Array of 3 bullet points highlighting benefits (max 40 chars each)
  - cta: A call-to-action (max 20 chars)
  - colorPalette: Array of 3 hex color codes that would complement this product
  
  The response must be valid JSON without additional text.`;
}

// Helper function to validate script structure
function validateScript(script: any): asserts script is Script {
  if (!script.headline || typeof script.headline !== 'string') {
    throw new Error('Invalid script format: headline is missing or not a string');
  }
  
  if (!Array.isArray(script.bullets) || script.bullets.length !== 3) {
    throw new Error('Invalid script format: bullets must be an array of 3 items');
  }
  
  if (!script.cta || typeof script.cta !== 'string') {
    throw new Error('Invalid script format: cta is missing or not a string');
  }
  
  if (!Array.isArray(script.colorPalette) || script.colorPalette.length !== 3) {
    throw new Error('Invalid script format: colorPalette must be an array of 3 hex colors');
  }
}