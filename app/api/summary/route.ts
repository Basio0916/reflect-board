import { NextRequest, NextResponse } from 'next/server';
import { generateSummary } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const summary = await generateSummary(prompt);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Failed to generate summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
