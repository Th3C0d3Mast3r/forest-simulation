"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, RefreshCw, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import "../../globals.css";

const FailureContent = () => {
    const searchParams = useSearchParams();
    const txid = searchParams.get('txid');

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-card rounded-[3rem] p-10 shadow-2xl border-destructive/5 border animate-in zoom-in duration-500 text-center space-y-8">
                <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center">
                    <XCircle className="w-12 h-12 text-destructive" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-bark">Payment Failed</h1>
                    <p className="text-muted-foreground font-bold italic">Something went wrong with your transaction.</p>
                </div>

                <div className="bg-destructive/5 rounded-3xl p-6 space-y-4 border border-destructive/10 text-left">
                    <div className="flex justify-between items-center text-destructive">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</span>
                        <span className="font-bold">Transaction Declined</span>
                    </div>
                    {txid && (
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-bark/40">Reference</span>
                            <span className="font-bold text-bark">{txid}</span>
                        </div>
                    )}
                </div>

                <p className="text-sm font-bold text-muted-foreground leading-relaxed px-4">
                    Don't worry, if any money was deducted, it will be refunded within 3-5 business days. You can try the payment again.
                </p>

                <div className="grid grid-cols-1 gap-4">
                    <Button asChild className="h-14 rounded-2xl bg-bark text-ivory font-black text-lg gap-2">
                        <Link href="/ticket">
                            Try Again <RefreshCw className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" asChild className="h-12 rounded-2xl border-bark/20 text-bark font-black gap-2">
                             <Link href="/dashboard">
                                <ArrowLeft className="w-4 h-4" /> Exit
                             </Link>
                        </Button>
                        <Button variant="outline" className="h-12 rounded-2xl border-bark/20 text-bark font-black gap-2">
                             <MessageCircle className="w-4 h-4" /> Help
                        </Button>
                    </div>
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-bark/30 pt-4">
                    Forest Reserve Management
                </p>
            </div>
        </div>
    );
};

const PaymentFailure = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FailureContent />
        </Suspense>
    );
}

export default PaymentFailure;
