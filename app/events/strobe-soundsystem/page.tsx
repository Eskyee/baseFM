'use client';

import Link from 'next/link';

interface LineupSlot {
  artist: string;
  genre: string;
  isLive?: boolean;
  isAV?: boolean;
  isSecret?: boolean;
  isSpecial?: boolean;
}

interface Stage {
  name: string;
  subtitle?: string;
  hostedBy?: string;
  lineup: LineupSlot[];
}

const EVENT_DATA: {
  title: string;
  subtitle: string;
  date: string;
  venue: string;
  ticketUrl: string;
  description: string;
  ticketBonus: string;
  headliners: { name: string; description: string; link: string; linkType: string }[];
  stages: Stage[];
} = {
  title: 'STROBE SOUNDSYSTEM LAUNCHES',
  subtitle: '16 Stacks: 2 Areas: Dub to Live Techno & Drum & Bass',
  date: 'Coming Soon',
  venue: '360 Warehouse',
  ticketUrl: 'https://ra.co/events/2334343',
  description: 'Each system presents a journey through rave history with veterans and cutting edge music from every genre, from dub to techno to drum & bass.',
  ticketBonus: 'Tickets purchased up until 31st Jan come with a commemorative launch gold 40mm custom necklace with the soundsystem logo designed by the founder, Fresh Lov3.',
  headliners: [
    {
      name: 'SAYTEK LIVE',
      description: '100% Live Techno',
      link: 'https://www.youtube.com/watch?v=ZwiYMCkxPFk',
      linkType: 'YouTube',
    },
    {
      name: 'JAH SCOOP',
      description: 'DUB REGGAE ACID TECHNO',
      link: 'https://soundcloud.com/the-geezer/jah-scoop-live-on-off-the-rails-illusive-2019',
      linkType: 'SoundCloud',
    },
    {
      name: 'ORIGINAL DUBMAN',
      description: "Jah Shaka's MC in the 70s • Championz League Selectors",
      link: 'https://www.facebook.com/ChampsLeagueSelectors',
      linkType: 'Facebook',
    },
  ],
  stages: [
    {
      name: '360 WAREHOUSE AUDIOVISUAL SYSTEM',
      lineup: [
        { artist: 'Original Dubman', genre: 'Roots Dub' },
        { artist: 'Zeb', genre: 'Wavefront Records', isAV: true },
        { artist: 'ROWLAND UK', genre: '', isAV: true },
        { artist: 'KINDRED', genre: 'Melodic', isLive: true },
        { artist: 'Rebecca Gough', genre: 'DJ Set' },
        { artist: 'Fresh Lov3', genre: '', isLive: true, isAV: true },
        { artist: 'SECRET HEADLINER', genre: '', isSecret: true },
        { artist: 'Jah Scoop', genre: 'Reggae Acid Techno' },
        { artist: 'Saytek', genre: 'Live Techno', isLive: true },
      ],
    },
    {
      name: 'SYSTEM 2',
      subtitle: 'Roots to Drum & Bass',
      hostedBy: 'MC Tempo',
      lineup: [
        { artist: 'K0TTI', genre: 'Minimal' },
        { artist: 'COMPETITION WINNER', genre: '', isSpecial: true },
        { artist: 'Medeea Haruki', genre: 'Melodic' },
        { artist: 'DJ Toilette', genre: 'Melodic' },
        { artist: 'Nosa', genre: '' },
        { artist: 'Alex Hexxen', genre: 'Esoteric / Collide' },
        { artist: 'Mr. Clottey', genre: 'UK Garage' },
        { artist: 'Rosie Flow', genre: 'DNB', isLive: true },
        { artist: 'Digital Pilgrimz', genre: '' },
        { artist: 'Serkus', genre: 'DNB & Jungle' },
        { artist: 'Soundwave Travellers', genre: 'Free Party DNB/140' },
      ],
    },
  ],
};

