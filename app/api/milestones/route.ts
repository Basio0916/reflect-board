import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const milestones = await prisma.milestone.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error('Failed to fetch milestones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, color } = body;

    const milestone = await prisma.milestone.create({
      data: {
        title,
        description,
        color,
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error('Failed to create milestone:', error);
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    );
  }
}
