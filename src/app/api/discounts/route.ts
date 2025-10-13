// app/api/discounts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('active');

    const discounts = await prisma.discount.findMany({
      where: isActive ? { isActive: isActive === 'true' } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        userDiscounts: {
          select: {
            usedAt: true,
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ discounts });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch discounts', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      code,
      type,
      value,
      appliesTo = 'ALL',
      minPurchase = 0,
      maxUses,
      validFrom,
      validTo,
    } = body;

    // Validate required fields
    if (!code || !type || !value || !validFrom || !validTo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 400 }
      );
    }

    const discount = await prisma.discount.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        appliesTo,
        minPurchase: parseFloat(minPurchase),
        maxUses: maxUses ? parseInt(maxUses) : null,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        isActive: true,
      },
    });

    return NextResponse.json({ discount }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to create discount', details: error.message },
      { status: 500 }
    );
  }
}