// app/api/projects/[projectId]/route.ts
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

export async function DELETE(req: Request, { params }: Params) {
  try {
    const cookie = req.headers.get('cookie');
    const token = parseTokenFromCookie(cookie);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token as string);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if user is admin
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: only admins can delete projects' }, { status: 403 });
    }

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
