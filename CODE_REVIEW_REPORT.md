# baseFM Comprehensive Code Review Report
**Date**: March 6, 2026  
**Reviewer**: GitHub Copilot  
**Repository**: https://github.com/Eskyee/baseFM  
**Previous Review**: February 24, 2026 (Kiro AI)

---

## Executive Summary

**Overall Grade: B (Good)**

Since the last review (February 24, 2026) several critical issues have been resolved, including the XSS vulnerability in the shop page, missing input validation, and webhook signature verification. TypeScript strict mode has been enabled. However, new or persisting issues remain, primarily around admin API authentication, npm vulnerabilities in direct dependencies, and missing HTTP security headers.

### Key Findings
- ✅ **11 improvements** since the previous review
- 🔴 **2 Critical security issues** remain
- ⚠️ **6 Medium-priority issues** found
- 📊 **8 npm vulnerabilities** (1 moderate, 7 high) — down from 23

---

## What Has Been Fixed Since the Last Review

| # | Issue | Status |
|---|-------|--------|
| 1 | XSS in `app/shop/[handle]/page.tsx` — now uses DOMPurify | ✅ Fixed |
| 2 | No admin authentication middleware — `lib/middleware/admin-auth.ts` created | ✅ Fixed |
| 3 | No tx hash validation — `lib/validation/index.ts` created and used | ✅ Fixed |
| 4 | Mux webhook had no signature verification — now verified with HMAC | ✅ Fixed |
| 5 | Shopify webhook had no signature verification — now verified with HMAC | ✅ Fixed |
| 6 | TypeScript strict mode was off — now enabled in `tsconfig.json` | ✅ Fixed |
| 7 | Chat had no sanitization — `lib/validation/sanitize.ts` created | ✅ Fixed |
| 8 | Ticket purchase had no on-chain verification — `lib/onchain/verify-transaction.ts` | ✅ Fixed |
| 9 | Input validation library missing — comprehensive `lib/validation/index.ts` added | ✅ Fixed |
| 10 | Realtime subscription leak in `LiveChat.tsx` — cleanup now in `useEffect` return | ✅ Fixed |
| 11 | Low test coverage — now 78 passing tests across 4 files | ✅ Improved |

---

## 1. Critical Security Issues

### 🔴 Issue 1: Admin API Routes Accept Wallet Address From Request Body (Unauthenticated)

**Severity**: CRITICAL  
**Files affected**:
- `app/api/admin/community/route.ts` (GET has **no auth check at all**)
- `app/api/admin/djs/route.ts` (GET reads wallet from query param, no signature)
- `app/api/admin/community/route.ts` POST reads wallet from body
- `app/api/admin/promoters/route.ts`
- `app/api/admin/events/route.ts`
- `app/api/admin/clear-streams/route.ts`

**Description**: Admin routes check if a provided `walletAddress` is in the admin list, but they accept that wallet address as a plain string from the request body or query params — no cryptographic proof is required. Any attacker who knows (or guesses) an admin wallet address can forge this header/body value and pass the authorization check.

Additionally, `GET /api/admin/community` has **zero** authentication — it returns all member wallet addresses, bios, and token balances to any unauthenticated caller.

