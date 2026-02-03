import { NextRequest, NextResponse } from 'next/server';
import {
  getCart,
  createCart,
  addToCart,
  updateCartLine,
  removeFromCart,
} from '@/lib/shopify/storefront';

// GET /api/shop/cart?cartId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cartId = searchParams.get('cartId');

  if (!cartId) {
    return NextResponse.json({ cart: null });
  }

  try {
    const cart = await getCart(cartId);
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Failed to get cart:', error);
    return NextResponse.json({ cart: null });
  }
}

// POST /api/shop/cart - Create cart or add item
export async function POST(request: NextRequest) {
  try {
    const { cartId, variantId, quantity = 1 } = await request.json();

    let cart;
    if (cartId) {
      // Add to existing cart
      cart = await addToCart(cartId, [{ merchandiseId: variantId, quantity }]);
    } else {
      // Create new cart with item
      cart = await createCart([{ merchandiseId: variantId, quantity }]);
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Failed to add to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// PATCH /api/shop/cart - Update item quantity
export async function PATCH(request: NextRequest) {
  try {
    const { cartId, lineId, quantity } = await request.json();

    if (!cartId || !lineId) {
      return NextResponse.json(
        { error: 'Missing cartId or lineId' },
        { status: 400 }
      );
    }

    const cart = await updateCartLine(cartId, lineId, quantity);
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Failed to update cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/shop/cart - Remove item
export async function DELETE(request: NextRequest) {
  try {
    const { cartId, lineId } = await request.json();

    if (!cartId || !lineId) {
      return NextResponse.json(
        { error: 'Missing cartId or lineId' },
        { status: 400 }
      );
    }

    const cart = await removeFromCart(cartId, [lineId]);
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove item' },
      { status: 500 }
    );
  }
}
