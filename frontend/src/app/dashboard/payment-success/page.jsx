"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Ticket, ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import "../../globals.css";

const PaymentSuccess = () => {
    const searchParams = useSearchParams();
    const txid = searchParams.get('txid');
    const [ticketData, setTicketData] = useState(null);

    useEffect(() => {
        if (txid) {
            // Fetch ticket details if needed
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/ticket/get-by-uid/${txid}`)
                .then(res => res.json())
                .then(data => setTicketData(data.reg))
                .catch(err => console.error(err));
        }
    }, [txid]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-card rounded-[3rem] p-10 shadow-2xl border-bark/5 border animate-in zoom-in duration-500 text-center space-y-8">
                <div className="mx-auto w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-bark">Payment Successful!</h1>
                    <p className="text-muted-foreground font-bold italic">Your expedition is confirmed.</p>
                </div>

                <div className="bg-bark/5 rounded-3xl p-6 space-y-4 border border-bark/10 text-left">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-bark/40">Transaction ID</span>
                        <span className="font-bold text-bark">{txid}</span>
                    </div>
                    {ticketData && (
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-bark/40">Safari Type</span>
                            <span className="font-bold text-bark">{ticketData.safariType}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <Button asChild className="h-14 rounded-2xl bg-bark text-ivory font-black text-lg gap-2">
                        <Link href="/dashboard">
                            Go to Dashboard <ArrowRight className="w-5 h-5" />
                        </Link>
                    </Button>
                    <Button variant="ghost" className="h-14 rounded-2xl text-bark font-black gap-2">
                        <Download className="w-5 h-5" /> Download E-Ticket
                    </Button>
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-bark/30 pt-4">
                    Forest Reserve Management
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccess;
