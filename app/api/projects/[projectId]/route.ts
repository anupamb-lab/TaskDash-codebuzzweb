// app/api/projects/[projectId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: { projectId: string };
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await prisma.project.delete({
      where: { id: params.projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
