/**
 * Next.js API Route for AI Model Generation
 * Uses Replicate FLUX/Stable Diffusion to generate custom fashion models
 */
import { NextRequest, NextResponse } from 'next/server';

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
    
    // Choose appropriate Replicate model
    const replicateModels = {
      'flux': 'black-forest-labs/flux-schnell', // Fast FLUX model
      'stable-diffusion': 'stability-ai/stable-diffusion-3.5-large' // SD 3.5 Large
    };
    
    const selectedModel = replicateModels[model as keyof typeof replicateModels] || replicateModels.flux;

    // Create prediction with model-specific parameters
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: selectedModel,
        input: {
          prompt: prompt,
          aspect_ratio: aspectRatio,
          num_outputs: 1,
          guidance: 3.5, // Good balance for fashion photography
          num_inference_steps: model === 'flux' ? 4 : 28, // FLUX is faster
          output_format: 'jpg',
          output_quality: 95,
          seed: Math.floor(Math.random() * 1000000)
        }
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