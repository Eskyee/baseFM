# baseFM
base Miniapp Created by raveculture 

# baseFM - Onchain Radio Platform

Production-ready streaming infrastructure for Base-native radio.

## ✅ Phase 1 Complete: Streaming Infrastructure

This implementation includes:
- ✅ Complete database schema (Supabase)
- ✅ Mux live streaming integration
- ✅ Stream lifecycle management (CREATED → PREPARING → LIVE → ENDING → ENDED)
- ✅ API routes for DJ and listener operations
- ✅ Webhook handling for real-time status updates
- ✅ Wallet-based authentication foundation
- ✅ TypeScript types for all entities

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Vercel (Next.js)               │
│  ┌─────────────┐         ┌─────────────┐   │
│  │  API Routes │────────▶│  Supabase   │   │
│  │             │         │  (Postgres) │   │
│  └──────┬──────┘         └─────────────┘   │
│         │                                    │
│         │ (creates/manages)                  │
│         ▼                                    │
│  ┌─────────────┐                            │
│  │     Mux     │──┐                         │
│  │  RTMP→HLS   │  │ Webhooks                │
│  └─────────────┘  │                         │
│         │          │                         │
│         ▼          ▼                         │
│  Listeners    API Updates                   │
│  (HLS.js)     (Stream Status)               │
└─────────────────────────────────────────────┘
```

## 📋 Prerequisites

1. **Node.js 18.17+**
2. **Supabase Account** (free tier works)
3. **Mux Account** (free tier: 1000 min/month)
4. **Vercel Account** (optional for deployment)

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo>
cd basefm
npm install
```

### 2. Database Setup (Supabase)

1. Go to https://supabase.com/dashboard
2. Create new project
3. Wait for provisioning (~2 minutes)
4. Go to **SQL Editor**
5. Copy contents of `supabase-schema.sql`
6. Paste and run in SQL Editor
7. Verify tables created: `streams`, `events`, `stream_activity`

### 3. Mux Setup

1. Go to https://dashboard.mux.com/signup
2. Create account
3. Navigate to **Settings → Access Tokens**
4. Click **Generate new token**
5. Enable these permissions:
   - ✅ Mux Video (Read + Write)
   - ✅ Mux Data (Read)
6. Copy `Token ID` and `Token Secret`
7. Go to **Settings → Webhooks**
8. Click **Create new webhook**
9. Set URL: `https://your-domain.com/api/webhooks/mux`
10. Copy the webhook signing secret

### 4. Environment Variables

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Fill in your values:

```env
# Supabase (from Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... # Keep secret!

# Mux
MUX_TOKEN_ID=xxxxx
MUX_TOKEN_SECRET=xxxxx
MUX_WEBHOOK_SECRET=xxxxx

# Base Network
NEXT_PUBLIC_BASE_CHAIN_ID=8453
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 📡 API Reference

### Streams

#### `GET /api/streams`
List all streams with optional filters.

**Query Parameters:**
- `status` - Filter by status: CREATED, PREPARING, LIVE, ENDING, ENDED
- `djWalletAddress` - Filter by DJ wallet
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset

**Response:**
```json
{
  "streams": [
    {
      "id": "uuid",
      "title": "Friday Night Vibes",
      "djName": "DJ Alpha",
      "status": "LIVE",
      "hlsPlaybackUrl": "https://stream.mux.com/xxx.m3u8",
      ...
    }
  ]
}
```

#### `POST /api/streams`
Create a new stream.

**Body:**
```json
{
  "title": "Friday Night Vibes",
  "description": "House music all night",
  "djName": "DJ Alpha",
  "djWalletAddress": "0x123...",
  "scheduledStartTime": "2024-01-01T20:00:00Z",
  "isGated": false
}
```

**Response:**
```json
{
  "stream": { ... },
  "rtmpUrl": "rtmps://global-live.mux.com:443/app/xxx",
  "rtmpKey": "xxx"
}
```

#### `GET /api/streams/[id]`
Get single stream by ID.

#### `PATCH /api/streams/[id]`
Update stream metadata (title, description, etc).

#### `DELETE /api/streams/[id]`
Delete a stream.

#### `POST /api/streams/[id]/start`
DJ signals ready to broadcast.

**Body:**
```json
{
  "djWalletAddress": "0x123...",
  "signature": "0xabc..."
}
```

**Response:**
```json
{
  "stream": { "status": "PREPARING", ... },
  "rtmpUrl": "rtmps://...",
  "rtmpKey": "xxx"
}
```

#### `POST /api/streams/[id]/stop`
DJ ends broadcast.

#### `GET /api/streams/live`
Get all currently live streams with listener counts.

### Webhooks

#### `POST /api/webhooks/mux`
Mux webhook endpoint (automatically called by Mux).

**Events handled:**
- `video.live_stream.active` → Updates status to LIVE
- `video.live_stream.idle` → Updates status to ENDING
- `video.live_stream.disconnected` → Updates status to ENDED

## 🔄 Stream Lifecycle

```
CREATED
   ↓ (POST /api/streams/[id]/start)