```typescript
// CURRENT — INSECURE: walletAddress from untrusted request body
const { walletAddress, memberId, action } = body;
if (!isAdminWallet(walletAddress)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

**Recommendation**: Require a wallet signature for admin actions, using the existing `verifyWalletSignature` function in `lib/auth/wallet.ts`. Add auth to the community GET route.

```typescript
// RECOMMENDED: Verify signature + admin wallet
const { walletAddress, signature, nonce, ...rest } = body;
if (!isAdminWallet(walletAddress)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
const isValid = await verifyWalletSignature(walletAddress, nonce, signature);
if (!isValid) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

---

### 🔴 Issue 2: npm Vulnerabilities in Direct Dependencies (8 Total: 1 Moderate, 7 High)

**Severity**: HIGH  
**Command**: `npm audit` reports 8 vulnerabilities (1 moderate, 7 high)

| Package | Version | CVE | Severity | Impact |
|---------|---------|-----|----------|--------|
| `next` | 14.2.35 | GHSA-9g9p-9gw9-jx7f | HIGH | DoS via Image Optimizer |
| `next` | 14.2.35 | GHSA-h25m-26qc-wcjf | HIGH | DoS via HTTP deserialization (React Server Components) |
| `dompurify` | 3.3.1 | GHSA-v2wj-7wpq-c8vv | MODERATE | XSS bypass |
| `hono` | 4.12.2 | GHSA-5pq2-9x2x-5p6w | HIGH | Cookie attribute injection |
| `hono` | 4.12.2 | GHSA-p6xx-57qc-3wxr | HIGH | SSE control field injection via CR/LF |
| `hono` | 4.12.2 | GHSA-q5qw-h33p-qvwr | HIGH | Arbitrary file access via serveStatic |
| `rollup` | 4.x | GHSA-mw96-cpmx-2vgc | HIGH | Arbitrary file write (build dep) |
| `minimatch` | multiple | GHSA-7r86-cg39-jmmj | HIGH | ReDoS (dev dep) |

**Next.js** and **DOMPurify** are direct production dependencies. The DOMPurify vulnerability is particularly notable since it was recently added to fix the shop page XSS, but the installed version is still in the vulnerable range.

**Recommended fix**:
```bash
# Fix non-breaking vulnerabilities:
npm audit fix

# Check what upgrades are needed for next.js and dompurify:
npm outdated
```

Note: Upgrading `next` to 15.x is a breaking change and requires testing.

---

## 2. Medium Priority Issues

### ⚠️ Issue 3: Missing Critical HTTP Security Headers

**Severity**: MEDIUM  
**Files**: `next.config.js`

The `next.config.js` defines some security headers (`X-Content-Type-Options`, `X-DNS-Prefetch-Control`, `Referrer-Policy`) but is missing several important ones:

| Missing Header | Risk |
|---------------|------|
| `X-Frame-Options: DENY` | Clickjacking |
| `Content-Security-Policy` | XSS, data injection |
| `Strict-Transport-Security` | SSL stripping / MITM |
| `Permissions-Policy` | Browser feature abuse |

**Recommendation**: Add to `next.config.js` headers:
```javascript
{ key: 'X-Frame-Options', value: 'DENY' },
{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
```

A `Content-Security-Policy` is complex to add (requires allowing Mux, Supabase, Cloudinary, etc.) but highly recommended.

---

### ⚠️ Issue 4: In-Memory Rate Limiting Won't Work on Vercel (Serverless)

**Severity**: MEDIUM  
**File**: `app/api/chat/route.ts`

The chat rate limiter uses a module-level `Map`:
```typescript
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
```

On Vercel (serverless), each request may hit a different function instance. The in-memory map is not shared across instances, making the rate limit ineffective under load.

**Recommendation**: Use an external store such as Upstash Redis (or KV), or Vercel's KV store. Alternatively, move rate limit tracking to Supabase.

---

### ⚠️ Issue 5: Stream Ownership Check Uses Unverified Wallet Address

**Severity**: MEDIUM  
**Files**: `app/api/streams/[id]/setup-mux/route.ts`, `app/api/streams/[id]/stop/route.ts`

Stream management routes check DJ ownership using the wallet address from the request body:
```typescript
if (body.djWalletAddress?.toLowerCase() !== stream.djWalletAddress.toLowerCase()) {
  return NextResponse.json({ error: 'Unauthorized: you do not own this stream' }, { status: 403 });
}
```

The `stop` route has optional signature verification via `verifyWalletSignature` but this is marked "recommended for production" rather than required. The `setup-mux` route has no signature check.

**Recommendation**: Make signature verification mandatory on all stream mutation endpoints.

---

### ⚠️ Issue 6: TypeScript `as any` in Stream Stop Route

**Severity**: LOW  
**File**: `app/api/streams/[id]/stop/route.ts:48`

```typescript
if (!STOPPABLE_STATUSES.includes(stream.status as any)) {
```

`stream.status` should be typed as `StreamStatus` or `string`, and `STOPPABLE_STATUSES` as `readonly StreamStatus[]`. The cast is unnecessary and hides a potential type mismatch.

**Fix**:
```typescript
if (!STOPPABLE_STATUSES.includes(stream.status as StreamStatus)) {
```
Or, define `STOPPABLE_STATUSES` as `string[]` and remove the cast.

---

### ⚠️ Issue 7: No Rate Limiting on Other Mutation Endpoints

**Severity**: MEDIUM  
**Affected routes**: `/api/bookings`, `/api/community` (POST), `/api/tips` (POST), `/api/tickets/purchase` (POST)

Only the `/api/chat` route has rate limiting. Mutation endpoints that trigger external calls (Slack notifications, on-chain reads, Supabase writes) are unprotected from bulk submission.

---

### ⚠️ Issue 8: API Route Cache Headers Expose Dynamic Data

**Severity**: LOW  
**File**: `next.config.js`

```javascript
// API routes - short cache for dynamic data
{
  source: '/api/:path*',
  headers: [
    { key: 'Cache-Control', value: 'public, s-maxage=10, stale-while-revalidate=59' },
  ],
},
```

This applies a shared cache header to **all** API routes, including sensitive mutation endpoints and user-specific data (e.g., `/api/analytics`, `/api/tips`). Mutation routes (POST, PATCH, DELETE) should explicitly return `Cache-Control: no-store, no-cache`.

---

## 3. Strengths

The following areas are well-implemented and should be preserved:

### Security
- ✅ **Mux webhook**: HMAC signature verification with `crypto.timingSafeEqual`
- ✅ **Shopify webhook**: HMAC signature verification with `crypto.timingSafeEqual`
- ✅ **DOMPurify**: Installed and used in shop page with explicit allowed tags/attrs
- ✅ **Input sanitization**: Comprehensive `lib/validation/sanitize.ts` with HTML entity encoding, pattern matching, and length enforcement
- ✅ **Validation library**: `lib/validation/index.ts` with wallet, UUID, tx hash, slug validators
- ✅ **On-chain tx verification**: `lib/onchain/verify-transaction.ts` verifies actual USDC Transfer events before recording ticket purchases
- ✅ **Duplicate tip prevention**: Checks tx hash uniqueness before insert
- ✅ **TypeScript strict mode**: Enabled in `tsconfig.json`
- ✅ **Private keys server-side only**: `BANKR_PRIVATE_KEY` only used in `app/api/**`

### API Design
- ✅ **Consistent error handling**: All routes have `try/catch` returning appropriate HTTP status codes
- ✅ **Good input validation**: Wallet address, UUID, and tx hash validation on all relevant endpoints
- ✅ **Wallet normalization**: `.toLowerCase()` used consistently before comparisons
- ✅ **Cron route protected**: `/api/cron/trading` verifies `CRON_SECRET` before running

### Code Quality
- ✅ **78 tests passing** across 4 test files covering tips, tickets, crew, and token config
- ✅ **Realtime subscriptions cleaned up** properly in `useEffect` return functions
- ✅ **Chat rate limiting**: In-memory rate limiter with bounded Map size and periodic cleanup
- ✅ **Admin middleware**: `lib/middleware/admin-auth.ts` created with `requireAdmin` and `isAdmin` helpers

---

## 4. Test Coverage

```
Test Files  4 passed (4)
Tests       78 passed (78)

Coverage:
  __tests__/lib/crew.test.ts      — 23 tests
  __tests__/lib/tickets.test.ts   — 18 tests
  __tests__/lib/tip-config.test.ts — 19 tests
  __tests__/token-config.test.ts  — 18 tests
```

**Coverage gaps** (no tests for):
- API route handlers (most critical paths)
- `lib/validation/index.ts` and `lib/validation/sanitize.ts`
- `lib/onchain/verify-transaction.ts`
- `lib/streaming/mux.ts` (webhook signature verification)
- React components

---

## 5. Priority Action Items

### 🔴 CRITICAL (Address Immediately)

1. **Add auth to `GET /api/admin/community`**
   - Add `isAdminWallet` check using query param wallet
   - Estimated time: 15 minutes

2. **Fix npm vulnerabilities**
   - Run `npm audit fix` for non-breaking fixes (dompurify, hono, rollup, minimatch)
   - Plan Next.js 15 upgrade for next sprint
   - Estimated time: 1 hour (non-breaking) + testing sprint for Next.js upgrade

3. **Consider requiring signatures on admin mutation routes**
   - The existing `verifyWalletSignature` in `lib/auth/wallet.ts` can be reused
   - This is a larger change but significantly improves security
   - Estimated time: 4 hours

### ⚠️ HIGH PRIORITY (This Week)

4. **Add missing security headers**
   - `X-Frame-Options`, `HSTS`, `Permissions-Policy`
   - Estimated time: 30 minutes

5. **Replace in-memory rate limiter with distributed store**
   - Use Vercel KV or Upstash Redis
   - Estimated time: 2 hours

6. **Make signature verification mandatory on stream mutations**
   - Already implemented in `stop` route as optional — make it required
   - Estimated time: 1 hour

### 📊 MEDIUM PRIORITY (This Month)

7. **Fix `as any` cast in stream stop route**
   - Estimated time: 5 minutes

8. **Add `Cache-Control: no-store` to mutation API routes**
   - Estimated time: 30 minutes

9. **Expand test coverage**
   - Add tests for `lib/validation/*`, API routes
   - Estimated time: 8–16 hours

---

## 6. Metrics

| Metric | Previous (Feb 24) | Current (Mar 6) | Target |
|--------|-----------------|----------------|--------|
| npm Vulnerabilities | 23 (1L, 2M, 20H) | **8 (1M, 7H)** | 0 |
| TypeScript Strict | ❌ Off | ✅ On | ✅ On |
| Passing Tests | Unknown | **78** | 80%+ coverage |
| Admin Auth | ❌ Missing | ⚠️ Partial (no sig) | Signed |
| XSS Protection | ❌ Missing | ✅ DOMPurify | ✅ |
| Webhook Verification | ❌ Missing | ✅ HMAC | ✅ |
| Tx Verification | ❌ Missing | ✅ On-chain | ✅ |
| Security Headers | ⚠️ Partial | ⚠️ Partial | ✅ Full |
| Rate Limiting | ⚠️ Chat only | ⚠️ Chat only | All mutations |

---

## 7. Conclusion

baseFM has made **significant security improvements** since the last review. The most dangerous issues (XSS, missing webhook verification, no tx validation) have been resolved. The codebase is clean, well-structured, and TypeScript strict mode is now active.

The two remaining critical issues are the admin API authentication weakness and the npm vulnerabilities in direct dependencies (especially Next.js). Both are actionable without major refactoring.

**Recommendation**: Run `npm audit fix`, add auth to the unauthenticated admin GET route, and add the missing security headers. The platform is otherwise in good shape for continued production use.

---

**Report Generated**: March 6, 2026  
**Next Review**: April 6, 2026 (1 month)
