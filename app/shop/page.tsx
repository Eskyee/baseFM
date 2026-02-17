import { getProducts } from '@/lib/shopify/storefront';
import { ProductCard } from '@/components/shop/ProductCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop | baseFM',
  description: 'Official RaveCulture merch. Pay with card or USDC on Base.',
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
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Hero - Clean & Minimal */}
      <div className="border-b border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0052FF] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 111 111" fill="currentColor">
                  <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"/>
                </svg>
              </div>
              <span className="text-[#0052FF] text-sm font-semibold">Powered by Base</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              RaveCulture Shop
            </h1>
            <p className="text-[#888] text-lg">
              Official merch with onchain perks. Pay with card or USDC.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods Banner */}
      <div className="border-b border-[#1A1A1A] bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-sm">
            <span className="text-[#666]">Accepted payments:</span>
            <div className="flex items-center gap-2 text-[#888]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
              <span>Card</span>
            </div>
            <div className="flex items-center gap-2 text-[#2775CA]">
              <svg className="w-5 h-5" viewBox="0 0 32 32" fill="currentColor">
                <circle cx="16" cy="16" r="16"/>
                <path fill="white" d="M16 6c5.523 0 10 4.477 10 10s-4.477 10-10 10S6 21.523 6 16 10.477 6 16 6zm0 2a8 8 0 100 16 8 8 0 000-16zm3.5 4v1.5h-1V12h-5v1.5h-1V12H11v8h1.5v-1.5h1V20h5v-1.5h1V20H21v-8h-1.5zm-1 6h-5v-4h5v4z"/>
              </svg>
              <span>USDC</span>
            </div>
            <div className="flex items-center gap-2 text-[#627EEA]">
              <svg className="w-5 h-5" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0z"/>
                <path fill="white" d="M16.498 4v8.87l7.497 3.35L16.498 4z" fillOpacity="0.6"/>
                <path fill="white" d="M16.498 4L9 16.22l7.498-3.35V4z"/>
                <path fill="white" d="M16.498 21.968v6.027L24 17.616l-7.502 4.352z" fillOpacity="0.6"/>
                <path fill="white" d="M16.498 27.995v-6.028L9 17.616l7.498 10.379z"/>
                <path fill="white" d="M16.498 20.573l7.497-4.353-7.497-3.348v7.701z" fillOpacity="0.2"/>
                <path fill="white" d="M9 16.22l7.498 4.353v-7.701L9 16.22z" fillOpacity="0.6"/>
              </svg>
              <span>ETH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-[#888]">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-[#1A1A1A] flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
            <p className="text-[#888] max-w-md mx-auto mb-8">
              We're preparing some exclusive merch with onchain perks.
              Connect your wallet to get notified when we launch.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-[#E5E5E5] transition-all active:scale-[0.98]"
              >
                Back to Radio
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-full font-semibold hover:bg-[#252525] transition-all active:scale-[0.98]"
              >
                View Events
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">{products.length} Products</h2>
              <div className="flex items-center gap-2">
                <span className="text-[#666] text-sm">Sort by:</span>
                <select className="bg-[#1A1A1A] text-white text-sm px-3 py-2 rounded-lg border border-[#333] focus:outline-none focus:border-[#0052FF]">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-[#0052FF]/10 to-[#8A63D2]/10 rounded-2xl p-6 sm:p-8 border border-[#1A1A1A]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Onchain Rewards</h3>
                <p className="text-[#888] text-sm">
                  Some items include exclusive NFT drops or token rewards. Connect your wallet to claim.
                </p>
              </div>
              <Link
                href="/wallet"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0052FF] text-white rounded-full font-semibold hover:bg-[#0047E0] transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <svg className="w-4 h-4" viewBox="0 0 111 111" fill="currentColor">
                  <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"/>
                </svg>
                Connect Wallet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
