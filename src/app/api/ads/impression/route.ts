// app/api/ads/impression/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adId } = body;

    if (!adId) {
      return NextResponse.json(
        { error: 'Ad ID required' },
        { status: 400 }
      );
    }

    // Get current user (optional - can be anonymous)
    const user = await getCurrentUser();

    // Get IP address
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Get user agent
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Check if this IP already viewed this ad today (prevent spam)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingImpression = await prisma.adImpression.findFirst({
      where: {
        adId,
        ipAddress,
        createdAt: {
          gte: today,
        },
      },
    });

    if (existingImpression) {
      return NextResponse.json({
        message: 'Impression already recorded today',
        counted: false,
      });
    }

    // Get ad details
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
    });

    if (!ad || !ad.isActive) {
      return NextResponse.json(
        { error: 'Ad not found or inactive' },
        { status: 404 }
      );
    }

    // Create impression
    await prisma.adImpression.create({
      data: {
        adId,
        userId: user?.id,
        ipAddress,
        userAgent,
      },
    });

    // Update ad stats
    const revenueGenerated = ad.revenuePerView;

    await prisma.ad.update({
      where: { id: adId },
      data: {
        impressions: { increment: 1 },
        totalRevenue: { increment: revenueGenerated },
      },
    });

    // Update platform stats
    await prisma.platformStats.upsert({
      where: { date: today },
      update: {
        totalAdRevenue: { increment: revenueGenerated },
        adImpressions: { increment: 1 },
      },
      create: {
        date: today,
        totalAdRevenue: revenueGenerated,
        adImpressions: 1,
      },
    });

    return NextResponse.json({
      message: 'Impression recorded',
      counted: true,
      revenue: revenueGenerated,
    });
  } catch (error: any) {
    console.error('Ad impression error:', error);
    return NextResponse.json(
      { error: 'Failed to record impression', details: error.message },
      { status: 500 }
    );
  }
}

// GET: Fetch active ads
export async function GET(req: NextRequest) {
  try {
    const now = new Date();

    const ads = await prisma.ad.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ads });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch ads', details: error.message },
      { status: 500 }
    );
  }
}