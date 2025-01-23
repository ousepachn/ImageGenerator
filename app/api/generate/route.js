import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const MODEL_IDENTIFIERS = {
  'stable-diffusion': "stability-ai/stable-diffusion-3.5-large",
  'flux': "black-forest-labs/flux-1.1-pro-ultra",
  'ideogram': "ideogram-ai/ideogram-v2"
};

const modelConfigs = {
  'stable-diffusion': {
    input: {
      prompt: "",
      negative_prompt: "",
      width: 1024,
      height: 1024,
      num_outputs: 1,
      scheduler: "dpm-plus-plus-2m-karras",
      num_inference_steps: 50,
      guidance_scale: 7.5,
      seed: null,
      refine: "no_refiner",
      high_noise_frac: 0.8,
    }
  },
  'flux': {
    input: {
      prompt: "",
      aspect_ratio: "1:1",
      raw: false,
      safety_tolerance: 2,
      seed: null,
      output_format: "jpg"
    }
  },
  'ideogram': {
    input: {
      prompt: "",
      negative_prompt: "",
      aspect_ratio: "1:1",
      resolution: "1024x1024",
      style_type: "General",
      magic_prompt_option: "Auto",
      seed: null
    }
  }
};

export async function POST(request) {
  try {
    const { prompt, model } = await request.json();
    console.log('Received request:', { prompt, model });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!model || !modelConfigs[model]) {
      return NextResponse.json(
        { error: 'Invalid model selected' },
        { status: 400 }
      );
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Get base config and add prompt
    const config = {
      ...modelConfigs[model].input,
      prompt,
      seed: Math.floor(Math.random() * 2147483647),
    };

    console.log('Creating prediction with config:', config);

    // Create prediction
    const prediction = await replicate.predictions.create({
      model: MODEL_IDENTIFIERS[model],
      input: config,
    });

    console.log('Initial prediction:', prediction);

    // Instead of waiting, return the prediction ID immediately
    return NextResponse.json({ 
      status: 'processing',
      id: prediction.id,
      message: 'Image generation started'
    });

  } catch (error) {
    console.error('Error details:', error);
    
    if (error.message?.includes('auth')) {
      return NextResponse.json(
        { error: 'Authentication failed. Please check your Replicate API token.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to start image generation',
        details: error.message
      },
      { status: 500 }
    );
  }
} 