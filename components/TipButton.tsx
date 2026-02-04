'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import {
  TIP_TOKENS,
  ERC20_TRANSFER_ABI,
  parseTipAmount,
  TipToken,
} from '@/lib/token/tip-config';

interface TipButtonProps {
  djWalletAddress: string;
  djName: string;
  djId?: string;
  streamId?: string;
}

const TIP_PRESETS = [
  { label: '$1', usd: 1 },
  { label: '$5', usd: 5 },
  { label: '$10', usd: 10 },
  { label: '$25', usd: 25 },
];

export function TipButton({ djWalletAddress, djName, djId, streamId }: TipButtonProps) {
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TipToken>(TIP_TOKENS[0]); // ETH default
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data: ethHash, sendTransaction, isPending: isEthPending, error: ethError } = useSendTransaction();
  const { data: tokenHash, writeContract, isPending: isTokenPending, error: tokenError } = useWriteContract();

  const hash = selectedToken.address === 'native' ? ethHash : tokenHash;
  const isPending = selectedToken.address === 'native' ? isEthPending : isTokenPending;
  const sendError = selectedToken.address === 'native' ? ethError : tokenError;

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isValid = amount && parseFloat(amount) > 0;

  // Handle closing with animation
  const handleClose = () => {
    if (isPending || isConfirming) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handlePreset = (usd: number) => {
    // Convert USD to token amount based on approximate prices
    if (selectedToken.symbol === 'USDC') {
      setAmount(usd.toString());
    } else if (selectedToken.symbol === 'ETH') {
      setAmount((usd / 2500).toFixed(6));
    } else if (selectedToken.symbol === 'cbBTC') {
      setAmount((usd / 95000).toFixed(8));
    } else if (selectedToken.symbol === 'RAVE') {
      setAmount((usd * 100).toString()); // Approximate
    }
  };

  const handleTip = async () => {
    if (!isValid || !address) return;

    try {
      if (selectedToken.address === 'native') {
        // ETH transfer
        sendTransaction({
          to: djWalletAddress as `0x${string}`,
          value: parseEther(amount),
        });
      } else {
        // ERC20 transfer
        const tokenAmount = parseTipAmount(amount, selectedToken.decimals);
        writeContract({
          address: selectedToken.address,
          abi: ERC20_TRANSFER_ABI,
          functionName: 'transfer',
          args: [djWalletAddress as `0x${string}`, tokenAmount],
        });
      }
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
          amount,
          tokenSymbol: selectedToken.symbol,
          tokenAddress: selectedToken.address,
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
      {/* Main tip button - prominent, Apple-style */}
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold text-sm shadow-lg shadow-green-500/25 transition-all duration-200 active:scale-[0.97] hover:shadow-green-500/40 touch-target"
      >
        <span className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full transition-transform group-hover:scale-110">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </span>
        Send Tip
      </button>

      {/* iOS-style bottom sheet modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop with blur */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
              isClosing ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={handleClose}
          />

          {/* Bottom sheet */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-[#1C1C1E] rounded-t-3xl safe-area-bottom transition-transform duration-200 ease-out ${
              isClosing ? 'translate-y-full' : 'translate-y-0'
            }`}
            style={{ maxHeight: '90vh' }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-1 bg-[#3A3A3C] rounded-full" />
            </div>

            <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 40px)' }}>
              {isSuccess ? (
                /* Success state - celebratory */
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/30">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Tip Sent!</h3>
                  <p className="text-[#8E8E93] mb-6">
                    You sent {amount} {selectedToken.symbol} to {djName}
                  </p>
                  <a
                    href={`https://basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#0A84FF] text-sm font-medium"
                  >
                    View on BaseScan
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <button
                    onClick={() => {
                      handleClose();
                      setTimeout(() => {
                        setAmount('');
                        setMessage('');
                      }, 200);
                    }}
                    className="block w-full mt-8 py-4 bg-[#2C2C2E] text-white rounded-2xl font-semibold text-base transition-all active:scale-[0.98] touch-target"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Form state */
                <>
                  {/* Header */}
                  <div className="text-center mb-6 pt-2">
                    <h3 className="text-xl font-bold text-white">Tip {djName}</h3>
                    <p className="text-[#8E8E93] text-sm mt-1">Show your appreciation</p>
                  </div>

                  {/* Token Selection - pill style */}
                  <div className="mb-5">
                    <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">
                      Select Token
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIP_TOKENS.map((token) => (
                        <button
                          key={token.symbol}
                          onClick={() => {
                            setSelectedToken(token);
                            setAmount('');
                          }}
                          disabled={isPending || isConfirming}
                          className={`relative p-3.5 rounded-2xl text-center transition-all duration-150 active:scale-[0.97] ${
                            selectedToken.symbol === token.symbol
                              ? 'bg-[#2C2C2E]'
                              : 'bg-[#2C2C2E]/50 hover:bg-[#2C2C2E]'
                          }`}
                          style={{
                            boxShadow: selectedToken.symbol === token.symbol ? `0 0 0 2px ${token.color}` : undefined,
                          }}
                        >
                          <span className="text-xl block mb-1">{token.icon}</span>
                          <span className="text-xs text-[#8E8E93] font-medium">{token.symbol}</span>
                          {selectedToken.symbol === token.symbol && (
                            <div
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: token.color }}
                            >
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick amounts - bigger touch targets */}
                  <div className="mb-5">
                    <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">
                      Quick Amount
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIP_PRESETS.map((preset) => (
                        <button
                          key={preset.usd}
                          onClick={() => handlePreset(preset.usd)}
                          disabled={isPending || isConfirming}
                          className="py-3.5 bg-[#2C2C2E] rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.97] active:bg-[#3C3C3E] touch-target"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom amount - iOS style input */}
                  <div className="mb-5">
                    <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">
                      Amount ({selectedToken.symbol})
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="any"
                        min="0"
                        disabled={isPending || isConfirming}
                        className="w-full px-4 py-4 bg-[#2C2C2E] text-white text-lg font-mono rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A84FF] transition-all placeholder:text-[#48484A]"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8E93] font-medium">
                        {selectedToken.symbol}
                      </span>
                    </div>
                  </div>

                  {/* Optional message */}
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">
                      Message (optional)
                    </label>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Great vibes!"
                      maxLength={100}
                      disabled={isPending || isConfirming}
                      className="w-full px-4 py-4 bg-[#2C2C2E] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A84FF] transition-all placeholder:text-[#48484A]"
                    />
                  </div>

                  {/* Error */}
                  {sendError && (
                    <div className="mb-5 p-4 bg-[#FF453A]/10 border border-[#FF453A]/30 rounded-xl">
                      <p className="text-[#FF453A] text-sm font-medium">
                        {sendError.message.includes('User rejected')
                          ? 'Transaction cancelled'
                          : 'Failed to send tip'}
                      </p>
                    </div>
                  )}

                  {/* Send button - prominent CTA */}
                  <button
                    onClick={handleTip}
                    disabled={!isValid || isPending || isConfirming}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none touch-target"
                  >
                    {isPending || isConfirming ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {isPending ? 'Confirm in wallet...' : 'Confirming...'}
                      </span>
                    ) : (
                      `Send ${amount || '0'} ${selectedToken.symbol}`
                    )}
                  </button>

                  {/* Cancel button */}
                  <button
                    onClick={handleClose}
                    disabled={isPending || isConfirming}
                    className="w-full mt-3 py-4 text-[#8E8E93] font-semibold text-base transition-all active:text-white touch-target"
                  >
                    Cancel
                  </button>

                  <p className="text-center text-xs text-[#48484A] mt-4">
                    Tips are sent directly to the DJ&apos;s wallet on Base
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
