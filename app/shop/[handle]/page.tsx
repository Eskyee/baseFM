'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import { useCart } from '@/lib/shopify/cart-context';
import { formatPrice } from '@/lib/shopify/storefront';
import type { ShopifyProduct } from '@/lib/shopify/storefront';
import { parseOnchainTags } from '@/lib/shopify/config';

interface ProductPageProps {
  params: { handle: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`/api/shop/products/${params.handle}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found');
          } else {
            setError('Failed to load product');
          }
          return;
        }
        const data = await response.json();
        setProduct(data.product);
        // Select first available variant
        const firstAvailable = data.product.variants.edges.find(
          (v: { node: { availableForSale: boolean } }) => v.node.availableForSale
        );
        if (firstAvailable) {
          setSelectedVariantId(firstAvailable.node.id);
        }
      } catch (e) {
        console.error('Failed to load product:', e);
        setError('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [params.handle]);

  const handleAddToCart = async () => {
    if (!selectedVariantId) return;
    setAdding(true);
    try {
      await addItem(selectedVariantId, 1);
    } catch (e) {
      console.error('Failed to add to cart:', e);
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 w-24 bg-[#1A1A1A] rounded mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-[#1A1A1A] rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-[#1A1A1A] rounded" />
                <div className="h-6 w-24 bg-[#1A1A1A] rounded" />
                <div className="h-32 bg-[#1A1A1A] rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#F5F5F5] mb-2">{error || 'Product not found'}</h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] rounded-xl text-[#F5F5F5] font-medium hover:bg-[#252525] transition-colors mt-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images.edges.map((e) => e.node);
  const variants = product.variants.edges.map((e) => e.node);
  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const onchainPerks = parseOnchainTags(product.tags);
  const hasMultipleVariants = variants.length > 1 && variants[0].title !== 'Default Title';

  // Group variants by option
  const options: Record<string, string[]> = {};
  variants.forEach((v) => {
    v.selectedOptions.forEach((opt) => {
      if (!options[opt.name]) {
        options[opt.name] = [];
      }
      if (!options[opt.name].includes(opt.value)) {
        options[opt.name].push(opt.value);
      }
    });
  });

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back link */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[#888] hover:text-[#F5F5F5] transition-colors mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-medium">Back to Shop</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Images */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="aspect-square bg-[#1A1A1A] rounded-2xl overflow-hidden relative">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImage].url}
                  alt={images[selectedImage].altText || product.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-[#666]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
                  </svg>
                </div>
              )}

              {/* Badges */}
              {onchainPerks.length > 0 && (
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1.5 bg-purple-500/90 rounded-lg text-white text-sm font-medium flex items-center gap-1.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    +Onchain Perk
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 ring-2 transition-all ${
                      selectedImage === i ? 'ring-purple-500' : 'ring-transparent hover:ring-[#888]'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || `${product.title} ${i + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5]">
              {product.title}
            </h1>

            <p className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mt-3">
              {selectedVariant
                ? formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)
                : formatPrice(
                    product.priceRange.minVariantPrice.amount,
                    product.priceRange.minVariantPrice.currencyCode
                  )}
            </p>

            {/* Variant Selectors */}
            {hasMultipleVariants && (
              <div className="mt-6 space-y-4">
                {Object.entries(options).map(([name, values]) => (
                  <div key={name}>
                    <label className="text-sm font-medium text-[#888] mb-2 block">
                      {name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {values.map((value) => {
                        const variant = variants.find((v) =>
                          v.selectedOptions.some(
                            (opt) => opt.name === name && opt.value === value
                          )
                        );
                        const isSelected = selectedVariant?.selectedOptions.some(
                          (opt) => opt.name === name && opt.value === value
                        );
                        const isAvailable = variant?.availableForSale;

                        return (
                          <button
                            key={value}
                            onClick={() => variant && setSelectedVariantId(variant.id)}
                            disabled={!isAvailable}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-purple-600 text-white'
                                : isAvailable
                                ? 'bg-[#1A1A1A] text-[#F5F5F5] hover:bg-[#252525]'
                                : 'bg-[#1A1A1A] text-[#666] line-through cursor-not-allowed'
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant?.availableForSale || adding}
              className={`mt-6 w-full py-4 rounded-xl text-white font-semibold text-base transition-all active:scale-[0.98] ${
                selectedVariant?.availableForSale
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500'
                  : 'bg-[#1A1A1A] text-[#666] cursor-not-allowed'
              }`}
            >
              {adding
                ? 'Adding...'
                : selectedVariant?.availableForSale
                ? 'Add to Cart'
                : 'Sold Out'}
            </button>

            {/* Description */}
            <div className="mt-8 pt-6 border-t border-[#1A1A1A]">
              <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wide mb-3">
                Description
              </h2>
              <div
                className="prose prose-invert prose-sm max-w-none text-[#888]"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(product.descriptionHtml, {
                    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                    ALLOWED_ATTR: ['href', 'target', 'rel']
                  })
                }}
              />
            </div>

            {/* Onchain Perks */}
            {onchainPerks.length > 0 && (
              <div className="mt-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/20">
                <h3 className="text-sm font-semibold text-purple-300 flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  Onchain Perks Included
                </h3>
                <p className="text-xs text-[#888]">
                  This item includes exclusive onchain perks. After purchase, connect your wallet to claim your {onchainPerks.map((p) => p.type).join(', ')} rewards on Base.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
