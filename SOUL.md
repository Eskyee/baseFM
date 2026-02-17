# baseFM Soul - Project Journey & Growth

> This document tracks the evolution of baseFM from concept to production.
> Updated as the project grows.

---

## Vision

**baseFM is onchain radio for the Base ecosystem.**

We're building the future of internet radio where:
- DJs stream directly to their audience
- Listeners support artists with crypto tips
- Community owns the culture through tokens
- Events connect the digital and physical worlds

---

## Project Timeline

### Phase 1: Foundation (Completed)
*Core streaming infrastructure*

- [x] Next.js 14 App Router setup
- [x] Supabase database integration
- [x] Mux streaming (RTMP → HLS)
- [x] Basic DJ profiles and authentication
- [x] Live stream player with HLS.js
- [x] Weekly schedule system
- [x] PWA support for mobile

### Phase 2: Onchain Integration (Completed)
*Web3 features with Base network*

- [x] Coinbase Smart Wallet integration
- [x] OnchainKit for identity (Avatar, Name)
- [x] RAVE token gating (5000 for DJ access)
- [x] Multi-token tipping (ETH, USDC, RAVE, cbBTC)
- [x] Token-gated community directory
- [x] Wallet-based authentication

### Phase 3: Community Features (Completed)
*Social and engagement tools*

- [x] Live chat with Supabase Realtime
- [x] Follow/unfollow DJs
- [x] Push notifications for live shows
- [x] DJ of the Day feature
- [x] Community threads and discussions
- [x] Direct messaging (wallet-to-wallet)

### Phase 4: Events & Ticketing (Completed)
*Real-world event integration*

- [x] Event listings and management
- [x] Promoter/collective profiles
- [x] Onchain ticket purchases with USDC
- [x] Direct payment to promoters
- [x] Ticket verification by wallet
- [x] Event submission for promoters

### Phase 5: Developer Experience (Completed)
*Tooling and documentation*

- [x] CI/CD pipeline with GitHub Actions
- [x] Unit testing with Vitest (55+ tests)
- [x] TypeScript strict mode
- [x] Code coverage reporting
- [x] Beginner user guide (/guide)
- [x] Comprehensive documentation

### Phase 6: Future Vision (Planned)
*What's next*

- [ ] DJ analytics dashboard
- [ ] Show recordings as NFTs
- [ ] Multi-stream support
- [ ] Mobile app (React Native)
- [ ] DAO governance
- [ ] Revenue sharing contracts

---

## Technical Achievements

### Performance
- Mobile-first responsive design
- PWA with offline support
- Service worker caching (v3)
- Optimized HLS streaming

### Security
- Row Level Security on all tables
- Wallet signature verification
- Rate limiting on chat API
- Admin-only routes protected

### Testing
- 55+ unit tests passing
- Tip configuration tests
- Ticket system tests
- Token validation tests
- CI runs on every push

### Code Quality
- TypeScript throughout
- ESLint for consistency
- Automated PR creation
- Vercel preview deployments

---

## Key Decisions

### Why Base?
- Low fees for micropayments (tips)
- Coinbase ecosystem integration
- Growing onchain community
- Smart Wallet simplicity

### Why Mux?
- Professional-grade streaming
- RTMP input, HLS output
- Automatic recording
- Webhook status updates

### Why Supabase?
- Realtime for live chat
- Row Level Security
- Postgres reliability
- Easy to self-host later

### Why OnchainKit?
- Native Base integration
- Identity components (Avatar, Name)
- Wallet connection handled
- Maintained by Coinbase

---

## Community Values

1. **Open Source** - MIT license, anyone can fork
2. **Direct Support** - Tips go 100% to artists
3. **No Middleman** - Onchain payments, no fees
4. **Culture First** - Built for underground music
5. **Mobile Native** - Works on any device

---

## Metrics We Care About

- Active DJs streaming
- Listener engagement (chat, tips)
- Community token holders
- Event ticket sales
- New user onboarding

---

## Credits

**Created by:** Eskyee / RaveCulture
**Built for:** Base Builders
**Powered by:** RAVE token community

---

## Links

- **Live Site:** https://basefm.space
- **GitHub:** https://github.com/Eskyee/baseFM
- **Shop:** https://shop.basefm.space
- **Token:** [RAVE on Base](https://base.meme/coin/base:0xdf3c79a5759eeedb844e7481309a75037b8e86f5)

---

*This document evolves with the project. Last updated: February 2026*
