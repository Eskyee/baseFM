---
applyTo: "app/api/**,lib/**"
---

# Security Review Guidelines for baseFM API & Library Code

Apply these rules when reviewing any file under `app/api/` or `lib/`.

## Authentication & Authorization

- **Admin routes** (`/api/admin/**`, analytics, moderation, viewer tracking with service role):
  - Must check `ADMIN_WALLET_ADDRESSES` before executing privileged operations.
  - Use `lib/admin/config.ts` for the admin wallet list, don't re-implement it inline.

- **DJ-only routes** (stream management, profile updates):
  - Must verify the caller owns the resource (match `walletAddress` from request to the record owner).

- **Public routes**:
  - Still require input validation and rate-limit awareness.

## Supabase Service Role

The `createServerClient()` function uses the service role key which bypasses RLS. Flag any usage that:
- Is called from an API route accessible without authentication.
- Writes user-controlled data without sanitization.
- Is in a file that could potentially be imported by client components.

## Environment Variables

Safe patterns:
```typescript
// ✅ Server-only in API route or lib/
const key = process.env.BANKR_PRIVATE_KEY;

// ❌ Never in client component or NEXT_PUBLIC_ prefix
const key = process.env.NEXT_PUBLIC_BANKR_PRIVATE_KEY; // WRONG
```

## Rate Limiting

The chat API (`/api/chat`) has rate limiting (10/min). Other mutation routes do not yet.  
Flag POST/PATCH/DELETE routes that:
- Accept arbitrary user input
- Perform expensive operations (Mux API calls, blockchain reads, Cloudinary uploads)
- Could be hammered in a loop

## Wallet Address Handling

```typescript
// ✅ Always normalize to lowercase before comparison
const isAdmin = adminWallets.includes(wallet.toLowerCase());

// ❌ Case-sensitive comparison
const isAdmin = adminWallets.includes(wallet); // WRONG if addresses have mixed case
```

## Transaction Hash Validation

```typescript
// ✅ Validate format before storing
const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;
if (!TX_HASH_REGEX.test(txHash)) {
  return NextResponse.json({ error: 'Invalid transaction hash' }, { status: 400 });
}
```

## Mux Webhooks

The Mux webhook handler (`/api/webhooks/mux`) must verify the signature using `MUX_WEBHOOK_SECRET`. Flag any webhook handler that processes events without signature verification.

## Shopify Webhooks

Similarly, Shopify webhook handlers must verify HMAC signatures.

## Error Messages

Don't leak internal details in error responses:
```typescript
// ✅ Generic error
return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });

// ❌ Leaks internals
return NextResponse.json({ error: error.message }, { status: 500 }); // May expose DB errors
```
