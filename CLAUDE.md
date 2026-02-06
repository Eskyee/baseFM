# baseFM - Project Guide for Claude

## What is this?
baseFM is an onchain radio platform on Base (chain ID 8453). DJs stream live music, listeners tune in, and everything is powered by crypto wallets and the RAVE token.

**Live site:** basefm.space
**Shop:** shop.basefm.space (Shopify - external)
**Owner:** Solo dev, tests on iPhone in PWA app mode

## Tech Stack
- **Framework:** Next.js 14 App Router, TypeScript, Tailwind CSS
- **Chain:** Base mainnet (8453) via Coinbase Smart Wallet
- **Wallet:** wagmi v2 + @coinbase/onchainkit
- **Streaming:** Mux (RTMP in, HLS out)
- **Database:** Supabase (Postgres + Realtime)
- **Hosting:** Vercel
- **Shop:** Shopify Storefront API (external at shop.basefm.space)

## Key Token
- **RAVE** (RaveCulture): `0xdf3c79a5759eeedb844e7481309a75037b8e86f5`
- 5,000 RAVE = community access
- 1B RAVE = premium tier (custom token gating)
- Config: `lib/token/config.ts`

## Project Structure
```
app/                    # Next.js pages (App Router)
  page.tsx              # Homepage
  wallet/               # Wallet balances, buy, swap
  community/            # Token-gated community
  dashboard/            # DJ dashboard (create streams)
  stream/[id]/          # Live stream viewer
  schedule/             # Show schedule
  djs/                  # DJ profiles
  gallery/              # Photos & collectibles
  archive/              # Past shows
  shop/                 # Internal shop page
  events/               # Event pages
  admin/                # Admin panel (ADMIN_WALLET_ADDRESS)
  api/                  # API routes (40+)
components/             # Shared components
  Navbar.tsx            # Fixed top nav (PWA safe-area aware)
  AppShell.tsx          # Layout wrapper with navbar spacer
  WalletConnect.tsx     # Wallet connect button (compact on mobile)
  AudioPlayer.tsx       # Bottom audio player bar
  ShareApp.tsx          # Share/social links
lib/                    # Utilities
  token/config.ts       # RAVE token configuration
  supabase/             # Supabase client
public/
  sw.js                 # Service worker (bump CACHE_VERSION on big releases)
  manifest.json         # PWA manifest
```

## Important Patterns

### PWA / Mobile
- Navbar is `fixed` positioned (not sticky) for iOS PWA compatibility
- Uses `env(safe-area-inset-top)` for notch/dynamic island
- CSS var `--navbar-height` + `.navbar-spacer` div for content offset
- Always test layouts at mobile width first
- Service worker caches aggressively - bump `CACHE_VERSION` in `public/sw.js` when deploying big UI changes

### Wallet
- Coinbase Smart Wallet only (no MetaMask)
- OnchainKit `Identity`, `Avatar`, `Name` for displaying wallet info
- `useBalance` for ETH, `useBalance` with `token` param for RAVE
- `useReadContract` with balanceOf ABI for token checks (see community page)

### Streaming
- Mux handles all video: RTMP ingest, HLS playback
- Stream keys are unique per stream (created via API)
- Webhooks at `/api/webhooks/mux`

### External Links
- Shop MUST link to `https://shop.basefm.space` (external Shopify)
- Buy crypto links to `https://www.coinbase.com/buy`
- Uniswap swap URL includes chain=base and outputCurrency

## Git Workflow
- Claude works on `claude/*` branches
- Auto-PR workflow creates PRs to `main` on push
- Owner reviews preview on Vercel, then squash-merges to `main`
- Vercel auto-deploys `main` to production (basefm.space)
- **Never push directly to main**

## Commands
```bash
npm run dev          # Local dev server
npm run build        # Production build
npm run lint         # ESLint
npm run test:run     # Run tests (Vitest)
```

## Don'ts
- Don't change Shop link to internal - owner wants external Shopify
- Don't use sticky positioning for navbar (breaks iOS PWA)
- Don't forget to bump sw.js CACHE_VERSION after big UI changes
- Don't add emojis to code unless asked
- Don't over-engineer - keep it simple, mobile-first
