// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (optional - comment out if you want to keep data)
  try {
    await prisma.analytics.deleteMany(); // Corrected to match schema
    await prisma.adImpression.deleteMany(); // Corrected to match schema
    await prisma.ad.deleteMany();
    await prisma.userDiscount.deleteMany(); // Corrected to match schema
    await prisma.discount.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.product.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Cleared existing data');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }

  // 1. Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mscakehub.com',
      fullName: 'Admin User',
      phone: '+2348012345678',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'ADMIN',
      isRegular: false,
    },
  });

  console.log('✅ Created Admin:', admin.email);

  // 2. Create Test Clients
  const client1 = await prisma.user.create({
    data: {
      email: 'client1@test.com',
      fullName: 'John Doe',
      phone: '+2348087654321',
      password: await bcrypt.hash('Client123!', 10),
      role: 'CLIENT',
      totalSpent: 45000,
      isRegular: false,
    },
  });

  const client2 = await prisma.user.create({
    data: {
      email: 'client2@test.com',
      fullName: 'Jane Smith',
      phone: '+2348098765432',
      password: await bcrypt.hash('Client123!', 10),
      role: 'CLIENT',
      totalSpent: 85000,
      isRegular: true, // Regular customer
    },
  });

  console.log('✅ Created Test Clients:', client1.email, client2.email);

  // 3. Create Products
  const products = await prisma.product.createMany({
    data: [
      // Cakes
      {
        title: 'Red Velvet Cake',
        slug: 'red-velvet-cake',
        description: 'Rich and moist red velvet cake with cream cheese frosting',
        price: 15000,
        imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500',
        category: 'Cakes',
        stock: 10,
        isFeatured: true,
      },
      {
        title: 'Chocolate Fudge Cake',
        slug: 'chocolate-fudge-cake',
        description: 'Decadent triple-layer chocolate cake with fudge frosting',
        price: 18000,
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
        category: 'Cakes',
        stock: 8,
        isFeatured: true,
      },
      {
        title: 'Vanilla Birthday Cake',
        slug: 'vanilla-birthday-cake',
        description: 'Classic vanilla cake perfect for birthdays and celebrations',
        price: 20000,
        imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500',
        category: 'Cakes',
        stock: 15,
        isFeatured: false,
      },
      {
        title: 'Strawberry Shortcake',
        slug: 'strawberry-shortcake',
        description: 'Light sponge cake with fresh strawberries and whipped cream',
        price: 25000,
        imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500',
        category: 'Cakes',
        stock: 6,
        isFeatured: true,
      },
      {
        title: 'Wedding Cake (3-Tier)',
        slug: 'wedding-cake-3-tier',
        description: 'Elegant 3-tier wedding cake with custom decorations',
        price: 80000,
        imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500',
        category: 'Cakes',
        stock: 2,
        isFeatured: false,
      },

      // Cupcakes
      {
        title: 'Chocolate Cupcakes (6pc)',
        slug: 'chocolate-cupcakes-6pc',
        description: 'Box of 6 delicious chocolate cupcakes',
        price: 12000,
        imageUrl: 'https://images.unsplash.com/photo-1426869884541-df7117556757?w=500',
        category: 'Cupcakes',
        stock: 20,
        isFeatured: true,
      },
      {
        title: 'Vanilla Cupcakes (6pc)',
        slug: 'vanilla-cupcakes-6pc',
        description: 'Box of 6 vanilla cupcakes with buttercream frosting',
        price: 10000,
        imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=500',
        category: 'Cupcakes',
        stock: 25,
        isFeatured: false,
      },

      // Cookies
      {
        title: 'Sugar Cookies (12pc)',
        slug: 'sugar-cookies-12pc',
        description: 'Dozen of freshly baked sugar cookies',
        price: 6000,
        imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500',
        category: 'Cookies',
        stock: 30,
        isFeatured: false,
      },
      {
        title: 'Chocolate Chip Cookies (12pc)',
        slug: 'chocolate-chip-cookies-12pc',
        description: 'Classic chocolate chip cookies - crispy outside, chewy inside',
        price: 8000,
        imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500',
        category: 'Cookies',
        stock: 40,
        isFeatured: true,
      },
      {
        title: 'Red Velvet Cookies (12pc)',
        slug: 'red-velvet-cookies-12pc',
        description: 'Soft red velvet cookies with cream cheese chips',
        price: 15000,
        imageUrl: 'https://images.unsplash.com/photo-1590080876121-a3582d3867f7?w=500',
        category: 'Cookies',
        stock: 15,
        isFeatured: false,
      },

      // Bento Cakes
      {
        title: 'Mini Bento Cake',
        slug: 'mini-bento-cake',
        description: 'Cute mini bento cake perfect for 1-2 people',
        price: 10000,
        imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e5b8f7f0?w=500',
        category: 'Bento Cakes',
        stock: 12,
        isFeatured: true,
      },
      {
        title: 'Deluxe Bento Cake',
        slug: 'deluxe-bento-cake',
        description: 'Larger bento cake with premium decorations',
        price: 20000,
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500',
        category: 'Bento Cakes',
        stock: 8,
        isFeatured: false,
      },
    ],
  });

  console.log('✅ Created', products.count, 'products');

  // 4. Create Discount Codes
  const discount1 = await prisma.discount.create({
    data: {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      minPurchase: 5000,
      maxUses: 100,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
    },
  });

  const discount2 = await prisma.discount.create({
    data: {
      code: 'SAVE5K',
      type: 'FIXED',
      value: 5000,
      minPurchase: 20000,
      maxUses: 50,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      isActive: true,
    },
  });

  console.log('✅ Created Discount Codes:', discount1.code, discount2.code);

  // 5. Create Test Orders with Payments
  const allProducts = await prisma.product.findMany();

  // Order 1 - Completed
  const order1 = await prisma.order.create({
    data: {
      userId: client1.id,
      subtotal: 30000,
      discount: 0,
      platformFee: 1500,
      adminRevenue: 28500,
      shipping: 0,
      total: 30000,
      status: 'DELIVERED',
      deliveryAddress: '123 Main Street, Ikeja, Lagos',
      items: {
        create: [
          {
            productId: allProducts[0].id,
            quantity: 2,
            priceSnapshot: allProducts[0].price,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order1.id,
      userId: client1.id,
      provider: 'paystack',
      transactionRef: `TEST_${Date.now()}_1`,
      amount: 30000,
      feeCollected: 1500,
      adminEarning: 28500,
      status: 'SUCCESS',
    },
  });

  // Order 2 - Pending
  const order2 = await prisma.order.create({
    data: {
      userId: client2.id,
      subtotal: 45000,
      discount: 4500,
      platformFee: 2025,
      adminRevenue: 38475,
      shipping: 0,
      total: 40500,
      status: 'PAID',
      deliveryAddress: '456 Victoria Island, Lagos',
      items: {
        create: [
          {
            productId: allProducts[1].id,
            quantity: 1,
            priceSnapshot: allProducts[1].price,
          },
          {
            productId: allProducts[5].id,
            quantity: 2,
            priceSnapshot: allProducts[5].price,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order2.id,
      userId: client2.id,
      provider: 'paystack',
      transactionRef: `TEST_${Date.now()}_2`,
      amount: 40500,
      feeCollected: 2025,
      adminEarning: 38475,
      status: 'SUCCESS',
    },
  });

  console.log('✅ Created 2 test orders with payments');

  // 6. Create Test Ad
  const ad = await prisma.ad.create({
    data: {
      title: 'Valentine Special - 20% Off All Cakes!',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500',
      link: '/client/products?category=Cakes',
      type: 'BANNER',
      position: 'BOTTOM_RIGHT',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      revenuePerView: 0.10,
    },
  });

  console.log('✅ Created test ad:', ad.title);

  // 7. Create Platform Stats (Today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.platformStats.create({
    data: {
      date: today,
      totalCommission: 3525, // 5% from orders
      totalAdRevenue: 0,
      totalSales: 70500,
      dailyActiveUsers: 2,
      newUsers: 2,
      ordersPlaced: 2,
      adImpressions: 0,
    },
  });

  console.log('✅ Created platform stats');

  // 8. Create Cart Items for Client 1
  await prisma.cartItem.createMany({
    data: [
      {
        userId: client1.id,
        productId: allProducts[2].id,
        quantity: 1,
      },
      {
        userId: client1.id,
        productId: allProducts[8].id,
        quantity: 2,
      },
    ],
  });

  console.log('✅ Created cart items for test client');

  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('📝 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Admin:');
  console.log('   Email: admin@mscakehub.com');
  console.log('   Password: Admin123!');
  console.log('\n👥 Test Clients:');
  console.log('   Email: client1@test.com');
  console.log('   Password: Client123!');
  console.log('   \n   Email: client2@test.com');
  console.log('   Password: Client123!');
  console.log('   (Regular Customer)');
  console.log('\n🎁 Discount Codes:');
  console.log('   WELCOME10 - 10% off (min ₦5,000)');
  console.log('   SAVE5K - ₦5,000 off (min ₦20,000)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });