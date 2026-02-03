import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/shopify/storefront';

// GET /api/shop/products
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const first = parseInt(searchParams.get('first') || '20');
  const after = searchParams.get('after') || undefined;

  try {
    const { products, pageInfo } = await getProducts(first, after);
    return NextResponse.json({ products, pageInfo });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
