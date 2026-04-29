-- baseFM headliner invite codes
-- Admin-issued promo codes for headliners who help promote the platform.
-- Redemption grants free DJ access for a fixed duration; baseFM eats the
-- underlying Mux/infra cost as a marketing expense.
--
-- Run via Supabase migration or psql against the project DB.

create extension if not exists "pgcrypto";

create table if not exists headliner_invite_codes (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,                      -- human-friendly, e.g. "HEADLINER-K7QX"
  issued_by       text not null,                             -- admin wallet that created the code
  notes           text,                                      -- e.g. "for @djname — Coachella promo"
  max_redemptions integer not null default 1,                -- how many wallets can redeem
  redemptions     integer not null default 0,                -- counter
  duration_days   integer not null default 30,               -- access window granted on redeem
  expires_at      timestamptz,                               -- code itself becomes invalid after this
  created_at      timestamptz not null default now(),
  revoked_at      timestamptz,                               -- admin can soft-disable
  constraint chk_max_redemptions check (max_redemptions >= 1),
  constraint chk_duration_days check (duration_days >= 1 and duration_days <= 365)
);

create index if not exists idx_headliner_codes_code on headliner_invite_codes (code) where revoked_at is null;
create index if not exists idx_headliner_codes_issued_by on headliner_invite_codes (issued_by);

-- Per-wallet redemption ledger — one row per (code, wallet) so a single code
-- with max_redemptions > 1 cannot be redeemed twice by the same wallet.
create table if not exists headliner_invite_redemptions (
  id              uuid primary key default gen_random_uuid(),
  code_id         uuid not null references headliner_invite_codes (id) on delete cascade,
  wallet_address  text not null,                             -- normalised lowercase EVM or Solana pubkey
  redeemed_at     timestamptz not null default now(),
  access_ends_at  timestamptz not null,                      -- when the granted access window closes
  unique (code_id, wallet_address)
);

create index if not exists idx_headliner_redemptions_wallet on headliner_invite_redemptions (wallet_address);
create index if not exists idx_headliner_redemptions_active on headliner_invite_redemptions (wallet_address, access_ends_at);

-- Optional: row level security. Adapt to your existing supabase RLS pattern.
-- Codes are readable by service role only; the redeem flow goes through the
-- API route, never directly from the browser.
alter table headliner_invite_codes enable row level security;
alter table headliner_invite_redemptions enable row level security;

-- Service-role (server) full access; no public policies — all reads/writes
-- go through /api/admin/headliner-codes and /api/headliner-codes/redeem.
