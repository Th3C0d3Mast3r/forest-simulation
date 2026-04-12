"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, MapPin, Activity, ScanLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

export default function DashboardPage() {
  const [taps, setTaps] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5000/rfid/stream");
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== "ping") {
        const newTap = { ...data, id: Date.now() + Math.random() };
        setTaps((prev) => [...prev, newTap]);
        
        // Remove tap popup after 5 seconds to match elegant real-time UI
        setTimeout(() => {
          setTaps((prev) => prev.filter(t => t.id !== newTap.id));
        }, 5000);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <main className="flex flex-1 flex-col gap-8 p-8 bg-background/50 animate-in fade-in duration-700">
      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Active Expeditions" value="14" sub="4 in Zone A" icon={MapPin} />
        <StatsCard title="Visitors Today" value="142" sub="+12% from yesterday" icon={Users} />
        <StatsCard title="Tiger Sightings" value="03" sub="Recent: T-104 (Dawn)" icon={Activity} />
        <StatsCard title="Daily Revenue" value="$4,820" sub="92% Goal met" icon={TrendingUp} />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Primary Monitoring Panel */}
        <Card className="md:col-span-4 bg-card border-none shadow-[0_8px_30px_rgba(74,60,49,0.05)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-black text-bark tracking-tight">Real-time Reserve Activity</CardTitle>
            <p className="text-sm text-muted-foreground font-medium">GPS overlay of active gypsies across all buffer zones.</p>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-3xl bg-bark/5 border-2 border-bark/5 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80&w=1200')] bg-cover opacity-20 filter grayscale" />
               <p className="z-10 text-xs font-black uppercase tracking-widest text-bark/40">Interactive Map Component Placeholder</p>
            </div>
          </CardContent>
        </Card>

        {/* Side Action/Status List */}
        <Card className="md:col-span-3 bg-bark border-none shadow-2xl rounded-2xl text-ivory">
          <CardHeader>
            <CardTitle className="text-xl font-black text-ivory tracking-tight">Operational Alerts</CardTitle>
            <div className="h-1 w-12 bg-primary rounded-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <AlertItem time="06:45 AM" title="T-104 Tiger Sighting" desc="Zone B near the waterhole." status="info" />
            <AlertItem time="08:12 AM" title="RFID Access Point 4" desc="Low battery on scanner." status="warn" />
            <AlertItem time="09:00 AM" title="Heavy Rainfall Prep" desc="Zone C routes may be muddy." status="normal" />
          </CardContent>
        </Card>
      </div>

      {/* Toast Popups for Real-time RFID Scans */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        <AnimatePresence>
          {taps.map((tap) => (
            <motion.div
              key={tap.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
              className="bg-card border border-primary/20 shadow-[-10px_10px_30px_rgba(74,60,49,0.15)] rounded-2xl p-5 flex items-center gap-4 w-80 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
              <div className="bg-primary/10 p-3 rounded-2xl">
                <ScanLine className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Live RFID Tap • {tap.time}</p>
                <p className="text-sm font-bold text-bark leading-tight">{tap.member} & Group ({tap.groupSize})</p>
                <p className="text-xs text-muted-foreground font-medium">Safari: <span className="text-primary font-bold">{tap.safariType}</span></p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}

function StatsCard({ title, value, sub, icon: Icon }) {
  return (
    <Card className="bg-card border-none shadow-[0_4px_20px_rgba(74,60,49,0.03)] hover:shadow-[0_8px_30px_rgba(74,60,49,0.08)] transition-all rounded-[2rem] overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-bark/50">{title}</p>
            <h3 className="text-3xl font-black text-bark tracking-tighter">{value}</h3>
          </div>
          <div className="bg-bark/5 p-3 rounded-2xl group-hover:bg-primary/10 transition-colors">
            <Icon className="h-5 w-5 text-bark" />
          </div>
        </div>
        <p className="mt-4 text-[11px] font-bold text-muted-foreground italic">{sub}</p>
      </CardContent>
    </Card>
  )
}

function AlertItem({ time, title, desc, status }) {
  return (
    <div className="space-y-1 relative pl-6 border-l-2 border-ivory/10 hover:border-primary transition-colors py-1 cursor-default group">
      <div className={cn(
        "absolute -left-[5px] top-2 h-2 w-2 rounded-full",
        status === "warn" ? "bg-red-400" : status === "info" ? "bg-primary" : "bg-ivory/30"
      )} />
      <p className="text-[10px] font-black text-ivory/40 uppercase tracking-widest">{time}</p>
      <p className="text-sm font-bold text-ivory group-hover:text-primary transition-colors">{title}</p>
      <p className="text-[11px] text-ivory/60 leading-snug">{desc}</p>
    </div>
  )
}
