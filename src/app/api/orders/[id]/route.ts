// app/api/admin/orders/[id]/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { sendOrderStatusEmail, isEmailConfigured } from '@/lib/email';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Track analytics
    await prisma.analytics.create({
      data: {
        event: 'ORDER_STATUS_UPDATED',
        metadata: {
          orderId: id,
          newStatus: status,
        },
      },
    });

    // Send status update email (if configured)
    if (isEmailConfigured()) {
      try {
        await sendOrderStatusEmail({
          to: order.user.email,
          customerName: order.user.fullName,
          orderId: order.id.slice(0, 8).toUpperCase(),
          status: status,
        });
      } catch (emailError) {
        // Log email error but don't fail the order update
        console.error('[Order Update] Failed to send status email:', emailError);
      }
    }

    return NextResponse.json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error: any) {
    console.error('[Order Update] Error:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to update order', details: error.message },
      { status: 500 }
    );
  }
}