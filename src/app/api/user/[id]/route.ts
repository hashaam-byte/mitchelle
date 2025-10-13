// app/api/user/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { isRegular, personalDiscount } = body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isRegular: isRegular !== undefined ? isRegular : user.isRegular,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isRegular: true,
        totalSpent: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    // If personal discount provided, create a discount code
    if (personalDiscount) {
      const discountCode = `USER${id.slice(0, 6).toUpperCase()}`;
     
      // Check if discount already exists
      const existingDiscount = await prisma.discount.findUnique({
        where: { code: discountCode },
      });

      if (!existingDiscount) {
        await prisma.discount.create({
          data: {
            code: discountCode,
            type: 'PERCENTAGE',
            value: parseFloat(personalDiscount),
            appliesTo: 'ALL',
            validFrom: new Date(),
            validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            isActive: true,
            maxUses: 100,
          },
        });
      }
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isRegular: true,
        totalSpent: true,
        createdAt: true,
        lastLogin: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error.message },
      { status: 500 }
    );
  }
}