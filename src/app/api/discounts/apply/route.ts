// app/api/discounts/apply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || !subtotal) {
      return NextResponse.json(
        { error: 'Discount code and subtotal are required' },
        { status: 400 }
      );
    }

    // Find discount
    const discount = await prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount) {
      return NextResponse.json(
        { error: 'Invalid discount code' },
        { status: 404 }
      );
    }

    // Check if active
    if (!discount.isActive) {
      return NextResponse.json(
        { error: 'This discount code is no longer active' },
        { status: 400 }
      );
    }

    // Check validity period
    const now = new Date();
    if (now < discount.validFrom || now > discount.validTo) {
      return NextResponse.json(
        { error: 'This discount code has expired' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (discount.maxUses && discount.usageCount >= discount.maxUses) {
      return NextResponse.json(
        { error: 'This discount code has reached its usage limit' },
        { status: 400 }
      );
    }

    // Check minimum purchase
    if (subtotal < discount.minPurchase) {
      return NextResponse.json(
        { 
          error: `Minimum purchase of ₦${discount.minPurchase.toLocaleString()} required for this discount` 
        },
        { status: 400 }
      );
    }

    // Check if user already used this discount
    const userDiscount = await prisma.userDiscount.findUnique({
      where: {
        userId_discountId: {
          userId: user.id,
          discountId: discount.id,
        },
      },
    });

    if (userDiscount) {
      return NextResponse.json(
        { error: 'You have already used this discount code' },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = (subtotal * discount.value) / 100;
    } else if (discount.type === 'FIXED') {
      discountAmount = discount.value;
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return NextResponse.json({
      message: 'Discount applied successfully',
      discount: discountAmount,
      code: discount.code,
      type: discount.type,
      value: discount.value,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Error applying discount:', error);
    return NextResponse.json(
      { error: 'Failed to apply discount', details: error.message },
      { status: 500 }
    );
  }
}