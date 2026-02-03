import { CartProvider } from '@/lib/shopify/cart-context';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { CartButton } from '@/components/shop/CartButton';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <CartButton />
    </CartProvider>
  );
}
