# baseFM - Onchain Radio Platform

Production-ready streaming platform for Base-native radio. Built by [Eskyee](https://github.com/Eskyee) / [RaveCulture](https://base.app/profile/raveculture) for Base Builders.

**Live:** [basefm.space](https://basefm.space) | 
**Shop:** [shop.basefm.space](https://shop.basefm.space) | **Guide:** [/guide](https://basefm.space/guide)

[![CI](https://github.com/Eskyee/baseFM/actions/workflows/ci.yml/badge.svg)](https://github.com/Eskyee/baseFM/actions/workflows/ci.yml)

## Features


### Core Streaming
- **Live DJ Streaming** - RTMP to HLS via Mux
- **Show Archives** - Automatic recording and playback
- **Weekly Schedule** - Recurring DJ timeslots
- **DJ Profiles** - Professional profiles with stats, followers, banners
- **DJ of the Day** - Featured artist spotlight

### Engagement
- **Live Chat** - Real-time chat during streams (Supabase Realtime)
- **Multi-Token Tipping** - ETH, USDC, RAVE, cbBTC direct to DJ wallets
- **Follow System** - Follow DJs and track favorites
- **Push Notifications** - Browser notifications for live shows
- **Community Threads** - Discussions and posts

### Events & Tickets
- **Event Listings** - Community events and parties
- **Onchain Tickets** - Buy with USDC, pay promoters directly
- **Promoter Profiles** - Collectives, venues, labels
- **Ticket Verification** - Wallet-based entry check
- **POS System** - QR payment generation + ticket scanner for door staff
- **Crew Management** - 35+ production roles for festival organizers

### Promoter Tools (NEW)
- **Crew Dashboard** - Manage event staff and production crew
- **Role Categories** - Management, Front of House, Safety, Technical, Production, Artists, Vendors
- **Check-in System** - Track crew arrivals at events
- **Crew Notifications** - Slack integration for team updates
- **Accounting** - Revenue tracking with GBP conversion guide

### Onchain
- **Wallet Auth** - Base Wallet (no seed phrases!)
- **Token-Gated Community** - 5000+ RAVE token holders
- **Show NFTs** - Mint recordings as collectibles
- **OnchainKit Integration** - Base names, avatars, identity
- **Direct Payments** - Tips and tickets go straight to wallets

### Mobile
- **PWA Support** - Install as app on iOS/Android
- **Responsive Design** - Mobile-first UI
- **Offline Support** - Service worker caching

### Performance (Vercel Pro Optimized)
- **Loading States** - Page-specific skeleton loaders
- **Page Transitions** - Smooth fade animations between pages
- **Smart Caching** - Service worker v4 with cache management
- **Update Notifications** - Banner prompts for new versions
- **Optimized Imports** - Tree-shaking for lucide-react, wagmi, viem
- **Image Optimization** - AVIF/WebP with 30-day cache

### Developer Experience
- **CI/CD Pipeline** - GitHub Actions with lint, test, build
- **Unit Tests** - 55+ tests with Vitest
- **TypeScript** - Full type safety
- **Documentation** - CLAUDE.md, SOUL.md, guides

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (Postgres + Realtime)
- **Streaming**: Mux (RTMP → HLS)
- **Blockchain**: Base (via wagmi, viem, OnchainKit)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/Eskyee/baseFM.git
cd baseFM
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Fill in your values (see [Environment Variables](#environment-variables)).

### 3. Database Setup

Run these SQL files in Supabase SQL Editor (in order):

1. `supabase/schema-djs.sql` - DJ profiles
2. `supabase/schema-schedule.sql` - Weekly schedule
3. `supabase/schema-members.sql` - Community directory
4. `supabase/schema-chat.sql` - Live chat
5. `supabase/schema-notifications.sql` - Favorites + push
6. `supabase/schema-tips.sql` - Tips tracking
7. `supabase/schema-nfts.sql` - NFT collectibles

**Important**: Enable Realtime for `chat_messages` table in Supabase dashboard.

### 4. Run Development

```bash
npm run dev
```

Open http://localhost:3000

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Mux (https://dashboard.mux.com)
MUX_TOKEN_ID=xxxxx
MUX_TOKEN_SECRET=xxxxx
MUX_WEBHOOK_SECRET=xxxxx

# Base Network
NEXT_PUBLIC_BASE_CHAIN_ID=8453
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# OnchainKit (https://portal.cdp.coinbase.com)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=

# Push Notifications (npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Live streams + featured content |
| Guide | `/guide` | Beginner-friendly user guide |
| Schedule | `/schedule` | Weekly DJ schedule |
| Archive | `/archive` | Past broadcasts |
| Collect | `/collect` | NFT collectibles |
| Community | `/community` | Token-gated member directory |
| DJs | `/djs` | DJ profiles listing |
| DJ Profile | `/djs/[slug]` | Individual DJ with stats |
| Events | `/events` | Community events |
| Event Detail | `/events/[slug]` | Event info + tickets |
| Dashboard | `/dashboard` | DJ streaming controls |
| Wallet | `/wallet` | Balances + swap + GBP guide |
| POS | `/pos` | Payment QR + ticket scanner |
| Promoter | `/promoter` | Crew management dashboard |
| Admin Accounting | `/admin/accounting` | Revenue tracking |
| Admin Crew | `/admin/crew` | Full crew management |

## API Routes

### Streams
- `GET /api/streams` - List streams
- `POST /api/streams` - Create stream
- `GET /api/streams/live` - Get live streams
- `POST /api/streams/[id]/start` - Start streaming
- `POST /api/streams/[id]/stop` - Stop streaming

### DJs
- `GET /api/djs` - List all DJs
- `GET /api/djs/[slug]` - Get DJ by slug
- `GET /api/djs/me` - Get current DJ profile
- `PUT /api/djs/me` - Update profile

### Engagement
- `GET/POST /api/chat` - Chat messages
- `GET/POST/DELETE /api/favorites` - Follow DJs
- `GET/POST /api/tips` - Tips
- `GET/POST /api/nfts` - Show NFTs
- `POST /api/nfts/mint` - Record mint

### Community
- `GET/POST /api/community` - Member directory

### Events & Tickets
- `GET /api/events` - List events (upcoming/past)
- `GET /api/events/[slug]` - Event details
- `POST /api/events` - Submit event
- `GET /api/tickets?eventId=xxx` - Get tickets for event
- `POST /api/tickets` - Create ticket tier
- `POST /api/tickets/purchase` - Record purchase after USDC payment
- `GET /api/tickets/purchase?wallet=xxx&eventId=xxx` - Check ticket ownership

### Crew Management
- `GET /api/crew?eventId=xxx` - Get crew for event
- `POST /api/crew` - Add crew member
- `DELETE /api/crew?id=xxx` - Remove crew member
- `PATCH /api/crew` - Update crew (check-in, role change)
- `POST /api/crew/notify` - Send crew notifications via Slack

## DJ Workflow

1. **Connect wallet** on `/dashboard`
2. **Create profile** at `/dashboard/profile`
3. **Create stream** with title and description
4. **Get RTMP credentials** (URL + stream key)
5. **Connect OBS/streaming software**
6. **Go live** - status updates automatically
7. **End stream** - recording saved to archive

## Architecture

```
┌─────────────────────────────────────────────────┐
│                Vercel (Next.js)                 │
│  ┌─────────────┐         ┌─────────────────┐   │
│  │  API Routes │────────▶│    Supabase     │   │
│  │             │         │ Postgres+Realtime│   │
│  └──────┬──────┘         └─────────────────┘   │
│         │                                       │
│         │ RTMP                                  │
│         ▼                                       │
│  ┌─────────────┐     ┌──────────────┐          │
│  │     Mux     │────▶│   Webhooks   │          │
│  │  RTMP→HLS   │     │ Status Sync  │          │
│  └──────┬──────┘     └──────────────┘          │
│         │                                       │
│         ▼ HLS                                   │
│  ┌─────────────┐                               │
│  │  Listeners  │                               │
│  │ (HLS Player)│                               │
│  └─────────────┘                               │
│                                                 │
│  ┌─────────────┐         ┌─────────────┐       │
│  │    Base     │◀───────▶│  OnchainKit │       │
│  │  Mainnet    │         │ Wallet/Auth │       │
│  └─────────────┘         └─────────────┘       │
└─────────────────────────────────────────────────┘
```

## Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

**Post-deploy**: Update Mux webhook URL to `https://your-domain.com/api/webhooks/mux`

---

# Developer Guide

## Project Structure

```
baseFM/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── archive/           # Show archives
│   ├── collect/           # NFT collectibles
│   ├── community/         # Token-gated community
│   ├── dashboard/         # DJ dashboard
│   ├── djs/               # DJ profiles
│   └── schedule/          # Weekly schedule
├── components/            # React components
├── lib/                   # Utilities
│   ├── db/               # Database functions
│   ├── mux/              # Mux API client
│   ├── supabase/         # Supabase client
│   └── viem/             # Viem client
├── types/                 # TypeScript types
├── supabase/             # SQL schema files
└── public/               # Static assets + PWA
```

## Adding New Features

### New Database Table

1. Create schema file: `supabase/schema-[feature].sql`
2. Create types: `types/[feature].ts`
3. Create DB functions: `lib/db/[feature].ts`
4. Create API route: `app/api/[feature]/route.ts`
5. Create page: `app/[feature]/page.tsx`

### New DJ Profile Field

1. Update `types/dj.ts` (DJ, DJRow, CreateDJInput, UpdateDJInput)
2. Update `supabase/schema-djs.sql`
3. Update `lib/db/djs.ts` (createDJ, updateDJ)
4. Update `app/dashboard/profile/page.tsx` (form)
5. Update `app/djs/[slug]/page.tsx` (display)

### New Component

```tsx
// components/MyComponent.tsx
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface MyComponentProps {
  // props
}

export function MyComponent({ }: MyComponentProps) {
  const { address, isConnected } = useAccount();

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-4">
      {/* content */}
    </div>
  );
}
```

## Future Feature Ideas

### Phase 1: Enhanced Streaming
- [ ] Multi-bitrate streaming (ABR)
- [ ] Low-latency mode
- [ ] Screen sharing support
- [ ] Co-streaming (multiple DJs)

### Phase 2: Community
- [ ] User profiles (non-DJ listeners)
- [ ] Chat reactions/emotes
- [ ] Chat moderation tools
- [ ] Private messaging

### Phase 3: Monetization
- [ ] Subscription tiers
- [ ] Paid shows (token gate specific streams)
- [ ] Merchandise integration
- [ ] Sponsorship slots

### Phase 4: Discovery
- [ ] Search functionality
- [ ] Genre filtering
- [ ] Recommendations
- [ ] Trending shows
- [ ] Featured DJs

### Phase 5: Analytics
- [ ] DJ analytics dashboard
- [ ] Listener stats
- [ ] Revenue tracking
- [ ] Show performance metrics

### Phase 6: Integrations
- [ ] External podcast RSS feeds
- [ ] YouTube/Twitch simulcast
- [ ] Calendar sync (Google, Apple)
- [ ] Discord bot notifications
- [ ] Farcaster frames

### Phase 7: Advanced Onchain
- [ ] On-chain DJ reputation
- [ ] Governance (DAO voting)
- [ ] Revenue sharing contracts
- [ ] Dynamic NFT artwork
- [ ] Loyalty rewards (POAP-style)

## Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## Support

- GitHub Issues: https://github.com/Eskyee/baseFM/issues
- RaveCulture: https://base.app/profile/raveculture
- Support Token: https://base.meme/coin/base:0x1DBf2954FFEC96a333ae20F00c0bC40471ad8888

## License

MIT

---

Built with love by RaveCulture for Base Builders
