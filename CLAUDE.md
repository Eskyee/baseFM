# baseFM - Complete Project Guide for Claude

## What is this?
baseFM is an onchain radio platform on Base (chain ID 8453). DJs stream live music, listeners tune in, and everything is powered by crypto wallets and the RAVE token. Think of it as a decentralized internet radio station with built-in community, tipping, and NFT features.

**Live site:** basefm.space
**Shop:** shop.basefm.space (Shopify - external, do NOT internalize)
**Owner:** Solo dev, tests on iPhone in PWA app mode
**Repo:** Private, GitHub (Eskyee/baseFM)

## Tech Stack
| Layer | Tech | Notes |
|-------|------|-------|
| Framework | Next.js 14 App Router | TypeScript, `@/*` path alias |
| Styling | Tailwind CSS | base-blue: #0052FF, base-dark: #0A0B0D |
| Chain | Base mainnet (8453) | Coinbase Smart Wallet only |
| Wallet | wagmi v2 + @coinbase/onchainkit | No MetaMask |
| Streaming | Mux | RTMP in, HLS out, webhooks |
| Database | Supabase | Postgres + Realtime + RLS |
| Images | Cloudinary | CDN + transforms |
| Hosting | Vercel | Auto-deploy from main |
| Shop | Shopify Storefront API | External at shop.basefm.space |
| Notifications | Web Push (VAPID) + Slack | Optional |
| Testing | Vitest + React Testing Library | `npm run test:run` |

## Key Tokens

### RAVE (Community Token)
```
Address:  0xdf3c79a5759eeedb844e7481309a75037b8e86f5
Chain:    Base (8453)
Decimals: 18
Symbol:   RAVE
Name:     RaveCulture
```
- **5,000 RAVE** = community access + DJ streaming
- **1B RAVE** = premium tier (custom token gating)
- Config: `lib/token/config.ts`

### USDC (Payments)
```
Address:  0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
Chain:    Base (8453)
Decimals: 6
Symbol:   USDC
```
- Used for ticket purchases (direct to promoter wallets)
- Used for tipping DJs

