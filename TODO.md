# baseFM Project Progress & Roadmap

Last updated: February 2026

---

## Current Sprint: Beta Testing

### Priority Tasks
- [ ] Gather beta tester feedback
- [ ] Fix any critical bugs reported
- [ ] Performance optimization for mobile
- [ ] Database migration testing
- [ ] 

---

## Feature Status

### Core Platform (Complete)
- [x] Next.js 14 App Router setup
- [x] Tailwind CSS styling with dark theme
- [x] Supabase database integration
- [x] Vercel deployment pipeline
- [x] PWA support with service worker
- [x] Safe area support for iOS

### Wallet & Web3 (Complete)
- [x] Coinbase Smart Wallet integration
- [x] OnchainKit Identity (Avatar, Name)
- [x] RAVE token balance checking
- [x] Token gating (5,000 RAVE)
- [x] Multi-token tipping (ETH, USDC, RAVE, cbBTC)

### Streaming (Complete)
- [x] Mux RTMP integration
- [x] HLS playback
- [x] Stream status management
- [x] Webhook handling
- [x] Persistent audio player
- [x] Listener count tracking

### DJ Features (Complete)
- [x] DJ registration & profiles
- [x] DJ dashboard
- [x] Stream creation & management
- [x] Cover image uploads (Cloudinary)
- [x] Social links
- [x] Genre tagging
- [x] Stats display (shows, listeners, tips)
- [x] Follow/unfollow system
- [x] DJ of the Day feature

### Community (Complete)
- [x] Token-gated community page
- [x] Member profiles
- [x] Live chat with realtime
- [x] Chat moderation (delete, timeout, ban)
- [x] Threads feature (posts, likes, replies)

### Content (Complete)
- [x] Schedule system
- [x] Archive page (past shows)
- [x] Gallery (token-gated photos)
- [x] Events page

### Commerce (Complete)
- [x] Shopify integration (external)
- [x] Tipping system
- [x] Tip tracking in database

---

## In Development

### Mix Uploads (Mux)
- [x] Database schema ready
- [ ] Upload UI in DJ dashboard
- [ ] Mux asset creation
- [ ] Playback on DJ profile

### Push Notifications
- [x] VAPID keys configured
- [ ] Subscription management
- [ ] Follow notifications
- [ ] Live stream alerts

### Admin Dashboard
- [x] Basic admin routes
- [ ] DJ of the Day management
- [ ] Featured content curation
- [ ] Analytics dashboard

---

## Planned Features

### Phase 1: Post-Beta
- [ ] NFT collectibles for shows
- [ ] Show mint functionality
- [ ] Collector profiles
- [ ] DM improvements (read receipts, typing)

### Phase 2: Growth
- [ ] Farcaster frames integration
- [ ] Event ticketing
- [ ] Merchandise drops
- [ ] Collaborator invites

### Phase 3: Scale
- [ ] Multi-room support
- [ ] Scheduled recordings
- [ ] DJ analytics dashboard
- [ ] Revenue sharing

---

## Technical Debt

### High Priority
- [ ] Add comprehensive error boundaries
- [ ] Implement retry logic for API calls
- [ ] Add loading skeletons everywhere
- [ ] Optimize image loading (lazy load)

### Medium Priority
- [ ] Add unit tests for DB helpers
- [ ] Add integration tests for API routes
- [ ] Improve TypeScript strictness
- [ ] Document API endpoints

### Low Priority
- [ ] Refactor large components
- [ ] Add Storybook for components
- [ ] Performance profiling
- [ ] Bundle size optimization

---

## Database Migrations Pending

| File | Description | Status |
|------|-------------|--------|
| `schema-threads.sql` | Threads, likes, triggers | Ready |
| `schema-dj-mixes.sql` | Mixes, followers, DJ of day | Ready |

---

## API Routes Count: 45+

### Streaming (7)
- `GET/POST /api/streams`
- `GET/PATCH/DELETE /api/streams/[id]`
- `POST /api/streams/[id]/setup-mux`
- `POST /api/streams/[id]/start`
- `POST /api/streams/[id]/stop`
- `POST /api/streams/[id]/check-status`
- `GET /api/streams/live`

### DJs (7)
- `GET/POST /api/djs`
- `GET/PATCH /api/djs/[slug]`
- `GET/PUT /api/djs/me`
- `GET /api/djs/[slug]/stats`
- `POST/DELETE /api/djs/[slug]/follow`
- `GET /api/dj-of-the-day`

### Threads (4)
- `GET/POST /api/threads`
- `GET/DELETE /api/threads/[id]`
- `POST/DELETE /api/threads/[id]/like`

### Community (6)
- `GET/POST /api/community`
- `GET/POST/DELETE /api/connections`
- `GET/POST /api/conversations`
- `GET/POST/PATCH/DELETE /api/messages`

### Content (6)
- `GET/POST /api/chat`
- `GET/POST /api/gallery`
- `GET/POST /api/schedule`
- `GET/PATCH/DELETE /api/schedule/[id]`
- `GET /api/archive`
- `GET /api/archive/[id]`

### Commerce (6)
- `GET/POST /api/tips`
- `GET/POST /api/nfts`
- `POST /api/nfts/mint`
- `GET /api/shop/products`
- `GET/POST/PATCH/DELETE /api/shop/cart`
- `GET/POST /api/shop/claim`

### System (9)
- `GET /api/token/check`
- `GET /api/analytics`
- `GET/POST /api/viewers`
- `GET/POST /api/moderation`
- `POST/DELETE /api/push/subscribe`
- `POST /api/bookings`
- `POST /api/webhooks/mux`
- `POST /api/webhooks/shopify`
- `GET/POST /api/webhooks/farcaster`

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
MUX_TOKEN_ID
MUX_TOKEN_SECRET
MUX_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
ADMIN_WALLET_ADDRESS
```

---

## Notes for Beta Testers

1. Test primarily on iPhone PWA
2. Report any safe area issues
3. Check token gating flows
4. Test with different RAVE balances
5. Try all navigation paths

---


## Contact

- GitHub Issues: Eskyee/baseFM
- Live Site: basefm.space
