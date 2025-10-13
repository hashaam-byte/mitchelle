// app/api/ads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await req.json();
    const {
      title,
      imageUrl,
      link,
      type = 'BANNER',
      position = 'BOTTOM_RIGHT',
      startDate,
      endDate,
      revenuePerView = 0.10,
    } = body;

    if (!title || !imageUrl || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const ad = await prisma.ad.create({
      data: {
        title,
        imageUrl,
        link,
        type,
        position,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        revenuePerView: parseFloat(revenuePerView),
        isActive: true,
      },
    });

    return NextResponse.json({ ad }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to create ad', details: error.message },
      { status: 500 }
    );
  }
}