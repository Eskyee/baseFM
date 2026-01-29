'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DJ } from '@/types/dj';
import { Stream } from '@/types/stream';

const DEFAULT_AVATAR = '/logo.png';

export default function DJProfilePage({ params }: { params: { slug: string } }) {
  const [dj, setDJ] = useState<DJ | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch DJ profile
        const djRes = await fetch(`/api/djs/${params.slug}`);
        if (!djRes.ok) {
          throw new Error('DJ not found');
        }
        const djData = await djRes.json();
        setDJ(djData.dj);

        // Fetch DJ's streams
        const streamsRes = await fetch(`/api/streams?djWalletAddress=${djData.dj.walletAddress}`);
        if (streamsRes.ok) {
          const streamsData = await streamsRes.json();
          setStreams(streamsData.streams || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load DJ profile');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-[#1A1A1A] rounded-xl mb-6" />
            <div className="flex gap-6">
              <div className="w-32 h-32 bg-[#1A1A1A] rounded-full" />
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-[#1A1A1A] rounded w-48" />
                <div className="h-4 bg-[#1A1A1A] rounded w-full" />
                <div className="h-4 bg-[#1A1A1A] rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dj) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-4">DJ Not Found</h1>
          <p className="text-[#888] mb-6">{error || 'This DJ profile does not exist'}</p>
          <Link href="/djs" className="text-blue-400 hover:underline">
            Browse all DJs
          </Link>
        </div>
      </div>
    );
  }

  const liveStream = streams.find(s => s.status === 'LIVE');
  const pastStreams = streams.filter(s => s.status === 'ENDED').slice(0, 6);
  const upcomingStreams = streams.filter(s => s.status === 'CREATED' || s.status === 'PREPARING');

  return (
    <div className="min-h-screen pb-20">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-[#1A1A1A]">
        {dj.coverImageUrl ? (
          <Image
            src={dj.coverImageUrl}
            alt={dj.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#0A0A0A] bg-[#1A1A1A]">
              <Image
                src={dj.avatarUrl || DEFAULT_AVATAR}
                alt={dj.name}
                fill
                className={dj.avatarUrl ? 'object-cover' : 'object-contain p-4'}
              />
            </div>

            {/* Info */}
            <div className="flex-1 pt-4 sm:pt-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5]">{dj.name}</h1>
                {dj.isVerified && (
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded">
                    Verified
                  </span>
                )}
                {dj.isResident && (
                  <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-medium rounded">
                    Resident
                  </span>
                )}
              </div>

              {/* Genres */}
              {dj.genres && dj.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {dj.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-1 bg-[#1A1A1A] text-[#888] text-xs rounded"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-6 text-sm mb-4">
                <div>
                  <span className="text-[#F5F5F5] font-semibold">{dj.totalShows}</span>
                  <span className="text-[#888] ml-1">shows</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                {dj.twitterUrl && (
                  <a
                    href={dj.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#1A1A1A] rounded-full hover:bg-[#333] transition-colors"
                  >
                    <svg className="w-5 h-5 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
                {dj.instagramUrl && (
                  <a
                    href={dj.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#1A1A1A] rounded-full hover:bg-[#333] transition-colors"
                  >
                    <svg className="w-5 h-5 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {dj.soundcloudUrl && (
                  <a
                    href={dj.soundcloudUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#1A1A1A] rounded-full hover:bg-[#333] transition-colors"
                  >
                    <svg className="w-5 h-5 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.084-.1zm-.899 1.751l.197 1.453-.197 1.398c-.009.06-.053.101-.101.101-.051 0-.094-.041-.099-.101l-.175-1.398.175-1.453c.005-.065.048-.101.099-.101.048 0 .092.041.101.101zm1.918-3.199c-.061 0-.108.051-.116.108l-.217 3.493.217 3.399c.008.06.055.108.116.108.059 0 .108-.048.116-.108l.252-3.399-.252-3.493c-.008-.058-.057-.108-.116-.108zm.899-.698c-.067 0-.12.058-.126.123l-.209 4.191.209 4.041c.006.066.059.123.126.123.064 0 .117-.057.123-.123l.24-4.041-.24-4.191c-.006-.065-.059-.123-.123-.123zm.901-.263c-.074 0-.133.064-.14.135l-.192 4.454.192 4.217c.007.071.066.135.14.135.073 0 .132-.064.139-.135l.218-4.217-.218-4.454c-.007-.071-.066-.135-.139-.135zm.9-.135c-.08 0-.144.071-.15.15l-.176 4.589.176 4.38c.006.078.07.15.15.15.078 0 .142-.072.15-.15l.199-4.38-.199-4.589c-.008-.079-.072-.15-.15-.15zm.901-.257c-.085 0-.152.078-.159.162l-.167 4.846.167 4.514c.007.085.074.162.159.162.083 0 .15-.077.158-.162l.19-4.514-.19-4.846c-.008-.084-.075-.162-.158-.162zm.9-.221c-.09 0-.164.085-.17.176l-.159 5.067.159 4.66c.006.091.08.176.17.176.089 0 .163-.085.169-.176l.181-4.66-.181-5.067c-.006-.091-.08-.176-.169-.176zm1.801.059c-.097 0-.177.092-.183.191l-.143 4.996.143 4.696c.006.099.086.191.183.191.095 0 .175-.092.181-.191l.163-4.696-.163-4.996c-.006-.099-.086-.191-.181-.191zm.899-.149c-.104 0-.189.099-.195.203l-.134 5.145.134 4.838c.006.105.091.203.195.203.103 0 .188-.098.194-.203l.153-4.838-.153-5.145c-.006-.104-.091-.203-.194-.203zm1.003-.15c-.11 0-.2.106-.206.218l-.133 5.295.133 4.969c.006.112.096.218.206.218.109 0 .199-.106.205-.218l.152-4.969-.152-5.295c-.006-.112-.096-.218-.205-.218zm.898-.15c-.116 0-.212.113-.218.232l-.125 5.445.125 5.106c.006.119.102.232.218.232.114 0 .21-.113.216-.232l.143-5.106-.143-5.445c-.006-.119-.102-.232-.216-.232zm1.804.195c-.123 0-.225.12-.231.247l-.116 5.25.116 5.212c.006.127.108.247.231.247.122 0 .224-.12.23-.247l.132-5.212-.132-5.25c-.006-.127-.108-.247-.23-.247zm.898-.195c-.13 0-.238.127-.244.261l-.107 5.445.107 5.318c.006.134.114.261.244.261.128 0 .236-.127.242-.261l.122-5.318-.122-5.445c-.006-.134-.114-.261-.242-.261zm1.908-.195c.009-.076.032-.15.032-.228 0-.63-.512-1.141-1.143-1.141-.614 0-1.118.494-1.14 1.103-.011-.009-3.883-.011-4.025 0-.135.011-.243.099-.243.236v10.741c0 .135.099.242.233.254.007 0 5.131.001 5.175.001 1.896 0 3.43-1.534 3.43-3.43-.001-1.896-1.535-3.43-3.43-3.536z" />
                    </svg>
                  </a>
                )}
                {dj.mixcloudUrl && (
                  <a
                    href={dj.mixcloudUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#1A1A1A] rounded-full hover:bg-[#333] transition-colors"
                  >
                    <svg className="w-5 h-5 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.27 12c0 1.253-1.015 2.267-2.27 2.267A2.267 2.267 0 0 1 9.73 12c0-1.254 1.016-2.267 2.27-2.267 1.254 0 2.27 1.013 2.27 2.267zM24 12c0 1.988-1.611 3.6-3.6 3.6a3.6 3.6 0 0 1-2.574-1.08c-.837.67-1.896 1.08-3.054 1.08a4.727 4.727 0 0 1-3.545-1.597A4.727 4.727 0 0 1 7.68 15.6c-1.157 0-2.217-.41-3.054-1.08A3.6 3.6 0 0 1 0 12c0-1.988 1.612-3.6 3.6-3.6.636 0 1.232.168 1.752.458a4.73 4.73 0 0 1 2.328-1.858V7a4.8 4.8 0 0 1 4.8-4.8 4.8 4.8 0 0 1 4.8 4.8v.002a4.73 4.73 0 0 1 2.328 1.857A3.575 3.575 0 0 1 20.4 8.4c1.988 0 3.6 1.612 3.6 3.6z" />
                    </svg>
                  </a>
                )}
                {dj.websiteUrl && (
                  <a
                    href={dj.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#1A1A1A] rounded-full hover:bg-[#333] transition-colors"
                  >
                    <svg className="w-5 h-5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {dj.bio && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-3">About</h2>
            <p className="text-[#888] whitespace-pre-line">{dj.bio}</p>
          </div>
        )}

        {/* Live Now */}
        {liveStream && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Live Now
            </h2>
            <Link
              href={`/stream/${liveStream.id}`}
              className="block bg-[#1A1A1A] rounded-lg p-4 hover:bg-[#222] transition-colors"
            >
              <h3 className="text-[#F5F5F5] font-medium">{liveStream.title}</h3>
              {liveStream.genre && (
                <span className="text-[#888] text-sm">{liveStream.genre}</span>
              )}
            </Link>
          </div>
        )}

        {/* Upcoming Shows */}
        {upcomingStreams.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Upcoming Shows</h2>
            <div className="space-y-3">
              {upcomingStreams.map((stream) => (
                <Link
                  key={stream.id}
                  href={`/stream/${stream.id}`}
                  className="block bg-[#1A1A1A] rounded-lg p-4 hover:bg-[#222] transition-colors"
                >
                  <h3 className="text-[#F5F5F5] font-medium">{stream.title}</h3>
                  {stream.scheduledStartTime && (
                    <span className="text-[#888] text-sm">
                      {new Date(stream.scheduledStartTime).toLocaleString()}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Past Shows */}
        {pastStreams.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Past Shows</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {pastStreams.map((stream) => (
                <div
                  key={stream.id}
                  className="bg-[#1A1A1A] rounded-lg overflow-hidden"
                >
                  <div className="aspect-video bg-[#0A0A0A] relative">
                    {stream.coverImageUrl ? (
                      <Image
                        src={stream.coverImageUrl}
                        alt={stream.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image
                          src="/logo.png"
                          alt="baseFM"
                          width={48}
                          height={48}
                          className="opacity-50"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-[#F5F5F5] text-sm font-medium line-clamp-1">
                      {stream.title}
                    </h3>
                    <span className="text-[#666] text-xs">
                      {new Date(stream.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