export default function StrobeSoundsystemPage() {
  return (
    <div className="min-h-screen bg-black pb-24 safe-area-all">
      {/* Hero Section */}
      <div className="relative">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-black to-black" />

        {/* Animated Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative max-w-2xl mx-auto px-4 pt-6 pb-8">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#8E8E93] hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </Link>

          {/* Event Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-white text-black text-xs font-bold uppercase rounded-full">
              Launch Event
            </span>
            <span className="px-3 py-1 bg-[#2C2C2E] text-[#8E8E93] text-xs font-medium rounded-full">
              16 Stacks
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
            {EVENT_DATA.title}
          </h1>
          <p className="text-[#8E8E93] text-lg mb-6">
            {EVENT_DATA.subtitle}
          </p>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-white">
              <svg className="w-5 h-5 text-[#8E8E93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">{EVENT_DATA.venue}</span>
            </div>
          </div>

          {/* CTA Button */}
          <a
            href={EVENT_DATA.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black rounded-2xl font-bold text-base transition-all hover:bg-[#E5E5E5] active:scale-[0.98] touch-target"
          >
            <span>Get Tickets</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          {/* Ticket Bonus */}
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-2xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <p className="text-yellow-200/90 text-sm leading-relaxed">
                {EVENT_DATA.ticketBonus}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-2xl mx-auto px-4 mb-8">
        <p className="text-[#8E8E93] text-base leading-relaxed">
          {EVENT_DATA.description}
        </p>
      </div>

      {/* Featured Artists */}
      <div className="max-w-2xl mx-auto px-4 mb-8">
        <h2 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-4">
          Featured Artists
        </h2>
        <div className="space-y-3">
          {EVENT_DATA.headliners.map((artist) => (
            <a
              key={artist.name}
              href={artist.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-[#1C1C1E] rounded-2xl hover:bg-[#2C2C2E] transition-all active:scale-[0.98] group"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base truncate">
                  {artist.name}
                </h3>
                <p className="text-[#8E8E93] text-sm truncate">
                  {artist.description}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <span className="px-2.5 py-1 bg-[#2C2C2E] group-hover:bg-[#3C3C3E] text-[#8E8E93] text-xs font-medium rounded-lg transition-colors">
                  {artist.linkType}
                </span>
                <svg className="w-5 h-5 text-[#8E8E93] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Lineups */}
      {EVENT_DATA.stages.map((stage, stageIndex) => (
        <div key={stage.name} className="max-w-2xl mx-auto px-4 mb-8">
          {/* Stage Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${stageIndex === 0 ? 'bg-purple-500' : 'bg-green-500'}`} />
            <div>
              <h2 className="text-white font-bold text-lg">
                {stage.name}
              </h2>
              {stage.subtitle && (
                <p className="text-[#8E8E93] text-sm">{stage.subtitle}</p>
              )}
            </div>
          </div>

          {stage.hostedBy && (
            <p className="text-[#8E8E93] text-xs mb-4 pl-6">
              Hosted sensitively by <span className="text-white font-medium">{stage.hostedBy}</span>
            </p>
          )}

          {/* Artist List */}
          <div className="space-y-1">
            {stage.lineup.map((slot, index) => (
              <div
                key={`${slot.artist}-${index}`}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  slot.isSecret
                    ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30'
                    : 'hover:bg-[#1C1C1E]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold truncate ${
                      slot.isSecret ? 'text-purple-300' : 'text-white'
                    }`}>
                      {slot.artist}
                    </span>
                    {slot.isLive && (
                      <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase rounded">
                        Live
                      </span>
                    )}
                    {slot.isAV && (
                      <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase rounded">
                        AV
                      </span>
                    )}
                    {slot.isSpecial && (
                      <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase rounded">
                        TBA
                      </span>
                    )}
                  </div>
                  {slot.genre && (
                    <p className="text-[#636366] text-xs mt-0.5 truncate">
                      {slot.genre}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Bottom CTA */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <a
          href={EVENT_DATA.ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black rounded-2xl font-bold text-base transition-all hover:bg-[#E5E5E5] active:scale-[0.98] touch-target"
        >
          <span>Get Tickets on RA</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        {/* Share Links */}
        <div className="flex justify-center gap-4 mt-6">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('STROBE SOUNDSYSTEM LAUNCHES - 16 Stacks: Dub to Live Techno & DNB')}&url=${encodeURIComponent(EVENT_DATA.ticketUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-[#1C1C1E] rounded-xl hover:bg-[#2C2C2E] transition-colors active:scale-[0.97]"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href={`https://warpcast.com/~/compose?text=${encodeURIComponent('STROBE SOUNDSYSTEM LAUNCHES\n\n16 Stacks: 2 Areas: Dub to Live Techno & DNB\n\nFeaturing SAYTEK LIVE, JAH SCOOP, ORIGINAL DUBMAN and more\n\n' + EVENT_DATA.ticketUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-[#1C1C1E] rounded-xl hover:bg-[#2C2C2E] transition-colors active:scale-[0.97]"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.24 4.315l-6.24 15.63-2.385-6.15L3.465 11.4l14.775-7.085zm.255-.63L3.21 10.77a.75.75 0 00-.135 1.29l6.855 2.67 2.67 6.855a.75.75 0 001.29-.135l7.085-14.775a.75.75 0 00-.93-.99z"/>
            </svg>
          </a>
        </div>

        <p className="text-center text-[#636366] text-xs mt-6">
          Powered by baseFM
        </p>
      </div>
    </div>
  );
}
