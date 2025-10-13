// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// GET: Single product
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Track product view
    await prisma.analytics.create({
      data: {
        event: 'PRODUCT_VIEWED',
        metadata: {
          productId: product.id,
          title: product.title,
        },
      },
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update product (Admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const product = await prisma.product.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to update product', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete product (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to delete product', details: error.message },
      { status: 500 }
    );
  }
}