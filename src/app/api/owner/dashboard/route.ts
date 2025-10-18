// app/api/owner/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Only SUPER_ADMIN can access
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Calculate total commission (5% of all successful payments)
    const totalCommissionResult = await prisma.payment.aggregate({
      where: {
        status: 'SUCCESS'
      },
      _sum: {
        feeCollected: true
      }
    });

    const totalCommission = totalCommissionResult._sum.feeCollected || 0;

    // Calculate total ad revenue
    const totalAdRevenueResult = await prisma.ad.aggregate({
      _sum: {
        totalRevenue: true,
        impressions: true
      }
    });

    const totalAdRevenue = totalAdRevenueResult._sum.totalRevenue || 0;
    const totalImpressions = totalAdRevenueResult._sum.impressions || 0;

    // Calculate total platform sales
    const totalSalesResult = await prisma.payment.aggregate({
      where: {
        status: 'SUCCESS'
      },
      _sum: {
        amount: true
      }
    });

    const totalSales = totalSalesResult._sum.amount || 0;

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Daily active users (logged in today)
    const dailyActiveUsers = await prisma.user.count({
      where: {
        lastLogin: {
          gte: today
        }
      }
    });

    // New users today
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });

    // Orders placed today
    const ordersPlaced = await prisma.order.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });

    // Ad impressions today
    const adImpressions = await prisma.adImpression.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });

    return NextResponse.json({
      totalCommission,
      totalAdRevenue,
      totalSales,
      dailyActiveUsers,
      newUsers,
      ordersPlaced,
      adImpressions,
      totalRevenue: totalCommission + totalAdRevenue,
      totalImpressions
    });

  } catch (error) {
    console.error('[OWNER DASHBOARD ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}