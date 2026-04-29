'use client';

import { useCallback, useEffect, useState } from 'react';
import { parseUnits } from 'viem';
import { useAccount, useSignMessage, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useStream } from '@/hooks/useStream';
import { WalletConnect } from '@/components/WalletConnect';
import { createStreamActionMessage, generateNonce, StreamAction } from '@/lib/auth/wallet';
import { ERC20_TRANSFER_ABI } from '@/lib/token/tip-config';
import Link from 'next/link';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const USDC_DECIMALS = 6;

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

function CopyField({ label, value, onCopy }: { label: string; value: string; onCopy: (v: string, l: string) => void }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">{label}</div>
      <div className="flex flex-col sm:flex-row gap-px">
        <code className="flex-1 bg-black border border-zinc-800 px-4 py-3 text-xs text-orange-400 font-mono break-all">
          {value}
        </code>
        <button
          onClick={() => onCopy(value, label)}
          className="basefm-button-secondary px-4 py-3 text-[10px]"
        >
          Copy
        </button>
      </div>
    </div>
  );
}

export default function DJStreamControlPage({ params }: { params: { id: string } }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { stream, isLoading, error, refetch } = useStream(params.id);
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
  const [copiedLabel, setCopiedLabel] = useState('');

  const copyValue = async (value: string, label: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLabel(label);
      setActionSuccess(`${label} copied`);
      setTimeout(() => {
        setCopiedLabel((c) => (c === label ? '' : c));
        setActionSuccess(null);
      }, 2000);
    } catch {
      setActionError('Copy failed. Select the text manually.');
    }
  };

  const fetchBilling = useCallback(async () => {
    if (!stream) return;
    setIsBillingLoading(true);
    try {
      const response = await fetch(`/api/billing/streams/${stream.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch billing status');
      }
      const data = await response.json();
      setBilling(data.billing || null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to fetch billing status');
    } finally {
      setIsBillingLoading(false);
    }
  }, [stream]);

  useEffect(() => {
    if (stream && isConnected) {
      void fetchBilling();
    }
  }, [fetchBilling, stream, isConnected]);

  useEffect(() => {
    if (billingWriteError) {
      setActionError(billingWriteError.message || 'Billing transaction failed');
    }
  }, [billingWriteError]);

  useEffect(() => {
    if (!billingTxHash || !billingAction || !isBillingConfirmed || !address || !stream || isRecordingBilling) {
      return;
    }

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

        const body =
          billingAction === 'subscription'
            ? { walletAddress: address, txHash: billingTxHash }
            : { walletAddress: address, txHash: billingTxHash };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to record billing payment');
        }

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
      args: [
        billing.platformWallet as `0x${string}`,
        parseUnits(amountUsdc.toFixed(2), USDC_DECIMALS),
      ],
    });
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20">
        <section className="max-w-3xl mx-auto px-5 sm:px-6 py-16 text-center space-y-6">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">Stream Control</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Connect Wallet</h1>
          <p className="text-zinc-400 text-sm">Connect your wallet to manage this stream.</p>
          <WalletConnect />
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20">
        <section className="max-w-3xl mx-auto px-5 sm:px-6 py-16">
          <div className="space-y-px">
            <div className="basefm-panel p-6 animate-pulse"><div className="h-8 bg-zinc-900 w-1/3 mb-4" /><div className="h-48 bg-zinc-900" /></div>
            <div className="basefm-panel p-6 animate-pulse"><div className="h-32 bg-zinc-900" /></div>
          </div>
        </section>
      </main>
    );
  }

  if (error || !stream) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20">
        <section className="max-w-3xl mx-auto px-5 sm:px-6 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tighter uppercase">Stream Not Found</h1>
          <Link href="/dashboard" className="text-[10px] uppercase tracking-widest text-orange-400 hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
        </section>
      </main>
    );
  }

  if (stream.djWalletAddress.toLowerCase() !== address?.toLowerCase()) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20">
        <section className="max-w-3xl mx-auto px-5 sm:px-6 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tighter uppercase">Unauthorized</h1>
          <p className="text-zinc-400 text-sm">You do not own this stream.</p>
          <Link href="/dashboard" className="text-[10px] uppercase tracking-widest text-orange-400 hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
        </section>
      </main>
    );
  }

  const handleStart = async () => {
    setIsStarting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await fetch(`/api/streams/${stream.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ djWalletAddress: address }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402 && data.billing) {
          setBilling(data.billing);
        }
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

  const createSignedPayload = async (action: StreamAction) => {
    if (!address) {
      throw new Error('Connect your wallet to continue');
    }

    const nonce = generateNonce();
    const timestamp = new Date().toISOString();
    const message = createStreamActionMessage(action, stream.id, nonce, timestamp);
    const signature = await signMessageAsync({ message });

    return {
      djWalletAddress: address,
      signature,
      message,
      nonce,
      timestamp,
    };
  };

  const handleStop = async () => {
    setIsStopping(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const signedPayload = await createSignedPayload('stop');
      const response = await fetch(`/api/streams/${stream.id}/stop`, {
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
      const response = await fetch(`/api/streams/${stream.id}/setup-mux`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signedPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402 && data.billing) {
          setBilling(data.billing);
        }
        throw new Error(data.error || 'Failed to setup streaming');
      }

      setActionSuccess('Streaming credentials generated. You can now go live.');
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
      const response = await fetch(`/api/streams/${stream.id}/check-status`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check status');
      }

      if (data.updated) {
        setActionSuccess(`Status updated: ${data.previousStatus} → ${data.currentStatus}`);
      } else {
        setActionSuccess(`Mux status: ${data.muxStatus} (no change needed)`);
      }
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const needsMuxSetup = !stream.muxStreamKey;
  const isLive = stream.status === 'LIVE';
  const isPreparing = stream.status === 'PREPARING';
  const canStart = stream.status === 'CREATED';
  const canStop = isLive || isPreparing;

  const statusDisplay = isLive
    ? { classes: 'border-green-500/30 bg-green-500/10 text-green-300', label: 'LIVE' }
    : isPreparing
    ? { classes: 'border-orange-500/30 bg-orange-500/10 text-orange-300', label: 'PREPARING' }
    : stream.status === 'ENDED'
    ? { classes: 'border-zinc-700 bg-zinc-900 text-zinc-500', label: 'ENDED' }
    : { classes: 'border-zinc-700 bg-black text-zinc-400', label: stream.status };

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-orange-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <div className="max-w-3xl space-y-8">

          {/* Back + Header */}
          <div>
            <Link
              href="/dashboard"
              className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-6 inline-block"
            >
              ← Dashboard
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter uppercase leading-[0.92]">
                  {stream.title}
                </h1>
                <p className="text-zinc-500 text-sm mt-1">Stream Control Panel</p>
              </div>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${statusDisplay.classes}`}>
                {isLive && <span className="w-1.5 h-1.5 bg-green-400 animate-pulse inline-block" />}
                {statusDisplay.label}
              </span>
            </div>
          </div>

          {/* Alerts */}
          {actionError && (
            <div className="border border-red-500/30 bg-red-500/5 px-4 py-3 text-xs text-red-300">
              {actionError}
            </div>
          )}
          {actionSuccess && (
            <div className="border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-200">
              {actionSuccess}
            </div>
          )}

          {/* Billing */}
          <div className="space-y-px">
            <div className="basefm-panel p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Streaming Billing</div>
                  <p className="text-xs text-zinc-500">Session fee, monthly DJ subscription, and per-hour stream metering settle to the platform wallet.</p>
                </div>
                {billing?.subscription ? (
                  <span className="px-3 py-1 text-[10px] uppercase tracking-widest border border-green-500/30 bg-green-500/10 text-green-300 whitespace-nowrap">
                    Subscribed until {new Date(billing.subscription.endsAt).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="px-3 py-1 text-[10px] uppercase tracking-widest border border-orange-500/30 bg-orange-500/10 text-orange-300 whitespace-nowrap">
                    Pay per stream
                  </span>
                )}
              </div>

              {isBillingLoading ? (
                <p className="text-xs text-zinc-500">Loading billing status...</p>
              ) : billing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-900">
                    <div className="bg-black p-4">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Session Fee</div>
                      <div className="text-lg font-bold tracking-tight">${billing.pricing.streamSessionFeeUsdc.toFixed(2)} <span className="text-xs text-zinc-500 font-normal">USDC</span></div>
                      <div className="text-[10px] text-zinc-600 mt-1">
                        {billing.streamSession?.sessionFeeStatus === 'paid'
                          ? 'Paid'
                          : billing.streamSession?.sessionFeeStatus === 'waived'
                          ? 'Waived by subscription'
                          : 'Required before setup/start'}
                      </div>
                    </div>
                    <div className="bg-black p-4">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Monthly Subscription</div>
                      <div className="text-lg font-bold tracking-tight">${billing.pricing.monthlySubscriptionFeeUsdc.toFixed(2)} <span className="text-xs text-zinc-500 font-normal">USDC</span></div>
                      <div className="text-[10px] text-zinc-600 mt-1">Waives session fee + lower hourly rate</div>
                    </div>
                    <div className="bg-black p-4">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Metered Rate</div>
                      <div className="text-lg font-bold tracking-tight">${billing.pricing.meteredRateUsdcPerHour.toFixed(2)} <span className="text-xs text-zinc-500 font-normal">/ hour</span></div>
                      <div className="text-[10px] text-zinc-600 mt-1">Outstanding: ${billing.outstandingMeteredFeeUsdc.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {!billing.subscription && (
                      <button
                        onClick={() => payUsdc(billing.pricing.monthlySubscriptionFeeUsdc, 'subscription')}
                        disabled={isBillingPending || isBillingConfirming || isRecordingBilling}
                        className="basefm-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {billingAction === 'subscription' && (isBillingPending || isBillingConfirming || isRecordingBilling)
                          ? 'Activating...'
                          : 'Buy Monthly Subscription'}
                      </button>
                    )}

                    {billing.requiresSessionPayment && (
                      <button
                        onClick={() => payUsdc(billing.pricing.streamSessionFeeUsdc, 'session')}
                        disabled={isBillingPending || isBillingConfirming || isRecordingBilling}
                        className="basefm-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {billingAction === 'session' && (isBillingPending || isBillingConfirming || isRecordingBilling)
                          ? 'Recording fee...'
                          : 'Pay Stream Session Fee'}
                      </button>
                    )}

                    {billing.outstandingMeteredFeeUsdc > 0 && stream.status === 'ENDED' && (
                      <button
                        onClick={() => payUsdc(billing.outstandingMeteredFeeUsdc, 'metered')}
                        disabled={isBillingPending || isBillingConfirming || isRecordingBilling}
                        className="basefm-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {billingAction === 'metered' && (isBillingPending || isBillingConfirming || isRecordingBilling)
                          ? 'Settling...'
                          : `Settle $${billing.outstandingMeteredFeeUsdc.toFixed(2)} USDC`}
                      </button>
                    )}
                  </div>

                  {billing.streamSession?.durationSeconds ? (
                    <p className="text-[10px] text-zinc-600">
                      Last billed duration: {(billing.streamSession.durationSeconds / 60).toFixed(1)} minutes
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">Billing status unavailable.</p>
              )}
            </div>
          </div>

          {/* Co-Show (B2B) */}
          <Link
            href={`/dashboard/stream/${stream.id}/co-show`}
            className="block basefm-panel p-5 border-orange-500/20 hover:border-orange-500/40 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-orange-400 mb-1">Co-Show (B2B)</div>
                <p className="text-xs text-zinc-500">Invite another DJ for a back-to-back set</p>
              </div>
              <span className="text-zinc-600 group-hover:text-white transition-colors">→</span>
            </div>
          </Link>

          {/* Setup Mux */}
          {needsMuxSetup && (
            <div className="basefm-panel p-6">
              <div className="text-[10px] uppercase tracking-widest text-orange-400 mb-3">Credentials Required</div>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                This stream session needs RTMP credentials. Generate them to connect OBS or mobile streaming apps.
              </p>
              <button
                onClick={handleSetupMux}
                disabled={isSettingUpMux}
                className="basefm-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSettingUpMux ? 'Provisioning...' : 'Generate Streaming Credentials'}
              </button>
            </div>
          )}

          {/* RTMP Credentials */}
          {!needsMuxSetup && (canStart || isPreparing || isLive) && stream.rtmpUrl && (
            <div className="space-y-px">
              <div className="basefm-panel p-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">RTMP Credentials</div>
                <p className="text-xs text-zinc-500 mb-6">Copy the credentials for your streaming software.</p>

                <div className="space-y-6">
                  {stream.muxStreamKey && (
                    <div className="border border-orange-500/20 bg-orange-500/5 p-4">
                      <div className="text-[10px] uppercase tracking-widest text-orange-400 mb-2">Full Stream URL (Mobile Apps)</div>
                      <p className="text-[10px] text-zinc-500 mb-3">One-tap copy for Larix, Streamlabs, and other mobile streaming apps</p>
                      <div className="space-y-2">
                        <code className="block bg-black border border-zinc-800 px-4 py-3 text-xs text-orange-400 font-mono break-all">
                          rtmps://global-live.mux.com:443/app/{stream.muxStreamKey}
                        </code>
                        <button
                          onClick={() => copyValue(`rtmps://global-live.mux.com:443/app/${stream.muxStreamKey}`, 'Full URL')}
                          className="w-full basefm-button-primary"
                        >
                          {copiedLabel === 'Full URL' ? 'Copied' : 'Copy Full URL'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">or use separate fields for OBS</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>

                  <CopyField
                    label="Server URL"
                    value="rtmps://global-live.mux.com:443/app"
                    onCopy={copyValue}
                  />

                  <CopyField
                    label="Stream Key"
                    value={stream.muxStreamKey || ''}
                    onCopy={copyValue}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stream Controls */}
          {!needsMuxSetup && (
            <div className="basefm-panel p-6">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Stream Controls</div>

              <div className="flex flex-col sm:flex-row gap-3">
                {canStart && (
                  <button
                    onClick={handleStart}
                    disabled={isStarting}
                    className="basefm-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStarting ? 'Starting...' : 'Start Stream'}
                  </button>
                )}

                {canStop && (
                  <button
                    onClick={handleStop}
                    disabled={isStopping}
                    className="basefm-button-danger disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStopping ? 'Stopping...' : 'End Stream'}
                  </button>
                )}

                {stream.status === 'ENDED' && (
                  <p className="text-xs text-zinc-500 py-2">This stream has ended.</p>
                )}
              </div>

              {isPreparing && (
                <div className="mt-4 border border-orange-500/20 bg-orange-500/5 p-4">
                  <div className="text-[10px] uppercase tracking-widest text-orange-400 mb-2">Waiting for encoder</div>
                  <p className="text-xs text-zinc-500 mb-3">Start streaming from OBS to go live.</p>
                  <button
                    onClick={handleCheckStatus}
                    disabled={isCheckingStatus}
                    className="basefm-button-secondary disabled:opacity-50"
                  >
                    {isCheckingStatus ? 'Checking...' : 'Check Mux Status'}
                  </button>
                </div>
              )}

              {isLive && (
                <div className="mt-4 border border-green-500/20 bg-green-500/5 p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 animate-pulse inline-block" />
                    <span className="text-[10px] uppercase tracking-widest text-green-300 font-bold">You are live</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stream Details */}
          <div className="basefm-panel p-6">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Stream Details</div>
            <div className="grid grid-cols-2 gap-px bg-zinc-900">
              <div className="bg-black p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">DJ Name</div>
                <p className="text-sm font-bold text-white">{stream.djName}</p>
              </div>
              {stream.genre && (
                <div className="bg-black p-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Genre</div>
                  <p className="text-sm font-bold text-white">{stream.genre}</p>
                </div>
              )}
              <div className="bg-black p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Token Gated</div>
                <p className="text-sm font-bold text-white">{stream.isGated ? 'Yes' : 'No'}</p>
              </div>
              <div className="bg-black p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Created</div>
                <p className="text-sm font-bold text-white">{new Date(stream.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {stream.description && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Description</div>
                <p className="text-sm text-zinc-400">{stream.description}</p>
              </div>
            )}
          </div>

        </div>
      </section>
    </main>
  );
}
