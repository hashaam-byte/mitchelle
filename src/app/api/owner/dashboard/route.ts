// app/api/owner/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin();

    // Get total platform revenue
    const totalStats = await prisma.platformStats.aggregate({
      _sum: {
        totalCommission: true,
        totalAdRevenue: true,
        totalSales: true,
        ordersPlaced: true,
        adImpressions: true,
      },
    });

    // Get last 30 days stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentStats = await prisma.platformStats.findMany({
      where: {
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: 'asc' },
    });

    // Get total users
    const userStats = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    // Get total products
    const productCount = await prisma.product.count();

    // Get recent payments
    const recentPayments = await prisma.payment.findMany({
      where: { status: 'SUCCESS' },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        order: {
          select: {
            total: true,
          },
        },
      },
    });

    // Get active ads
    const now = new Date();
    const activeAds = await prisma.ad.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    // Get all admins
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    return NextResponse.json({
      totalRevenue: {
        commission: totalStats._sum.totalCommission || 0,
        adRevenue: totalStats._sum.totalAdRevenue || 0,
        total: (totalStats._sum.totalCommission || 0) + (totalStats._sum.totalAdRevenue || 0),
      },
      totalSales: totalStats._sum.totalSales || 0,
      totalOrders: totalStats._sum.ordersPlaced || 0,
      totalAdImpressions: totalStats._sum.adImpressions || 0,
      recentStats,
      userStats,
      productCount,
      recentPayments,
      activeAds,
      admins,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Super admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}