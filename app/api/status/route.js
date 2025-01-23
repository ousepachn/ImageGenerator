import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Prediction ID is required' },
        { status: 400 }
      );
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const prediction = await replicate.predictions.get(id);
    console.log('Prediction status:', prediction.status);

    if (prediction.error) {
      return NextResponse.json(
        { 
          status: 'error',
          error: prediction.error
        },
        { status: 500 }
      );
    }

    if (prediction.status === 'succeeded') {
      let imageUrl;
      if (Array.isArray(prediction.output)) {
        imageUrl = prediction.output[0];
      } else if (typeof prediction.output === 'string') {
        imageUrl = prediction.output;
      } else {
        throw new Error('Unexpected output format');
      }

      return NextResponse.json({
        status: 'success',
        imageUrl
      });
    }

    return NextResponse.json({
      status: prediction.status,
      message: 'Image is still being generated'
    });

  } catch (error) {
    console.error('Error checking prediction status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check generation status',
        details: error.message
      },
      { status: 500 }
    );
  }
} 