## Project Structure
```
app/                          # Next.js pages (App Router)
  page.tsx                    # Homepage (redesigned - compact, mobile-first)
  wallet/page.tsx             # Wallet balances, buy crypto, swap, RAVE chart
  community/page.tsx          # Token-gated community (5000 RAVE)
  dashboard/                  # DJ dashboard
    page.tsx                  #   Stream management
    create/page.tsx           #   Create new stream
    profile/page.tsx          #   Edit DJ profile
    analytics/page.tsx        #   View stats
    stream/[id]/page.tsx      #   Stream control panel
  stream/[id]/page.tsx        # Live stream viewer (HLS player + chat)
  schedule/page.tsx           # Show schedule
  djs/                        # DJ profiles
    page.tsx                  #   All DJs list
    [slug]/page.tsx           #   Individual DJ profile
  gallery/page.tsx            # Photos & collectibles (token-gated)
  archive/                    # Past shows
    page.tsx                  #   Archive list
    [id]/page.tsx             #   Individual recording
  shop/                       # Shop pages
    page.tsx                  #   Product listing
    [handle]/page.tsx         #   Product detail
  events/                     # Event pages
    page.tsx                  #   Events listing (upcoming/past)
    [slug]/page.tsx           #   Event detail + ticket purchase
  guide/page.tsx              # Beginner user guide (9 sections)
  messages/page.tsx           # DMs (wallet-to-wallet)
  agency/page.tsx             # Booking & partnerships
  bookings/page.tsx           # Booking form
  services/page.tsx           # Services offered
  promoters/page.tsx          # Promoter info
  collect/page.tsx            # NFT collection
  shows/[slug]/page.tsx       # Individual show page
  pos/page.tsx                 # POS payment QR + ticket scanner
  promoter/page.tsx             # Promoter crew management dashboard
  admin/                      # Admin panel (ADMIN_WALLET_ADDRESS env var)
    page.tsx                  #   Admin dashboard
    djs/page.tsx              #   Manage DJs
    schedule/page.tsx         #   Manage schedule
    community/page.tsx        #   Manage members
    crew/page.tsx             #   Full crew management (all events)
    accounting/page.tsx       #   Revenue tracking + GBP conversion

components/                   # Shared components
  Navbar.tsx                  # Fixed top nav (PWA safe-area aware, compact mobile)
  AppShell.tsx                # Layout wrapper with navbar spacer + player context
  WalletConnect.tsx           # Wallet button (avatar on mobile, full on desktop)
  AudioPlayer.tsx             # HLS audio player
  PersistentPlayer.tsx        # Fixed bottom player bar
  LiveChat.tsx                # Realtime chat (Supabase subscriptions)
  LiveShowCard.tsx            # Show card (featured/compact/carousel variants)
  StreamCard.tsx              # Stream listing card
  ScheduleBlock.tsx           # Schedule time slot + DaySelector
  ShareApp.tsx                # Social share (inline/compact/full variants)
  TipButton.tsx               # Tip DJs (ETH, USDC, RAVE, cbBTC)
  TicketPurchase.tsx          # Event ticket purchase with USDC
  CollectibleCard.tsx         # NFT mint card
  TokenGate.tsx               # Token-gated content wrapper
  FollowButton.tsx            # Follow DJ + push notification opt-in
  ChatModeration.tsx          # Mod tools (delete, timeout, ban)
  ListenerCount.tsx           # Live listener count with polling
  ErrorBoundary.tsx           # React error boundary
  BaseAd.tsx                  # Base network promo
  Footer.tsx                  # App footer
  SplashScreen.tsx            # Loading splash (800ms min)
  PageTransition.tsx          # Smooth page transitions with fade animation
  UpdateBanner.tsx            # Service worker update notification banner
  providers/
    OnchainProvider.tsx       # Root: WagmiProvider + OnchainKit + ReactQuery
  shop/
    CartButton.tsx            # Floating cart button with badge
    CartDrawer.tsx            # Cart sidebar drawer
    ProductCard.tsx           # Product card with onchain perk badges
  ui/
    Skeleton.tsx              # Loading skeletons (Stream, DJ, Schedule, Profile)

hooks/                        # Custom React hooks
  useDJAccess.ts              # Check RAVE balance for DJ access
  useTokenGate.ts             # Check token balance for stream gating
  useStream.ts                # Single stream with realtime updates
  useStreams.ts               # Multiple streams + useLiveStreams() helper
  useServiceWorker.ts         # Cache management + update detection

lib/                          # Server & shared utilities
  admin/config.ts             # Admin wallet list from env
  auth/wallet.ts              # Wallet signature verification (viem)
  cloudinary.ts               # Cloudinary SDK + URL helpers
  db/                         # Database CRUD
    djs.ts                    #   DJ profiles
    members.ts                #   Community members
    schedule.ts               #   Schedule slots
    streams.ts                #   Stream management
    tickets.ts                #   Ticket purchases (USDC payments)
    crew.ts                   #   Event crew management (35+ roles)
  onchain/minter.ts           # Server-side token minting (ERC20/721/1155)
  schedule.ts                 # Schedule formatting utilities
  shopify/
    cart-context.tsx           # React Context for cart state
    config.ts                 # Shopify config + onchain tag parsing
    order-processor.ts        # Order processing with perk minting
    storefront.ts             # GraphQL Storefront API client
  slack/webhook.ts            # Slack notifications
  streaming/mux.ts            # Mux API (create/delete/status/thumbnails)
  supabase/client.ts          # Supabase client (anon + service role)
  token/
    config.ts                 # RAVE token config
    tip-config.ts             # Tip tokens (ETH, USDC, RAVE, cbBTC)
    tokenGate.ts              # Token balance checking via viem
  viem/client.ts              # Viem public client for Base

public/
  sw.js                       # Service worker - BUMP CACHE_VERSION on big releases
  manifest.json               # PWA manifest
  logo.png                    # App logo
  icon-192.png, icon-32.png   # PWA icons

supabase/                     # Database schemas (13 files)
  schema-bookings.sql         # Booking inquiries
  schema-chat.sql             # Live chat messages (realtime enabled)
  schema-crew.sql             # Event crew members (35+ production roles)
  schema-djs.sql              # DJ profiles
  schema-members.sql          # Community members (token-gated visibility)
  schema-moderation.sql       # Bans, timeouts, deleted messages
  schema-nfts.sql             # Show NFTs and mints
  schema-notifications.sql    # Favorites + push subscriptions
  schema-schedule.sql         # Weekly schedule slots
  schema-shop.sql             # Shopify orders + onchain entitlements
  schema-social.sql           # Connections, DMs, group chats
  schema-tickets.sql          # Event tickets + purchases (USDC)
  schema-tips.sql             # Tip tracking

__tests__/                    # Unit tests (55+ tests)
  lib/
    tip-config.test.ts        # Tip token configuration tests
    tickets.test.ts           # Ticket system tests
  utils/
    test-utils.tsx            # Mock data, render helpers, Supabase mocks
```

