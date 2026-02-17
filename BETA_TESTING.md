# baseFM Beta Testing Guide

## Overview

Welcome to the baseFM beta! This guide covers new features ready for testing. Please test on **iPhone PWA** and desktop browser.

---

## New Features

### 1. Threads - Community Conversations
**URL:** `/threads`

Token-gated community discussion board inspired by Meta Threads.

**Features:**
- Requires 5,000 RAVE tokens to post
- Create threads up to 500 characters
- Like/unlike threads (token-gated)
- Reply to threads
- Delete your own threads
- OnchainKit wallet avatars

**Testing Checklist:**
- [ ] Connect wallet and verify token gate message
- [ ] Create a new thread
- [ ] Like/unlike threads
- [ ] Reply to a thread
- [ ] Delete your own thread
- [ ] View thread detail page (`/threads/[id]`)
- [ ] Check "Members" tab navigation to community

---

### 2. Enhanced DJ Profiles
**URL:** `/djs/[slug]`

Redesigned DJ profile pages with stats, follow system, and improved UX.

**Features:**
- Stats grid: Followers, Shows, Listeners, ETH Tips
- Follow/Unfollow button (requires wallet)
- Tabbed interface: Shows / About
- Social links row (X, Instagram, SoundCloud, etc.)
- Live Now banner when DJ is streaming
- Gradient cover image with visual improvements
- Tip button integration

**Testing Checklist:**
- [ ] View any DJ profile
- [ ] Follow/unfollow a DJ
- [ ] Verify stats display correctly
- [ ] Switch between Shows/About tabs
- [ ] Click social links (open in new tab)
- [ ] Check display when DJ has no shows
- [ ] Test back navigation button
- [ ] Tip a DJ

---

### 3. DJ of the Day
**URL:** Homepage (`/`)

Featured DJ spotlight on the homepage.

**Features:**
- Shows featured DJ with avatar, name, reason
- Displays genres and show count
- Links to DJ profile
- Falls back to random top DJ if none set

**Testing Checklist:**
- [ ] View DJ of the Day section on homepage
- [ ] Click through to DJ profile
- [ ] Verify layout on mobile

---

### 4. Mobile UX Improvements

**Features:**
- Safe area support for iPhone home indicator
- Persistent player respects safe areas
- Seamless navigation throughout app

**Testing Checklist:**
- [ ] Test on iPhone as PWA (Add to Home Screen)
- [ ] Player bar doesn't overlap home indicator
- [ ] Navigation between pages is smooth
- [ ] No layout jumps or overlaps

---

## Database Setup

Run these SQL migrations in Supabase before testing:

1. **Threads:** `supabase/schema-threads.sql`
2. **DJ Features:** `supabase/schema-dj-mixes.sql`

---

## Known Limitations

| Feature | Status |
|---------|--------|
| Media attachments in threads | Coming soon (button disabled) |
| DJ of the Day admin UI | Manual DB entry for now |
| Mix uploads via Mux | Schema ready, UI pending |
| Push notifications for follows | Not yet implemented |

---

## Feedback Request

Please provide feedback on these areas:

### UX Flow
- Is navigation intuitive?
- Are token gate messages clear?
- Any confusing interactions?

### Mobile Experience
- How does it feel on iPhone PWA?
- Any touch/tap issues?
- Font sizes and spacing good?

### Visual Design
- Do new components match the style?
- Colors and contrast okay?
- Any elements feel out of place?

### Performance
- Any slow loading?
- Lag when scrolling feeds?
- API response times?

---

## How to Report Issues

1. Screenshot or screen recording
2. Device info (iPhone model, browser)
3. Steps to reproduce
4. Expected vs actual behavior

---

## Feature Summary

| Feature | Route | Token Gated |
|---------|-------|-------------|
| Threads Feed | `/threads` | 5,000 RAVE to post |
| Thread Detail | `/threads/[id]` | View: No, Reply: Yes |
| DJ Profile | `/djs/[slug]` | No |
| DJ of the Day | `/` (homepage) | No |
| Follow DJ | DJ Profile | Wallet required |
| Like Thread | Threads | 5,000 RAVE |

---

## Project Progress

### Completed
- [x] Core streaming infrastructure (Mux)
- [x] Wallet connection (Coinbase Smart Wallet)
- [x] Token gating (RAVE token)
- [x] Live chat with moderation
- [x] DJ dashboard & stream management
- [x] Community members page
- [x] Schedule system
- [x] Tipping (ETH, USDC, RAVE, cbBTC)
- [x] Threads feature
- [x] Enhanced DJ profiles
- [x] DJ of the Day
- [x] Mobile PWA support

### In Progress
- [ ] Mix uploads via Mux
- [ ] Push notifications
- [ ] Admin dashboard improvements
- [ ] Archive playback

### Planned
- [ ] NFT collectibles for shows
- [ ] DM improvements
- [ ] Farcaster frames
- [ ] Event ticketing

---

Thank you for testing! Your feedback helps make baseFM better for the community.
