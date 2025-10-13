// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// GET: Fetch all products (with filters)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}

// POST: Create new product (Admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();

    const body = await req.json();
    const { title, description, price, imageUrl, category, stock, isFeatured } = body;

    // Validation
    if (!title || !price || !imageUrl || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    const finalSlug = existingProduct ? `${slug}-${Date.now()}` : slug;

    // Create product
    const product = await prisma.product.create({
      data: {
        title,
        slug: finalSlug,
        description,
        price,
        imageUrl,
        category,
        stock: stock || 0,
        isFeatured: isFeatured || false,
        createdById: user.id,
      },
    });

    // Track analytics
    await prisma.analytics.create({
      data: {
        event: 'PRODUCT_CREATED',
        userId: user.id,
        metadata: {
          productId: product.id,
          title: product.title,
        },
      },
    });

    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Product creation error:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    );
  }
}