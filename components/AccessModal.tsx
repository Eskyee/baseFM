'use client';

import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

/**
 * AccessModal
 *
 * Single entry point for all six DJ access rails:
 *   1. Hold RAVE on Base       (token check)
 *   2. Hold AGENTBOT on Solana (token check)
 *   3. USDC pay-as-you-go      ($2 + $5/hr → /api/billing/streams/[id]/settle)
 *   4. USDC subscription       ($40/mo on Base → /api/billing/subscription)
 *   5. Stripe subscription     ($40/mo card → /api/billing/subscription/stripe-checkout)
 *   6. Headliner invite code   (admin-issued promo → /api/headliner-codes/redeem)
 *
 * Whichever rail unlocks first wins — the gate code in tokenGate.ts checks
 * each in turn and the modal reflects the user's verified status on close.
 */

type Rail = 'token-rave' | 'token-agentbot' | 'usdc-payg' | 'usdc-sub' | 'stripe-sub' | 'headliner-code';

interface RailDef {
  rail: Rail;
  label: string;
  badge: string;
  price: string;
  cadence: string;
  description: string;
  cta: string;
  accent: string;
}

const RAILS: RailDef[] = [
  {
    rail: 'token-rave',
    label: 'Hold RAVE',
    badge: 'TOKEN — BASE',
    price: '50,000 RAVE',
    cadence: 'one-time',
    description: '~$25 USD on Base. Wallet check, no transaction.',
    cta: 'Verify RAVE balance',
    accent: 'purple',
  },
  {
    rail: 'token-agentbot',
    label: 'Hold AGENTBOT',
    badge: 'TOKEN — SOLANA',
    price: '≈ $25 USD',
    cadence: 'one-time',
    description: 'Equivalent value on Solana. Same DJ rights.',
    cta: 'Verify AGENTBOT balance',
    accent: 'blue',
  },
  {
    rail: 'usdc-payg',
    label: 'Pay per session',
    badge: 'USDC — PAYG',
    price: '$2 + $5/hr',
    cadence: 'per session',
    description: 'No commitment. Settles in USDC at stream end.',
    cta: 'Continue with PAYG',
    accent: 'green',
  },
  {
    rail: 'usdc-sub',
    label: 'Subscribe (USDC)',
    badge: 'USDC — MONTHLY',
    price: '$40/mo',
    cadence: 'monthly',
    description: 'Waives session fee. $3/hr metered. Paid in USDC on Base.',
    cta: 'Subscribe with USDC',
    accent: 'cyan',
  },
  {
    rail: 'stripe-sub',
    label: 'Subscribe (Card)',
    badge: 'STRIPE — MONTHLY',
    price: '$40/mo',
    cadence: 'monthly',
    description: 'Same plan as USDC sub. Visa, Mastercard, Apple Pay via Stripe.',
    cta: 'Subscribe with card',
    accent: 'yellow',
  },
  {
    rail: 'headliner-code',
    label: 'Have an invite code?',
    badge: 'HEADLINER — PROMO',
    price: 'Free',
    cadence: 'admin-issued',
    description: 'Free DJ access for invited headliners. baseFM covers the cost.',
    cta: 'Redeem invite code',
    accent: 'pink',
  },
];

const ACCENT: Record<string, { border: string; bg: string; text: string }> = {
  purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-300' },
  blue:   { border: 'border-blue-500/30',   bg: 'bg-blue-500/10',   text: 'text-blue-300'   },
  green:  { border: 'border-green-500/30',  bg: 'bg-green-500/10',  text: 'text-green-300'  },
  cyan:   { border: 'border-cyan-500/30',   bg: 'bg-cyan-500/10',   text: 'text-cyan-300'   },
  yellow: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', text: 'text-yellow-300' },
  pink:   { border: 'border-pink-500/30',   bg: 'bg-pink-500/10',   text: 'text-pink-300'   },
};

export interface AccessModalProps {
  open: boolean;
  onClose: () => void;
  streamId?: string;
  onUnlocked?: (rail: Rail) => void;
}

