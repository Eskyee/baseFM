'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { ShopifyCart } from './storefront';

interface CartContextType {
  cart: ShopifyCart | null;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_ID_KEY = 'raveculture-cart-id';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart on mount
  useEffect(() => {
    async function loadCart() {
      const cartId = localStorage.getItem(CART_ID_KEY);
      if (cartId) {
        try {
          const response = await fetch(`/api/shop/cart?cartId=${cartId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.cart) {
              setCart(data.cart);
            } else {
              // Cart expired or invalid
              localStorage.removeItem(CART_ID_KEY);
            }
          }
        } catch (error) {
          console.error('Failed to load cart:', error);
        }
      }
      setIsLoading(false);
    }

    loadCart();
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    setIsLoading(true);
    try {
      const cartId = localStorage.getItem(CART_ID_KEY);
      const response = await fetch('/api/shop/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, variantId, quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const data = await response.json();
      setCart(data.cart);
      localStorage.setItem(CART_ID_KEY, data.cart.id);
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to add item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (lineId: string, quantity: number) => {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/shop/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, lineId, quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error('Failed to update item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (lineId: string) => {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/shop/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, lineId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isOpen,
        openCart,
        closeCart,
        addItem,
        updateItem,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
