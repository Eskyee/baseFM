'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';

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

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [copied, setCopied] = useState(false);

  const [scannerInput, setScannerInput] = useState('');
  const [eventId, setEventId] = useState('');
  const [ticketResult, setTicketResult] = useState<TicketCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';

  const generatePaymentLink = useCallback(() => {
    if (!address || !amount) return '';
    const amountInUnits = parseUnits(amount, USDC_DECIMALS);
    return `ethereum:${USDC_ADDRESS}@${BASE_CHAIN_ID}/transfer?address=${address}&uint256=${amountInUnits}`;
  }, [address, amount]);

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
    if (!paymentLink) return;
    await navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckTicket = async () => {
    if (!scannerInput || !eventId) return;

    setChecking(true);
    setTicketResult(null);

    try {
      const walletAddress = scannerInput.startsWith('0x')
        ? scannerInput.slice(0, 42)
        : scannerInput;

      const res = await fetch(`/api/tickets/purchase?wallet=${walletAddress}&eventId=${eventId}`);

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

  const startCamera = useCallback(async () => {
    setCameraError(null);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      const qrCodeSuccessCallback = (decodedText: string) => {
        let walletAddress = decodedText;

        if (decodedText.startsWith('ethereum:')) {
          const match = decodedText.match(/ethereum:(0x[a-fA-F0-9]{40})/);
          if (match) {
            walletAddress = match[1];
          }
        } else if (decodedText.startsWith('0x') && decodedText.length >= 42) {
          walletAddress = decodedText.slice(0, 42);
        }

        setScannerInput(walletAddress);
        void stopCamera();
      };

      const config = {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0,
        videoConstraints: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback,
        () => {}
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
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (mode !== 'scanner') {
      void stopCamera();
    }
  }, [mode, stopCamera]);

  const quickAmounts = [5, 10, 25, 50, 100];

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="basefm-kicker text-blue-500">POS</span>
              <span className="basefm-kicker text-zinc-500">Payments and scanning</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
                Event point of sale.
                <br />
                <span className="text-zinc-700">Connect first.</span>
              </h1>
              <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
                Use this operator surface to take Base payments and verify event entry from the door.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8 mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">POS</span>
            <span className="basefm-kicker text-zinc-500">Door and payment ops</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase leading-[0.92]">
              Point of sale.
              <br />
              <span className="text-zinc-700">Take payment. Verify entry.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              Switch between payment collection and ticket verification without leaving the station workflow.
            </p>
          </div>
        </div>

        <div className="max-w-md space-y-6">
          <div className="basefm-panel p-4 flex items-center gap-3">
            <div className="h-10 w-10 border border-green-500/30 bg-green-500/10 flex items-center justify-center flex-shrink-0 text-green-400">
              OK
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Receiving wallet</div>
              <p className="text-sm text-white font-mono truncate">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          </div>

          <div className="basefm-panel p-1 flex">
            <button
              onClick={() => setMode('payment')}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                mode === 'payment' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
              }`}
            >
              Accept Payment
            </button>
            <button
              onClick={() => setMode('scanner')}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                mode === 'scanner' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
              }`}
            >
              Scan Tickets
            </button>
          </div>

          {mode === 'payment' ? (
            <>
              {!showQR ? (
                <>
                  <div className="basefm-panel p-5 space-y-4">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600">Payment amount</div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-2xl font-bold">$</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-black border border-zinc-800 py-4 pl-10 pr-4 text-white text-3xl font-bold text-center focus:outline-none focus:border-zinc-500 transition-colors"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map((q) => (
                        <button
                          key={q}
                          onClick={() => setAmount(q.toString())}
                          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                            amount === q.toString()
                              ? 'border-white bg-white text-black'
                              : 'border-zinc-800 text-zinc-500 hover:text-white'
                          }`}
                        >
                          ${q}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="basefm-panel p-5 space-y-2">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600">Description</div>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Ticket, merch, donation"
                      className="w-full bg-black border border-zinc-800 py-3 px-4 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                      maxLength={50}
                    />
                  </div>

                  <button
                    onClick={handleGenerateQR}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="basefm-button-primary w-full disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-800 disabled:text-zinc-500"
                  >
                    Generate Payment QR
                  </button>
                </>
              ) : (
                <>
                  <div className="border border-zinc-900 bg-white p-6 flex flex-col items-center">
                    <QRCodeSVG
                      value={paymentLink}
                      size={240}
                      level="H"
                      includeMargin
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  </div>

                  <div className="basefm-panel p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-sm">Amount</span>
                      <span className="text-white text-xl font-bold">${amount} USDC</span>
                    </div>
                    {description ? (
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-zinc-500 text-sm">For</span>
                        <span className="text-white text-sm text-right">{description}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-sm">Network</span>
                      <span className="text-blue-400 text-sm font-medium">Base</span>
                    </div>
                  </div>

                  <div className="border border-blue-500/20 bg-blue-500/10 p-4">
                    <p className="text-blue-300 text-sm text-center">
                      Customer scans the QR with Base Wallet to pay.
                    </p>
                  </div>

                  <button onClick={handleCopyLink} className="basefm-button-secondary w-full">
                    {copied ? 'Copied' : 'Copy Payment Link'}
                  </button>

                  <button onClick={handleReset} className="basefm-button-secondary w-full">
                    New Payment
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <div className="basefm-panel p-5 space-y-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600">Ticket verification</div>
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600">Event ID</div>
                  <input
                    type="text"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    placeholder="Enter event ID or slug"
                    className="w-full bg-black border border-zinc-800 py-3 px-4 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
              </div>

              <div className="basefm-panel p-1 flex">
                <button
                  onClick={() => {
                    setScanMode('camera');
                    setCameraError(null);
                  }}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    scanMode === 'camera' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  Camera
                </button>
                <button
                  onClick={() => {
                    setScanMode('manual');
                    void stopCamera();
                  }}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    scanMode === 'manual' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  Manual
                </button>
              </div>

              {scanMode === 'camera' ? (
                <>
                  {!cameraActive && !scannerInput ? (
                    <button
                      onClick={startCamera}
                      className="w-full py-5 border-2 border-dashed border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white transition-colors flex flex-col items-center gap-2"
                    >
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <span className="text-sm font-medium">Tap to scan QR code</span>
                    </button>
                  ) : null}

                  <div
                    id={scannerContainerId}
                    className={`qr-scanner-container overflow-hidden border border-zinc-900 bg-black relative ${cameraActive ? 'block' : 'hidden'}`}
                    style={{
                      width: '100%',
                      minHeight: cameraActive ? '320px' : '0',
                    }}
                  />

                  <style jsx global>{`
                    .qr-scanner-container video {
                      width: 100% !important;
                      height: auto !important;
                      min-height: 320px;
                      object-fit: cover;
                    }
                    .qr-scanner-container > div {
                      border: none !important;
                    }
                    #qr-shaded-region {
                      border-color: rgba(255, 255, 255, 0.45) !important;
                    }
                  `}</style>

                  {cameraActive ? (
                    <div className="border border-blue-500/20 bg-blue-500/10 p-3">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span className="text-blue-300 text-sm">Point camera at QR code</span>
                      </div>
                    </div>
                  ) : null}

                  {cameraActive ? (
                    <button onClick={stopCamera} className="basefm-button-danger w-full">
                      Stop Camera
                    </button>
                  ) : null}

                  {cameraError ? (
                    <div className="border border-red-500/20 bg-red-500/10 p-4 text-center">
                      <p className="text-red-400 text-sm">{cameraError}</p>
                      <button
                        onClick={() => setScanMode('manual')}
                        className="mt-2 text-zinc-500 text-xs hover:text-white underline"
                      >
                        Switch to manual entry
                      </button>
                    </div>
                  ) : null}

                  {scannerInput ? (
                    <div className="border border-green-500/20 bg-green-500/10 p-4">
                      <p className="text-zinc-500 text-xs mb-1 uppercase tracking-widest">Scanned wallet</p>
                      <p className="text-white text-sm font-mono break-all">{scannerInput}</p>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="basefm-panel p-5 space-y-2">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600">Customer wallet address</div>
                  <textarea
                    value={scannerInput}
                    onChange={(e) => setScannerInput(e.target.value)}
                    placeholder="0x..."
                    rows={3}
                    className="w-full bg-black border border-zinc-800 py-3 px-4 text-white text-sm font-mono focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                  />
                  <p className="text-zinc-500 text-xs">Paste the customer wallet address manually.</p>
                </div>
              )}

              <button
                onClick={handleCheckTicket}
                disabled={!scannerInput || !eventId || checking}
                className="basefm-button-primary w-full disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {checking ? 'Checking...' : 'Verify Ticket'}
              </button>

              {ticketResult ? (
                <div
                  className={`border p-6 text-center ${
                    ticketResult.valid ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
                  }`}
                >
                  <div
                    className={`h-16 w-16 mx-auto mb-4 border flex items-center justify-center ${
                      ticketResult.valid ? 'border-green-500/40 text-green-400' : 'border-red-500/40 text-red-400'
                    }`}
                  >
                    {ticketResult.valid ? 'OK' : 'NO'}
                  </div>
                  <p className={`text-xl font-bold mb-2 ${ticketResult.valid ? 'text-green-400' : 'text-red-400'}`}>
                    {ticketResult.message}
                  </p>
                  {ticketResult.ticketType ? <p className="text-zinc-400 text-sm">{ticketResult.ticketType}</p> : null}
                  {ticketResult.eventName ? <p className="text-zinc-500 text-xs mt-1">{ticketResult.eventName}</p> : null}
                </div>
              ) : null}

              {scannerInput || ticketResult ? (
                <button onClick={handleScannerReset} className="basefm-button-secondary w-full">
                  Scan Next Ticket
                </button>
              ) : null}

              <div className="basefm-panel p-5">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">How to verify tickets</div>
                <ol className="text-zinc-500 text-xs space-y-2 list-decimal list-inside">
                  <li>Enter the event ID above.</li>
                  <li>Ask the customer to show their Base Wallet QR.</li>
                  <li>Scan the QR or paste the wallet address manually.</li>
                  <li>Use Verify Ticket to check ownership.</li>
                </ol>
              </div>
            </>
          )}

          <div className="pt-2 text-center">
            <Link href="/guide" className="text-zinc-500 text-xs hover:text-white transition-colors">
              Need help? View guide
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
