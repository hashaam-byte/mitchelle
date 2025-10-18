// app/api/ads/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// DELETE - Remove ad
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    // Check if ad exists
    const ad = await prisma.ad.findUnique({
      where: { id }
    });

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // Delete ad (will cascade delete all impressions)
    await prisma.ad.delete({
      where: { id }
    });

    console.log('[AD DELETED]', { id, title: ad.title });

    return NextResponse.json({ 
      success: true,
      message: 'Ad deleted successfully'
    });

  } catch (error) {
    console.error('[DELETE AD ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to delete ad' },
      { status: 500 }
    );
  }
}

// PATCH - Update ad (optional)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const updatedAd = await prisma.ad.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      ad: updatedAd
    });

  } catch (error) {
    console.error('[UPDATE AD ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update ad' },
      { status: 500 }
    );
  }
}