'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ImageLoaderProps } from 'next/image';
import { formatPrice } from '@/lib/shopify/storefront';
import type { ShopifyProduct } from '@/lib/shopify/storefront';
import { parseOnchainTags } from '@/lib/shopify/config';

// Shopify CDN supports resizing via the `width` query param, e.g.
//   https://cdn.shopify.com/s/files/.../image.jpg?v=1&width=800
// This lets Next.js request appropriately-sized images without needing
// the Vercel image optimizer, keeping Shopify CDN as the resize layer.
// See: https://shopify.dev/docs/api/liquid/filters/img_url
function shopifyLoader({ src, width }: ImageLoaderProps): string {
  const url = new URL(src);
  url.searchParams.set('width', String(width));
  return url.toString();
}

interface ProductCardProps {
  product: ShopifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const price = product.priceRange.minVariantPrice;
  const hasOnchainPerks = parseOnchainTags(product.tags).length > 0;

  return (
    <Link
      href={`/shop/${product.handle}`}
      className="group block bg-[#111] rounded-2xl overflow-hidden border border-[#1A1A1A] hover:border-[#333] transition-all"
    >
      {/* Image */}
      <div className="aspect-square bg-[#0A0A0A] relative overflow-hidden">
        {product.featuredImage ? (
          <Image
            loader={shopifyLoader}
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A]">
            <svg className="w-16 h-16 text-[#333]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {!product.availableForSale && (
            <span className="px-2.5 py-1 bg-black/80 backdrop-blur-sm rounded-full text-white text-xs font-medium">
              Sold Out
            </span>
          )}
          {hasOnchainPerks && (
            <span className="px-2.5 py-1 bg-[#0052FF]/90 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 111 111" fill="currentColor">
                <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"/>
              </svg>
              Onchain Perk
            </span>
          )}
        </div>

        {/* Quick Add Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white text-black text-center py-2.5 rounded-xl font-semibold text-sm">
            View Product
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-white truncate mb-1">
          {product.title}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-white">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
          {hasOnchainPerks && (
            <span className="text-[#0052FF] text-xs font-medium">+NFT</span>
          )}
        </div>
      </div>
    </Link>
  );
}
