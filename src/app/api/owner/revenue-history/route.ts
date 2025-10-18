// app/api/owner/revenue-history/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get last 7 days of revenue data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date);
    }

    const history = await Promise.all(
      last7Days.map(async (date) => {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        // Commission for that day
        const commissionResult = await prisma.payment.aggregate({
          where: {
            status: 'SUCCESS',
            createdAt: {
              gte: date,
              lt: nextDate
            }
          },
          _sum: {
            feeCollected: true
          }
        });

        // Ad revenue for that day
        const adRevenueResult = await prisma.adImpression.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        });

        // Get average revenue per view from active ads
        const activeAds = await prisma.ad.findMany({
          where: {
            isActive: true,
            startDate: { lte: date },
            endDate: { gte: date }
          },
          select: {
            revenuePerView: true
          }
        });

        const avgRevenuePerView = activeAds.length > 0
          ? activeAds.reduce((sum, ad) => sum + ad.revenuePerView, 0) / activeAds.length
          : 0.5;

        const commission = commissionResult._sum.feeCollected || 0;
        const adRevenue = adRevenueResult * avgRevenuePerView;

        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          commission: Number(commission.toFixed(2)),
          adRevenue: Number(adRevenue.toFixed(2)),
          total: Number((commission + adRevenue).toFixed(2))
        };
      })
    );

    return NextResponse.json({ history });

  } catch (error) {
    console.error('[REVENUE HISTORY ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue history' },
      { status: 500 }
    );
  }
}