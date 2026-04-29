'use client';

import { useCallback, useEffect, useState } from 'react';
import { parseUnits } from 'viem';
import { useAccount, useSignMessage, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useStream } from '@/hooks/useStream';
import { useDJAccess } from '@/hooks/useDJAccess';
import { WalletConnect } from '@/components/WalletConnect';
import { createStreamActionMessage, generateNonce, StreamAction } from '@/lib/auth/wallet';
import { ERC20_TRANSFER_ABI } from '@/lib/token/tip-config';
import Link from 'next/link';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const USDC_DECIMALS = 6;

function StatusPill({ status }: { status: 'active' | 'idle' | 'error' | 'offline' }) {
  const classes = {
    active: 'border border-green-500/30 bg-green-500/10 text-green-300',
    idle: 'border border-amber-500/30 bg-amber-500/10 text-amber-300',
    error: 'border border-red-500/30 bg-red-500/10 text-red-300',
    offline: 'border border-zinc-700 bg-black text-zinc-400',
  };
  return <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest font-mono ${classes[status]}`} />;
}

interface BillingSummary {
  platformWallet: string;
  pricing: {
    streamSessionFeeUsdc: number;
    monthlySubscriptionFeeUsdc: number;
    meteredRateUsdcPerHour: number;
    subscribedMeteredRateUsdcPerHour: number;
    tipPlatformFeeBps: number;
    ticketPlatformFeeBps: number;
  };
  subscription?: {
    id: string;
    endsAt: string;
  } | null;
  streamSession?: {
    sessionFeeStatus: 'pending' | 'paid' | 'waived';
    meteredFeeStatus: 'pending' | 'paid' | 'waived';
    meteredFeeUsdc: number;
    durationSeconds: number;
  } | null;
  canActivateStream: boolean;
  requiresSessionPayment: boolean;
  outstandingMeteredFeeUsdc: number;
}

function formatAddress(address?: string | null) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function DJStreamControlPage({ params }: { params: { id: string } }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { stream, isLoading, error, refetch } = useStream(params.id);
  const { isAdmin } = useDJAccess();
  const { writeContract, data: billingTxHash, isPending: isBillingPending, error: billingWriteError } = useWriteContract();
  const { isLoading: isBillingConfirming, isSuccess: isBillingConfirmed } = useWaitForTransactionReceipt({
    hash: billingTxHash,
  });
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isSettingUpMux, setIsSettingUpMux] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingSummary | null>(null);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [billingAction, setBillingAction] = useState<'subscription' | 'session' | 'metered' | null>(null);
  const [isRecordingBilling, setIsRecordingBilling] = useState(false);
  const [showStreamKey, setShowStreamKey] = useState(false);

  const fetchBilling = useCallback(async () => {
    if (!stream) return;
    setIsBillingLoading(true);
    try {
      const response = await fetch(`/api/billing/streams/${stream.id}`);
      if (!response.ok) throw new Error('Failed to fetch billing status');
      const data = await response.json();
      setBilling(data.billing || null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to fetch billing status');
    } finally {
      setIsBillingLoading(false);
    }
  }, [stream]);

  useEffect(() => {
    if (stream && isConnected && !isAdmin) void fetchBilling();
  }, [fetchBilling, stream, isConnected, isAdmin]);

  useEffect(() => {
    if (billingWriteError) setActionError(billingWriteError.message || 'Billing transaction failed');
  }, [billingWriteError]);

  useEffect(() => {
    if (!billingTxHash || !billingAction || !isBillingConfirmed || !address || !stream || isRecordingBilling) return;

    const recordBilling = async () => {
      setIsRecordingBilling(true);
      setActionError(null);
      try {
        const endpoint =
          billingAction === 'subscription'
            ? '/api/billing/subscription'
            : billingAction === 'session'
            ? `/api/billing/streams/${stream.id}`
            : `/api/billing/streams/${stream.id}/settle`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address, txHash: billingTxHash }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to record billing payment');

        setActionSuccess(
          billingAction === 'subscription'
            ? 'Subscription activated.'
            : billingAction === 'session'
            ? 'Session fee recorded. You can now generate credentials and start the stream.'
            : 'Metered stream fee settled.'
        );
        await fetchBilling();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Failed to record billing payment');
      } finally {
        setBillingAction(null);
        setIsRecordingBilling(false);
      }
    };
    void recordBilling();
  }, [address, billingAction, billingTxHash, fetchBilling, isBillingConfirmed, isRecordingBilling, stream]);

  const payUsdc = (amountUsdc: number, action: 'subscription' | 'session' | 'metered') => {
    if (!billing?.platformWallet || !amountUsdc || amountUsdc <= 0) {
      setActionError('Billing destination is not available');
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    setBillingAction(action);
    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_TRANSFER_ABI,
      functionName: 'transfer',
      args: [billing.platformWallet as `0x${string}`, parseUnits(amountUsdc.toFixed(2), USDC_DECIMALS)],
    });
  };

  const createSignedPayload = async (action: StreamAction) => {
    if (!address) throw new Error('Connect your wallet to continue');
    const nonce = generateNonce();
    const timestamp = new Date().toISOString();
    const message = createStreamActionMessage(action, stream!.id, nonce, timestamp);
    const signature = await signMessageAsync({ message });
    return { djWalletAddress: address, signature, message, nonce, timestamp };
  };

  const handleStart = async () => {
    setIsStarting(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const response = await fetch(`/api/streams/${stream!.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ djWalletAddress: address }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 402 && data.billing) setBilling(data.billing);
        throw new Error(data.error || 'Failed to start stream');
      }
      setActionSuccess('Stream marked as preparing. Start your encoder to go live.');
      refetch();
      void fetchBilling();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const signedPayload = await createSignedPayload('stop');
      const response = await fetch(`/api/streams/${stream!.id}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signedPayload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to stop stream');
      }
      setActionSuccess('Stream ended. Listener sessions will clear automatically.');
      refetch();
      void fetchBilling();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsStopping(false);
    }
  };

  const handleSetupMux = async () => {
    setIsSettingUpMux(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const signedPayload = await createSignedPayload('setup');
      const response = await fetch(`/api/streams/${stream!.id}/setup-mux`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signedPayload),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 402 && data.billing) setBilling(data.billing);
        throw new Error(data.error || 'Failed to setup streaming');
      }
      setActionSuccess('Streaming credentials generated! You can now go live.');
      refetch();
      void fetchBilling();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSettingUpMux(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const response = await fetch(`/api/streams/${stream!.id}/check-status`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to check status');
      setActionSuccess(data.updated ? `Status updated: ${data.previousStatus} → ${data.currentStatus}` : `Mux status: ${data.muxStatus} (no change needed)`);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // ── Not connected ───────────────────────────────────────────────
  if (!isConnected) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-lg mx-auto space-y-6">
            <div className="basefm-kicker text-blue-500">Stream Control</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter uppercase leading-[0.92]">
              Connect wallet.
            </h1>
            <p className="text-sm text-zinc-400">Connect your wallet to manage this stream.</p>
            <WalletConnect />
          </div>
        </section>
      </main>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl space-y-6 animate-pulse">
            <div className="h-6 w-48 bg-zinc-900" />
            <div className="h-64 bg-zinc-900" />
          </div>
        </section>
      </main>
    );
  }

  // ── Error / Not found ───────────────────────────────────────────
  if (error || !stream) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-lg mx-auto space-y-4">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">Error</div>
            <h1 className="text-3xl font-bold tracking-tighter uppercase">Stream Not Found</h1>
            <Link href="/dashboard" className="inline-block text-[10px] uppercase tracking-widest text-blue-500 border border-blue-500/30 px-4 py-2 hover:bg-blue-500/10 transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // ── Unauthorized ────────────────────────────────────────────────
  if (stream.djWalletAddress.toLowerCase() !== address?.toLowerCase()) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-lg mx-auto space-y-4">
            <div className="text-[10px] uppercase tracking-widest text-red-400">Unauthorized</div>
            <h1 className="text-3xl font-bold tracking-tighter uppercase">Not Your Stream</h1>
            <p className="text-sm text-zinc-400">You do not own this stream.</p>
            <Link href="/dashboard" className="inline-block text-[10px] uppercase tracking-widest text-blue-500 border border-blue-500/30 px-4 py-2 hover:bg-blue-500/10 transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const needsMuxSetup = !stream.muxStreamKey;
  const isLive = stream.status === 'LIVE';
  const isPreparing = stream.status === 'PREPARING';
  const canStart = stream.status === 'CREATED';
  const canStop = isLive || isPreparing;

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <div className="max-w-3xl space-y-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">Stream Control</span>
            <span className={`basefm-kicker ${isLive ? 'text-red-400' : isPreparing ? 'text-amber-400' : 'text-zinc-500'}`}>
              {stream.status}
            </span>
            {isAdmin && <span className="basefm-kicker text-green-400">Admin</span>}
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase leading-[0.92]">
              {stream.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-widest text-zinc-600">
              <span>{stream.djName}</span>
              {stream.genre && <><span className="text-zinc-800">·</span><span>{stream.genre}</span></>}
              <span className="text-zinc-800">·</span>
              <span>{formatAddress(stream.djWalletAddress)}</span>
            </div>
          </div>

          {/* Alerts */}
          {actionError && (
            <div className="border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
              {actionError}
            </div>
          )}
          {actionSuccess && (
            <div className="border border-green-500/30 bg-green-500/10 p-4 text-xs text-green-300">
              {actionSuccess}
            </div>
          )}
        </div>
      </section>

      {/* Billing — hidden for admins */}
      {!isAdmin && (
      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
          <div className="max-w-3xl">
            <div className="border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Billing</div>
                  <h2 className="text-sm font-bold uppercase tracking-wider">Streaming Billing</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Session fee, monthly subscription, and per-hour metering.
                  </p>
                </div>
                {billing?.subscription ? (
                  <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest border border-green-500/30 bg-green-500/10 text-green-300">
                    Sub active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest border border-zinc-700 bg-black text-zinc-400">
                    Pay per stream
                  </span>
                )}
              </div>

              {isBillingLoading ? (
                <p className="text-xs text-zinc-500">Loading billing status...</p>
              ) : billing ? (
                <div className="space-y-4">
                  <div className="grid gap-px bg-zinc-900 sm:grid-cols-3">
                    <div className="bg-black p-4">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Session Fee</div>
                      <div className="text-lg font-bold tracking-tight">${billing.pricing.streamSessionFeeUsdc.toFixed(2)}</div>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        {billing.streamSession?.sessionFeeStatus === 'paid' ? 'Paid' : billing.streamSession?.sessionFeeStatus === 'waived' ? 'Waived' : 'Required'}
                      </div>
                    </div>
                    <div className="bg-black p-4">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Monthly Sub</div>
                      <div className="text-lg font-bold tracking-tight">${billing.pricing.monthlySubscriptionFeeUsdc.toFixed(2)}</div>
                      <div className="text-[10px] text-zinc-500 mt-1">Waives session fee</div>
                    </div>
                    <div className="bg-black p-4">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Metered</div>
                      <div className="text-lg font-bold tracking-tight">${billing.pricing.meteredRateUsdcPerHour.toFixed(2)}<span className="text-xs text-zinc-500">/hr</span></div>
                      <div className="text-[10px] text-zinc-500 mt-1">Outstanding: ${billing.outstandingMeteredFeeUsdc.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {!billing.subscription && (
                      <button onClick={() => payUsdc(billing.pricing.monthlySubscriptionFeeUsdc, 'subscription')} disabled={isBillingPending || isBillingConfirming || isRecordingBilling} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-blue-500/40 text-blue-400 hover:bg-blue-500 hover:text-black transition-all disabled:opacity-50">
                        {billingAction === 'subscription' && (isBillingPending || isBillingConfirming || isRecordingBilling) ? 'Activating...' : 'Buy Subscription'}
                      </button>
                    )}
                    {billing.requiresSessionPayment && (
                      <button onClick={() => payUsdc(billing.pricing.streamSessionFeeUsdc, 'session')} disabled={isBillingPending || isBillingConfirming || isRecordingBilling} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-purple-500/40 text-purple-400 hover:bg-purple-500 hover:text-black transition-all disabled:opacity-50">
                        {billingAction === 'session' && (isBillingPending || isBillingConfirming || isRecordingBilling) ? 'Recording...' : 'Pay Session Fee'}
                      </button>
                    )}
                    {billing.outstandingMeteredFeeUsdc > 0 && stream.status === 'ENDED' && (
                      <button onClick={() => payUsdc(billing.outstandingMeteredFeeUsdc, 'metered')} disabled={isBillingPending || isBillingConfirming || isRecordingBilling} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-black transition-all disabled:opacity-50">
                        {billingAction === 'metered' && (isBillingPending || isBillingConfirming || isRecordingBilling) ? 'Settling...' : `Settle $${billing.outstandingMeteredFeeUsdc.toFixed(2)}`}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">Billing status unavailable.</p>
              )}
            </div>

            {/* Co-Show */}
            <Link href={`/dashboard/stream/${stream.id}/co-show`} className="mt-px flex items-center justify-between border border-zinc-800 bg-zinc-950 p-6 hover:bg-zinc-900 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-lg">🎛️</span>
                <div>
                  <span className="text-sm font-bold uppercase tracking-wider text-amber-400">Co-Show (B2B)</span>
                  <p className="text-[10px] text-zinc-500 mt-1">Invite another DJ for a back-to-back set</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* Mux Setup */}
      {needsMuxSetup && (
        <section className="border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
            <div className="max-w-3xl border border-purple-500/30 bg-purple-500/5 p-6">
              <div className="text-[10px] uppercase tracking-widest text-purple-400 mb-2">Setup Required</div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-purple-300 mb-3">Streaming Credentials</h2>
              <p className="text-xs text-zinc-400 mb-4">
                This stream needs RTMP credentials. Generating these will allow you to connect OBS or mobile streaming apps.
              </p>
              <button onClick={handleSetupMux} disabled={isSettingUpMux} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-purple-500/40 text-purple-400 hover:bg-purple-500 hover:text-black transition-all disabled:opacity-50">
                {isSettingUpMux ? 'Provisioning...' : 'Generate Streaming Credentials'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* RTMP Credentials */}
      {!needsMuxSetup && (canStart || isPreparing || isLive) && stream.rtmpUrl && (
        <section className="border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
            <div className="max-w-3xl space-y-px">
              <div className="border border-zinc-800 bg-zinc-950 p-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Encoder / OBS Settings</div>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4">RTMP Credentials</h2>
                <p className="text-xs text-zinc-500 mb-6">Copy the credentials for your streaming software.</p>

                {/* Full URL for mobile */}
                {stream.muxStreamKey && (
                  <div className="border border-zinc-800 bg-black p-4 mb-4">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Full Stream URL (Mobile Apps)</div>
                    <code className="block text-xs text-green-400 break-all select-all mb-3">
                      rtmps://global-live.mux.com:443/app/{stream.muxStreamKey}
                    </code>
                    <button onClick={() => { navigator.clipboard.writeText(`rtmps://global-live.mux.com:443/app/${stream.muxStreamKey}`); setActionSuccess('Full stream URL copied!'); setTimeout(() => setActionSuccess(null), 3000); }} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-all">
                      Copy Full URL
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 py-3">
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">or use separate fields for OBS</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>

                {/* Server URL */}
                <div className="border border-zinc-800 bg-black p-4 mt-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Server URL</div>
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-xs text-green-400 break-all select-all">rtmps://global-live.mux.com:443/app</code>
                    <button onClick={() => { navigator.clipboard.writeText('rtmps://global-live.mux.com:443/app'); setActionSuccess('Server URL copied!'); setTimeout(() => setActionSuccess(null), 2000); }} className="flex-shrink-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all">
                      Copy
                    </button>
                  </div>
                </div>

                {/* Stream Key */}
                <div className="border border-zinc-800 bg-black p-4 mt-px">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Stream Key</div>
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-xs text-green-400 break-all select-all">
                      {showStreamKey ? (stream.muxStreamKey || '••••••••••••••••') : '••••••••••••••••'}
                    </code>
                    <div className="flex gap-2 flex-shrink-0">
                      {stream.muxStreamKey && (
                        <button onClick={() => setShowStreamKey(!showStreamKey)} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all">
                          {showStreamKey ? 'Hide' : 'Show'}
                        </button>
                      )}
                      {stream.muxStreamKey && (
                        <button onClick={() => { navigator.clipboard.writeText(stream.muxStreamKey!); setActionSuccess('Stream Key copied!'); setTimeout(() => setActionSuccess(null), 2000); }} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all">
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* OBS Quick Notes */}
              <div className="border border-zinc-800 bg-zinc-950 p-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Pioneer / Rekordbox Quick Notes</div>
                <div className="space-y-2 text-xs text-zinc-500">
                  <p>1. Keep cue, beatmatch, loops, hot cues, and EQ work on your Pioneer hardware or Rekordbox.</p>
                  <p>2. Use the mixer master as the source feed for OBS.</p>
                  <p>3. Treat baseFM like the broadcast rack after the mixer, not a CDJ or mixer replacement.</p>
                  <p>4. Audio: 256-320 kbps · AAC · 44.1kHz Stereo.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Controls */}
      {!needsMuxSetup && (
        <section className="border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
            <div className="max-w-3xl space-y-px">
              <div className="border border-zinc-800 bg-zinc-950 p-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Stream Controls</div>

                <div className="flex flex-wrap gap-3">
                  {canStart && (
                    <button onClick={handleStart} disabled={isStarting} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest border border-green-500/40 text-green-400 hover:bg-green-500 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {isStarting ? 'Starting...' : 'Go Live'}
                    </button>
                  )}
                  {canStop && (
                    <button onClick={handleStop} disabled={isStopping} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {isStopping ? 'Stopping...' : 'End Stream'}
                    </button>
                  )}
                  {stream.status === 'ENDED' && (
                    <p className="text-xs text-zinc-500">This stream has ended.</p>
                  )}
                </div>

                {isPreparing && (
                  <div className="mt-4 border border-amber-500/30 bg-amber-500/5 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-amber-400 mb-2">Waiting for video feed</p>
                    <p className="text-xs text-zinc-500 mb-3">Start streaming from OBS to go live.</p>
                    <button onClick={handleCheckStatus} disabled={isCheckingStatus} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-blue-500/40 text-blue-400 hover:bg-blue-500 hover:text-black transition-all disabled:opacity-50">
                      {isCheckingStatus ? 'Checking...' : 'Check Mux Status'}
                    </button>
                  </div>
                )}

                {isLive && (
                  <div className="mt-4 border border-green-500/30 bg-green-500/5 p-4">
                    <p className="text-sm font-bold uppercase tracking-wider text-green-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      You are LIVE
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stream Details */}
      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
          <div className="max-w-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Stream Details</div>
            <div className="grid gap-px bg-zinc-900 sm:grid-cols-2">
              <div className="bg-black p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">DJ Name</div>
                <div className="text-sm text-zinc-300">{stream.djName}</div>
              </div>
              {stream.genre && (
                <div className="bg-black p-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Genre</div>
                  <div className="text-sm text-zinc-300">{stream.genre}</div>
                </div>
              )}
              <div className="bg-black p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Token Gated</div>
                <div className="text-sm text-zinc-300">{stream.isGated ? 'Yes' : 'No'}</div>
              </div>
              <div className="bg-black p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Created</div>
                <div className="text-sm text-zinc-300">{new Date(stream.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            {stream.description && (
              <div className="mt-4 border-t border-zinc-800 pt-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Description</div>
                <p className="text-xs text-zinc-400">{stream.description}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
