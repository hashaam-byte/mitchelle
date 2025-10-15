// app/api/admin/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Fetch payments
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
          order: {
            select: {
              id: true,
              total: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    // Calculate statistics
    const stats = await prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: {
        amount: true,
        feeCollected: true,
        adminEarning: true,
      },
      _count: true,
    });

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await prisma.payment.aggregate({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: today },
      },
      _sum: {
        amount: true,
        adminEarning: true,
      },
      _count: true,
    });

    // Get status breakdown
    const statusBreakdown = await prisma.payment.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      payments,
      stats: {
        totalAmount: stats._sum.amount || 0,
        totalPlatformFee: stats._sum.feeCollected || 0,
        totalAdminEarning: stats._sum.adminEarning || 0,
        successCount: stats._count || 0,
        todayAmount: todayStats._sum.amount || 0,
        todayEarning: todayStats._sum.adminEarning || 0,
        todayCount: todayStats._count || 0,
        statusBreakdown,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments', details: error.message },
      { status: 500 }
    );
  }
}