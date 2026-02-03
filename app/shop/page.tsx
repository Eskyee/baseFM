import { getProducts } from '@/lib/shopify/storefront';
import { ProductCard } from '@/components/shop/ProductCard';
import Link from 'next/link';

export const metadata = {
  title: 'RaveCulture Shop | baseFM',
  description: 'Official RaveCulture merch. T-shirts, hoodies, and exclusive onchain perks.',
};

export default async function ShopPage() {
  let products: Awaited<ReturnType<typeof getProducts>>['products'] = [];
  let error: string | null = null;

  try {
    const data = await getProducts(20);
    products = data.products;
  } catch (e) {
    console.error('Failed to load products:', e);
    error = 'Failed to load products. Please try again later.';
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-b from-purple-900/40 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-2">
              RaveCulture Shop
            </h1>
            <p className="text-[#888] text-sm sm:text-base max-w-md mx-auto">
              Official merch with exclusive onchain perks for token holders
            </p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-[#888]">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#F5F5F5] mb-2">Coming Soon</h2>
            <p className="text-[#888] text-sm max-w-md mx-auto mb-6">
              We're working on some awesome merch. Check back soon or get notified when we launch.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] rounded-xl text-[#F5F5F5] font-medium hover:bg-[#252525] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Radio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-[#F5F5F5] font-semibold mb-1">Onchain Perks Included</h3>
              <p className="text-[#888] text-sm">
                Some items include exclusive NFT drops or token rewards. Connect your wallet after purchase to claim your onchain perks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
