// app/api/payment/initialize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify the order belongs to the user
    if (order.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to access this order' },
        { status: 403 }
      );
    }

    // Check if order is already paid
    if (order.status === 'PAID' || order.status === 'DELIVERED') {
      return NextResponse.json(
        { error: 'Order is already paid' },
        { status: 400 }
      );
    }

    // Convert amount to kobo (Paystack uses kobo)
    const amountInKobo = Math.round(order.total * 100);

    // Initialize Paystack payment
    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: order.user.email,
          amount: amountInKobo,
          currency: 'NGN',
          reference: `ORDER_${order.id}_${Date.now()}`,
          callback_url: `${process.env.NEXTAUTH_URL}/client/payment-success`,
          metadata: {
            orderId: order.id,
            userId: order.userId,
            orderTotal: order.total,
            platformFee: order.platformFee,
            adminRevenue: order.adminRevenue,
            custom_fields: [
              {
                display_name: 'Order ID',
                variable_name: 'order_id',
                value: order.id,
              },
              {
                display_name: 'Customer Name',
                variable_name: 'customer_name',
                value: order.user.fullName,
              },
            ],
          },
        }),
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      return NextResponse.json(
        { error: 'Failed to initialize payment', details: paystackData.message },
        { status: 500 }
      );
    }

    // Create payment record in database
    await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: order.userId,
        provider: 'paystack',
        transactionRef: paystackData.data.reference,
        amount: order.total,
        feeCollected: order.platformFee,
        adminEarning: order.adminRevenue,
        status: 'PENDING',
        paymentMetadata: paystackData.data,
      },
    });

    // Return the payment URL
    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to verify payment status
export async function GET(req: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.status) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Get payment record
    const payment = await prisma.payment.findUnique({
      where: { transactionRef: reference },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
            user: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      payment: verifyData.data,
      order: payment?.order,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to verify payment', details: error.message },
      { status: 500 }
    );
  }
}