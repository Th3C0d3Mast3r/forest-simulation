"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Activity, Satellite } from "lucide-react";
import { cn } from "@/lib/utils";

const TRACK_WAYPOINTS = [
  // --- TOP LEFT START & UPPER S-CURVE ---
  [48.5050, -0.1200], [48.5050, -0.1205], [48.5050, -0.1210], // Top straight
  [48.5048, -0.1215], [48.5045, -0.1218], [48.5042, -0.1219], // Curve in
  [48.5040, -0.1220], [48.5038, -0.1219], [48.5035, -0.1216], // Curve out
  
  // --- MIDDLE BUMP OF THE 'S' ---
  [48.5033, -0.1212], [48.5030, -0.1210], [48.5028, -0.1212], 
  [48.5026, -0.1215], [48.5024, -0.1218], [48.5022, -0.1219], 
  
  // --- BOTTOM LEFT CURVE & STRAIGHT ---
  [48.5020, -0.1220], [48.5018, -0.1218], [48.5016, -0.1214],
  [48.5015, -0.1210], [48.5015, -0.1200], [48.5015, -0.1190], // Bottom straight
  [48.5015, -0.1180], [48.5015, -0.1170], [48.5015, -0.1160], 

  // --- THE FIGURE-8 LOOP (BOTTOM RIGHT) ---
  [48.5015, -0.1150], [48.5016, -0.1145], [48.5018, -0.1142], // Approaching cross
  [48.5020, -0.1140], // CROSS POINT
  [48.5022, -0.1135], [48.5023, -0.1125], [48.5022, -0.1115], // Top of loop
  [48.5020, -0.1110], [48.5017, -0.1110], [48.5014, -0.1115], // Far right
  [48.5013, -0.1125], [48.5014, -0.1135], [48.5016, -0.1138], // Bottom of loop
  [48.5020, -0.1140], // CROSS POINT AGAIN
  
  // --- TRANSITION TO INNER HAIRPIN ---
  [48.5023, -0.1145], [48.5025, -0.1150], [48.5027, -0.1160], 
  [48.5030, -0.1170], [48.5032, -0.1180], [48.5034, -0.1185],

  // --- THE INNER U-TURN (CENTER) ---
  [48.5035, -0.1190], [48.5037, -0.1191], [48.5039, -0.1190], // Apex
  [48.5041, -0.1185], [48.5042, -0.1175], [48.5042, -0.1165], 
  
  // --- THE DASHED STRAIGHT & FAR RIGHT TURN ---
  [48.5042, -0.1150], [48.5042, -0.1130], [48.5042, -0.1110], // Dashed line
  [48.5043, -0.1105], [48.5045, -0.1100], [48.5048, -0.1102], // Far right curve
  [48.5050, -0.1110], [48.5052, -0.1120], [48.5053, -0.1135],
  
  // --- TOP RETURN STRAIGHT ---
  [48.5055, -0.1150], [48.5055, -0.1170], [48.5055, -0.1190],
  [48.5053, -0.1198], [48.5050, -0.1200]  // Back to Start
];

const START_IDX = 0;
const API_BASE = "http://localhost:5000";