## API Routes (50+ total)
```
# Streaming (core)
GET/POST   /api/streams              # List/create streams
GET/PATCH/DELETE /api/streams/[id]   # Manage individual stream
POST       /api/streams/[id]/setup-mux    # Generate Mux RTMP credentials
POST       /api/streams/[id]/start        # Start stream
POST       /api/streams/[id]/stop         # Stop stream
POST       /api/streams/[id]/check-status # Check Mux status
GET        /api/streams/live              # Get all live streams

# DJs
GET/POST   /api/djs                  # List/create DJ profiles
GET/PATCH  /api/djs/[slug]           # Get/update DJ by slug
GET/PUT    /api/djs/me               # Current DJ profile

# Community & Social
GET/POST   /api/community            # List members / join
GET/POST/DELETE /api/connections      # Follow/unfollow
GET/POST   /api/conversations        # DM and group chats
GET/POST/PATCH/DELETE /api/messages   # Direct messages

# Content
GET/POST   /api/chat                 # Live chat (rate limited: 10/min)
GET/POST   /api/gallery              # Cloudinary images
GET/POST   /api/schedule             # Schedule slots
GET/PATCH/DELETE /api/schedule/[id]   # Individual slot
GET        /api/archive              # Past shows
GET        /api/archive/[id]         # Individual recording

# Commerce
GET/POST   /api/tips                 # Tipping
GET/POST   /api/nfts                 # Show NFTs
POST       /api/nfts/mint            # Record mint
GET        /api/shop/products        # Shopify products
GET        /api/shop/products/[handle]
GET/POST/PATCH/DELETE /api/shop/cart  # Shopping cart
GET/POST   /api/shop/claim           # Onchain perk claims

# Events & Tickets
GET        /api/events               # List events (upcoming/past)
GET        /api/events/[slug]        # Event details
POST       /api/events               # Submit event
GET        /api/tickets              # Get tickets for event (?eventId=xxx)
POST       /api/tickets              # Create ticket tier
POST       /api/tickets/purchase     # Record purchase after USDC payment
GET        /api/tickets/purchase     # Check ticket ownership (?wallet=xxx&eventId=xxx)

# Crew Management
GET        /api/crew                 # Get crew (?eventId=xxx)
POST       /api/crew                 # Add crew member
DELETE     /api/crew                 # Remove crew (?id=xxx)
PATCH      /api/crew                 # Update crew (check-in, role)
POST       /api/crew/notify          # Send Slack notification to crew

# System
GET        /api/token/check          # Check token balance
GET        /api/analytics            # DJ analytics
GET/POST   /api/viewers              # Viewer count tracking
GET/POST   /api/moderation           # Chat moderation
POST/DELETE /api/push/subscribe      # Push notifications
POST       /api/bookings             # Booking inquiries (→ Slack)
GET/POST   /api/admin/*              # Admin operations

# Webhooks
POST       /api/webhooks/mux         # Mux stream events
POST       /api/webhooks/shopify     # Shopify orders → onchain perks
POST/GET   /api/webhooks/farcaster   # Farcaster frames
GET        /api/.well-known/farcaster # Farcaster manifest
```

