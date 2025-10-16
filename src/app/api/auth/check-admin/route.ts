// app/api/auth/check-admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    // Check if any admin exists (excluding super admin)
    const adminCount = await prisma.user.count({
      where: { 
        role: UserRole.ADMIN 
      },
    });

    return NextResponse.json(
      { 
        exists: adminCount > 0,
        count: adminCount
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error checking admin:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status', details: error.message },
      { status: 500 }
    );
  }
}