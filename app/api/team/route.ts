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

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie');
    const token = parseTokenFromCookie(cookie);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token as string);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Find tasks assigned to this user (by assigneeId or legacy assignee name)
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: payload.id },
          { assignee: payload.name || undefined }
        ]
      },
      include: { project: true },
      orderBy: { createdAt: 'asc' }
    });

    // Group tasks by project
    const projectsMap: Record<string, any> = {};
    for (const t of tasks) {
      const p = t.project;
      if (!projectsMap[p.id]) {
        projectsMap[p.id] = { ...p, tasks: [] };
      }
      projectsMap[p.id].tasks.push(t);
    }

    const projects = Object.values(projectsMap);
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Team error:', error);
    return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 });
  }
}
