// app/api/projects/[projectId]/tasks/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function parseTokenFromCookie(cookieHeader?: string | null) {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(';').map(p => p.trim());
  const tokenPair = pairs.find(p => p.startsWith('token='));
  if (!tokenPair) return null;
  return tokenPair.split('=')[1];
}

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
  const { title, description, status, priority, assignee, assigneeId, dueDate } = body;

    const task = await prisma.task.create({
      // cast to any to avoid strict prisma input type mismatch for optional assigneeId
      data: {
        projectId: params.projectId,
        title,
        description: description || null,
        status: status || 'todo',
        priority: priority || 'medium',
        assignee: assignee || null,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      } as any,
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

    // allow updating assigneeId explicitly
    const dataToUpdate: any = { ...updateData };
    if (updateData.assigneeId === undefined && updateData.assignee === undefined) {
      // nothing special
    }

    const task = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
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

    // Fetch the task to check if it's assigned
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // If task is assigned, only admin can delete
    if (task.assigneeId || task.assignee) {
      const cookie = req.headers.get('cookie');
      const token = parseTokenFromCookie(cookie);
      if (!token) return NextResponse.json({ error: 'Unauthorized: assigned tasks can only be deleted by admin' }, { status: 401 });

      const payload = verifyToken(token as string);
      if (!payload) return NextResponse.json({ error: 'Unauthorized: assigned tasks can only be deleted by admin' }, { status: 401 });

      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: assigned tasks can only be deleted by admin' }, { status: 403 });
      }
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
