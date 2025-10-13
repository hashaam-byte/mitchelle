// app/api/webhooks/paystack/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    // Handle charge.success event
    if (event.event === 'charge.success') {
      const { reference, amount, metadata } = event.data;
      const orderId = metadata.orderId;

      // Find payment record
      const payment = await prisma.payment.findUnique({
        where: { transactionRef: reference },
        include: { order: true },
      });

      if (!payment) {
        console.error('Payment not found:', reference);
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          paymentMetadata: event.data,
        },
      });

      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      });

      // Update user's total spent
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          totalSpent: {
            increment: payment.amount,
          },
        },
      });

      // Check if user should be marked as regular (e.g., spent > ₦50,000)
      const user = await prisma.user.findUnique({
        where: { id: payment.userId },
      });

      if (user && user.totalSpent >= 50000 && !user.isRegular) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isRegular: true },
        });
      }

      // Update platform stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.platformStats.upsert({
        where: { date: today },
        update: {
          totalCommission: { increment: payment.feeCollected },
          totalSales: { increment: payment.amount },
          ordersPlaced: { increment: 1 },
        },
        create: {
          date: today,
          totalCommission: payment.feeCollected,
          totalSales: payment.amount,
          ordersPlaced: 1,
        },
      });

      // Track analytics
      await prisma.analytics.create({
        data: {
          event: 'PAYMENT_SUCCESS',
          userId: payment.userId,
          metadata: {
            orderId,
            amount: payment.amount,
            reference,
          },
        },
      });

      console.log('Payment processed successfully:', reference);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}