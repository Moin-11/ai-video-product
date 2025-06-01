/**
 * AI Model Generator Integration
 * Generates custom AI models/mannequins using Replicate FLUX/Stable Diffusion
 */
import { logger, createTimer } from '@/lib/utils/logger';

interface AIModelGenerationParams {
  prompt: string;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '16:9';
  model?: 'flux' | 'stable-diffusion';
}

/**
 * Generate AI model using Replicate's FLUX model
 */
export async function generateAIModel(params: AIModelGenerationParams): Promise<string> {
  const timer = createTimer('AI model generation');
  
  try {
    logger.info('Starting AI model generation with FLUX');
    
    const response = await fetch('/api/generate-model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        aspectRatio: params.aspectRatio || '3:4',
        model: params.model || 'flux'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `AI model generation failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.imageUrl) {
      throw new Error(result.error || 'No model image generated');
    }
    
    logger.info(`AI model generation completed in ${result.processingTime}s`);
    timer.stop();
    
    return result.imageUrl;
    
  } catch (error: any) {
    timer.stop();
    logger.error(`AI model generation failed: ${error.message}`);
    throw new Error(`AI model generation failed: ${error.message}`);
  }
}