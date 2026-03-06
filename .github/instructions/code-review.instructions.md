---
applyTo: "**"
---

# baseFM Code Review Guidelines

You are reviewing code for **baseFM** — an onchain radio platform built on Base (chain ID 8453) using Next.js 14 App Router, Supabase, wagmi v2, and the RAVE token.

## Core Principles

- **Mobile-first**: Owner tests on iPhone in PWA mode. All UI must work at iPhone width.
- **Security-first**: Crypto wallets and private keys are involved. Be strict about security.
- **Simple and clean**: No over-engineering. Keep it readable and maintainable.
- **No breaking changes**: Preserve existing behavior unless the PR explicitly changes it.

---

## 1. Security Checks (Always Review)

### Private Keys & Secrets
- `BANKR_PRIVATE_KEY`, `MINTER_PRIVATE_KEY`, and any `*_SECRET` must **never** appear in client-side code or `NEXT_PUBLIC_*` env vars.
- Flag any `process.env` usage that accesses private keys outside of `app/api/**` or `lib/**` server-only files.

### Wallet Authentication
- Admin routes must validate the caller is in `ADMIN_WALLET_ADDRESSES`.
- For privileged operations, use `lib/auth/wallet.ts` (viem-based signature verification) rather than trusting bare `x-wallet-address` headers.
- Wallet address comparisons must be case-insensitive (`.toLowerCase()`).

### XSS / HTML Injection
- Any `dangerouslySetInnerHTML` must sanitize content with `isomorphic-dompurify` before rendering.
- Flag raw HTML from external sources (Shopify, user input) rendered without sanitization.

### Input Validation
- API routes must validate required fields and reject invalid wallet addresses early (400 status).
- Reject malformed `tx_hash` values (must match `/^0x[a-fA-F0-9]{64}$/`).

---

## 2. Web3 / Onchain Rules

- **USDC has 6 decimals** — `$25 = 25_000_000`. Never use 18-decimal math for USDC.
- **RAVE has 18 decimals** — use `parseUnits` from `viem`, never raw multiplication.
- Token addresses are fixed constants in `lib/token/config.ts`. Don't hardcode them elsewhere.
- Chain ID must always be `8453` (Base mainnet). Flag any other chain IDs.
- Only **Coinbase Smart Wallet** is supported — no MetaMask, WalletConnect, or injected providers.
- All `useReadContract` / `useWriteContract` calls must handle pending, error, and success states.

---

## 3. Next.js / React Patterns

### PWA / Mobile (Critical)
- Navbar **must** use `position: fixed`, never `sticky` — sticky breaks iOS PWA.
- New pages must include a `.navbar-spacer` div (or use `AppShell`) to avoid content hiding under the fixed navbar.
- `env(safe-area-inset-top)` required for notch/Dynamic Island on iPhone.

### API Routes
- All API routes must have `try/catch` with a `500` fallback response.
- Mutations (POST/PATCH/DELETE) must validate the request body before calling the database.
- Use `createServerClient()` (service role) only when RLS would block legitimate server operations.

### Data Fetching
- Prefer server components for initial data when possible.
- Client-side fetching must show loading and error states.
- Supabase Realtime subscriptions must be cleaned up in `useEffect` return functions.

---

## 4. TypeScript

- No `any` types without a comment explaining why.
- Prefer explicit return types on exported functions.
- No `!` non-null assertions on values that could legitimately be undefined at runtime.
- Database types should come from the generated Supabase schema, not be hand-written.

---

## 5. Testing

- New utility functions in `lib/` should have corresponding unit tests in `__tests__/lib/`.
- Tests must use the existing mock infrastructure in `__tests__/utils/test-utils.tsx`.
- Don't skip or comment out existing tests.

---

## 6. Style & Conventions

- Tailwind CSS only — no inline `style` props unless absolutely necessary.
- Use `base-blue: #0052FF` and `base-dark: #0A0B0D` for brand colors.
- Gradient buttons: `bg-gradient-to-r from-[#0052FF] to-[#0066FF]` for primary CTAs.
- Component files use PascalCase (`MyComponent.tsx`), utilities use camelCase (`myUtil.ts`).
- Page-level loading states should use the existing `Skeleton` components in `components/ui/Skeleton.tsx`.

---

## 7. External Links (Never Change)

- Shop link must always point to `https://shop.basefm.space` — never internalized.
- Buy crypto: `https://www.coinbase.com/buy`.
- Swap: Uniswap URL with the RAVE token address pre-filled.

---

## 8. Service Worker

- After any significant UI change, ask if `CACHE_VERSION` in `public/sw.js` needs bumping.
- Don't modify `public/sw.js` cache logic without bumping the version.

---

## Review Checklist Summary

For every PR, check:
- [ ] No secrets or private keys in client-side code
- [ ] `dangerouslySetInnerHTML` sanitized with DOMPurify
- [ ] USDC amounts use 6 decimals, RAVE uses 18
- [ ] Admin/privileged routes validate caller wallet
- [ ] Mobile layout works (fixed navbar, safe-area, iPhone width)
- [ ] API routes have try/catch and input validation
- [ ] No `any` types without justification
- [ ] External shop link unchanged
- [ ] TypeScript compiles without errors