export default function AccessModal({ open, onClose, streamId, onUnlocked }: AccessModalProps) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [selected, setSelected] = useState<Rail | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  async function handleRail(rail: Rail) {
    setError(null);
    setSuccess(null);
    setSelected(rail);

    if (!address) {
      setError('Connect your wallet first.');
      return;
    }

    setBusy(true);
    try {
      switch (rail) {
        case 'token-rave':
        case 'token-agentbot': {
          const res = await fetch(`/api/token/check?wallet=${address}&rail=${rail}`);
          const data = await res.json();
          if (data.hasAccess) {
            setSuccess(`Verified — ${rail === 'token-rave' ? 'RAVE' : 'AGENTBOT'} balance meets the gate.`);
            onUnlocked?.(rail);
          } else {
            setError(`Insufficient ${rail === 'token-rave' ? 'RAVE' : 'AGENTBOT'} balance. Required: ${data.requiredAmount} ${data.symbol}.`);
          }
          break;
        }
        case 'usdc-payg': {
          if (!streamId) {
            setError('No active stream — start a session first.');
            break;
          }
          const res = await fetch(`/api/billing/streams/${streamId}/settle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: address, mode: 'session-fee' }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error ?? `Failed (${res.status})`);
            break;
          }
          setSuccess('Session fee paid. You can go live.');
          onUnlocked?.(rail);
          break;
        }
        case 'usdc-sub': {
          const res = await fetch('/api/billing/subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: address, rail: 'usdc' }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error ?? `Failed (${res.status})`);
            break;
          }
          setSuccess('Subscription active. Welcome to the $40/mo tier.');
          onUnlocked?.(rail);
          break;
        }
        case 'stripe-sub': {
          const res = await fetch('/api/billing/subscription/stripe-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: address }),
          });
          const data = await res.json();
          if (!res.ok || !data.url) {
            setError(data.error ?? 'Stripe checkout failed.');
            break;
          }
          // Redirect to Stripe Checkout
          window.location.href = data.url as string;
          break;
        }
        case 'headliner-code': {
          if (!code.trim()) {
            setError('Enter your invite code.');
            break;
          }
          const nonce = crypto.randomUUID();
          const timestamp = new Date().toISOString();
          const message = `Redeem baseFM headliner code ${code.trim().toUpperCase()}\nWallet: ${address}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
          const signature = await signMessageAsync({ message });

          const res = await fetch('/api/headliner-codes/redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: code.trim().toUpperCase(),
              walletAddress: address,
              signature, message, nonce, timestamp,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error ?? `Redeem failed (${res.status})`);
            break;
          }
          setSuccess(`Redeemed — free access until ${new Date(data.accessEndsAt).toLocaleDateString()}.`);
          onUnlocked?.(rail);
          break;
        }
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0A0A0A] border border-[#222] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#F5F5F5]">Choose Your Access</h2>
          <button onClick={onClose} className="text-[#666] hover:text-[#F5F5F5] text-2xl leading-none">×</button>
        </div>

        <p className="text-[#888] text-sm mb-5">
          All paths unlock the same DJ rights. Pick whichever rail fits you.
        </p>

        <div className="grid gap-3">
          {RAILS.map((r) => {
            const a = ACCENT[r.accent];
            const isSelected = selected === r.rail;
            return (
              <div
                key={r.rail}
                className={`bg-[#1A1A1A] rounded-xl p-4 border ${a.border} ${isSelected ? 'ring-1 ring-purple-400' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-md ${a.bg} ${a.text} text-xs font-mono`}>{r.badge}</span>
                  <span className="text-[#666] text-xs">{r.cadence}</span>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-[#F5F5F5] font-medium">{r.label}</p>
                  <p className={`font-bold ${a.text}`}>{r.price}</p>
                </div>
                <p className="text-[#888] text-xs mb-3">{r.description}</p>

                {r.rail === 'headliner-code' && (
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="HEADLINER-XXXX"
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] font-mono mb-2 focus:outline-none focus:border-pink-500"
                  />
                )}

                <button
                  disabled={busy}
                  onClick={() => handleRail(r.rail)}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-opacity ${a.bg} ${a.text} hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {busy && isSelected ? 'Working…' : r.cta}
                </button>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
