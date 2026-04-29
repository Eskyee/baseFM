-- baseFM headliner profiles
-- Curated DJ profiles for the public /headliners page.
-- Until the first profile is published, the page shows a "Stay Tuned"
-- empty state. Once admin adds profiles, the page renders them as cards.

create extension if not exists "pgcrypto";

create table if not exists headliner_profiles (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,                   -- e.g. "djsuperstar"
  display_name    text not null,                          -- e.g. "DJ Superstar"
  tagline         text,                                   -- one-line hook
  bio             text,                                   -- longer description (markdown ok)
  avatar_url      text,                                   -- square image, ideally 512×512
  banner_url      text,                                   -- optional wide banner
  genres          text[] not null default '{}',           -- ['house','techno','jungle']
  city            text,                                   -- e.g. "Berlin"

  -- Onchain identity (optional, all)
  wallet_address  text,                                   -- EVM wallet (Base) for tips/access
  ens_name        text,                                   -- e.g. "djsuperstar.eth"
  farcaster_fid   integer,                                -- Farcaster FID
  farcaster_handle text,                                  -- e.g. "djsuperstar"

  -- Off-chain socials
  socials         jsonb not null default '{}',            -- { instagram, soundcloud, mixcloud, x, tiktok, youtube, website }

  -- Scheduling
  next_show_at    timestamptz,                            -- if known, surfaces "Next: ..." on card
  next_show_url   text,                                   -- link to event/stream page

  -- Publication state
  is_published    boolean not null default false,         -- only published rows show on /headliners
  featured_rank   integer,                                -- if set, sort by this ASC ahead of created_at

  -- Audit
  created_by      text,                                   -- admin wallet that created the profile
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_headliner_profiles_published
  on headliner_profiles (is_published, featured_rank, created_at desc)
  where is_published = true;

create index if not exists idx_headliner_profiles_slug
  on headliner_profiles (slug);

-- Lock down: profiles are written via admin API (service role only),
-- read publicly through the API route which filters is_published = true.
alter table headliner_profiles enable row level security;

-- updated_at trigger
create or replace function tg_headliner_profiles_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_headliner_profiles_touch on headliner_profiles;
create trigger trg_headliner_profiles_touch
  before update on headliner_profiles
  for each row execute function tg_headliner_profiles_touch_updated_at();
