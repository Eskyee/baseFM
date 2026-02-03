'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useStream } from '@/hooks/useStream';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';

export default function DJStreamControlPage({ params }: { params: { id: string } }) {
  const { address, isConnected } = useAccount();
  const { stream, isLoading, error, refetch } = useStream(params.id);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isSettingUpMux, setIsSettingUpMux] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start stream');
      }

      refetch();
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
      const response = await fetch(`/api/streams/${stream.id}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ djWalletAddress: address }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to stop stream');
      }

      refetch();
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
      const response = await fetch(`/api/streams/${stream.id}/setup-mux`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ djWalletAddress: address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup streaming');
      }

      setActionSuccess('Streaming credentials generated! You can now go live.');
      refetch();
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href="/dashboard"
        className="text-gray-400 hover:text-white mb-6 inline-flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{stream.title}</h1>
          <p className="text-gray-400">Stream Control Panel</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isLive
                ? 'bg-red-500 text-white'
                : isPreparing
                ? 'bg-yellow-500 text-black'
                : stream.status === 'ENDED'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-700 text-white'
            }`}
          >
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

      {/* Setup Mux Section - Show if stream doesn't have Mux credentials */}
      {needsMuxSetup && (
        <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-400 mb-2">Streaming Setup Required</h2>
          <p className="text-yellow-200/80 text-sm mb-4">
            This stream needs to be connected to the streaming service to get your RTMP credentials.
            Click the button below to generate your streaming credentials.
          </p>
          <button
            onClick={handleSetupMux}
            disabled={isSettingUpMux}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSettingUpMux ? 'Setting up...' : 'Generate Streaming Credentials'}
          </button>
        </div>
      )}

      {/* RTMP Credentials */}
      {!needsMuxSetup && (canStart || isPreparing || isLive) && stream.rtmpUrl && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">RTMP Credentials</h2>
          <p className="text-gray-400 text-sm mb-4">
            Use these credentials in OBS or your streaming software
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Server URL
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-900 rounded text-green-400 text-sm font-mono overflow-x-auto">
                  rtmps://global-live.mux.com:443/app
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText('rtmps://global-live.mux.com:443/app')}
                  className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Stream Key
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-900 rounded text-green-400 text-sm font-mono overflow-x-auto">
                  {stream.muxStreamKey || '••••••••••••••••'}
                </code>
                {stream.muxStreamKey && (
                  <button
                    onClick={() => navigator.clipboard.writeText(stream.muxStreamKey!)}
                    className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {!needsMuxSetup && (
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Stream Controls</h2>

        <div className="flex gap-4">
          {canStart && (
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? 'Starting...' : 'Start Stream'}
            </button>
          )}

          {canStop && (
            <button
              onClick={handleStop}
              disabled={isStopping}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStopping ? 'Stopping...' : 'End Stream'}
            </button>
          )}

          {stream.status === 'ENDED' && (
            <p className="text-gray-400 py-3">This stream has ended</p>
          )}
        </div>

        {isPreparing && (
          <div className="mt-4">
            <p className="text-yellow-400 text-sm mb-3">
              Waiting for video feed... Start streaming from OBS to go live.
            </p>
            <button
              onClick={handleCheckStatus}
              disabled={isCheckingStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isCheckingStatus ? 'Checking...' : 'Check Mux Status'}
            </button>
          </div>
        )}

        {isLive && (
          <p className="text-green-400 text-sm mt-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            You are live!
          </p>
        )}
      </div>
      )}

      {/* Stream Info */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Stream Details</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">DJ Name</span>
            <p className="text-white">{stream.djName}</p>
          </div>
          {stream.genre && (
            <div>
              <span className="text-gray-500">Genre</span>
              <p className="text-white">{stream.genre}</p>
            </div>
          )}
          <div>
            <span className="text-gray-500">Token Gated</span>
            <p className="text-white">{stream.isGated ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <span className="text-gray-500">Created</span>
            <p className="text-white">
              {new Date(stream.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {stream.description && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <span className="text-gray-500 text-sm">Description</span>
            <p className="text-white mt-1">{stream.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
