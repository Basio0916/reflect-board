import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      status, 
      milestoneId, 
      order,
      isStuck,
      stuckContent,
      stuckSolution,
      createdAt,
      updatedAt
    } = body;

    // Log the data being sent to help debug
    console.log('Creating task with data:', {
      title,
      status,
      order,
      isStuck,
      milestoneId,
      createdAt: createdAt ? new Date(createdAt).toISOString() : undefined,
      updatedAt: updatedAt ? new Date(updatedAt).toISOString() : undefined,
    });

    // Ensure order is a valid integer within INT4 range (-2147483648 to 2147483647)
    const safeOrder = order !== undefined && order !== null 
      ? Math.max(-2147483648, Math.min(2147483647, parseInt(String(order), 10))) 
      : 0;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'todo',
        milestoneId,
        order: safeOrder,
        isStuck: isStuck ?? false,
        stuckContent: stuckContent || undefined,
        stuckSolution: stuckSolution || undefined,
        // Convert date strings to Date objects if provided
        createdAt: createdAt ? new Date(createdAt) : undefined,
        updatedAt: updatedAt ? new Date(updatedAt) : undefined,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
