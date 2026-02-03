'use client';

import { useCart } from '@/lib/shopify/cart-context';
import { formatPrice } from '@/lib/shopify/storefront';
import Image from 'next/image';

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem, isLoading } = useCart();

  if (!isOpen) return null;

  const lines = cart?.lines.edges || [];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-[#0A0A0A] shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1A1A1A]">
          <h2 className="text-lg font-bold text-[#F5F5F5]">Your Cart</h2>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg text-[#888] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-[#888] text-sm">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="mt-4 px-6 py-2 bg-[#1A1A1A] rounded-lg text-[#F5F5F5] text-sm font-medium hover:bg-[#252525] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {lines.map(({ node: line }) => (
                <div
                  key={line.id}
                  className="flex gap-3 bg-[#1A1A1A] rounded-xl p-3"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg bg-[#252525] overflow-hidden flex-shrink-0">
                    {line.merchandise.product.featuredImage ? (
                      <Image
                        src={line.merchandise.product.featuredImage.url}
                        alt={line.merchandise.product.featuredImage.altText || line.merchandise.product.title}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#666]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[#F5F5F5] truncate">
                      {line.merchandise.product.title}
                    </h3>
                    {line.merchandise.title !== 'Default Title' && (
                      <p className="text-xs text-[#888] mt-0.5">
                        {line.merchandise.title}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-[#F5F5F5] mt-1">
                      {formatPrice(
                        line.merchandise.price.amount,
                        line.merchandise.price.currencyCode
                      )}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-[#252525] rounded-lg">
                        <button
                          onClick={() =>
                            line.quantity > 1
                              ? updateItem(line.id, line.quantity - 1)
                              : removeItem(line.id)
                          }
                          disabled={isLoading}
                          className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-[#F5F5F5] transition-colors disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-8 text-center text-sm text-[#F5F5F5]">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(line.id, line.quantity + 1)}
                          disabled={isLoading}
                          className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-[#F5F5F5] transition-colors disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(line.id)}
                        disabled={isLoading}
                        className="p-2 text-[#888] hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && cart && (
          <div className="p-4 border-t border-[#1A1A1A] space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#888]">Subtotal</span>
              <span className="text-[#F5F5F5] font-semibold">
                {formatPrice(
                  cart.cost.subtotalAmount.amount,
                  cart.cost.subtotalAmount.currencyCode
                )}
              </span>
            </div>
            <p className="text-xs text-[#666]">
              Shipping and taxes calculated at checkout
            </p>
            <a
              href={cart.checkoutUrl}
              className="block w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white text-center font-semibold hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98]"
            >
              Checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}
