'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import Image from 'next/image';
import Link from 'next/link';
import { WalletConnect } from '@/components/WalletConnect';
import { DJ_TOKEN_CONFIG } from '@/lib/token/config';

interface GalleryImage {
  id: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  secure_url: string;
}

// TODO: Move this to @/lib/abis.ts for shared usage
const balanceOfAbi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default function GalleryPage() {
  const { address, isConnected } = useAccount();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const lastViewedPhoto = useRef<number | null>(null);

  // Check token balance for upload access
  const { data: balanceData } = useReadContract({
    address: DJ_TOKEN_CONFIG.address,
    abi: balanceOfAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const tokenBalance = balanceData
    ? Number(balanceData / BigInt(10 ** DJ_TOKEN_CONFIG.decimals))
    : 0;

  const canUpload = tokenBalance >= 5000; // 5K RAVE to upload

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    } catch (err) {
      console.error('Failed to fetch images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      // SECURITY NOTE: The backend MUST verify this address via signature or session.
      // Relying solely on this field allows impersonation.
      if (address) {
        formData.append('walletAddress', address);
      }

      const res = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      await fetchImages();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const openModal = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
    lastViewedPhoto.current = index;
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    if (!selectedImage) return;

    let newIndex = selectedIndex;
    if (direction === 'next' && selectedIndex < images.length - 1) {
      newIndex = selectedIndex + 1;
    } else if (direction === 'prev' && selectedIndex > 0) {
      newIndex = selectedIndex - 1;
    }

    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
      setSelectedImage(images[newIndex]);
      lastViewedPhoto.current = newIndex;
    }
  }, [selectedImage, selectedIndex, images]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;

      if (e.key === 'ArrowRight') navigateImage('next');
      else if (e.key === 'ArrowLeft') navigateImage('prev');
      else if (e.key === 'Escape') closeModal();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, navigateImage]);

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-12 pb-8 px-4">
        <div className="mb-6">
          <Image
            src="/logo.png"
            alt="RaveCulture"
            width={180}
            height={180}
            className="rounded-2xl"
            priority
            unoptimized
          />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white text-center mb-3 tracking-tight">
          RaveCulture Gallery
        </h1>
        <p className="text-white/60 text-center max-w-md mb-8">
          Photos from the underground. Captured by the community.
        </p>

        {/* Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {isConnected ? (
            canUpload ? (
              <label className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full cursor-pointer hover:bg-white/90 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {isUploading ? 'Uploading...' : 'Upload Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="text-center">
                <p className="text-white/40 text-sm mb-2">
                  Hold {(5000).toLocaleString()} {DJ_TOKEN_CONFIG.symbol} to upload
                </p>
                <Link
                  href={`https://app.uniswap.org/swap?chain=base&outputCurrency=${DJ_TOKEN_CONFIG.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 text-sm hover:underline"
                >
                  Get {DJ_TOKEN_CONFIG.symbol} →
                </Link>
              </div>
            )
          ) : (
            <WalletConnect />
          )}
        </div>

        {uploadError && (
          <p className="text-red-400 text-sm mt-4">{uploadError}</p>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="mx-auto max-w-[1960px] p-4">
        {isLoading ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="mb-4 break-inside-avoid rounded-lg bg-white/5 animate-pulse"
                style={{ height: `${200 + (i % 3) * 100}px` }}
              />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">No photos yet</h2>
            <p className="text-white/40 mb-8">Be the first to share a moment</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group mb-4 break-inside-avoid cursor-zoom-in"
                onClick={() => openModal(image, index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openModal(image, index)}
              >
                <div className="relative overflow-hidden rounded-lg bg-white/5">
                  <Image
                    src={image.secure_url || '/logo.png'}
                    alt={`Gallery image ${index + 1}`}
                    width={image.width}
                    height={image.height}
                    className="transform transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAQMDBAMBAAAAAAAAAAAAAQIDBAAFEQYSITETQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAQEBAAAAAAAAAAAAAAAAAQIRITH/2gAMAwEAAhEDEEEQA/KpZLtdLY7GW7PnPtNqUQG1OKKd4xxjPWKr0UtZSlCBgAYApSnZo0f/2Q=="
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    unoptimized
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-12 text-center">
        <p className="text-white/30 text-sm">
          Powered by{' '}
          <Link href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
            Cloudinary
          </Link>
          {' '}&{' '}
          <Link href="https://base.org" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
            Base
          </Link>
        </p>
      </footer>

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Image details"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />

          {/* Close button */}
          <button
            onClick={closeModal}
            aria-label="Close modal"
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation - Previous */}
          {selectedIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('prev');
              }}
              aria-label="Previous image"
              className="absolute left-4 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Navigation - Next */}
          {selectedIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('next');
              }}
              aria-label="Next image"
              className="absolute right-4 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Image */}
          <div
            className="relative z-40 max-w-[90vw] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage.secure_url || '/logo.png'}
              alt={`Full screen view of image ${selectedIndex + 1}`}
              width={selectedImage.width}
              height={selectedImage.height}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              priority
              unoptimized
            />
          </div>
        </div>
      )}
    </main>
  );
}
