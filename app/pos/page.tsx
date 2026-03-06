'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';

// USDC on Base
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDC_DECIMALS = 6;
const BASE_CHAIN_ID = 8453;

type Mode = 'payment' | 'scanner';
type ScanMode = 'camera' | 'manual';

interface TicketCheckResult {
  valid: boolean;
  message: string;
  ticketType?: string;
  eventName?: string;
}

export default function POSPage() {
  const { address, isConnected } = useAccount();
  const [mode, setMode] = useState<Mode>('payment');

  // Payment state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Scanner state
  const [scannerInput, setScannerInput] = useState('');
  const [eventId, setEventId] = useState('');
  const [ticketResult, setTicketResult] = useState<TicketCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';

  // Generate EIP-681 payment URI for USDC transfer
  const generatePaymentLink = useCallback(() => {
    if (!address || !amount) return '';

    const amountInUnits = parseUnits(amount, USDC_DECIMALS);

    // EIP-681 format for ERC20 transfer
    const uri = `ethereum:${USDC_ADDRESS}@${BASE_CHAIN_ID}/transfer?address=${address}&uint256=${amountInUnits}`;

    return uri;
  }, [address, amount]);

  // Generate payment when amount changes
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      setPaymentLink(generatePaymentLink());
    } else {
      setPaymentLink('');
    }
  }, [amount, generatePaymentLink]);

  const handleGenerateQR = () => {
    if (amount && parseFloat(amount) > 0) {
      setShowQR(true);
    }
  };

  const handleReset = () => {
    setAmount('');
    setDescription('');
    setShowQR(false);
    setPaymentLink('');
  };

  const handleCopyLink = async () => {
    if (paymentLink) {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Check ticket ownership
  const handleCheckTicket = async () => {
    if (!scannerInput || !eventId) return;

    setChecking(true);
    setTicketResult(null);

    try {
      // Extract wallet address from input (could be full address or QR data)
      const walletAddress = scannerInput.startsWith('0x')
        ? scannerInput.slice(0, 42)
        : scannerInput;

      // Check ticket ownership via API
      const res = await fetch(
        `/api/tickets/purchase?wallet=${walletAddress}&eventId=${eventId}`
      );

      if (res.ok) {
        const data = await res.json();
        if (data.hasTicket) {
          setTicketResult({
            valid: true,
            message: 'Valid ticket!',
            ticketType: data.ticketType || 'General Admission',
            eventName: data.eventName,
          });
        } else {
          setTicketResult({
            valid: false,
            message: 'No ticket found for this wallet',
          });
        }
      } else {
        setTicketResult({
          valid: false,
          message: 'Could not verify ticket',
        });
      }
    } catch {
      setTicketResult({
        valid: false,
        message: 'Error checking ticket',
      });
    } finally {
      setChecking(false);
    }
  };

  const handleScannerReset = () => {
    setScannerInput('');
    setTicketResult(null);
  };

  // Start camera scanner
  const startCamera = useCallback(async () => {
    setCameraError(null);

    try {
      // Create scanner instance if it doesn't exist
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      const qrCodeSuccessCallback = (decodedText: string) => {
        // Extract wallet address from scanned data
        // Could be plain address, ethereum: URI, or Base Wallet format
        let walletAddress = decodedText;

        // Handle ethereum: URI format
        if (decodedText.startsWith('ethereum:')) {
          const match = decodedText.match(/ethereum:(0x[a-fA-F0-9]{40})/);
          if (match) {
            walletAddress = match[1];
          }
        }
        // Handle plain 0x address
        else if (decodedText.startsWith('0x') && decodedText.length >= 42) {
          walletAddress = decodedText.slice(0, 42);
        }

        // Set the scanned address
        setScannerInput(walletAddress);

        // Stop camera after successful scan
        if (html5QrCodeRef.current) {
          html5QrCodeRef.current.stop().catch(() => {});
          setCameraActive(false);
        }
      };

      const config = {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0,
        videoConstraints: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      // Prefer back camera on mobile
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback,
        () => {} // Ignore scan failures (no QR in frame)
      );

      setCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(
        err instanceof Error
          ? err.message.includes('Permission')
            ? 'Camera access denied. Please allow camera permission.'
            : 'Could not start camera. Try manual entry.'
          : 'Camera not available'
      );
    }
  }, []);

  // Stop camera scanner
  const stopCamera = useCallback(async () => {
    if (html5QrCodeRef.current && cameraActive) {
      try {
        await html5QrCodeRef.current.stop();
        setCameraActive(false);
      } catch (err) {
        console.error('Error stopping camera:', err);
      }
    }
  }, [cameraActive]);

  // Cleanup camera on unmount or mode change
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Stop camera when switching away from scanner mode
  useEffect(() => {
    if (mode !== 'scanner') {
      stopCamera();
    }
  }, [mode, stopCamera]);

  // Quick amount buttons
  const quickAmounts = [5, 10, 25, 50, 100];

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-[#F5F5F5] text-xl font-bold mb-2">baseFM POS</h1>
          <p className="text-[#888] text-sm mb-6">Connect wallet to receive payments or scan tickets</p>
          <p className="text-[#666] text-xs">
            Use the wallet button in the navbar to connect
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <header className="text-center">
          <h1 className="text-[#F5F5F5] text-2xl font-bold mb-1">baseFM POS</h1>
          <p className="text-[#888] text-sm">Payments & Ticket Scanning</p>
        </header>

        {/* Mode toggle */}
        <div className="flex bg-[#1A1A1A] rounded-xl p-1">
          <button
            onClick={() => setMode('payment')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'payment'
                ? 'bg-purple-500 text-white'
                : 'text-[#888] hover:text-[#F5F5F5]'
            }`}
          >
            Accept Payment
          </button>
          <button
            onClick={() => setMode('scanner')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'scanner'
                ? 'bg-purple-500 text-white'
                : 'text-[#888] hover:text-[#F5F5F5]'
            }`}
          >
            Scan Tickets
          </button>
        </div>

        {mode === 'payment' ? (
          <>
            {/* Receiving wallet indicator */}
            <div className="bg-[#1A1A1A] rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[#888] text-xs">Receiving to</p>
                <p className="text-[#F5F5F5] text-sm font-mono truncate">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            </div>

            {!showQR ? (
              <>
                {/* Amount input */}
                <div className="space-y-3">
                  <label className="text-[#888] text-sm font-medium">Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888] text-2xl font-bold">$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl py-4 pl-10 pr-4 text-[#F5F5F5] text-3xl font-bold text-center focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  {/* Quick amounts */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickAmounts.map((q) => (
                      <button
                        key={q}
                        onClick={() => setAmount(q.toString())}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          amount === q.toString()
                            ? 'bg-purple-500 text-white'
                            : 'bg-[#1A1A1A] text-[#888] hover:bg-[#222] hover:text-[#F5F5F5]'
                        }`}
                      >
                        ${q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional description */}
                <div className="space-y-2">
                  <label className="text-[#888] text-sm font-medium">Description (optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Ticket, Merch, Donation"
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl py-3 px-4 text-[#F5F5F5] text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    maxLength={50}
                  />
                </div>

                {/* Generate QR button */}
                <button
                  onClick={handleGenerateQR}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98]"
                >
                  Generate Payment QR
                </button>
              </>
            ) : (
              <>
                {/* QR Code display */}
                <div className="bg-white rounded-2xl p-6 flex flex-col items-center">
                  <QRCodeSVG
                    value={paymentLink}
                    size={240}
                    level="H"
                    includeMargin
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                  />
                </div>

                {/* Payment details */}
                <div className="bg-[#1A1A1A] rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#888] text-sm">Amount</span>
                    <span className="text-[#F5F5F5] text-xl font-bold">${amount} USDC</span>
                  </div>
                  {description && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#888] text-sm">For</span>
                      <span className="text-[#F5F5F5] text-sm">{description}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-[#888] text-sm">Network</span>
                    <span className="text-blue-400 text-sm font-medium">Base</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <p className="text-purple-300 text-sm text-center">
                    Customer scans QR with Base Wallet to pay
                  </p>
                </div>

                {/* Copy link button */}
                <button
                  onClick={handleCopyLink}
                  className="w-full py-3 bg-[#1A1A1A] text-[#F5F5F5] rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#222] transition-colors active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copied ? 'Copied!' : 'Copy Payment Link'}
                </button>

                {/* New payment button */}
                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-[#0A0A0A] border border-[#333] text-[#888] rounded-xl font-medium hover:text-[#F5F5F5] hover:border-[#444] transition-colors active:scale-[0.98]"
                >
                  New Payment
                </button>
              </>
            )}
          </>
        ) : (
          /* Scanner Mode */
          <>
            {/* Event selection */}
            <div className="space-y-2">
              <label className="text-[#888] text-sm font-medium">Event ID</label>
              <input
                type="text"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="Enter event ID or slug"
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl py-3 px-4 text-[#F5F5F5] text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Scan mode toggle */}
            <div className="flex bg-[#0A0A0A] rounded-lg p-1">
              <button
                onClick={() => {
                  setScanMode('camera');
                  setCameraError(null);
                }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  scanMode === 'camera'
                    ? 'bg-[#1A1A1A] text-[#F5F5F5]'
                    : 'text-[#666] hover:text-[#888]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Camera
              </button>
              <button
                onClick={() => {
                  setScanMode('manual');
                  stopCamera();
                }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  scanMode === 'manual'
                    ? 'bg-[#1A1A1A] text-[#F5F5F5]'
                    : 'text-[#666] hover:text-[#888]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Manual
              </button>
            </div>

            {scanMode === 'camera' ? (
              <>
                {/* Camera scanner */}
                <div className="space-y-3">
                  {!cameraActive && !scannerInput && (
                    <button
                      onClick={startCamera}
                      className="w-full py-4 bg-[#1A1A1A] border-2 border-dashed border-[#333] rounded-xl text-[#888] hover:border-purple-500 hover:text-[#F5F5F5] transition-colors flex flex-col items-center gap-2"
                    >
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <span className="text-sm font-medium">Tap to scan QR code</span>
                    </button>
                  )}

                  {/* Camera view container - must have explicit height for camera feed */}
                  <div
                    id={scannerContainerId}
                    className={`qr-scanner-container overflow-hidden rounded-xl bg-black relative ${cameraActive ? 'block' : 'hidden'}`}
                    style={{
                      width: '100%',
                      minHeight: cameraActive ? '320px' : '0',
                    }}
                  />

                  {/* CSS to ensure video fills container */}
                  <style jsx global>{`
                    .qr-scanner-container video {
                      width: 100% !important;
                      height: auto !important;
                      min-height: 320px;
                      object-fit: cover;
                      border-radius: 0.75rem;
                    }
                    .qr-scanner-container > div {
                      border: none !important;
                    }
                    #qr-shaded-region {
                      border-color: rgba(168, 85, 247, 0.5) !important;
                    }
                  `}</style>

                  {/* Scanning indicator overlay */}
                  {cameraActive && (
                    <div className="text-center py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                        <span className="text-purple-300 text-sm">Point camera at QR code</span>
                      </div>
                    </div>
                  )}

                  {cameraActive && (
                    <button
                      onClick={stopCamera}
                      className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                    >
                      Stop Camera
                    </button>
                  )}

                  {cameraError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                      <p className="text-red-400 text-sm">{cameraError}</p>
                      <button
                        onClick={() => setScanMode('manual')}
                        className="mt-2 text-[#888] text-xs hover:text-[#F5F5F5] underline"
                      >
                        Switch to manual entry
                      </button>
                    </div>
                  )}

                  {/* Scanned address display */}
                  {scannerInput && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <p className="text-[#888] text-xs mb-1">Scanned wallet</p>
                      <p className="text-[#F5F5F5] text-sm font-mono break-all">{scannerInput}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Manual entry */
              <div className="space-y-2">
                <label className="text-[#888] text-sm font-medium">Customer Wallet Address</label>
                <textarea
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                  placeholder="0x..."
                  rows={3}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl py-3 px-4 text-[#F5F5F5] text-sm font-mono focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
                <p className="text-[#666] text-xs">
                  Paste the customer&apos;s wallet address
                </p>
              </div>
            )}

            {/* Check button */}
            <button
              onClick={handleCheckTicket}
              disabled={!scannerInput || !eventId || checking}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98]"
            >
              {checking ? 'Checking...' : 'Verify Ticket'}
            </button>

            {/* Result display */}
            {ticketResult && (
              <div
                className={`rounded-xl p-6 text-center ${
                  ticketResult.valid
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    ticketResult.valid ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {ticketResult.valid ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <p
                  className={`text-xl font-bold mb-2 ${
                    ticketResult.valid ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {ticketResult.message}
                </p>
                {ticketResult.ticketType && (
                  <p className="text-[#888] text-sm">{ticketResult.ticketType}</p>
                )}
                {ticketResult.eventName && (
                  <p className="text-[#666] text-xs mt-1">{ticketResult.eventName}</p>
                )}
              </div>
            )}

            {/* Reset scanner */}
            {(scannerInput || ticketResult) && (
              <button
                onClick={handleScannerReset}
                className="w-full py-3 bg-[#0A0A0A] border border-[#333] text-[#888] rounded-xl font-medium hover:text-[#F5F5F5] hover:border-[#444] transition-colors active:scale-[0.98]"
              >
                Scan Next Ticket
              </button>
            )}

            {/* Instructions */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 space-y-2">
              <p className="text-[#F5F5F5] text-sm font-medium">How to verify tickets:</p>
              <ol className="text-[#888] text-xs space-y-1 list-decimal list-inside">
                <li>Enter the event ID above</li>
                <li>Ask customer to show wallet QR from Base Wallet</li>
                <li>Scan their QR with camera or paste address manually</li>
                <li>Tap Verify to check ticket ownership onchain</li>
              </ol>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="pt-4 text-center">
          <Link
            href="/guide"
            className="text-[#666] text-xs hover:text-[#888] transition-colors"
          >
            Need help? View guide
          </Link>
        </div>

      </div>
    </div>
  );
}
