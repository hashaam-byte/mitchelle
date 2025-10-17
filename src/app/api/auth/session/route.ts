// app/api/auth/session/route.ts - ENHANCED with DB role check
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 401 }
      );
    }

    // Fetch user from database to get current role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        isRegular: true,
        totalSpent: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Return session with current role from database
    return NextResponse.json(
      { 
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role, // This is the actual role from DB
          phone: user.phone,
          isRegular: user.isRegular,
          totalSpent: user.totalSpent,
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Session API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}