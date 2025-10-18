// app/api/ads/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch all ads (for owner dashboard)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const ads = await prisma.ad.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ ads });

  } catch (error) {
    console.error('[GET ADS ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    );
  }
}

// POST - Create new ad (SUPER_ADMIN only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { title, imageUrl, link, startDate, endDate, revenuePerView, position, type } = body;

    // Validation
    if (!title || !imageUrl || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create ad
    const ad = await prisma.ad.create({
      data: {
        title,
        imageUrl,
        link: link || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        revenuePerView: parseFloat(revenuePerView) || 0.5,
        position: position || 'BOTTOM_RIGHT',
        type: type || 'BANNER',
        isActive: true
      }
    });

    console.log('[AD CREATED]', {
      id: ad.id,
      title: ad.title,
      revenuePerView: ad.revenuePerView
    });

    return NextResponse.json({ 
      success: true, 
      ad,
      message: 'Ad created successfully and is now live!'
    });

  } catch (error) {
    console.error('[CREATE AD ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to create ad' },
      { status: 500 }
    );
  }
}