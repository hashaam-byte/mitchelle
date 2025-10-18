// app/api/cron/daily-stats/route.ts
// This endpoint should be called daily (use Vercel Cron or external cron service)
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Calculate today's commission
    const todayCommission = await prisma.payment.aggregate({
      where: {
        status: 'SUCCESS',
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      _sum: {
        feeCollected: true
      }
    });

    // Calculate today's ad impressions and revenue
    const todayImpressions = await prisma.adImpression.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get active ads to calculate revenue
    const activeAds = await prisma.ad.findMany({
      where: {
        isActive: true,
        startDate: { lte: today },
        endDate: { gte: today }
      },
      select: {
        revenuePerView: true
      }
    });

    const avgRevenuePerView = activeAds.length > 0
      ? activeAds.reduce((sum, ad) => sum + ad.revenuePerView, 0) / activeAds.length
      : 0.5;

    const todayAdRevenue = todayImpressions * avgRevenuePerView;

    // Calculate today's total sales
    const todaySales = await prisma.payment.aggregate({
      where: {
        status: 'SUCCESS',
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      _sum: {
        amount: true
      }
    });

    // Count daily active users
    const dailyActiveUsers = await prisma.user.count({
      where: {
        lastLogin: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Count new users
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Count orders
    const ordersPlaced = await prisma.order.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Update or create platform stats for today
    await prisma.platformStats.upsert({
      where: { date: today },
      update: {
        totalCommission: todayCommission._sum.feeCollected || 0,
        totalAdRevenue: todayAdRevenue,
        totalSales: todaySales._sum.amount || 0,
        dailyActiveUsers,
        newUsers,
        ordersPlaced,
        adImpressions: todayImpressions
      },
      create: {
        date: today,
        totalCommission: todayCommission._sum.feeCollected || 0,
        totalAdRevenue: todayAdRevenue,
        totalSales: todaySales._sum.amount || 0,
        dailyActiveUsers,
        newUsers,
        ordersPlaced,
        adImpressions: todayImpressions
      }
    });

    console.log('[DAILY STATS UPDATED]', {
      date: today.toISOString(),
      commission: todayCommission._sum.feeCollected || 0,
      adRevenue: todayAdRevenue,
      sales: todaySales._sum.amount || 0,
      users: dailyActiveUsers,
      orders: ordersPlaced
    });

    return NextResponse.json({
      success: true,
      stats: {
        date: today,
        totalCommission: todayCommission._sum.feeCollected || 0,
        totalAdRevenue: todayAdRevenue,
        totalSales: todaySales._sum.amount || 0,
        dailyActiveUsers,
        newUsers,
        ordersPlaced,
        adImpressions: todayImpressions
      }
    });

  } catch (error) {
    console.error('[DAILY STATS CRON ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update daily stats' },
      { status: 500 }
    );
  }
}

// For manual trigger (development only)
export async function POST(req: Request) {
  return GET(req);
}