/**
 * Next.js API Route for AI Model Generation
 * Uses Replicate FLUX/Stable Diffusion to generate custom fashion models
 */
import { NextRequest, NextResponse } from 'next/server';

// Build model-specific input parameters
function buildModelInput(model: string, prompt: string, aspectRatio: string) {
  const commonNegative = "nude, naked, nsfw, revealing, underwear, lingerie, swimsuit, bikini, bare skin, exposed, inappropriate, cartoon, illustration, CGI, 3d render, painting, sketch, bad anatomy, bad hands, deformed";
  
  const baseInput = {
    prompt: prompt,
    seed: Math.floor(Math.random() * 1000000)
  };

  // FLUX models (state-of-the-art 2024/2025)
  if (model === 'flux-ultra') {
    return {
      ...baseInput,
      raw: true, // Raw mode for hyper-realistic humans
      aspect_ratio: aspectRatio || '3:4',
      safety_tolerance: 3, // Allow fashion photography
      guidance: 3.5, // Optimal for photorealism
      steps: 28 // High quality steps
    };
  }
  
  if (model === 'flux-pro') {
    return {
      ...baseInput,
      aspect_ratio: aspectRatio || '3:4',
      guidance: 3, // FLUX Pro optimal range
      steps: 25, // Good balance speed/quality
      output_format: 'jpg'
    };
  }

  // Legacy SDXL models (fallback)
  return {
    ...baseInput,
    negative_prompt: commonNegative,
    width: aspectRatio === '3:4' ? 768 : 1024,
    height: aspectRatio === '3:4' ? 1024 : 768,
    num_outputs: 1,
    num_inference_steps: 30,
    guidance_scale: 7,
    scheduler: 'K_EULER_ANCESTRAL'
  };
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio = '3:4', model = 'flux' } = await request.json();
    
    // Validate inputs
    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing required parameter: prompt' },
        { status: 400 }
      );
    }
    
    if (!process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500 }
      );
    }

    console.log(`Starting AI model generation with ${model}`);
    
    // Choose appropriate Replicate model - STATE-OF-THE-ART 2024/2025 models
    const replicateModels = {
      'flux-ultra': 'c6e5086a542c99e7e523a83d3017654e8618fe64ef427c772a1def05bb599f0c', // FLUX 1.1 Pro Ultra - Best quality, 4MP, Raw mode
      'flux-pro': '1e237aa703bf3a8ab480d5b595563128807af649c50afc0b4f22a9174e90d1d6', // FLUX Pro - Excellent quality, faster
      'ideogram': 'recraft/recraft-v3', // Ideogram v3 - Stunning realism
      'juggernaut': '6a52feace43ce1f6bbc2cdabfc68423cb2319d7444a1a1dae529c5e88b976382' // Fallback
    };
    
    // Try FLUX 1.1 Pro Ultra first (absolute best for photorealistic humans)
    const selectedModel = replicateModels[model as keyof typeof replicateModels] || replicateModels['flux-ultra'];

    // Create prediction with model-specific parameters
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: selectedModel,
        input: buildModelInput(model, prompt, aspectRatio)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate API Error:', response.status, errorText);
      throw new Error(`Replicate API error: ${response.status} - ${errorText}`);
    }

    const prediction = await response.json();
    
    // Poll for completion with progress tracking
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes maximum for model generation
    const startTime = Date.now();
    
    while (result.status === 'starting' || result.status === 'processing') {
      if (attempts >= maxAttempts) {
        throw new Error('Model generation timeout after 2 minutes - please try again');
      }
      
      // Progressive polling
      const waitTime = attempts < 3 ? 1000 : 2000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      attempts++;
      
      console.log(`Model generation polling attempt ${attempts}, status: ${result.status}, elapsed: ${Math.round((Date.now() - startTime) / 1000)}s`);
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN}`,
        },
      });
      
      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        console.error('Polling error:', pollResponse.status, errorText);
        throw new Error(`Polling error: ${pollResponse.status} - ${errorText}`);
      }
      
      result = await pollResponse.json();
    }
    
    if (result.status === 'failed') {
      throw new Error(`Model generation failed: ${result.error || 'Unknown error'}`);
    }
    
    // Debug logging
    console.log('Model generation result:', JSON.stringify(result, null, 2));
    
    if (!result.output) {
      throw new Error('No output in model generation result');
    }
    
    // Handle different output formats
    let imageUrl: string;
    if (typeof result.output === 'string') {
      imageUrl = result.output;
    } else if (Array.isArray(result.output)) {
      imageUrl = result.output[0];
    } else {
      throw new Error('Unexpected output format from model generation');
    }
    
    // Validate URL
    if (!imageUrl || imageUrl.length < 10 || !imageUrl.startsWith('http')) {
      throw new Error(`Invalid model image URL: ${imageUrl}`);
    }
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`AI model generation completed successfully in ${totalTime}s`);
    
    return NextResponse.json({ 
      success: true, 
      imageUrl: imageUrl,
      processingTime: totalTime,
      metadata: {
        attempts: attempts,
        replicateId: result.id,
        model: selectedModel,
        prompt: prompt.substring(0, 100) + '...' // Truncated for logging
      }
    });
    
  } catch (error: any) {
    console.error('AI model generation API error:', error);
    return NextResponse.json(
      { error: error.message || 'AI model generation failed' },
      { status: 500 }
    );
  }
}