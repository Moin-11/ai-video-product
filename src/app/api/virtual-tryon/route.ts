/**
 * Next.js API Route for Virtual Try-On
 * Enhanced Replicate IDM-VTON integration with better error handling
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { clothingImageUrl, modelImageUrl, clothingType } = await request.json();
    
    // Validate inputs
    if (!clothingImageUrl || !modelImageUrl || !clothingType) {
      return NextResponse.json(
        { error: 'Missing required parameters: clothingImageUrl, modelImageUrl, clothingType' },
        { status: 400 }
      );
    }
    
    if (!process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500 }
      );
    }

    console.log(`Starting virtual try-on for ${clothingType}`);

    // Create prediction
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4', // IDM-VTON
        input: {
          human_img: modelImageUrl,
          garm_img: clothingImageUrl,
          garment_des: `A high-quality ${clothingType} that fits perfectly on the model`,
          is_checked: true,
          is_checked_crop: false,
          denoise_steps: 20, // Reduce from 30 to 20 for faster processing
          guidance_scale: 1.5, // Reduce guidance for faster generation
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
    const maxAttempts = 60; // 2 minutes maximum (reduced from 3)
    const startTime = Date.now();
    
    while (result.status === 'starting' || result.status === 'processing') {
      if (attempts >= maxAttempts) {
        throw new Error('Virtual try-on timeout after 2 minutes - please try again or check if images are valid');
      }
      
      // Progressive polling - faster initially, slower later
      const waitTime = attempts < 5 ? 1000 : attempts < 15 ? 2000 : 3000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      attempts++;
      
      console.log(`Polling attempt ${attempts}, status: ${result.status}, elapsed: ${Math.round((Date.now() - startTime) / 1000)}s`);
      
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
      throw new Error(`Generation failed: ${result.error || 'Unknown error'}`);
    }
    
    // Debug logging
    console.log('Replicate result:', JSON.stringify(result, null, 2));
    
    if (!result.output) {
      throw new Error('No output in result');
    }
    
    // Handle different output formats
    let imageUrl: string;
    if (typeof result.output === 'string') {
      imageUrl = result.output;
    } else if (Array.isArray(result.output)) {
      imageUrl = result.output[0];
    } else {
      throw new Error('Unexpected output format');
    }
    
    // Validate URL
    if (!imageUrl || imageUrl.length < 10 || !imageUrl.startsWith('http')) {
      throw new Error(`Invalid image URL: ${imageUrl}`);
    }
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`Virtual try-on completed successfully in ${totalTime}s`);
    
    return NextResponse.json({ 
      success: true, 
      imageUrl: imageUrl,
      processingTime: totalTime,
      metadata: {
        attempts: attempts,
        replicateId: result.id,
        clothingType: clothingType
      }
    });
    
  } catch (error: any) {
    console.error('Virtual try-on API error:', error);
    return NextResponse.json(
      { error: error.message || 'Virtual try-on generation failed' },
      { status: 500 }
    );
  }
}