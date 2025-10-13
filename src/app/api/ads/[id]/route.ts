// app/api/ads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    // Check if ad exists
    const ad = await prisma.ad.findUnique({
      where: { id },
    });

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // Delete ad
    await prisma.ad.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Ad deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to delete ad', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const body = await req.json();

    const ad = await prisma.ad.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ ad });
  } catch (error: any) {
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to update ad', details: error.message },
      { status: 500 }
    );
  }
}