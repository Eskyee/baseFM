'use client';

import { useCart } from '@/lib/shopify/cart-context';

export function CartButton() {
  const { cart, openCart } = useCart();
  const itemCount = cart?.totalQuantity || 0;

  return (
    <button
      onClick={openCart}
      className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg flex items-center justify-center hover:from-purple-500 hover:to-blue-500 transition-all active:scale-95"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
