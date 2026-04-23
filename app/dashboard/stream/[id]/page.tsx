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
                : stream.status === 'ENDED'
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

        <div className="flex flex-col sm:flex-row gap-3">
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
              onClick={handleStop}
              disabled={isStopping}
              className="w-full sm:w-auto px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
              {isStopping ? 'Stopping...' : 'End Stream'}
            </button>
          )}

          {stream.status === 'ENDED' && (
            <p className="text-gray-400 py-3 text-center sm:text-left">This stream has ended</p>
          )}
        </div>

        {isPreparing && (
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-400 text-sm mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Waiting for video feed...
            </p>
            <p className="text-gray-400 text-xs mb-3">Start streaming from OBS to go live</p>
            <button
              onClick={handleCheckStatus}
              disabled={isCheckingStatus}
              className="w-full sm:w-auto px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all text-sm font-medium disabled:opacity-50"
            >
              {isCheckingStatus ? 'Checking...' : 'Check Mux Status'}
            </button>
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
      </div>
      )}

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