export default function WildlifePage() {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const carMarkerRef = useRef(null);
  const trailRef = useRef(null);
  const animFrameRef = useRef(null);
  const pollingRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [posLabel, setPosLabel] = useState("Standby");
  const [apiTriggered, setApiTriggered] = useState(false);

  const progressRef = useRef(0);
  const speedRef = useRef(1);
  const runningRef = useRef(false);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (leafletMapRef.current) return;

    const loadLeaflet = async () => {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!window.L) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      const L = window.L;
      const map = L.map(mapRef.current, {
        center: [48.5035, -0.1160],
        zoom: 16,
        zoomControl: false,
        scrollWheelZoom: true,
        attributionControl: false,
      });

      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
      }).addTo(map);

      L.polyline(TRACK_WAYPOINTS, {
        color: "#facc15",
        weight: 4,
        opacity: 0.9,
        lineJoin: "round",
        lineCap: "round",
      }).addTo(map);

      const startIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#22c55e;border:3px solid #fff;box-shadow:0 0 12px #22c55e;"></div>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker(TRACK_WAYPOINTS[START_IDX], { icon: startIcon }).addTo(map);

      const endIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#ef4444;border:3px solid #fff;box-shadow:0 0 12px #ef4444;"></div>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker(TRACK_WAYPOINTS[TRACK_WAYPOINTS.length - 1], { icon: endIcon }).addTo(map);

      const carIcon = L.divIcon({
        html: `<div style="width:28px;height:28px;border-radius:50%;background:#facc15;border:3px solid #fff;box-shadow:0 0 20px rgba(250,204,21,0.8);display:flex;align-items:center;justify-content:center;font-size:14px;color:#000;font-weight:900;">⚡</div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      carMarkerRef.current = L.marker(TRACK_WAYPOINTS[START_IDX], {
        icon: carIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      trailRef.current = L.polyline([], {
        color: "#22c55e",
        weight: 3,
        opacity: 0.6,
        dashArray: "6,8",
      }).addTo(map);

      leafletMapRef.current = map;
    };

    loadLeaflet();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/simulation/status`);
        const data = await res.json();
        if (data.success && data.state.running && !runningRef.current) {
          if (data.state.speed) setSpeed(data.state.speed);
          setApiTriggered(true);
          startAnimation();
        }
      } catch {}
    };

    pollingRef.current = setInterval(poll, 2000);
    return () => clearInterval(pollingRef.current);
  }, []);

  const lerp = (a, b, t) => a + (b - a) * t;

  const getPositionAtProgress = (t) => {
    const totalPoints = TRACK_WAYPOINTS.length - 1;
    const scaled = t * totalPoints;
    const idx = Math.floor(scaled);
    const frac = scaled - idx;
    const from = TRACK_WAYPOINTS[Math.min(idx, totalPoints)];
    const to = TRACK_WAYPOINTS[Math.min(idx + 1, totalPoints)];
    return [lerp(from[0], to[0], frac), lerp(from[1], to[1], frac)];
  };

  const startAnimation = () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);

    const trailCoords = [];

    const step = () => {
      if (!runningRef.current) return;
      progressRef.current = Math.min(progressRef.current + 0.0002 * speedRef.current, 1);
      const pos = getPositionAtProgress(progressRef.current);

      if (carMarkerRef.current) carMarkerRef.current.setLatLng(pos);

      trailCoords.push(pos);
      if (trailRef.current) trailRef.current.setLatLngs(trailCoords);

      setProgress(progressRef.current);
      setPosLabel(progressRef.current >= 1 ? "Finished" : `T+${Math.round(progressRef.current * 100)}%`);

      if (progressRef.current >= 1) {
        runningRef.current = false;
        setIsRunning(false);
        fetch(`${API_BASE}/simulation/stop`, { method: "POST" }).catch(() => {});
        return;
      }
      animFrameRef.current = requestAnimationFrame(step);
    };
    animFrameRef.current = requestAnimationFrame(step);
  };

  const pauseAnimation = () => {
    runningRef.current = false;
    setIsRunning(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  const resetAnimation = () => {
    pauseAnimation();
    progressRef.current = 0;
    setProgress(0);
    setPosLabel("Standby");
    setApiTriggered(false);
    if (carMarkerRef.current) carMarkerRef.current.setLatLng(TRACK_WAYPOINTS[START_IDX]);
    if (trailRef.current) trailRef.current.setLatLngs([]);
    fetch(`${API_BASE}/simulation/stop`, { method: "POST" }).catch(() => {});
  };

  return (
    <main className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0" />

        {/* Title overlay */}
        <div className="absolute top-6 left-6 z-[1000]">
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/10">
            <div className="flex items-center gap-3 mb-1">
              <Satellite className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">SPIT Line Follower</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tighter">Track Visualizer</h2>
            {apiTriggered && (
              <span className="inline-block mt-2 text-[9px] bg-primary/20 text-primary px-3 py-1 rounded-full font-black uppercase tracking-widest">
                API Triggered
              </span>
            )}
          </div>
        </div>

        {/* Status overlay */}
        <div className="absolute top-6 right-6 z-[1000]">
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/10 flex items-center gap-3">
            <div className={cn(
              "h-2.5 w-2.5 rounded-full transition-all",
              isRunning ? "bg-green-500 shadow-[0_0_12px_#22c55e] animate-pulse" : progress >= 1 ? "bg-red-500 shadow-[0_0_12px_#ef4444]" : "bg-zinc-500"
            )} />
            <span className="text-xs font-black text-white uppercase tracking-widest">
              {isRunning ? "Running" : progress >= 1 ? "Finished" : "Standby"}
            </span>
          </div>
        </div>

        {/* Control Panel */}
        <Card className="absolute bottom-8 left-8 z-[1000] w-80 bg-black/70 backdrop-blur-2xl border border-white/10 p-6 text-white rounded-2xl shadow-2xl">
          <div className="space-y-5">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Telemetry</p>
                <h4 className="text-2xl font-black tracking-tighter">{posLabel}</h4>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Velocity</p>
                <span className="text-xl font-black text-primary tabular-nums">{speed}x</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Progress</span>
                <span className="text-xs font-black tabular-nums">{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{ width: `${progress * 100}%`, background: "linear-gradient(90deg, #22c55e, #facc15)" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Speed Control</span>
              </div>
              <input
                type="range" min="0.5" max="5" step="0.5" value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary bg-white/10"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={isRunning ? pauseAnimation : startAnimation}
                className={cn(
                  "flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs transition-all active:scale-95",
                  isRunning ? "bg-white/10 text-white hover:bg-white/15" : "bg-primary text-black hover:brightness-110"
                )}
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                {isRunning ? "Pause" : "Run"}
              </button>
              <button
                onClick={resetAnimation}
                className="w-12 h-12 rounded-xl bg-white/5 text-zinc-400 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 border border-white/10"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container { background: #1a2e1a !important; outline: none; }
      `}} />
    </main>
  );
}
