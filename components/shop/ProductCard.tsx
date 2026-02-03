'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/shopify/storefront';
import type { ShopifyProduct } from '@/lib/shopify/storefront';
import { parseOnchainTags } from '@/lib/shopify/config';

interface ProductCardProps {
  product: ShopifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const price = product.priceRange.minVariantPrice;
  const hasOnchainPerks = parseOnchainTags(product.tags).length > 0;

  return (
    <Link
      href={`/shop/${product.handle}`}
      className="group block bg-[#1A1A1A] rounded-2xl overflow-hidden hover:bg-[#252525] transition-all active:scale-[0.98]"
    >
      {/* Image */}
      <div className="aspect-square bg-[#252525] relative overflow-hidden">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-[#666]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {!product.availableForSale && (
            <span className="px-2 py-1 bg-red-500/90 rounded-md text-white text-xs font-medium">
              Sold Out
            </span>
          )}
          {hasOnchainPerks && (
            <span className="px-2 py-1 bg-purple-500/90 rounded-md text-white text-xs font-medium flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              +Onchain Perk
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-[#F5F5F5] truncate group-hover:text-white transition-colors">
          {product.title}
        </h3>
        <p className="text-base font-bold text-[#F5F5F5] mt-1">
          {formatPrice(price.amount, price.currencyCode)}
        </p>
      </div>
    </Link>
  );
}
