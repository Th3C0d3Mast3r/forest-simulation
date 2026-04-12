"use client";

import FormLayout from '@/components/form-layout'
import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, X, Copy, Check } from 'lucide-react'
import "../globals.css"

const TicketContent = () => {
  const searchParams = useSearchParams();
  const payment = searchParams.get('payment');
  const txid = searchParams.get('txid');

  const [showPopup, setShowPopup] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (payment) {
      setShowPopup(true);
    }
  }, [payment]);

  const handleCopy = () => {
    if (txid) {
      navigator.clipboard.writeText(txid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShowPopup(false);
    window.history.replaceState(null, '', '/ticket');
  };

  return (
    <>
        <FormLayout />

        {showPopup && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="relative max-w-sm w-full bg-card rounded-[2.5rem] p-10 shadow-2xl border border-bark/10 animate-in zoom-in-95 duration-500 text-center space-y-6">
              
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 h-8 w-8 rounded-full bg-bark/5 hover:bg-bark/10 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-bark" />
              </button>

              {payment === 'success' ? (
                <>
                  <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black tracking-tighter text-bark">Ticket Confirmed!</h2>
                    <p className="text-muted-foreground font-bold text-sm">Your safari expedition has been booked successfully.</p>
                  </div>

                  {txid && (
                    <div className="bg-bark/5 rounded-2xl p-5 space-y-3 border border-bark/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-bark/40">Your Ticket ID</p>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl font-black text-bark tracking-tight">{txid}</span>
                        <button
                          onClick={handleCopy}
                          className="h-8 w-8 rounded-lg bg-bark/10 hover:bg-bark/20 flex items-center justify-center transition-colors"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-bark" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] font-bold text-bark/50 italic">Use this ID at the reserve entry gate for RFID allocation</p>
                    </div>
                  )}

                  <button
                    onClick={handleClose}
                    className="w-full h-14 rounded-2xl bg-bark text-ivory font-black text-base transition-all active:scale-95 shadow-xl"
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-destructive" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black tracking-tighter text-bark">Payment Failed</h2>
                    <p className="text-muted-foreground font-bold text-sm">Your transaction could not be completed. Please try again.</p>
                  </div>

                  {txid && (
                    <div className="bg-destructive/5 rounded-2xl p-4 border border-destructive/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-destructive/50">Reference</p>
                      <p className="text-sm font-bold text-bark mt-1">{txid}</p>
                    </div>
                  )}

                  <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                    If any amount was deducted, it will be refunded within 3–5 business days.
                  </p>

                  <button
                    onClick={handleClose}
                    className="w-full h-14 rounded-2xl bg-bark text-ivory font-black text-base transition-all active:scale-95 shadow-xl"
                  >
                    Try Again
                  </button>
                </>
              )}

              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-bark/20 pt-2">
                Forest Reserve Management
              </p>
            </div>
          </div>
        )}
    </>
  );
};

const Ticket = () => {
  return (
    <div className="min-h-screen bg-background relative">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-bark font-black uppercase tracking-[0.4em]">Loading...</div>}>
            <TicketContent />
        </Suspense>
    </div>
  )
}

export default Ticket