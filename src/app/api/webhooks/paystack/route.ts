// app/api/webhooks/paystack/route.ts - UPDATED WITH AUTO COMMISSION
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get('x-paystack-signature');

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('[PAYSTACK WEBHOOK] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('[PAYSTACK WEBHOOK] Event received:', event.event);

    // Handle successful payment
    if (event.event === 'charge.success') {
      const { reference, amount, customer } = event.data;

      // Amount is in kobo, convert to naira
      const amountInNaira = amount / 100;

      // Calculate 5% platform commission and 95% admin revenue
      const platformCommission = amountInNaira * 0.05;
      const adminRevenue = amountInNaira * 0.95;

      console.log('[PAYMENT BREAKDOWN]', {
        total: `₦${amountInNaira}`,
        platformCommission: `₦${platformCommission.toFixed(2)} (5%)`,
        adminRevenue: `₦${adminRevenue.toFixed(2)} (95%)`
      });

      // Find the payment record
      const payment = await prisma.payment.findUnique({
        where: { transactionRef: reference },
        include: { order: true }
      });

      if (!payment) {
        console.error('[PAYSTACK WEBHOOK] Payment not found:', reference);
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      // Update payment with commission split
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          feeCollected: platformCommission,
          adminEarning: adminRevenue,
          paymentMetadata: event.data
        }
      });

      // Update order status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          platformFee: platformCommission,
          adminRevenue: adminRevenue
        }
      });

      // Update user's total spent
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          totalSpent: { increment: amountInNaira }
        }
      });

      // Check if user qualifies as regular customer (spent > 50,000)
      const user = await prisma.user.findUnique({
        where: { id: payment.userId },
        select: { totalSpent: true, isRegular: true }
      });

      if (user && user.totalSpent >= 50000 && !user.isRegular) {
        await prisma.user.update({
          where: { id: payment.userId },
          data: { isRegular: true }
        });
        console.log('[USER UPGRADED] User is now a regular customer');
      }

      // Update platform stats for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.platformStats.upsert({
        where: { date: today },
        update: {
          totalCommission: { increment: platformCommission },
          totalSales: { increment: amountInNaira },
          ordersPlaced: { increment: 1 }
        },
        create: {
          date: today,
          totalCommission: platformCommission,
          totalSales: amountInNaira,
          ordersPlaced: 1
        }
      });

      console.log('[PAYMENT SUCCESS]', {
        reference,
        userId: payment.userId,
        amount: `₦${amountInNaira}`,
        platformCommission: `₦${platformCommission.toFixed(2)}`,
        adminRevenue: `₦${adminRevenue.toFixed(2)}`
      });

      return NextResponse.json({ 
        success: true,
        message: 'Payment processed successfully'
      });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[PAYSTACK WEBHOOK ERROR]', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}