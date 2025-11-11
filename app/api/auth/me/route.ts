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
    if (!token) return NextResponse.json({ user: null });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ user: null });

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
