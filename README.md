<div align="center">

# 📻 baseFM

**Onchain Radio for the Base Ecosystem**

Live DJs · Crypto Tipping · Token-Gated Access · Onchain Events

![baseFM Banner](https://raw.githubusercontent.com/Eskyee/baseFM/main/public/og-image.png)

[![CI](https://github.com/Eskyee/baseFM/actions/workflows/ci.yml/badge.svg)](https://github.com/Eskyee/baseFM/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

**Live:** [basefm.space](https://basefm.space) · **Shop:** [shop.basefm.space](https://shop.basefm.space) · **Guide:** [/guide](https://basefm.space/guide)

</div>

---

## 🎤 Join the Community

baseFM is a community-owned radio station built on Base. DJs stream live, listeners tip in crypto, and everyone owns a piece of the culture.

**We're not a platform. We're a scene.**

### 🎧 Listen

- **Tune in live** at [basefm.space](https://basefm.space) — jungle, dub, drum & bass, electronic
- **Push notifications** — get alerted when your favourite DJ goes live
- **Chat in real-time** during streams
- **Tip your DJ** — ETH, USDC, RAVE, cbBTC straight to their wallet

### 🎚️ DJ

- **Stream live** from OBS — RTMP in, HLS out, global CDN
- **Your own profile** — stats, followers, banner, bio
- **Get paid directly** — tips go straight to your wallet, no middleman
- **Show archives** — automatic recording and playback
- **Weekly schedule** — lock in your recurring timeslot

[Apply to DJ →](https://basefm.space/guide)

### 🏗️ Build

baseFM is open source. We welcome contributors of all levels.

```bash
git clone https://github.com/Eskyee/baseFM.git
cd baseFM
npm install
cp .env.example .env.local
npm run dev
```

See the [Developer Guide](#-developer-guide) below for setup details.

### 🎫 Events

- **Community events** — listings, parties, and shows
- **Onchain tickets** — buy with USDC, verify with your wallet
- **Promoter tools** — crew management, POS, check-in, Slack notifications
- **35+ production roles** — from stage manager to sound engineer

### 🪙 Token

- **$RAVE** — 5,000+ tokens for DJ-gated community access
- **Show NFTs** — mint recordings as collectibles
- **Direct payments** — tips and tickets go straight to wallets

[Get $RAVE →](https://base.meme/coin/base:0x1DBf2954FFEC96a333ae20F00c0bC40471ad8888)

---

## 🤝 Contributing

We want your help. Seriously.

**Good first issues** — check the [issues tab](https://github.com/Eskyee/baseFM/issues) for beginner-friendly tasks.

**How to contribute:**
1. Fork the repo
2. Create a branch: `git checkout -b feature/amazing`
3. Make your changes
4. Push and open a PR

**What we need help with:**
- UI/UX improvements
- Mobile experience
- Chat moderation tools
- Genre filtering and search
- Analytics dashboards
- Documentation
- Testing

**Code style:** TypeScript, Tailwind CSS, Next.js App Router. Check [CLAUDE.md](./CLAUDE.md) for full conventions.

---

## 📖 What's Inside

### For Listeners
| Feature | Description |
|---------|-------------|
| Live Streaming | RTMP → HLS via Mux, global CDN |
| Show Archives | Automatic recording and playback |
| Live Chat | Real-time during streams (Supabase) |
| Multi-Token Tips | ETH, USDC, RAVE, cbBTC |
| Follow System | Track your favourite DJs |
| Push Notifications | Never miss a live show |
| PWA | Install as app on iOS/Android |

### For DJs
| Feature | Description |
|---------|-------------|
| Streaming Dashboard | Start/stop, OBS credentials, stats |
| DJ Profiles | Bio, banner, socials, follower count |
| Weekly Schedule | Lock in recurring timeslots |
| DJ of the Day | Featured artist spotlight |
| Direct Wallet | Tips arrive in your wallet instantly |

### For Promoters
| Feature | Description |
|---------|-------------|
| Event Management | Create events, sell tickets, manage attendees |
| Onchain Tickets | USDC payments, wallet verification |
| Crew Dashboard | 35+ roles, check-in, notifications |
| POS System | QR payment generation + ticket scanner |
| Accounting | Revenue tracking with GBP conversion |

### For Developers
| Feature | Description |
|---------|-------------|
| CI/CD | GitHub Actions (lint, test, build) |
| Tests | 55+ unit tests with Vitest |
| TypeScript | Full type safety |
| OnchainKit | Base names, avatars, wallet auth |

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (Postgres + Realtime) |
| Streaming | Mux (RTMP → HLS) |
| Blockchain | Base (wagmi, viem, OnchainKit) |
| Styling | Tailwind CSS |
| Language | TypeScript |

---

## 🔧 Developer Guide

### Environment Setup

```bash
cp .env.example .env.local
```

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

### Database Setup

Run these SQL files in Supabase SQL Editor (in order):

1. `supabase/schema-djs.sql` - DJ profiles
2. `supabase/schema-schedule.sql` - Weekly schedule
3. `supabase/schema-members.sql` - Community directory
4. `supabase/schema-chat.sql` - Live chat
5. `supabase/schema-notifications.sql` - Favorites + push
6. `supabase/schema-tips.sql` - Tips tracking
7. `supabase/schema-nfts.sql` - NFT collectibles

Enable Realtime for `chat_messages` table in Supabase dashboard.

### Project Structure

```
baseFM/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # DJ dashboard
│   ├── djs/               # DJ profiles
│   ├── events/            # Community events
│   └── community/         # Token-gated directory
├── components/            # React components
├── lib/                   # Utilities
│   ├── db/               # Database functions
│   ├── mux/              # Mux API client
│   └── supabase/         # Supabase client
├── supabase/             # SQL schema files
└── public/               # Static assets + PWA
```

### Architecture

```
┌─────────────────────────────────────────────────┐
│                Vercel (Next.js)                 │
│  ┌─────────────┐         ┌─────────────────┐   │
│  │  API Routes │────────▶│    Supabase     │   │
│  └──────┬──────┘         └─────────────────┘   │
│         │ RTMP                                  │
│         ▼                                       │
│  ┌─────────────┐     ┌──────────────┐          │
│  │     Mux     │────▶│   Webhooks   │          │
│  └──────┬──────┘     └──────────────┘          │
│         ▼ HLS                                   │
│  ┌─────────────┐                               │
│  │  Listeners  │                               │
│  └─────────────┘                               │
│  ┌─────────────┐         ┌─────────────┐       │
│  │    Base     │◀───────▶│  OnchainKit │       │
│  └─────────────┘         └─────────────┘       │
└─────────────────────────────────────────────────┘
```

---

## 📬 Links

- **Live:** [basefm.space](https://basefm.space)
- **Shop:** [shop.basefm.space](https://shop.basefm.space)
- **GitHub:** [Eskyee/baseFM](https://github.com/Eskyee/baseFM)
- **Issues:** [github.com/Eskyee/baseFM/issues](https://github.com/Eskyee/baseFM/issues)
- **RaveCulture:** [base.app/profile/raveculture](https://base.app/profile/raveculture)

## License

MIT

---

<div align="center">

Built with love by [RaveCulture](https://base.app/profile/raveculture) for Base Builders

📻 Keep the signal alive

Built with ❤️ by the community, for the community.

</div>