## Environment Variables
```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mux Streaming (required)
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_WEBHOOK_SECRET=

# Base Network
NEXT_PUBLIC_BASE_CHAIN_ID=8453
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# OnchainKit (optional)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=

# Push Notifications (optional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# App
NEXT_PUBLIC_APP_URL=https://basefm.space
ADMIN_WALLET_ADDRESS=              # Comma-separated admin wallets
```

## Important Patterns & Rules

### PWA / Mobile (CRITICAL)
- Navbar MUST be `fixed` positioned (not sticky) - sticky breaks iOS PWA
- Uses `env(safe-area-inset-top)` for notch/dynamic island
- CSS var `--navbar-height` + `.navbar-spacer` div in AppShell for content offset
- Always design mobile-first, test at iPhone width
- Service worker (`public/sw.js`) caches aggressively - bump `CACHE_VERSION` after big UI changes
- Current cache version: v4
- UpdateBanner component shows when new version available
- useServiceWorker hook for cache management

### Wallet / Web3
- Coinbase Smart Wallet ONLY (configured in OnchainProvider.tsx)
- OnchainKit `Identity`, `Avatar`, `Name` for wallet display
- `useBalance` for ETH, `useBalance({ token })` for ERC-20 (RAVE)
- `useReadContract` with balanceOf ABI for manual token checks
- Mobile wallet display: avatar only (no text), see WalletConnect.tsx

### Streaming Flow
```
DJ creates stream → /api/streams POST
DJ sets up Mux   → /api/streams/[id]/setup-mux (gets RTMP key)
DJ starts stream → Connects OBS/Larix to Mux RTMP URL
Mux sends webhook → /api/webhooks/mux (stream.active)
Listeners watch  → HLS via Mux playback URL
DJ stops         → /api/streams/[id]/stop
```

### Database
- All CRUD goes through `lib/db/*.ts` helpers
- Supabase Realtime enabled on: chat_messages, streams, direct_messages
- RLS (Row Level Security) enforced on all tables
- Server operations use `createServerClient()` with service role key

### External Links (DO NOT CHANGE)
- Shop: `https://shop.basefm.space` (external Shopify - owner explicitly wants this)
- Buy crypto: `https://www.coinbase.com/buy`
- Swap: `https://app.uniswap.org/#/swap?chain=base&outputCurrency={RAVE_ADDRESS}`
- RAVE chart: GeckoTerminal embed on wallet page

### Tipping
- Supports 4 tokens: ETH, USDC, RAVE, cbBTC
- Config in `lib/token/tip-config.ts`
- iOS-style bottom sheet UI in TipButton.tsx
- Tips recorded in Supabase with tx hash

### Ticket Purchases (like dice.fm but onchain)
```
User selects event → /events/[slug]
Selects ticket tier → TicketPurchase component
Pays with USDC → wagmi useWriteContract (ERC20 transfer)
USDC goes direct to promoter wallet → no middleman
Transaction confirmed → POST /api/tickets/purchase records it
Ticket ownership → GET /api/tickets/purchase?wallet=xxx&eventId=xxx
```
- Direct wallet-to-wallet payments
- No platform fees on ticket sales
- Promoter receives full ticket price

## Git Workflow
```
1. Claude builds on claude/* branch
2. Push triggers auto-PR workflow (.github/workflows/auto-pr.yml)
3. CI runs: TypeScript → Lint → Tests → Build (.github/workflows/ci.yml)
4. Vercel auto-deploys preview URL
5. Owner reviews on iPhone, checks preview
6. Owner squash-merges PR to main on GitHub
7. Vercel deploys main to production (basefm.space)
```
- **Never push directly to main**
- **Default branch is main** (not a claude/ branch)
- PR template at `.github/pull_request_template.md`

## Commands
```bash
npm run dev          # Local dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm run test:run     # Run tests once (Vitest)
npm run test         # Run tests in watch mode
```

## Testing Infrastructure
- **Framework**: Vitest with jsdom environment
- **Coverage**: V8 provider, reports in text/json/html
- **Tests**: 55+ unit tests covering:
  - Tip token configuration
  - Ticket purchase calculations
  - Token amount conversions
  - Availability logic
  - Transaction hash validation
