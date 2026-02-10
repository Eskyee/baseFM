'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';

// ============================================================
// AccessModal — Access acquisition flow
//
// UX Copy Rules (NON-NEGOTIABLE):
//   ✅ Access, Pass, Entry, Confirmed
//   ❌ NFT, Token, Mint, Blockchain, Gas, Transaction
//
// Flow: Explain → Wallet (if needed) → Issue pass → Confirm
// ============================================================

type ModalStep = 'explain' | 'wallet' | 'issuing' | 'success' | 'error';

interface AccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  onAccessGranted?: () => void;
}

export function AccessModal({
  isOpen,
  onClose,
  eventId,
  eventName,
  onAccessGranted,
}: AccessModalProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const [step, setStep] = useState<ModalStep>('explain');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('explain');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinue = async () => {
    if (!isConnected) {
      setStep('wallet');
      return;
    }
    await issueAccess();
  };

  const handleWalletConnect = async () => {
    try {
      connect(
        { connector: connectors[0] },
        {
          onSuccess: () => {
            // After wallet connects, issue access
            // Small delay to let wagmi state settle
            setTimeout(() => issueAccess(), 500);
          },
          onError: () => {
            setErrorMessage('Something didn\'t work. Please try again or switch wallets.');
            setStep('error');
          },
        }
      );
    } catch {
      setErrorMessage('Something didn\'t work. Please try again.');
      setStep('error');
    }
  };

  const issueAccess = async () => {
    setStep('issuing');
    try {
      const wallet = address;
      if (!wallet) {
        setErrorMessage('Please connect your wallet to continue.');
        setStep('wallet');
        return;
      }

      const res = await fetch('/api/events/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, eventId }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Map API errors to user-friendly language
        if (res.status === 409) {
          // Already has access — that's actually a success
          setStep('success');
          onAccessGranted?.();
          return;
        }
        setErrorMessage(
          data.error === 'No more passes available for this event'
            ? 'No more passes available for this event.'
            : data.error === 'This event has ended'
              ? 'This event has ended.'
              : 'Something didn\'t work. Please try again.'
        );
        setStep('error');
        return;
      }

      setStep('success');
      onAccessGranted?.();
    } catch {
      setErrorMessage('Something didn\'t work. Please try again.');
      setStep('error');
    }
  };

  const handleRetry = () => {
    setStep('explain');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-[#1A1A1A] rounded-2xl overflow-hidden transition-transform duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#888] hover:text-[#F5F5F5] transition-colors z-10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 pt-8">
          {/* === STEP: Explain === */}
          {step === 'explain' && (
            <>
              <div className="w-14 h-14 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-[#F5F5F5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h2 className="text-[#F5F5F5] text-xl font-bold text-center mb-2">
                Access Required
              </h2>
              <p className="text-[#888] text-sm text-center leading-relaxed mb-6">
                This event uses digital passes instead of guestlists. Your pass
                is required for entry and stays with you.
              </p>
              <button
                onClick={handleContinue}
                className="w-full py-3.5 bg-white text-black rounded-xl font-semibold text-base transition-all active:scale-[0.97]"
              >
                Continue
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 mt-2 text-[#888] text-sm font-medium transition-colors hover:text-[#F5F5F5]"
              >
                Cancel
              </button>
            </>
          )}

          {/* === STEP: Wallet === */}
          {step === 'wallet' && (
            <>
              <div className="w-14 h-14 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-[#F5F5F5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 110-6h.008a.75.75 0 01.744.65l.075.484A2.25 2.25 0 0018.06 6.75H21M3 12a2.25 2.25 0 012.25-2.25H9a3 3 0 100-6h-.008a.75.75 0 00-.744.65l-.075.484A2.25 2.25 0 015.94 6.75H3" />
                </svg>
              </div>
              <h2 className="text-[#F5F5F5] text-xl font-bold text-center mb-2">
                Continue with a wallet
              </h2>
              <p className="text-[#888] text-sm text-center leading-relaxed mb-6">
                Your pass will be added securely and used for entry.
              </p>
              <button
                onClick={handleWalletConnect}
                disabled={isConnecting}
                className="w-full py-3.5 bg-white text-black rounded-xl font-semibold text-base transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Continue with Coinbase Wallet'
                )}
              </button>
              <p className="text-[#666] text-xs text-center mt-4">
                No signup. No passwords.
              </p>
            </>
          )}

          {/* === STEP: Issuing === */}
          {step === 'issuing' && (
            <div className="py-8 text-center">
              <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-5" />
              <h2 className="text-[#F5F5F5] text-xl font-bold mb-2">
                Setting up your access
              </h2>
              <p className="text-[#888] text-sm">
                This usually takes a moment...
              </p>
            </div>
          )}

          {/* === STEP: Success === */}
          {step === 'success' && (
            <>
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-[#F5F5F5] text-xl font-bold text-center mb-2">
                You&apos;re in
              </h2>
              <p className="text-[#888] text-sm text-center leading-relaxed mb-6">
                Your pass has been added. You&apos;re confirmed for this event.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-white text-black rounded-xl font-semibold text-base transition-all active:scale-[0.97]"
              >
                View Event
              </button>
              <p className="text-[#666] text-xs text-center mt-4">
                This pass will be checked at entry.
              </p>
            </>
          )}

          {/* === STEP: Error === */}
          {step === 'error' && (
            <>
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-[#F5F5F5] text-xl font-bold text-center mb-2">
                Something didn&apos;t work
              </h2>
              <p className="text-[#888] text-sm text-center leading-relaxed mb-6">
                {errorMessage || 'Please try again or switch wallets.'}
              </p>
              <button
                onClick={handleRetry}
                className="w-full py-3.5 bg-white text-black rounded-xl font-semibold text-base transition-all active:scale-[0.97]"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 mt-2 text-[#888] text-sm font-medium transition-colors hover:text-[#F5F5F5]"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
