// app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    // Get total users (clients only)
    const totalUsers = await prisma.user.count({
      where: { role: 'CLIENT' },
    });

    // Get total orders
    const totalOrders = await prisma.order.count();

    // Get total revenue (admin's 95% share)
    const revenueStats = await prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: {
        adminEarning: true,
      },
    });

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await prisma.order.count({
      where: {
        createdAt: { gte: today },
      },
    });

    const todayRevenue = await prisma.payment.aggregate({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: today },
      },
      _sum: {
        adminEarning: true,
      },
    });

    // Get DAU (Daily Active Users)
    const dau = await prisma.user.count({
      where: {
        lastLogin: { gte: today },
        role: 'CLIENT',
      },
    });

    // Get active carts
    const activeCarts = await prisma.cartItem.groupBy({
      by: ['userId'],
      _count: true,
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Get top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    interface TopProductGroup {
        productId: string;
        _sum: {
            quantity: number | null;
        };
    }

    interface Product {
            id: string;
            name: string;
            description?: string;
            price: number;
            // Add other product fields as needed
    }

    interface TopProductWithDetails extends Product {
        totalSold: number | null;
    }

    const topProductsWithDetails: TopProductWithDetails[] = await Promise.all(
        topProducts.map(async (item: TopProductGroup): Promise<TopProductWithDetails> => {
            const dbProduct = await prisma.product.findUnique({
                where: { id: item.productId },
            });
            if (!dbProduct) {
                return {
                    id: item.productId,
                    name: '',
                    description: '',
                    price: 0,
                    totalSold: item._sum.quantity,
                };
            }
            return {
                id: dbProduct.id,
                name: dbProduct.title, // Map 'title' to 'name'
                description: dbProduct.description ?? '',
                price: dbProduct.price,
                // Add other fields if needed
                totalSold: item._sum.quantity,
            };
        })
    );

    // Get regular customers
    const regularCustomers = await prisma.user.findMany({
      where: {
        isRegular: true,
        role: 'CLIENT',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        totalSpent: true,
      },
      orderBy: { totalSpent: 'desc' },
      take: 10,
    });

    // Get last 30 days revenue trend
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch payments and group them by date in JavaScript
    const payments = await prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        adminEarning: true,
      },
    });

    // Group by date
    const revenueTrendMap = new Map<string, number>();
    interface PaymentTrendItem {
        createdAt: Date;
        adminEarning: number | null;
    }

    payments.forEach((payment: PaymentTrendItem) => {
        const dateKey: string = payment.createdAt.toISOString().split('T')[0];
        const current: number = revenueTrendMap.get(dateKey) || 0;
        revenueTrendMap.set(dateKey, current + (payment.adminEarning || 0));
    });

    const revenueTrend = Array.from(revenueTrendMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    })).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRevenue: revenueStats._sum.adminEarning || 0,
      todayOrders,
      todayRevenue: todayRevenue._sum.adminEarning || 0,
      dailyActiveUsers: dau,
      activeCarts: activeCarts.length,
      recentOrders,
      topProducts: topProductsWithDetails,
      regularCustomers,
      revenueTrend,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}