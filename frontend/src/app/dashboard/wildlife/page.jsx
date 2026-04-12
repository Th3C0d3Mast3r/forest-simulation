"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Activity, Satellite, Eye, MapPin as PinIcon, CheckCircle2, Download, X, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const TRACK_WAYPOINTS = [
  // Precise track from the user ref image
  [48.5050, -0.1200], [48.5050, -0.1205], [48.5050, -0.1210], 
  [48.5048, -0.1215], [48.5045, -0.1218], [48.5042, -0.1219], 
  [48.5040, -0.1220], [48.5038, -0.1219], [48.5035, -0.1216], 
  [48.5033, -0.1212], [48.5030, -0.1210], [48.5028, -0.1212], 
  [48.5026, -0.1215], [48.5024, -0.1218], [48.5022, -0.1219], 
  [48.5020, -0.1220], [48.5018, -0.1218], [48.5016, -0.1214],
  [48.5015, -0.1210], [48.5015, -0.1200], [48.5015, -0.1190], 
  [48.5015, -0.1180], [48.5015, -0.1170], [48.5015, -0.1160], 
  [48.5015, -0.1150], [48.5016, -0.1145], [48.5018, -0.1142], 
  [48.5020, -0.1140], 
  [48.5022, -0.1135], [48.5023, -0.1125], [48.5022, -0.1115], 
  [48.5020, -0.1110], [48.5017, -0.1110], [48.5014, -0.1115],
  [48.5013, -0.1125], [48.5014, -0.1135], [48.5016, -0.1138], 
  [48.5020, -0.1140], 
  [48.5023, -0.1145], [48.5025, -0.1150], [48.5027, -0.1160], 
  [48.5030, -0.1170], [48.5032, -0.1180], [48.5034, -0.1185],
  [48.5035, -0.1190], [48.5037, -0.1191], [48.5039, -0.1190], 
  [48.5041, -0.1185], [48.5042, -0.1175], [48.5042, -0.1165], 
  [48.5042, -0.1150], [48.5042, -0.1130], [48.5042, -0.1110], 
  [48.5043, -0.1105], [48.5045, -0.1100], [48.5048, -0.1102], 
  [48.5050, -0.1110], [48.5052, -0.1120], [48.5053, -0.1135],
  [48.5055, -0.1150], [48.5055, -0.1170], [48.5055, -0.1190],
  [48.5053, -0.1198], [48.5050, -0.1200]
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function WildlifePage() {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const carMarkerRef = useRef(null);
  const trailRef = useRef(null);
  const detectionMarkersRef = useRef({});
  const animFrameRef = useRef(null);
  const pollingRef = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [posLabel, setPosLabel] = useState("Standby");
  const [detections, setDetections] = useState([]);
  const [unitId, setUnitId] = useState("");
  const [tripDuration, setTripDuration] = useState(null);
  const [sensorData, setSensorData] = useState({ temp: 0, humidity: 0, gas: 0, vibration: 0 });
  const tripStartRef = useRef(null);

  useEffect(() => {
    setUnitId(`UNIT-${Math.floor(100 + Math.random() * 900)}`);
  }, []);

  const [taps, setTaps] = useState([]);

  // RFID Stream subscription
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5000/rfid/stream");
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== "ping") {
        const newTap = { ...data, id: Date.now() + Math.random() };
        setTaps((prev) => [...prev, newTap]);
        setTimeout(() => setTaps((prev) => prev.filter(t => t.id !== newTap.id)), 5000);
      }
    };

    return () => eventSource.close();
  }, []);

  const progressRef = useRef(0);
  const speedRef = useRef(1);
  const runningRef = useRef(false);
  const detectionsRef = useRef([]);
  const finishedRef = useRef(false);
  const sensorHistoryRef = useRef([]);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { detectionsRef.current = detections; }, [detections]);

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
        center: [48.5035, -0.1160], zoom: 17, zoomControl: false, attributionControl: false,
      });

      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19 }).addTo(map);

      // Track styled like the image (Green/Yellow dashed)
      L.polyline(TRACK_WAYPOINTS, { color: "#fbbf24", weight: 6, opacity: 0.9 }).addTo(map);
      L.polyline(TRACK_WAYPOINTS, { color: "#22c55e", weight: 6, opacity: 0.9, dashArray: "10, 15" }).addTo(map);

      const carIcon = L.divIcon({
        html: `<div class="marker-vehicle"><div class="bolt">⚡</div></div>`,
        className: "", iconSize: [40, 40], iconAnchor: [20, 20],
      });
      carMarkerRef.current = L.marker(TRACK_WAYPOINTS[0], { icon: carIcon, zIndexOffset: 1000 }).addTo(map);

      trailRef.current = L.polyline([], { color: "#facc15", weight: 4, opacity: 0.8 }).addTo(map);
      leafletMapRef.current = map;
    };
    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current || !window.L) return;
    const L = window.L;

    detections.forEach((det) => {
      if (det.progress === undefined || detectionMarkersRef.current[det.id]) return;

      const pos = getPositionAtProgress(det.progress);
      const animalIcon = L.divIcon({
        html: `
          <div class="marker-animal">
            <div class="label">${det.name.toUpperCase()}</div>
            <div class="dot"></div>
          </div>
        `,
        className: "", iconSize: [60, 40], iconAnchor: [30, 35],
      });

      detectionMarkersRef.current[det.id] = L.marker(pos, { icon: animalIcon }).addTo(leafletMapRef.current);
    });
  }, [detections]);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/simulation/status`);
        const data = await res.json();
        if (data.success) {
          if (data.state.running && !runningRef.current && !isFinished) {
            startAnimation();
          }
          if (data.state.running && data.state.detections) {
            setDetections(prev => {
              if (data.state.detections.length === 0) return [];
              if (data.state.detections.length === prev.length) return prev;
              return data.state.detections.map(det => {
                const existing = prev.find(d => d.id === det.id);
                if (existing && existing.progress !== undefined) return existing;
                return { ...det, progress: progressRef.current };
              });
            });
          }
          if (!data.state.running && !runningRef.current && !isFinished) {
            setDetections([]);
          }
        }

        // Fetch IoT Sensor Data
        const sensorRes = await fetch(`${API_BASE}/sensor/data`);
        const sensorJson = await sensorRes.json();
        if (sensorJson.success) {
          setSensorData(sensorJson.data);
          if (runningRef.current) {
            sensorHistoryRef.current.push(sensorJson.data);
          }
        }
      } catch (err) {}
    };
    pollingRef.current = setInterval(poll, 1500);
    return () => clearInterval(pollingRef.current);
  }, [isFinished]);

  const startAnimation = () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);
    setIsFinished(false);
    if (!tripStartRef.current) tripStartRef.current = Date.now();

    const step = () => {
      if (!runningRef.current) return;
      progressRef.current = Math.min(progressRef.current + 0.0003 * speedRef.current, 1);
      const pos = getPositionAtProgress(progressRef.current);

      if (carMarkerRef.current) carMarkerRef.current.setLatLng(pos);
      if (trailRef.current) trailRef.current.setLatLngs([...trailRef.current.getLatLngs(), pos]);

      setProgress(progressRef.current);
      setPosLabel(`T+${Math.round(progressRef.current * 100)}%`);

      if (progressRef.current >= 1) {
        onComplete();
        return;
      }
      animFrameRef.current = requestAnimationFrame(step);
    };
    animFrameRef.current = requestAnimationFrame(step);
  };

  const onComplete = () => {
    finishedRef.current = true;
    runningRef.current = false;
    setIsRunning(false);
    setIsFinished(true);
    setPosLabel("Round Completed");
    const elapsed = tripStartRef.current ? Date.now() - tripStartRef.current : 0;
    setTripDuration(elapsed);
    fetch(`${API_BASE}/simulation/stop`, { method: "POST" }).catch(() => {});

    const currentDetections = detectionsRef.current;
    const history = sensorHistoryRef.current;
    const avgTemp = history.length ? (history.reduce((a, b) => a + b.temp, 0) / history.length).toFixed(1) : 0;
    const avgHum = history.length ? (history.reduce((a, b) => a + b.humidity, 0) / history.length).toFixed(1) : 0;

    const tripRecord = {
      id: Date.now(),
      unitId,
      date: new Date().toISOString(),
      durationMs: elapsed,
      totalDetections: currentDetections.length,
      avgTemp,
      avgHum,
      detections: currentDetections.map(d => ({
        name: d.name,
        progress: d.progress,
        coordinates: getPositionAtProgress(d.progress),
        timestamp: d.timestamp || null,
      })),
    };
    try {
      const existing = JSON.parse(localStorage.getItem("forest_trips") || "[]");
      existing.unshift(tripRecord);
      localStorage.setItem("forest_trips", JSON.stringify(existing.slice(0, 50)));
    } catch (e) {}
  };

  const formatDuration = (ms) => {
    if (!ms) return "--:--";
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const saveReport = () => {
    const report = {
      unitId,
      date: new Date().toISOString(),
      tripDuration: formatDuration(tripDuration),
      tripDurationMs: tripDuration,
      totalDetections: detections.length,
      detections: detections.map(d => ({
        name: d.name,
        locationProgress: `${Math.round(d.progress * 100)}%`,
        coordinates: getPositionAtProgress(d.progress),
        timestamp: d.timestamp || null,
      })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${unitId}_report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetSimulation = () => {
    progressRef.current = 0;
    finishedRef.current = false;
    sensorHistoryRef.current = [];
    setProgress(0);
    setIsFinished(false);
    setIsRunning(false);
    setDetections([]);
    setPosLabel("Standby");
    setTripDuration(null);
    tripStartRef.current = null;
    if (carMarkerRef.current) carMarkerRef.current.setLatLng(TRACK_WAYPOINTS[0]);
    if (trailRef.current) trailRef.current.setLatLngs([]);
    Object.values(detectionMarkersRef.current).forEach(m => m.remove());
    detectionMarkersRef.current = {};
    fetch(`${API_BASE}/simulation/stop`, { method: "POST" }).catch(() => {});
  };

  return (
    <main className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-zinc-950 font-sans">
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0" />

        {/* Top Header Overlay */}
        <div className="absolute top-6 left-6 z-[1000] flex items-center gap-4">
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-1">
              <Satellite className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Unit Monitoring active</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">{unitId}</h2>
          </div>
          
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/10 shadow-2xl h-fit">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Progress</p>
               <h4 className="text-xl font-black text-white tabular-nums">{posLabel}</h4>
          </div>
        </div>

        {/* TOP OVERLAYS */}
        <div className="absolute top-6 left-6 z-[1000] flex items-center gap-4">
          <div className="bg-zinc-800/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-1">
              <Satellite className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Unit Monitoring active</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">{unitId}</h2>
          </div>
          
          <div className="bg-zinc-800/40 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/10 shadow-2xl h-fit">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Progress</p>
               <h4 className="text-xl font-black text-white tabular-nums">{posLabel}</h4>
          </div>
        </div>

        {/* IOT SENSOR SUITE */}
        <div className="absolute top-6 right-6 z-[1000] w-60 space-y-3">
            <Card className="bg-zinc-800/40 backdrop-blur-3xl border border-white/10 p-3 rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                        <Activity className="h-3 w-3 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">IoT Telemetry</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {/* Sensor items ... */}
                        <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                            <p className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Temp</p>
                            <div className="flex items-baseline gap-1">
                                <span className={cn("text-lg font-black tabular-nums leading-none", sensorData.temp > 40 ? "text-red-500" : "text-white")}>
                                    {sensorData.temp}
                                </span>
                                <span className="text-[8px] text-zinc-500 font-bold italic">°C</span>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                            <p className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Humidity</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black text-white tabular-nums leading-none">{sensorData.humidity}</span>
                                <span className="text-[8px] text-zinc-500 font-bold italic">%</span>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                            <p className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Gas</p>
                            <div className="flex items-baseline gap-1">
                                <span className={cn("text-lg font-black tabular-nums leading-none", sensorData.gas > 50 ? "text-orange-500" : "text-white")}>
                                    {sensorData.gas}
                                </span>
                                <span className="text-[8px] text-zinc-500 font-bold italic">PPM</span>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                            <p className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Vib</p>
                            <div className="flex items-baseline gap-1">
                                <span className={cn("text-lg font-black tabular-nums leading-none", sensorData.vibration > 70 ? "text-red-500 animate-pulse" : "text-white")}>
                                    {sensorData.vibration}
                                </span>
                                <span className="text-[8px] text-zinc-500 font-bold italic">Hz</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* LOG PANEL (Moved below IoT for stack) */}
                {isRunning && detections.length > 0 && (
                    <Card className="bg-zinc-800/40 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                            <Eye className="h-3 w-3 text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Live Logs</span>
                        </div>
                        <div className="space-y-3 max-h-[250px] overflow-y-auto no-scrollbar scroll-smooth">
                            {detections.map((det) => (
                                <div key={det.id} className="flex gap-2.5">
                                    <div className="h-6 w-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                        <Activity className="h-2.5 w-2.5 text-red-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black text-white truncate uppercase tracking-tighter">{det.name}</p>
                                        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">@ T+{Math.round(det.progress * 100)}%</p>
                                    </div>
                                </div>
                            )).reverse()}
                        </div>
                    </Card>
                )}
        </div>

        {/* FINISH OVERLAY (The "Snapshot") */}
        {isFinished && (
            <div className="absolute inset-0 z-[2000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-10 animate-in fade-in duration-1000">
                <Card className="max-w-md w-full bg-zinc-900 border-2 border-primary/20 rounded-[2.5rem] shadow-[0_0_100px_rgba(192,88,0,0.2)] overflow-hidden">
                    <div className="bg-primary p-8 text-center space-y-2">
                        <CheckCircle2 className="h-12 w-12 text-white mx-auto mb-2" />
                        <h3 className="text-3xl font-black text-white tracking-widest uppercase">Mission Success</h3>
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">{unitId} • Summary Report</p>
                    </div>
                    <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-3 gap-6 uppercase">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-zinc-500 tracking-widest">Detections</p>
                                <p className="text-2xl font-black text-white">{detections.length}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-zinc-500 tracking-widest">Trip Time</p>
                                <p className="text-2xl font-black text-primary tabular-nums">{formatDuration(tripDuration)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-zinc-500 tracking-widest">Total Area</p>
                                <p className="text-2xl font-black text-white">42.4km</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-zinc-500 tracking-widest uppercase">Verified Sightings</p>
                            <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2 custom-scroll">
                                {detections.map(det => (
                                    <div key={det.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                                        <span className="font-black text-white uppercase">{det.name}</span>
                                        <span className="text-primary font-black">T+{Math.round(det.progress * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={saveReport} className="flex-1 h-14 rounded-2xl bg-zinc-800 text-white font-black uppercase text-xs tracking-widest hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                                <Download className="h-4 w-4" /> Save Data
                            </button>
                            <button 
                                onClick={resetSimulation}
                                className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center hover:scale-105 transition-all shadow-xl shadow-primary/20"
                            >
                                <RotateCcw className="h-5 w-5" />
                            </button>
                        </div>
                    </CardContent>
                </Card>
                <button 
                  onClick={() => setIsFinished(false)}
                  className="absolute top-10 right-10 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>
        )}

        {/* BOTTOM SPEED CONTROLLER (Only show if not finished) */}
        {!isFinished && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-6">
                <Card className="bg-black/80 backdrop-blur-3xl border border-white/10 p-6 rounded-[2rem] shadow-2xl flex items-center gap-8">
                    <div className="shrink-0 flex items-center gap-4 border-r border-white/10 pr-8">
                        <button 
                            onClick={resetSimulation}
                            className="h-10 w-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 transition-all"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                        <div className="text-right">
                             <p className="text-[9px] font-black text-zinc-500 uppercase">Speed</p>
                             <h4 className="text-xl font-black text-primary leading-none">{speed}x</h4>
                        </div>
                    </div>

                    <input
                        type="range" min="0.5" max="5" step="0.5" value={speed}
                        onChange={e => setSpeed(Number(e.target.value))}
                        className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-primary bg-white/10"
                    />

                    <div className="flex items-center gap-3">
                        <div className="flex-col text-right hidden sm:flex">
                            <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">{isRunning ? 'Streaming' : 'Wait'}</span>
                            <span className="text-[10px] font-black text-white uppercase">{isRunning ? 'Live' : 'Ready'}</span>
                        </div>
                        <div className={cn("h-3 w-3 rounded-full", isRunning ? "bg-primary animate-ping" : "bg-zinc-700")} />
                    </div>
                </Card>
            </div>
        )}

      {/* Toast Popups for Real-time RFID Scans */}
      <div className="fixed bottom-8 right-8 z-[5000] flex flex-col gap-4">
        <AnimatePresence>
          {taps.map((tap) => (
            <motion.div
              key={tap.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
              className="bg-zinc-900/90 backdrop-blur-xl border border-primary/20 shadow-[0_10px_30px_rgba(192,88,0,0.15)] rounded-2xl p-5 flex items-center gap-4 w-80 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
              <div className="bg-primary/10 p-3 rounded-2xl">
                <ScanLine className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Live RFID Tap • {tap.time}</p>
                <p className="text-sm font-bold text-white leading-tight">{tap.member} & Group ({tap.groupSize})</p>
                <p className="text-xs text-zinc-400 font-medium">Safari: <span className="text-primary font-bold">{tap.safariType}</span></p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container { background: #1a2e1a !important; outline: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Marker Styling matching user ref image */
        .marker-vehicle {
            width: 40px; height: 40px;
            background: white; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 30px rgba(255,255,255,0.4), 0 0 15px rgba(251,191,36,0.6);
            border: 4px solid #facc15;
            animation: pulse-ring 2s infinite;
        }
        .marker-vehicle .bolt {
            color: #ef4444; font-size: 20px; font-weight: 900;
            filter: drop-shadow(0 0 5px rgba(239,68,68,0.5));
        }
        
        .marker-animal {
            display: flex; flex-direction: column; align-items: center;
        }
        .marker-animal .label {
            background: #ef4444; color: white; font-size: 11px; font-weight: 900;
            padding: 4px 10px; border-radius: 6px; white-space: nowrap;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;
            transform: translateY(-5px);
            letter-spacing: 0.05em;
        }
        .marker-animal .dot {
            width: 14px; height: 14px; background: #ef4444;
            border-radius: 50%; border: 3px solid white;
            box-shadow: 0 0 15px #ef4444;
        }
        
        @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.9); opacity: 0.8; } }
        
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(192,88,0,0.5); border-radius: 10px; }
      `}} />
    </main>
  );
}
