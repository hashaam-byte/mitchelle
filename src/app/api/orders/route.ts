// app/api/orders/route.ts - WITH EMAIL NOTIFICATIONS
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendOrderConfirmationEmail, isEmailConfigured } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { deliveryAddress, discountCode } = body;

    // Get user's cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    type CartItemWithProduct = typeof cartItems[number];

    // Calculate subtotal
    const subtotal = cartItems.reduce(
      (sum: number, item: CartItemWithProduct) => sum + item.product.price * item.quantity,
      0
    );

    let discount = 0;

    // Apply discount if provided
    if (discountCode) {
      const discountObj = await prisma.discount.findUnique({
        where: { code: discountCode },
      });

      if (discountObj && discountObj.isActive) {
        const now = new Date();
        if (now >= discountObj.validFrom && now <= discountObj.validTo) {
          if (!discountObj.maxUses || discountObj.usageCount < discountObj.maxUses) {
            if (subtotal >= discountObj.minPurchase) {
              if (discountObj.type === 'PERCENTAGE') {
                discount = (subtotal * discountObj.value) / 100;
              } else {
                discount = discountObj.value;
              }

              // Update discount usage
              await prisma.discount.update({
                where: { id: discountObj.id },
                data: { usageCount: { increment: 1 } },
              });

              // Track user discount usage
              await prisma.userDiscount.create({
                data: {
                  userId: user.id,
                  discountId: discountObj.id,
                },
              });
            }
          }
        }
      }
    }

    const shipping = 0;
    const total = subtotal - discount + shipping;

    // Calculate platform fee (5%)
    const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5');
    const platformFee = (total * platformFeePercentage) / 100;
    const adminRevenue = total - platformFee;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        subtotal,
        discount,
        platformFee,
        adminRevenue,
        shipping,
        total,
        deliveryAddress,
        status: 'PENDING',
      },
      include: {
        user: true,
      },
    });

    // Create order items
    for (const cartItem of cartItems) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          priceSnapshot: cartItem.product.price,
        },
      });

      // Update product stock
      await prisma.product.update({
        where: { id: cartItem.productId },
        data: {
          stock: {
            decrement: cartItem.quantity,
          },
        },
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });

    // Track analytics
    await prisma.analytics.create({
      data: {
        event: 'ORDER_CREATED',
        userId: user.id,
        metadata: {
          orderId: order.id,
          total,
          itemCount: cartItems.length,
        },
      },
    });

    // Send order confirmation email (if configured)
    if (isEmailConfigured()) {
      await sendOrderConfirmationEmail({
        to: order.user.email,
        customerName: order.user.fullName,
        orderId: order.id.slice(0, 8).toUpperCase(),
        total: order.total,
        items: cartItems.map(item => ({
          name: item.product.title,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });
    }

    return NextResponse.json({
      message: 'Order created successfully',
      order: {
        ...order,
        items: cartItems,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    );
  }
}