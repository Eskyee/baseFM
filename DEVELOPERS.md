# baseFM Developer Documentation

Comprehensive guide for developers integrating with baseFM's onchain infrastructure.

---

## Table of Contents

1. [Bankr Agent Integration](#bankr-agent-integration)
2. [Clanker Token Deployment](#clanker-token-deployment)
3. [Farcaster Integration](#farcaster-integration)
4. [Agentbot Platform](#agentbot-platform)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [Environment Variables](#environment-variables)

---

## Bankr Agent Integration

### Overview

Bankr is an AI-powered crypto trading assistant that handles onchain operations via natural language prompts. baseFM integrates Bankr for:

- **NFT Minting** — Mint RavePass and event NFTs
- **Token Trading** — Automated trading agent
- **Portfolio Management** — Balance checking and tracking

### Official Bankr Resources

| Resource | URL | Description |
|----------|-----|-------------|
| Main Documentation | [docs.bankr.bot](https://docs.bankr.bot) | Full Bankr documentation |
| LLM Documentation | [docs.bankr.bot/llm](https://docs.bankr.bot/llm) | AI/LLM-friendly docs (for agents and tools) |
| API Reference | [docs.bankr.bot/api](https://docs.bankr.bot/api) | Agent API endpoints and schemas |
| SDK Reference | [docs.bankr.bot/sdk](https://docs.bankr.bot/sdk) | JavaScript/TypeScript SDK reference |
| Example Apps | [github.com/BankrBot/claude-plugins](https://github.com/BankrBot/claude-plugins) | Reference implementations |
| Dashboard | [bankr.bot/dashboard](https://bankr.bot/dashboard) | Manage API keys and settings |
| Status Page | [status.bankr.bot](https://status.bankr.bot) | API status and uptime |

### Quick Links

- **Get API Key**: [bankr.bot/api](https://bankr.bot/api)
- **SDK Install**: `npm install @bankr/sdk`
- **Support**: [Bankr Discord](https://discord.gg/bankr) or [docs.bankr.bot/support](https://docs.bankr.bot/support)

### Agent Trading Flow

The trading agent follows a four-step workflow:

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  SCAN   │ →  │ DECIDE  │ →  │ EXECUTE │ →  │ BALANCE │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

1. **Scan** — Ask Bankr for trending tokens on Base
2. **Decide** — Parse response, filter for high/medium conviction picks
3. **Execute** — Send swap command via Bankr API
4. **Balance** — Update portfolio display

### API Flow

```
POST /agent/prompt  →  { jobId, threadId }
GET  /agent/job/:id →  poll until status === "completed"
                    →  { response, transactions }
```

### Installation

```bash
npm install @bankr/sdk
```

See official SDK docs: [docs.bankr.bot/sdk](https://docs.bankr.bot/sdk)

### Configuration

```bash
# .env.local (server-side only)
BANKR_API_KEY=your_api_key          # Get from bankr.bot/api
BANKR_PRIVATE_KEY=your_private_key  # NEVER expose client-side

# Optional trading agent settings
AGENT_INTERVAL_MS=180000            # Trading cycle interval (3 min default)
AGENT_MAX_TRADE_PCT=1               # Max % of USDC per trade
```

**Getting API Keys**: Register at [bankr.bot/api](https://bankr.bot/api) to obtain your API key. The private key is your wallet's private key for signing transactions.

### Usage Examples

#### 1. NFT Minting (Server-Side Only)

```typescript
import { BankrClient } from '@bankr/sdk';

const bankr = new BankrClient({
  apiKey: process.env.BANKR_API_KEY,
  privateKey: process.env.BANKR_PRIVATE_KEY,
  network: 'base',
});

// Mint an NFT
const response = await bankr.promptAndWait({
  prompt: `mint an NFT called RavePass for 0x123... on base`,
});

console.log('TX Hash:', response.txHash);
```

#### 2. Trading Agent Cycle

```typescript
import { runTradingCycle } from '@/lib/bankr';

// Run full Scan → Decide → Execute → Balance cycle
const result = await runTradingCycle();

console.log('Decision:', result.decision);
console.log('TX Hash:', result.txHash);
console.log('Balance:', result.balance);
```

#### 3. Check Balance

```typescript
import { checkBalance } from '@/lib/bankr';

const { totalUsd, breakdown } = await checkBalance();

console.log('Total USD:', totalUsd);
console.log('Tokens:', breakdown);
// { USDC: 100.00, BNKR: 25.50, DEGEN: 12.30 }
```

#### 4. Analyze Specific Token

```typescript
import { analyzeToken } from '@/lib/bankr';

const analysis = await analyzeToken('BNKR');

console.log('Token:', analysis?.token);
console.log('Direction:', analysis?.direction);  // 'up' or 'down'
console.log('Conviction:', analysis?.conviction); // 'high', 'medium', 'low'
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/trading/agent` | POST | Execute agent actions (cycle, scan, decide, balance, analyze) |
| `/api/trading/agent` | GET | Get agent status and recent activity |
| `/api/trading/balances` | GET | Fetch current portfolio balances |
| `/api/trading/trades` | GET/POST | List/record trades |
| `/api/trading/logs` | GET/POST | Activity log feed |
| `/api/bankr-mint` | POST | Server-side NFT minting |

### Token Pick Format

Bankr returns picks in this format:
```
TOKEN - up/down - high/medium/low
```

Example response:
```
Based on my analysis, here are my picks:
- BNKR - up - high
- DEGEN - up - medium
- BRETT - down - low
```

### Security Requirements

> ⚠️ **CRITICAL: Follow these security rules when integrating Bankr**

| Rule | Description |
|------|-------------|
| **Server-Side Only** | `BANKR_PRIVATE_KEY` must NEVER be exposed to the client. Use API routes only. |
| **Whitelisted Prompts** | Use template prompts from your codebase. Never pass raw user input to Bankr. |
| **Address Validation** | Always validate addresses with `isAddress()` from viem before execution. |
| **Rate Limiting** | Implement rate limits on any endpoint that calls Bankr. |
| **Read-Only Mode** | Lock API keys to read-only in [Bankr Dashboard](https://bankr.bot/dashboard) when not trading. |

**What NOT to expose:**
- Private keys (BANKR_PRIVATE_KEY)
- Internal prompt templates (your trading strategy)
- Wallet addresses tied to trading operations
- Session/thread IDs from Bankr responses

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "session is locked in read-only mode" | Disable read-only mode at bankr.bot/api |
| Portfolio shows $0.00 | Check balance parser regex in `checkBalance()` |
| Agent not executing trades | Verify API key has Agent API access enabled |
| Multiple instances running | Kill all: `pkill -f "trading"` |

---

## Clanker Token Deployment

### Overview

Clanker v4 provides one-click ERC-20 token deployment on Base with built-in Uniswap v4 liquidity.

### Official Clanker Resources

| Resource | URL | Description |
|----------|-----|-------------|
| Main Documentation | [docs.clanker.world](https://docs.clanker.world) | Full Clanker documentation |
| API Reference | [docs.clanker.world/api](https://docs.clanker.world/api) | API endpoints and schemas |
| Token Deployer | [clanker.world/clanker](https://www.clanker.world/clanker) | Deploy tokens via UI |
| Farcaster Bot | [@clanker on Farcaster](https://warpcast.com/clanker) | Deploy via Farcaster cast |
| Token Explorer | [clanker.world/tokens](https://www.clanker.world/tokens) | Browse deployed tokens |
| GitHub | [github.com/clanker](https://github.com/clanker) | Open source code and SDKs |

### Quick Links

- **Deploy via Farcaster**: Cast to [@clanker](https://warpcast.com/clanker) with token details
- **SDK Install**: `npm install @clanker/sdk`
- **Support**: [Clanker Discord](https://discord.gg/clanker)

### Features

| Feature | Description |
|---------|-------------|
| Uniswap v4 Liquidity | Automatic DEX liquidity on deployment |
| Vesting Mechanisms | Built-in token vesting for teams |
| Creator Rewards | 40% of LP rewards to deployer |
| Base Native | Deploys directly on Base (chain 8453) |
| Farcaster Integration | Deploy via social cast |

### Usage

```typescript
import { Clanker } from '@clanker/sdk';

const token = await Clanker.deploy({
  name: "My Token",
  symbol: "MTK",
  supply: 1_000_000_000,
  chain: "base",
  liquidityPool: true,
  vesting: { cliff: 30, duration: 365 }
});

console.log('Contract:', token.address);
```

### Configuration

```bash
NEXT_PUBLIC_CLANKER_KEY=your_clanker_key  # Get from clanker.world/api
```

**Getting API Keys**: Register at [clanker.world/api](https://www.clanker.world/api) or [docs.clanker.world/api-keys](https://docs.clanker.world/api-keys).

### Use Cases

| Use Case | Description |
|----------|-------------|
| DJ Tokens | Launch fan tokens with built-in utility |
| Show Tokens | Create tokens for exclusive show access |
| Community | Token-gated communities and rewards |

### Deployment Methods

1. **Via Farcaster** (easiest): Cast to @clanker with token name, symbol, and image
2. **Via API**: Use the SDK for programmatic deployment
3. **Via UI**: Deploy directly at [clanker.world/clanker](https://www.clanker.world/clanker)

---

## Farcaster Integration

### Overview

baseFM integrates with Farcaster for social features and frames.

### Documentation Links

- [Farcaster Docs](https://docs.farcaster.xyz) — Protocol documentation
- [Frames Spec](https://docs.farcaster.xyz/reference/frames/spec) — Frames specification
- [Neynar API](https://docs.neynar.com) — Farcaster API provider

### Frames Support

baseFM supports Farcaster Frames for:
- Stream sharing
- Event announcements
- NFT minting

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/farcaster` | POST/GET | Farcaster frame handler |
| `/api/.well-known/farcaster` | GET | Farcaster manifest |

### Frame Implementation

```typescript
// pages/api/webhooks/farcaster/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { untrustedData, trustedData } = body;

  // Validate frame action
  const fid = untrustedData.fid;
  const buttonIndex = untrustedData.buttonIndex;

  // Handle button click
  switch (buttonIndex) {
    case 1:
      // Listen to stream
      return NextResponse.json({
        image: 'https://basefm.space/og/stream.png',
        buttons: [{ label: 'Listen Now' }],
      });
    case 2:
      // Mint NFT
      return NextResponse.json({
        image: 'https://basefm.space/og/mint.png',
        buttons: [{ label: 'Minted!' }],
      });
  }
}
```

### Manifest

```json
// .well-known/farcaster
{
  "accountAssociation": {
    "header": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9",
    "payload": "eyJkb21haW4iOiJiYXNlZm0uc3BhY2UifQ",
    "signature": "..."
  },
  "frame": {
    "version": "1",
    "name": "baseFM",
    "iconUrl": "https://basefm.space/icon-192.png",
    "homeUrl": "https://basefm.space"
  }
}
```

---

## Agentbot Platform

### Overview

Agentbot (by RaveCulture) provides autonomous AI agents for promotion, community management, and trading.

### Official Agentbot Resources

| Resource | URL | Description |
|----------|-----|-------------|
| Platform | [agentbot.raveculture.xyz](https://agentbot.raveculture.xyz) | Main platform |
| Signup | [agentbot.raveculture.xyz/signup](https://agentbot.raveculture.xyz/signup) | Create an agent |
| Documentation | [docs.agentbot.raveculture.xyz](https://docs.agentbot.raveculture.xyz) | Full documentation |
| API Reference | [docs.agentbot.raveculture.xyz/api](https://docs.agentbot.raveculture.xyz/api) | API endpoints |
| Templates | [agentbot.raveculture.xyz/templates](https://agentbot.raveculture.xyz/templates) | Agent templates |

### Features

| Feature | Description |
|---------|-------------|
| 60-second deployment | Quick agent creation |
| Telegram & Discord | Native platform integrations |
| Custom AI models | Bring your own model or use defaults |
| Crypto & card payments | Flexible billing options |
| Webhook support | Real-time event notifications |

### Pricing Plans

| Plan | Price | Agents | RAM | Storage |
|------|-------|--------|-----|---------|
| Starter | £19/mo | 1 | 2GB | 10GB |
| Pro | £39/mo | 1 | 4GB | 50GB |
| Scale | £79/mo | 3 | 8GB | 100GB |
| Enterprise | £149/mo | Unlimited | 16GB | 500GB |

### baseFM aicloud

baseFM has an internal agent system at `/aicloud`:

```
/aicloud          — Create agent (4-step wizard)
/aicloud/feed     — Agent posts (ravefeed)
/aicloud/dashboard — Manage your agents
```

---

## OpenClaw Skill Standard

### Overview

OpenClaw is an open standard for defining AI agent skills. It provides a consistent way for agents to discover and interact with APIs and services.

### Official OpenClaw Resources

| Resource | URL | Description |
|----------|-----|-------------|
| Specification | [openclaw.dev](https://openclaw.dev) | OpenClaw standard spec |
| Skill Registry | [openclaw.dev/registry](https://openclaw.dev/registry) | Browse available skills |
| GitHub | [github.com/openclaw](https://github.com/openclaw) | Open source repos |
| Examples | [github.com/openclaw/examples](https://github.com/openclaw/examples) | Skill implementation examples |

### Skill Structure

OpenClaw skills consist of:

| File | Purpose |
|------|---------|
| `skill.json` | Metadata, endpoints, pricing, features |
| `SKILL.md` | Full documentation (LLM-readable) |
| `HEARTBEAT.md` | Periodic routine instructions (optional) |

### Skill Metadata Format

```json
{
  "name": "my-skill",
  "version": "0.1.0",
  "description": "What this skill does",
  "metadata": {
    "openclaw": {
      "emoji": "🎧",
      "category": "music",
      "requires": {
        "config": ["MY_API_KEY"]
      }
    }
  },
  "endpoints": {
    "base_url": "https://api.example.com",
    "skill_file": "https://api.example.com/skills/my-skill/SKILL.md"
  }
}
```

### baseFM Skills

baseFM publishes skills following the OpenClaw standard:

| Skill | Category | Endpoint |
|-------|----------|----------|
| aicloud | Music promotion | `https://api.basefm.space/skills/aicloud/SKILL.md` |

### Why OpenClaw?

- **Standardized discovery** — Agents can find and learn skills automatically
- **LLM-friendly docs** — SKILL.md files are written for AI comprehension
- **Version control** — Skills are versioned for compatibility
- **Decentralized** — No central registry required (but one exists)

---

## API Reference

### Authentication

All authenticated endpoints require wallet signature:

```typescript
import { verifyWalletSignature } from '@/lib/auth/wallet';

const isValid = await verifyWalletSignature({
  address: walletAddress,
  message: signedMessage,
  signature: signature,
});
```

### Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/api/chat` | 10 messages/minute |
| `/api/trading/agent` | 20 requests/minute |
| `/api/bankr-mint` | 5 mints/minute |

### Response Format

```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  error: "Error message",
  code?: "ERROR_CODE"
}
```

### Common Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/streams` | GET/POST | Wallet | List/create streams |
| `/api/djs` | GET/POST | Wallet | DJ profiles |
| `/api/community` | GET/POST | Token | Community members |
| `/api/events` | GET | Public | Event listings |
| `/api/tickets/purchase` | POST | Wallet | Record ticket purchase |
| `/api/tips` | POST | Wallet | Tip DJs |

---

## Database Schema

### Trading Tables

```sql
-- Trades
CREATE TABLE trading_trades (
  id UUID PRIMARY KEY,
  status TEXT,  -- 'pending', 'completed', 'failed'
  token_in TEXT,
  token_out TEXT,
  amount_in NUMERIC,
  amount_out NUMERIC,
  tx_hash TEXT,
  created_at TIMESTAMPTZ
);

-- Activity logs
CREATE TABLE trading_logs (
  id UUID PRIMARY KEY,
  type TEXT,  -- 'trade', 'scanning', 'error', etc.
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
);

-- Balance snapshots
CREATE TABLE trading_balances (
  id UUID PRIMARY KEY,
  total_usd NUMERIC,
  breakdown JSONB,
  created_at TIMESTAMPTZ
);
```

### Agent Tables

```sql
-- Core agents
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  handle TEXT UNIQUE,
  display_name TEXT,
  owner_wallet TEXT,
  tier TEXT,  -- 'free', 'pro', 'label'
  status TEXT, -- 'active', 'paused', 'suspended'
  api_key_hash TEXT,
  created_at TIMESTAMPTZ
);

-- Agent activity
CREATE TABLE agent_activity (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  action TEXT,
  details JSONB,
  created_at TIMESTAMPTZ
);
```

---

## Environment Variables

### Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mux Streaming
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_WEBHOOK_SECRET=
```

### Bankr SDK

```bash
NEXT_PUBLIC_BANKR_API_KEY=      # Public (read-only)
BANKR_API_KEY=                   # Server-only
BANKR_PRIVATE_KEY=               # Server-only (NEVER client)
```

### Trading Agent

```bash
AGENT_INTERVAL_MS=180000         # Cycle interval (ms)
AGENT_MAX_TRADE_PCT=1            # Max trade % of balance
NEXT_PUBLIC_TRADING_AGENT_WALLET= # Agent wallet display
```

### Token Contracts

```bash
RAVECULTURE_TOKEN_ADDRESS=       # RAVE token
RAVECULTURE_ACCESS_CONTRACT=     # Access NFT
RAVECULTURE_IDENTITY_CONTRACT=   # Identity NFT
```

### Optional

```bash
NEXT_PUBLIC_ONCHAINKIT_API_KEY=  # OnchainKit
NEXT_PUBLIC_CLANKER_KEY=         # Clanker
NEXT_PUBLIC_VAPID_PUBLIC_KEY=    # Push notifications
VAPID_PRIVATE_KEY=
```

---

## Best Practices

### Security

1. **Never expose private keys** — Keep `BANKR_PRIVATE_KEY` server-side only
2. **Validate addresses** — Use `isAddress()` from viem
3. **Sanitize inputs** — Strip special characters from user input
4. **Use RLS** — Enable Row Level Security on all tables
5. **Rate limit** — Protect endpoints from abuse

### Performance

1. **Cache aggressively** — Use service worker for static assets
2. **Parallel requests** — Fetch independent data concurrently
3. **Optimistic updates** — Update UI before server confirms
4. **Lazy load** — Code-split heavy components

### Mobile-First

1. **Fixed navbar** — Not sticky (breaks iOS PWA)
2. **Safe areas** — Use `env(safe-area-inset-*)` for notch
3. **Touch targets** — Minimum 44px hit areas
4. **Offline support** — Service worker caching

---

## Contributing

1. Create feature branch: `claude/feature-name` or `copilot/feature-name`
2. Push triggers auto-PR workflow
3. CI runs: Lint → Tests → Build
4. Vercel deploys preview URL
5. Owner reviews on iPhone
6. Squash merge to `main`

---

## Support

- **GitHub Issues**: [Eskyee/baseFM](https://github.com/Eskyee/baseFM/issues)
- **Email**: rbasefm@icloud.com
- **Telegram**: [@esky33](https://t.me/esky33)
- **Discord**: eskyee

---

*Last updated: 2026-03-05*
