'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { ERC20_TRANSFER_ABI } from '@/lib/token/tip-config';

// USDC on Base
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const USDC_DECIMALS = 6;

interface Ticket {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  priceUsdc: number;
  totalQuantity: number | null;
  soldCount: number;
  isAvailable: boolean;
  remaining: number | null;
  promoterWallet: string | null;
  promoterName: string | null;
}

interface TicketPurchaseProps {
  eventId: string;
  eventTitle: string;
}

export function TicketPurchase({ eventId, eventTitle }: TicketPurchaseProps) {
  const { address, isConnected } = useAccount();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [purchaseStep, setPurchaseStep] = useState<'idle' | 'paying' | 'confirming' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasTicket, setHasTicket] = useState(false);

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Fetch tickets for this event
  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await fetch(`/api/tickets?eventId=${eventId}`);
        if (res.ok) {
          const data = await res.json();
          setTickets(data.tickets || []);
          if (data.tickets?.length > 0) {
            setSelectedTicket(data.tickets[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTickets();
  }, [eventId]);

  // Check if user already has a ticket
  useEffect(() => {
    async function checkTicket() {
      if (!address) return;
      try {
        const res = await fetch(`/api/tickets/purchase?wallet=${address}&eventId=${eventId}`);
        if (res.ok) {
          const data = await res.json();
          setHasTicket(data.hasTicket);
        }
      } catch (err) {
        console.error('Failed to check ticket:', err);
      }
    }
    checkTicket();
  }, [address, eventId]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash && selectedTicket) {
      recordPurchase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, txHash]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      setPurchaseStep('error');
      setErrorMessage(writeError.message || 'Transaction failed');
    }
  }, [writeError]);

  async function recordPurchase() {
    if (!txHash || !selectedTicket || !address) return;

    setPurchaseStep('confirming');

    try {
      const res = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          buyerWallet: address,
          quantity,
          txHash,
        }),
      });

      if (res.ok) {
        setPurchaseStep('success');
        setHasTicket(true);
      } else {
        const data = await res.json();
        setPurchaseStep('error');
        setErrorMessage(data.error || 'Failed to record purchase');
      }
    } catch (err) {
      setPurchaseStep('error');
      setErrorMessage('Failed to record purchase');
    }
  }

  function handlePurchase() {
    if (!selectedTicket || !selectedTicket.promoterWallet || !isConnected) return;

    const totalAmount = selectedTicket.priceUsdc * quantity;
    const amountInUnits = parseUnits(totalAmount.toString(), USDC_DECIMALS);

    setPurchaseStep('paying');
    setErrorMessage('');

    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_TRANSFER_ABI,
      functionName: 'transfer',
      args: [selectedTicket.promoterWallet as `0x${string}`, amountInUnits],
    });
  }

  function resetPurchase() {
    setPurchaseStep('idle');
    setErrorMessage('');
    setQuantity(1);
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-[#1A1A1A] rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-[#333] rounded w-32 mb-4" />
        <div className="h-12 bg-[#333] rounded mb-3" />
        <div className="h-12 bg-[#333] rounded" />
      </div>
    );
  }

  // No tickets available
  if (tickets.length === 0) {
    return null;
  }

  // User already has ticket
  if (hasTicket) {
    return (
      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-green-400 font-bold">You have a ticket!</h3>
            <p className="text-[#888] text-sm">See you at {eventTitle}</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (purchaseStep === 'success') {
    return (
      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/30">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-green-400 font-bold text-xl mb-2">Purchase Complete!</h3>
          <p className="text-[#888] text-sm mb-4">
            Your ticket for {eventTitle} has been confirmed
          </p>
          {txHash && (
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 text-sm hover:underline"
            >
              View transaction
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-[#2A2A2A]">
      {/* Header */}
      <div className="p-5 border-b border-[#2A2A2A]">
        <h3 className="text-[#F5F5F5] font-bold text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          Get Tickets
        </h3>
        <p className="text-[#888] text-sm mt-1">Pay directly to the promoter with USDC</p>
      </div>

      {/* Ticket Selection */}
      <div className="p-5 space-y-4">
        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => setSelectedTicket(ticket)}
            disabled={!ticket.isAvailable || purchaseStep !== 'idle'}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selectedTicket?.id === ticket.id
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-[#333] hover:border-[#444]'
            } ${!ticket.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[#F5F5F5] font-semibold">{ticket.name}</h4>
                {ticket.description && (
                  <p className="text-[#888] text-sm mt-0.5">{ticket.description}</p>
                )}
                {ticket.remaining !== null && (
                  <p className="text-[#666] text-xs mt-1">
                    {ticket.remaining} remaining
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-[#F5F5F5] font-bold text-lg">
                  ${ticket.priceUsdc.toFixed(2)}
                </div>
                <div className="text-[#888] text-xs">USDC</div>
              </div>
            </div>
          </button>
        ))}

        {/* Quantity Selector */}
        {selectedTicket && selectedTicket.isAvailable && (
          <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-xl">
            <span className="text-[#888]">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || purchaseStep !== 'idle'}
                className="w-8 h-8 rounded-full bg-[#2A2A2A] text-[#F5F5F5] flex items-center justify-center hover:bg-[#333] disabled:opacity-50"
              >
                -
              </button>
              <span className="text-[#F5F5F5] font-bold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={
                  purchaseStep !== 'idle' ||
                  (selectedTicket.remaining !== null && quantity >= selectedTicket.remaining)
                }
                className="w-8 h-8 rounded-full bg-[#2A2A2A] text-[#F5F5F5] flex items-center justify-center hover:bg-[#333] disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Total */}
        {selectedTicket && (
          <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <span className="text-[#F5F5F5] font-medium">Total</span>
            <span className="text-[#F5F5F5] font-bold text-xl">
              ${(selectedTicket.priceUsdc * quantity).toFixed(2)} USDC
            </span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">{errorMessage}</p>
            <button
              onClick={resetPurchase}
              className="text-red-400 text-sm underline mt-2"
            >
              Try again
            </button>
          </div>
        )}

        {/* Purchase Button */}
        {!isConnected ? (
          <div className="text-center py-4">
            <p className="text-[#888] text-sm">Connect your wallet to purchase tickets</p>
          </div>
        ) : selectedTicket && !selectedTicket.promoterWallet ? (
          <div className="text-center py-4">
            <p className="text-[#888] text-sm">Promoter wallet not configured</p>
          </div>
        ) : (
          <button
            onClick={handlePurchase}
            disabled={!selectedTicket || !selectedTicket.isAvailable || purchaseStep !== 'idle'}
            className="w-full py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_100%] rounded-xl text-white font-bold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:bg-right transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {isPending || isConfirming ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{isPending ? 'Confirm in wallet...' : 'Processing...'}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Pay with USDC</span>
              </>
            )}
          </button>
        )}

        {/* Promoter Info */}
        {selectedTicket?.promoterName && (
          <p className="text-center text-[#666] text-xs">
            Payment goes directly to {selectedTicket.promoterName}
          </p>
        )}
      </div>
    </div>
  );
}
