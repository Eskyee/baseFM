'use client';

import { useCallback, useEffect, useState } from 'react';
import { parseUnits } from 'viem';
import { useAccount, useSignMessage, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useStream } from '@/hooks/useStream';
import { WalletConnect } from '@/components/WalletConnect';
import { createAuthMessage, createStreamActionMessage, generateNonce, StreamAction } from '@/lib/auth/wallet';
import { ERC20_TRANSFER_ABI } from '@/lib/token/tip-config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const USDC_DECIMALS = 6;

interface MuxStatusData {
  muxStatus?: string;
  currentStatus?: string;
  previousStatus?: string;
  updated?: boolean;
  mux?: {
    id?: string;
    status?: string;
    playbackId?: string | null;
    recentAssetIds?: string[];
  };
  streamHealth?: 'good' | 'waiting' | 'bad';
  pickupRecommended?: boolean;
}

interface RelayInfo {
  id: string;
  key: string;
  name: string;
  type: 'origin' | 'first-party' | 'youtube' | 'other';
  required: boolean;
  enabled: boolean;
  status: 'healthy' | 'pending' | 'degraded' | 'failed' | 'offline';
  viewerUrl: string | null;
  probeUrl: string | null;
  lastHealthyAt: string | null;
  lastErrorAt: string | null;
  lastErrorMessage: string | null;
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

export default function DJStreamControlPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { stream, isLoading, error, refetch } = useStream(params.id);
  const { writeContract, data: billingTxHash, isPending: isBillingPending, error: billingWriteError } = useWriteContract();
  const { isLoading: isBillingConfirming, isSuccess: isBillingConfirmed } = useWaitForTransactionReceipt({
    hash: billingTxHash,
  });
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isSettingUpMux, setIsSettingUpMux] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isRefreshingStation, setIsRefreshingStation] = useState(false);
  const [isResettingStream, setIsResettingStream] = useState(false);
  const [muxStatusData, setMuxStatusData] = useState<MuxStatusData | null>(null);
  const [relays, setRelays] = useState<RelayInfo[]>([]);
  const [relaysLoading, setRelaysLoading] = useState(true);
  const [probingRelayKey, setProbingRelayKey] = useState<string | null>(null);
  const [relayActionMessage, setRelayActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingSummary | null>(null);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [billingAction, setBillingAction] = useState<'subscription' | 'session' | 'metered' | null>(null);
  const [isRecordingBilling, setIsRecordingBilling] = useState(false);

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

  // Load distribution / relay state alongside billing.
  useEffect(() => {
    let active = true;
    const loadRelays = async () => {
      setRelaysLoading(true);
      try {
        const res = await fetch('/api/relays', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setRelays(Array.isArray(data?.relays) ? data.relays : []);
      } catch {
        // non-fatal — distribution panel will show empty state
      } finally {
        if (active) setRelaysLoading(false);
      }
    };
    void loadRelays();
    return () => {
      active = false;
    };
  }, []);

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
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Stream Control</h1>
        <p className="text-gray-400 mb-8">Connect your wallet to manage this stream</p>
        <WalletConnect />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/3" />
          <div className="h-64 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Stream Not Found</h1>
        <Link href="/dashboard" className="text-blue-400 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Check ownership
  if (stream.djWalletAddress.toLowerCase() !== address?.toLowerCase()) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Unauthorized</h1>
        <p className="text-gray-400 mb-6">You do not own this stream</p>
        <Link href="/dashboard" className="text-blue-400 hover:underline">
          Back to Dashboard
        </Link>
      </div>
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

  const handleStop = async (archive: boolean = false) => {
    if (archive) {
      setIsArchiving(true);
    } else {
      setIsStopping(true);
    }
    setActionError(null);
    setActionSuccess(null);

    try {
      const signedPayload = await createSignedPayload('stop');
      const response = await fetch(`/api/streams/${stream.id}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...signedPayload, archive }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to stop stream');
      }

      setActionSuccess(
        data.message ||
          (archive
            ? 'Set ended. Replay retained on Mux.'
            : 'Stream ended. Listener sessions will clear automatically.')
      );
      refetch();
      void fetchBilling();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsStopping(false);
      setIsArchiving(false);
    }
  };

  const handleArchiveStop = () => handleStop(true);

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
      const response = await fetch(`/api/streams/${stream.id}/check-status`);

      const data: MuxStatusData = await response.json();

      if (!response.ok) {
        throw new Error((data as unknown as { error?: string }).error || 'Failed to check status');
      }

      setMuxStatusData(data);
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

  // Forces a Mux→station re-sync. Use this if Mux says the feed is active but
  // the page still says PREPARING (the listener experience is broken until the
  // status flips to LIVE).
  const handleRefreshStation = async () => {
    setIsRefreshingStation(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await fetch(`/api/streams/${stream.id}/check-status`, {
        method: 'POST',
      });
      const data: MuxStatusData = await response.json();
      if (!response.ok) {
        throw new Error((data as unknown as { error?: string }).error || 'Failed to refresh station');
      }
      setMuxStatusData(data);
      setActionSuccess(
        data.updated
          ? `Station synced: ${data.previousStatus} → ${data.currentStatus}`
          : 'Station refreshed (no change).'
      );
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRefreshingStation(false);
    }
  };

  const handleProbeRelay = async (key: string) => {
    setProbingRelayKey(key);
    setRelayActionMessage(null);
    try {
      const res = await fetch(`/api/relays/${key}/probe`, { method: 'POST' });
      const data = await res.json();
      if (data?.relay) {
        setRelays((prev) => prev.map((r) => (r.key === key ? data.relay : r)));
      }
      setRelayActionMessage(
        data.ok ? `${key} relay probe succeeded.` : `${key} relay probe failed: ${data.error || 'unknown error'}`
      );
    } catch (err) {
      setRelayActionMessage(err instanceof Error ? err.message : 'Probe failed');
    } finally {
      setProbingRelayKey(null);
    }
  };

  const handleEmergencyReset = async () => {
    if (!address) return;
    const confirmed = window.confirm(
      'Emergency reset will force-close every non-ended stream on this wallet (including this one) and remove the Mux live resources. Continue?'
    );
    if (!confirmed) return;

    setIsResettingStream(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const nonce = generateNonce();
      const timestamp = new Date().toISOString();
      const message = createAuthMessage(nonce);
      const signature = await signMessageAsync({ message });

      const res = await fetch('/api/streams/cleanup-stale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          djWalletAddress: address,
          signature,
          message,
          timestamp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Cleanup failed');
      }

      setActionSuccess(data.message || 'Stale streams cleared.');
      refetch();
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reset stream');
    } finally {
      setIsResettingStream(false);
    }
  };

  const needsMuxSetup = !stream.muxStreamKey;

  const isLive = stream.status === 'LIVE';
  const isPreparing = stream.status === 'PREPARING';
  const isEnding = stream.status === 'ENDING';
  const isEnded = stream.status === 'ENDED';
  const canStart = stream.status === 'CREATED';
  // Allow DJs to manually end while ENDING too — Mux idle webhook can leave the
  // stream in ENDING for several minutes before disconnect fires, and without
  // this branch the End Stream button silently disappears mid-set.
  const canStop = isLive || isPreparing || isEnding;
  const canCheckStatus = !isEnded;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24">
      {/* Back Link */}
      <Link
        href="/dashboard"
        className="text-gray-400 hover:text-white mb-4 sm:mb-6 inline-flex items-center gap-2 py-2 -ml-2 pl-2 active:bg-white/5 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm sm:text-base">Back to Dashboard</span>
      </Link>

      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold text-white truncate">{stream.title}</h1>
          <p className="text-gray-400 text-sm sm:text-base">Stream Control Panel</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-semibold ${
              isLive
                ? 'bg-red-500 text-white animate-pulse'
                : isPreparing
                ? 'bg-yellow-500 text-black'
                : isEnding
                ? 'bg-orange-500 text-black'
                : isEnded
                ? 'bg-gray-600 text-white'
                : 'bg-gray-700 text-white'
            }`}
          >
            {isLive && <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />}
            {stream.status}
          </span>
        </div>
      </div>

      {actionError && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-6">
          {actionSuccess}
        </div>
      )}

      <div className="bg-[#111827] border border-blue-500/20 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white">Streaming Billing</h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              Session fee, monthly DJ subscription, and per-hour stream metering settle to the platform wallet.
            </p>
          </div>
          {billing?.subscription ? (
            <span className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold">
              Subscription active until {new Date(billing.subscription.endsAt).toLocaleDateString()}
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-semibold">
              Pay per stream
            </span>
          )}
        </div>

        {isBillingLoading ? (
          <p className="text-gray-400 text-sm">Loading billing status...</p>
        ) : billing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Session Fee</div>
                <div className="text-white font-semibold">${billing.pricing.streamSessionFeeUsdc.toFixed(2)} USDC</div>
                <div className="text-[11px] text-gray-500 mt-1">
                  {billing.streamSession?.sessionFeeStatus === 'paid'
                    ? 'Paid'
                    : billing.streamSession?.sessionFeeStatus === 'waived'
                    ? 'Waived by subscription'
                    : 'Required before setup/start'}
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Monthly Subscription</div>
                <div className="text-white font-semibold">${billing.pricing.monthlySubscriptionFeeUsdc.toFixed(2)} USDC</div>
                <div className="text-[11px] text-gray-500 mt-1">Waives session fee and lowers hourly rate</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Metered Rate</div>
                <div className="text-white font-semibold">${billing.pricing.meteredRateUsdcPerHour.toFixed(2)} / hour</div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Outstanding: ${billing.outstandingMeteredFeeUsdc.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {!billing.subscription && (
                <button
                  onClick={() => payUsdc(billing.pricing.monthlySubscriptionFeeUsdc, 'subscription')}
                  disabled={isBillingPending || isBillingConfirming || isRecordingBilling}
                  className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {billingAction === 'subscription' && (isBillingPending || isBillingConfirming || isRecordingBilling)
                    ? 'Activating subscription...'
                    : 'Buy Monthly Subscription'}
                </button>
              )}

              {billing.requiresSessionPayment && (
                <button
                  onClick={() => payUsdc(billing.pricing.streamSessionFeeUsdc, 'session')}
                  disabled={isBillingPending || isBillingConfirming || isRecordingBilling}
                  className="px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {billingAction === 'session' && (isBillingPending || isBillingConfirming || isRecordingBilling)
                    ? 'Recording session fee...'
                    : 'Pay Stream Session Fee'}
                </button>
              )}

              {billing.outstandingMeteredFeeUsdc > 0 && stream.status === 'ENDED' && (
                <button
                  onClick={() => payUsdc(billing.outstandingMeteredFeeUsdc, 'metered')}
                  disabled={isBillingPending || isBillingConfirming || isRecordingBilling}
                  className="px-5 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {billingAction === 'metered' && (isBillingPending || isBillingConfirming || isRecordingBilling)
                    ? 'Settling metered fee...'
                    : `Settle ${billing.outstandingMeteredFeeUsdc.toFixed(2)} USDC Metered Fee`}
                </button>
              )}
            </div>

            {billing.streamSession?.durationSeconds ? (
              <p className="text-xs text-gray-500">
                Last billed duration: {(billing.streamSession.durationSeconds / 60).toFixed(1)} minutes
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Billing status unavailable.</p>
        )}
      </div>

      {/* Co-Show (B2B) — Flagship Feature */}
      <Link
        href={`/dashboard/stream/${stream.id}/co-show`}
        className="block bg-gradient-to-r from-amber-900/30 to-amber-800/20 border border-amber-500/40 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 hover:border-amber-400 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎛️</span>
            <div>
              <span className="text-amber-400 font-bold text-sm sm:text-base">Co-Show (B2B)</span>
              <p className="text-amber-200/60 text-xs mt-0.5">Invite another DJ for a back-to-back set</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>

      {/* Setup Mux Section - Show if stream doesn't have Mux credentials */}
      {needsMuxSetup && (
        <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-purple-400 mb-2">Streaming Credentials Required</h2>
          <p className="text-purple-200/80 text-sm mb-4">
            This stream session needs to be provisioned with RTMP credentials. 
            Generating these will allow you to connect OBS or mobile streaming apps.
          </p>
          <button
            onClick={handleSetupMux}
            disabled={isSettingUpMux}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSettingUpMux ? 'Provisioning...' : 'Generate Streaming Credentials'}
          </button>
        </div>
      )}

      {/* RTMP Credentials - Mobile optimized */}
      {!needsMuxSetup && (canStart || isPreparing || isLive) && stream.rtmpUrl && (
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-4">RTMP Credentials</h2>
          <p className="text-gray-400 text-xs sm:text-sm mb-4">
            Copy the credentials for your streaming software
          </p>

          <div className="space-y-4">
            {/* Full Stream URL - Best for mobile apps */}
            {stream.muxStreamKey && (
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <label className="text-sm font-semibold text-purple-300">
                    Full Stream URL (Mobile Apps)
                  </label>
                </div>
                <p className="text-gray-400 text-xs mb-3">
                  One-tap copy for Larix, Streamlabs, and other mobile streaming apps
                </p>
                <div className="flex flex-col gap-2">
                  <code className="px-3 py-3 bg-black/50 rounded-lg text-green-400 text-xs font-mono break-all">
                    rtmps://global-live.mux.com:443/app/{stream.muxStreamKey}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`rtmps://global-live.mux.com:443/app/${stream.muxStreamKey}`);
                      setActionSuccess('Full stream URL copied! Paste this in your streaming app.');
                      setTimeout(() => setActionSuccess(null), 3000);
                    }}
                    className="w-full py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 active:scale-[0.98] transition-all font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Full URL
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-gray-500 text-xs">or use separate fields for OBS</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>

            {/* Server URL */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                Server URL
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <code className="flex-1 px-3 py-3 bg-gray-900 rounded-lg text-green-400 text-xs sm:text-sm font-mono break-all">
                  rtmps://global-live.mux.com:443/app
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('rtmps://global-live.mux.com:443/app');
                    setActionSuccess('Server URL copied!');
                    setTimeout(() => setActionSuccess(null), 2000);
                  }}
                  className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 active:scale-[0.98] transition-all font-medium text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            {/* Stream Key */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                Stream Key
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <code className="flex-1 px-3 py-3 bg-gray-900 rounded-lg text-green-400 text-xs sm:text-sm font-mono break-all">
                  {stream.muxStreamKey || '••••••••••••••••'}
                </code>
                {stream.muxStreamKey && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(stream.muxStreamKey!);
                      setActionSuccess('Stream Key copied!');
                      setTimeout(() => setActionSuccess(null), 2000);
                    }}
                    className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 active:scale-[0.98] transition-all font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls - Mobile optimized */}
      {!needsMuxSetup && (
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-4">Stream Controls</h2>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          {canStart && (
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="w-full sm:w-auto px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {isStarting ? 'Starting...' : 'Start Stream'}
            </button>
          )}

          {canStop && (
            <button
              onClick={() => handleStop(false)}
              disabled={isStopping || isArchiving}
              className="w-full sm:w-auto px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title="End the set and drop the recent Mux recordings to stop storage billing."
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
              {isStopping ? 'Stopping...' : isEnding ? 'Force End Stream' : 'End Set'}
            </button>
          )}

          {canStop && (
            <button
              onClick={handleArchiveStop}
              disabled={isStopping || isArchiving}
              className="w-full sm:w-auto px-6 py-4 bg-amber-500/20 border border-amber-500/40 text-amber-200 rounded-xl hover:bg-amber-500/30 hover:border-amber-400 active:scale-[0.98] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title="End the set but keep the Mux recording for replay (Mux storage keeps billing while it lives)."
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              {isArchiving ? 'Saving Replay...' : 'End Set + Save Replay'}
            </button>
          )}

          {canCheckStatus && (
            <button
              onClick={handleCheckStatus}
              disabled={isCheckingStatus}
              className="w-full sm:w-auto px-4 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isCheckingStatus ? 'Checking...' : 'Check Mux Status'}
            </button>
          )}

          {canCheckStatus && (
            <button
              onClick={handleRefreshStation}
              disabled={isRefreshingStation}
              className="w-full sm:w-auto px-4 py-4 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl hover:border-zinc-500 active:scale-[0.98] transition-all text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              title="Force a Mux→station re-sync if Mux is active but the page hasn't flipped to LIVE."
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRefreshingStation ? 'Refreshing...' : 'Refresh Station'}
            </button>
          )}

          {isEnded && (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Start a New Set
            </Link>
          )}
        </div>

        {isPreparing && (
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-400 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Waiting for video feed...
            </p>
            <p className="text-gray-400 text-xs mt-2">Start streaming from OBS to go live. Use Check Mux Status if your encoder is connected but the page hasn&apos;t flipped to LIVE.</p>
          </div>
        )}

        {isLive && (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
            <p className="text-green-400 font-semibold flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              You are LIVE!
            </p>
          </div>
        )}

        {isEnding && (
          <div className="mt-4 p-4 bg-orange-900/20 border border-orange-500/30 rounded-xl">
            <p className="text-orange-300 font-semibold flex items-center gap-2 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.27 3 1.73 3z" />
              </svg>
              Stream is ending
            </p>
            <p className="text-gray-400 text-xs">
              Mux saw your encoder go idle. If this was intentional, press <strong className="text-orange-200">Force End Stream</strong> to settle billing now. Otherwise, reconnect OBS with the same key and use <strong className="text-orange-200">Check Mux Status</strong> to recover.
            </p>
          </div>
        )}

        {isEnded && (
          <div className="mt-4 p-4 bg-gray-900/40 border border-gray-700 rounded-xl">
            <p className="text-gray-300 font-semibold mb-1">This stream has ended</p>
            <p className="text-gray-500 text-xs">
              Billing is finalized. The credentials and key on this page are retained for reference but a new set requires a fresh stream from the dashboard.
            </p>
          </div>
        )}

        {/* Mux Status mini-grid: surfaces what Mux currently sees vs what the
            station thinks. Mirrors agentbot's Broadcast Rack status block. */}
        {muxStatusData && (
          <div className="mt-4 p-4 bg-gray-900/50 border border-gray-700 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">Mux Status</span>
              <span
                className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${
                  muxStatusData.streamHealth === 'good'
                    ? 'bg-green-500/15 text-green-300 border border-green-500/30'
                    : muxStatusData.streamHealth === 'waiting'
                    ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30'
                    : 'bg-red-500/15 text-red-300 border border-red-500/30'
                }`}
              >
                {muxStatusData.streamHealth || 'unknown'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-zinc-500 mb-0.5">Mux Stream</span>
                <span className="text-zinc-200 font-mono break-all">{muxStatusData.mux?.id || '—'}</span>
              </div>
              <div>
                <span className="block text-zinc-500 mb-0.5">Mux State</span>
                <span className="text-zinc-200">{muxStatusData.mux?.status || muxStatusData.muxStatus || '—'}</span>
              </div>
              <div>
                <span className="block text-zinc-500 mb-0.5">Station</span>
                <span className="text-zinc-200">{muxStatusData.currentStatus || stream.status}</span>
              </div>
              <div>
                <span className="block text-zinc-500 mb-0.5">Playback ID</span>
                <span className="text-zinc-200 font-mono break-all">{muxStatusData.mux?.playbackId || '—'}</span>
              </div>
            </div>
            {muxStatusData.pickupRecommended && (
              <p className="mt-3 text-xs text-yellow-300">
                Mux is active but the station hasn&apos;t picked up the feed. Press <strong>Refresh Station</strong>.
              </p>
            )}
          </div>
        )}
      </div>
      )}

      {/* Pioneer Mode — Rekordbox-friendly framing of what each surface in
          baseFM is doing relative to a Pioneer / Rekordbox booth. */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-semibold text-white">Pioneer Mode</h2>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 border border-zinc-700 rounded px-2 py-0.5">
            DJ-friendly framing
          </span>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm mb-4">
          Treat baseFM like the broadcast rack <em>after</em> your mixer — not a CDJ, not a controller. Your decks, EQ,
          loops and cue work all stay on Pioneer / Rekordbox. baseFM only handles the encode + relay.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-gray-900/50 rounded-lg p-3 border border-zinc-800">
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500">Source</span>
            <p className="text-zinc-200 mt-1">Pioneer decks + Rekordbox</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-zinc-800">
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500">Mixer</span>
            <p className="text-zinc-200 mt-1">EQ, cue, master out</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-zinc-800">
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500">Encoder</span>
            <p className="text-zinc-200 mt-1">OBS / Larix → Mux RTMP</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-zinc-800">
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500">Station</span>
            <p className="text-zinc-200 mt-1">basefm.space + relays</p>
          </div>
        </div>
      </div>

      {/* Distribution / Station Health — every relay baseFM pushes the master
          feed to. Required relays drive the station health pill. */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-semibold text-white">Distribution / Station Health</h2>
          <span
            className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${
              relays.some((r) => r.required && r.status === 'failed')
                ? 'bg-red-500/15 text-red-300 border-red-500/30'
                : relays.some((r) => r.required && r.status !== 'healthy')
                ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                : 'bg-green-500/15 text-green-300 border-green-500/30'
            }`}
          >
            {relays.some((r) => r.required && r.status === 'failed')
              ? 'degraded'
              : relays.some((r) => r.required && r.status !== 'healthy')
              ? 'pending'
              : 'healthy'}
          </span>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm mb-4">
          The places baseFM pushes your master feed to. Required relays gate &ldquo;station healthy&rdquo;.
          YouTube and other optional relays can be wired up by an admin.
        </p>

        {relaysLoading ? (
          <p className="text-zinc-500 text-xs">Loading relays…</p>
        ) : relays.length === 0 ? (
          <p className="text-zinc-500 text-xs">No relays registered yet.</p>
        ) : (
          <ul className="space-y-2">
            {relays.map((relay) => (
              <li
                key={relay.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gray-900/50 rounded-lg p-3 border border-zinc-800"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`mt-1 inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                      relay.status === 'healthy'
                        ? 'bg-green-400'
                        : relay.status === 'failed'
                        ? 'bg-red-400'
                        : relay.status === 'degraded'
                        ? 'bg-yellow-400'
                        : 'bg-zinc-500'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-zinc-200 text-sm font-medium">{relay.name}</span>
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500 border border-zinc-700 rounded px-1.5 py-0.5">
                        {relay.type}
                      </span>
                      {relay.required && (
                        <span className="text-[10px] uppercase tracking-widest text-orange-300 border border-orange-500/30 rounded px-1.5 py-0.5">
                          required
                        </span>
                      )}
                    </div>
                    {relay.viewerUrl && (
                      <a
                        href={relay.viewerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-500 text-xs hover:text-blue-400 break-all"
                      >
                        {relay.viewerUrl}
                      </a>
                    )}
                    {relay.lastErrorMessage && relay.status !== 'healthy' && (
                      <p className="text-red-400 text-xs mt-1">{relay.lastErrorMessage}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleProbeRelay(relay.key)}
                  disabled={probingRelayKey === relay.key}
                  className="self-start sm:self-auto px-3 py-1.5 text-xs border border-zinc-700 text-zinc-200 rounded hover:border-zinc-500 disabled:opacity-50"
                >
                  {probingRelayKey === relay.key ? 'Probing…' : 'Probe'}
                </button>
              </li>
            ))}
          </ul>
        )}

        {relayActionMessage && (
          <p className="mt-3 text-xs text-zinc-300">{relayActionMessage}</p>
        )}

        <details className="mt-4 group">
          <summary className="cursor-pointer text-xs text-zinc-400 hover:text-zinc-200">
            Optional YouTube / external relay (admin only)
          </summary>
          <p className="mt-2 text-xs text-zinc-500">
            Wire up a YouTube Live or other RTMP relay by adding a row to the <code className="font-mono text-zinc-300">relays</code> table
            (or call <code className="font-mono text-zinc-300">POST /api/relays</code> with an admin wallet).
            Listeners never see RTMP push keys — only the public <em>viewer URL</em>.
          </p>
        </details>
      </div>

      {/* Encoder / OBS Settings — the "audio-only or etc" guidance the user
          asked about. Hard-coded recommendations that match what Mux expects. */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-3">Encoder / OBS Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-900/50 rounded-lg p-3 border border-zinc-800">
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500">Encoder Mode</span>
            <p className="text-zinc-200 mt-1">Custom RTMP (not platform presets)</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-zinc-800">
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500">Audio</span>
            <p className="text-zinc-200 mt-1">256–320 kbps · AAC · 44.1 kHz Stereo</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-zinc-800">
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500">Server</span>
            <p className="text-zinc-200 mt-1 font-mono break-all">rtmps://global-live.mux.com:443/app</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-zinc-800">
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500">Deck / Mixer Model</span>
            <p className="text-zinc-200 mt-1">Decks + EQ + cue on Pioneer, broadcast out via baseFM</p>
          </div>
        </div>
      </div>

      {/* Pioneer / Rekordbox Quick Notes */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-3">Pioneer / Rekordbox Quick Notes</h2>
        <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-400">
          <li>Keep cue, beatmatch, loops, hot cues, and EQ work on your Pioneer hardware or Rekordbox.</li>
          <li>Use the mixer master as the source feed for OBS / Larix.</li>
          <li>Treat baseFM like the broadcast rack <em>after</em> the mixer, not a CDJ or mixer replacement.</li>
          <li>If you already know Pioneer workflow, you only need the go-live, end set, and refresh controls here.</li>
        </ol>
      </div>

      {/* Emergency Reset — always available so a DJ can self-recover from a stuck
          state without leaving the stream page */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-orange-500/20">
        <h2 className="text-base sm:text-lg font-semibold text-orange-400 mb-2">Emergency Reset</h2>
        <p className="text-gray-400 text-xs sm:text-sm mb-4">
          Force-clear every non-ended stream on this wallet and delete the Mux live resources. Use this if the page is stuck on LIVE / ENDING when you aren&apos;t actually broadcasting.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleEmergencyReset}
            disabled={isResettingStream}
            className="w-full sm:w-auto px-5 py-3 border border-orange-500/40 text-orange-300 rounded-xl hover:bg-orange-500 hover:text-black active:scale-[0.98] transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            {isResettingStream ? 'Clearing...' : 'Clear Stale Sessions'}
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-3 border border-gray-700 text-gray-300 rounded-xl hover:border-gray-500 active:scale-[0.98] transition-all font-medium text-sm flex items-center justify-center gap-2"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Stream Info - Mobile optimized */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-4">Stream Details</h2>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <span className="text-gray-500 text-xs">DJ Name</span>
            <p className="text-white font-medium mt-1">{stream.djName}</p>
          </div>
          {stream.genre && (
            <div className="bg-gray-900/50 rounded-lg p-3">
              <span className="text-gray-500 text-xs">Genre</span>
              <p className="text-white font-medium mt-1">{stream.genre}</p>
            </div>
          )}
          <div className="bg-gray-900/50 rounded-lg p-3">
            <span className="text-gray-500 text-xs">Token Gated</span>
            <p className="text-white font-medium mt-1">{stream.isGated ? 'Yes' : 'No'}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <span className="text-gray-500 text-xs">Gate Source</span>
            <p className="text-white font-medium mt-1">
              {stream.isGated && stream.requiredTokenAddress
                ? stream.requiredTokenAddress.toLowerCase() === '0x9a4376bab717ac0a3901eeed8308a420c59c0ba3'.toLowerCase()
                  ? 'BASEFM token'
                  : 'Custom token'
                : 'Community pass'}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <span className="text-gray-500 text-xs">Created</span>
            <p className="text-white font-medium mt-1">
              {new Date(stream.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {stream.description && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <span className="text-gray-500 text-xs">Description</span>
            <p className="text-white mt-1 text-sm">{stream.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
