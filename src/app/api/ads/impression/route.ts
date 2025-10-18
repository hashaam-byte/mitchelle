// app/api/ads/impression/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get active ads for display
export async function GET() {
  try {
    const now = new Date();

    // Get all active ads within date range
    const ads = await prisma.ad.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3 // Limit to 3 active ads at a time
    });

    return NextResponse.json({ ads });

  } catch (error) {
    console.error('[GET ACTIVE ADS ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch active ads' },
      { status: 500 }
    );
  }
}

// POST - Track ad impression and calculate revenue
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { adId } = body;

    if (!adId) {
      return NextResponse.json({ error: 'Ad ID required' }, { status: 400 });
    }

    // Get ad details
    const ad = await prisma.ad.findUnique({
      where: { id: adId }
    });

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // Track impression
    const impression = await prisma.adImpression.create({
      data: {
        adId,
        userId: session?.user?.id || null,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      }
    });

    // Update ad metrics
    const revenue = ad.revenuePerView;
    await prisma.ad.update({
      where: { id: adId },
      data: {
        impressions: { increment: 1 },
        totalRevenue: { increment: revenue }
      }
    });

    console.log('[AD IMPRESSION TRACKED]', {
      adId,
      impressionId: impression.id,
      revenue: `₦${revenue}`,
      userId: session?.user?.id || 'guest'
    });

    return NextResponse.json({ 
      success: true,
      revenue,
      message: 'Impression tracked successfully'
    });

  } catch (error) {
    console.error('[TRACK IMPRESSION ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to track impression' },
      { status: 500 }
    );
  }
}