import { NextRequest, NextResponse } from 'next/server';
import { getProductByHandle } from '@/lib/shopify/storefront';

// GET /api/shop/products/[handle]
export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const product = await getProductByHandle(params.handle);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