- **Setup**: `vitest.setup.tsx` mocks Next.js router, Image, wagmi hooks
- **Helpers**: `__tests__/utils/test-utils.tsx` provides mock data and render utilities

## CI/CD Pipeline
`.github/workflows/ci.yml` runs on push to main and claude/* branches:
1. **Lint Job** - ESLint checks
2. **Test Job** - Vitest with coverage (parallel with lint)
3. **Build Job** - Next.js production build (after lint+test pass)

Features:
- Parallel job execution for speed
- Coverage reporting to Codecov
- Concurrency control (cancels stale runs)
- Node 20, npm caching

## Lessons Learned (from building sessions)
1. **Sticky navbar breaks iOS PWA** - Must use `fixed` + spacer div
2. **Coinbase Pay URLs need registered appId** - Use `coinbase.com/buy` instead
3. **Service worker caches old builds** - Bump CACHE_VERSION after UI changes
4. **Vercel domains must point to Production** - Preview branches get auto `.vercel.app` URLs
5. **DNS: root domain A record must be Vercel** (76.76.21.21) not Shopify (23.227.38.65)
6. **Mobile wallet text overflows** - Show avatar only, no address text on small screens
7. **Owner tests everything on iPhone PWA** - Always prioritize mobile layout
8. **Keep it simple** - No over-engineering, no unnecessary abstractions
9. **Owner wants external shop** - Never internalize the Shopify store link
10. **Vitest setup needs .tsx extension** - When mocking React components, use vitest.setup.tsx not .ts
11. **USDC has 6 decimals** - $25 USDC = 25000000 (use parseUnits from viem)
12. **Events need status: 'approved'** - Past events only show if approved in database
13. **User guide should use simple English** - Teaching noobs, not developers
14. **Keep comments for development** - Owner wants code comments preserved
15. **Gradient buttons look better** - Use `bg-gradient-to-r` for premium styling
16. **Base Wallet not Coinbase** - Use "Base Wallet" branding for decentralized feel
17. **GBP conversion helps UK users** - $1 = ~£0.79, show common amounts
18. **Crew roles are categorized** - Group 35+ roles into Management, FOH, Safety, Technical, etc.
19. **Page transitions improve UX** - 150ms fade with translate-y for smooth navigation
20. **Loading skeletons per page** - Custom skeletons for schedule, events, gallery, DJs, wallet

## Don'ts
- Don't change Shop link to internal (owner explicitly said no)
- Don't use sticky positioning for navbar (breaks iOS PWA)
- Don't forget to bump sw.js CACHE_VERSION after big UI changes
- Don't add emojis to code unless asked
- Don't over-engineer - keep it simple, mobile-first
- Don't use Coinbase Pay API URLs (appId not registered)
- Don't set Vercel custom domains to Preview environment
- Don't change the GitHub default branch away from main

## Project Documentation
- **CLAUDE.md** - This file (AI context and project rules)
- **SOUL.md** - Project journey, vision, timeline, achievements
- **README.md** - Public-facing documentation with features, setup, API routes
- **/guide** - User-facing beginner guide (9 sections including advanced features)

## Key Pages Built
| Page | Purpose | Key Features |
|------|---------|--------------|
| `/guide` | Beginner user guide | 9 sections, simple English, advanced features |
| `/events` | Event listings | Upcoming/past toggle, promoter info |
| `/events/[slug]` | Event detail | Ticket purchase with USDC, direct payments |
| `/wallet` | Token management | Balances, swap, RAVE chart, GBP guide |
| `/community` | Token-gated directory | 5000 RAVE requirement |
| `/pos` | Point of Sale | USDC payment QR, ticket scanner mode |
| `/promoter` | Crew management | Add/remove crew, check-ins, notifications |
| `/admin/crew` | Admin crew panel | Full crew management for all events |
| `/admin/accounting` | Revenue tracking | Ticket sales, tips, GBP conversion guide |

## Future Expansion Notes
- Underground rave culture history knowledge base (for community education)
- DJ analytics dashboard
- Show recordings as NFTs
- Multi-stream support
- Mobile app (React Native)
- DAO governance