PREPARING
   ↓ (DJ connects RTMP)
LIVE
   ↓ (DJ disconnects or POST /api/streams/[id]/stop)
ENDING
   ↓ (5min grace period expires)
ENDED
```

## 🎵 DJ Workflow

1. **Create Stream**
   ```bash
   POST /api/streams
   # Returns: stream ID, RTMP URL, stream key
   ```

2. **Start Stream**
   ```bash
   POST /api/streams/[id]/start
   # Status: CREATED → PREPARING
   ```

3. **Connect OBS/Streaming Software**
   - RTMP URL: `rtmps://global-live.mux.com:443/app`
   - Stream Key: `[from API response]`
   - Status automatically updates to LIVE when connected

4. **Broadcast**
   - Listeners can access HLS URL
   - Status remains LIVE

5. **End Stream**
   - Option A: DJ stops RTMP (automatic)
   - Option B: Call `POST /api/streams/[id]/stop`
   - Status: LIVE → ENDING → ENDED (after 5min)

## 🎧 Listener Workflow

1. **Discover Streams**
   ```bash
   GET /api/streams/live
   ```

2. **Play Stream**
   - Use `hlsPlaybackUrl` from stream object
   - Compatible with HLS.js, video.js, or native HLS players

## 🔐 Security Notes

**Current Implementation:**
- Wallet address validation ✅
- Basic DJ ownership checks ✅
- Mux webhook signature verification ✅

**TODO for Production:**
- [ ] Implement wallet signature verification for DJ actions
- [ ] Add rate limiting to API routes
- [ ] Implement CORS policies
- [ ] Add request validation middleware
- [ ] Implement session management

## 🚢 Deployment to Vercel

### Quick Deploy

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**
- Go to https://vercel.com/new
- Import your GitHub repo
- Framework Preset: **Next.js** (auto-detected)

3. **Add Environment Variables**
In Vercel project settings, add all variables from `.env.local`

4. **Deploy**
Click "Deploy" - done in ~2 minutes

5. **Configure Mux Webhook**
- Get your Vercel domain: `https://basefm.vercel.app`
- Update Mux webhook URL: `https://basefm.vercel.app/api/webhooks/mux`

### Custom Domain

1. Go to Vercel project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update Mux webhook URL to use your domain

## 📊 Database Queries

### Get active listeners count
```sql
SELECT get_listener_count('stream-uuid');
```

### View live streams
```sql
SELECT * FROM live_streams;
```

### View upcoming events
```sql
SELECT * FROM upcoming_events;
```

## 🐛 Troubleshooting

### Stream stuck in PREPARING
- Check DJ connected RTMP correctly
- Verify Mux webhook is configured
- Check Mux dashboard for connection status

### Webhook not updating status
- Verify webhook secret matches
- Check webhook URL is publicly accessible
- Review webhook logs in Mux dashboard

### RTMP connection fails
- Ensure using `rtmps://` (secure)
- Verify stream key is correct
- Check firewall allows RTMP traffic

## 📝 Next Steps (Phase 2-5)

- [ ] Phase 2: Mux integration testing
- [ ] Phase 3: Frontend - Listener playback (HLS.js)
- [ ] Phase 4: Frontend - DJ broadcast flow
- [ ] Phase 5: Token gating (optional)

## 📄 License

MIT

## 🤝 Support

Questions? Check:
- Mux Docs: https://docs.mux.com
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
