'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';

interface TipButtonProps {
  djWalletAddress: string;
  djName: string;
  djId?: string;
  streamId?: string;
}

const TIP_AMOUNTS = [
  { label: '0.001 ETH', value: '0.001' },
  { label: '0.005 ETH', value: '0.005' },
  { label: '0.01 ETH', value: '0.01' },
  { label: '0.05 ETH', value: '0.05' },
];

export function TipButton({ djWalletAddress, djName, djId, streamId }: TipButtonProps) {
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data: hash, sendTransaction, isPending, error: sendError } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const amount = selectedAmount || customAmount;
  const isValid = amount && parseFloat(amount) > 0;

  const handleTip = async () => {
    if (!isValid || !address) return;

    try {
      sendTransaction({
        to: djWalletAddress as `0x${string}`,
        value: parseEther(amount),
      });
    } catch (err) {
      console.error('Failed to send tip:', err);
    }
  };

  // Save tip to database when confirmed
  const saveTip = async () => {
    if (!hash || !address || isSaving) return;

    setIsSaving(true);

    try {
      await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderWallet: address,
          recipientWallet: djWalletAddress,
          djId,
          streamId,
          amountWei: parseEther(amount).toString(),
          amountEth: amount,
          txHash: hash,
          message: message || null,
        }),
      });
    } catch (err) {
      console.error('Failed to save tip:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Save when transaction confirms
  if (isSuccess && !isSaving) {
    saveTip();
  }

  if (!isConnected) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/20"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
        </svg>
        Tip
      </button>

      {/* Tip Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => !isPending && !isConfirming && setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-[#1A1A1A] rounded-2xl max-w-md w-full p-6 animate-slide-up">
            {/* Close button */}
            {!isPending && !isConfirming && (
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-[#888] hover:text-[#F5F5F5]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {isSuccess ? (
              /* Success state */
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#F5F5F5] mb-2">Tip Sent!</h3>
                <p className="text-[#888] mb-4">
                  You sent {amount} ETH to {djName}
                </p>
                <a
                  href={`https://basescan.org/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-sm hover:underline"
                >
                  View on BaseScan →
                </a>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedAmount(null);
                    setCustomAmount('');
                    setMessage('');
                  }}
                  className="block w-full mt-6 px-4 py-3 bg-[#333] text-[#F5F5F5] rounded-lg hover:bg-[#444] transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Form state */
              <>
                <h3 className="text-xl font-bold text-[#F5F5F5] mb-1">
                  Tip {djName}
                </h3>
                <p className="text-[#888] text-sm mb-6">
                  Send ETH directly to the DJ on Base
                </p>

                {/* Amount selection */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {TIP_AMOUNTS.map((tip) => (
                    <button
                      key={tip.value}
                      onClick={() => {
                        setSelectedAmount(tip.value);
                        setCustomAmount('');
                      }}
                      disabled={isPending || isConfirming}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        selectedAmount === tip.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-[#0A0A0A] text-[#888] hover:text-[#F5F5F5] hover:bg-[#222]'
                      }`}
                    >
                      {tip.label}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="mb-4">
                  <label className="block text-sm text-[#888] mb-2">Custom amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      placeholder="0.00"
                      step="0.001"
                      min="0"
                      disabled={isPending || isConfirming}
                      className="w-full px-4 py-3 bg-[#0A0A0A] text-[#F5F5F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888]">ETH</span>
                  </div>
                </div>

                {/* Optional message */}
                <div className="mb-6">
                  <label className="block text-sm text-[#888] mb-2">Message (optional)</label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Great show!"
                    maxLength={100}
                    disabled={isPending || isConfirming}
                    className="w-full px-4 py-3 bg-[#0A0A0A] text-[#F5F5F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Error */}
                {sendError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">
                      {sendError.message.includes('User rejected')
                        ? 'Transaction cancelled'
                        : 'Failed to send tip'}
                    </p>
                  </div>
                )}

                {/* Send button */}
                <button
                  onClick={handleTip}
                  disabled={!isValid || isPending || isConfirming}
                  className="w-full px-4 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending || isConfirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {isPending ? 'Confirm in wallet...' : 'Confirming...'}
                    </span>
                  ) : (
                    `Send ${amount || '0'} ETH`
                  )}
                </button>

                <p className="text-center text-xs text-[#666] mt-4">
                  Tips are sent directly to the DJ&apos;s wallet on Base
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
