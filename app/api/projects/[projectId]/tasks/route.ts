// app/api/projects/[projectId]/tasks/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: { projectId: string };
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: params.projectId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const { title, description, status, priority, assignee, dueDate } = body;

    const task = await prisma.task.create({
      data: {
        projectId: params.projectId,
        title,
        description: description || null,
        status: status || 'todo',
        priority: priority || 'medium',
        assignee: assignee || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
