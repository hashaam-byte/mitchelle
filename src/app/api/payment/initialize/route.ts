// app/api/payment/initialize/route.ts - WITH SUB-ACCOUNT SPLIT
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_SUBACCOUNT = process.env.PAYSTACK_SUBACCOUNT_CODE!;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { orderId } = body;

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Generate unique reference
    const reference = `MCH-${Date.now()}-${order.id.slice(0, 8)}`;

    // Calculate commission split (done automatically by Paystack)
    const totalAmount = order.total * 100; // Convert to kobo
    const platformCommission = order.total * 0.05; // 5%
    const adminRevenue = order.total * 0.95; // 95%

    // Initialize Paystack payment WITH SUB-ACCOUNT
    const paystackData = {
      email: order.user.email,
      amount: totalAmount, // Amount in kobo
      reference,
      currency: 'NGN',
      callback_url: `${process.env.NEXTAUTH_URL}/client/payment-success?reference=${reference}`,
      metadata: {
        orderId: order.id,
        userId: order.userId,
        custom_fields: [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: order.id
          },
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: order.user.fullName
          }
        ]
      },
      // SUB-ACCOUNT CONFIGURATION
      subaccount: PAYSTACK_SUBACCOUNT,
      transaction_charge: platformCommission * 100, // 5% in kobo
      bearer: 'account' // Main account bears Paystack fees
    };

    console.log('[PAYMENT INIT WITH SUB-ACCOUNT]', {
      orderId: order.id,
      total: `₦${order.total}`,
      commission: `₦${platformCommission} (5%)`,
      adminRevenue: `₦${adminRevenue} (95%)`,
      subaccount: PAYSTACK_SUBACCOUNT
    });

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paystackData)
    });

    const data = await response.json();

    if (!data.status) {
      console.error('[PAYSTACK ERROR]', data);
      return NextResponse.json(
        { error: data.message || 'Payment initialization failed' },
        { status: 400 }
      );
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: order.userId,
        transactionRef: reference,
        amount: order.total,
        feeCollected: platformCommission,
        adminEarning: adminRevenue,
        status: 'PENDING',
        provider: 'paystack'
      }
    });

    console.log('[PAYMENT INITIALIZED]', {
      reference,
      authorization_url: data.data.authorization_url,
      splitInfo: {
        total: `₦${order.total}`,
        superAdmin: `₦${platformCommission} (5%)`,
        admin: `₦${adminRevenue} (95%)`
      }
    });

    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url,
      reference,
      splitInfo: {
        total: order.total,
        platformCommission,
        adminRevenue
      }
    });

  } catch (error) {
    console.error('[PAYMENT INIT ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}