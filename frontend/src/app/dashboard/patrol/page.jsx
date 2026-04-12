"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Clock, Eye, MapPin, ArrowLeft, Trash2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const TRACK_WAYPOINTS = [
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

const formatDuration = (ms) => {
  if (!ms) return "--:--";
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

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

export default function PatrolPage() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("forest_trips") || "[]");
      setTrips(stored);
    } catch (e) {
      setTrips([]);
    }
  }, []);

  const deleteTrip = (id) => {
    const updated = trips.filter(t => t.id !== id);
    setTrips(updated);
    localStorage.setItem("forest_trips", JSON.stringify(updated));
    if (selectedTrip?.id === id) setSelectedTrip(null);
  };

  const clearAll = () => {
    setTrips([]);
    setSelectedTrip(null);
    localStorage.removeItem("forest_trips");
  };

  useEffect(() => {
    if (!selectedTrip) return;
    if (typeof window === "undefined") return;

    const loadMap = async () => {
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

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      markersRef.current = [];

      await new Promise(r => setTimeout(r, 100));

      const map = L.map(mapRef.current, {
        center: [48.5035, -0.1160], zoom: 16, zoomControl: false, attributionControl: false,
      });

      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19 }).addTo(map);

      L.polyline(TRACK_WAYPOINTS, { color: "#fbbf24", weight: 5, opacity: 0.7 }).addTo(map);
      L.polyline(TRACK_WAYPOINTS, { color: "#22c55e", weight: 5, opacity: 0.7, dashArray: "10, 15" }).addTo(map);

      selectedTrip.detections.forEach((det) => {
        const pos = det.coordinates || getPositionAtProgress(det.progress);
        const icon = L.divIcon({
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div style="background:#ef4444;color:white;font-size:10px;font-weight:900;padding:3px 8px;border-radius:6px;white-space:nowrap;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);letter-spacing:0.05em;">${det.name.toUpperCase()}</div>
              <div style="width:12px;height:12px;background:#ef4444;border-radius:50%;border:2px solid white;box-shadow:0 0 10px #ef4444;margin-top:3px;"></div>
            </div>
          `,
          className: "", iconSize: [60, 40], iconAnchor: [30, 35],
        });
        const marker = L.marker(pos, { icon }).addTo(map);
        markersRef.current.push(marker);
      });

      leafletMapRef.current = map;
    };

    loadMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [selectedTrip]);

  if (selectedTrip) {
    return (
      <main className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex-1 relative">
          <div ref={mapRef} className="absolute inset-0" />

          <div className="absolute top-6 left-6 z-[1000]">
            <button
              onClick={() => setSelectedTrip(null)}
              className="flex items-center gap-2 bg-black/80 backdrop-blur-xl text-white px-5 py-3 rounded-2xl border border-white/10 hover:bg-black/90 transition-all font-black text-xs uppercase tracking-widest"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Logs
            </button>
          </div>

          <div className="absolute top-6 right-6 z-[1000] w-72">
            <Card className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-primary/20 border-b border-primary/20 p-5">
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Session Replay</p>
                <h3 className="text-xl font-black text-white tracking-widest uppercase mt-1">{selectedTrip.unitId}</h3>
              </div>
              <CardContent className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Date</p>
                    <p className="text-sm font-black text-white">{formatDate(selectedTrip.date)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Duration</p>
                    <p className="text-sm font-black text-primary tabular-nums">{formatDuration(selectedTrip.durationMs)}</p>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Sightings ({selectedTrip.detections.length})</p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {selectedTrip.detections.length === 0 ? (
                      <p className="text-[10px] text-zinc-600 italic text-center py-3">No sightings recorded</p>
                    ) : (
                      selectedTrip.detections.map((det, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs">
                          <div className="h-6 w-6 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                            <Activity className="h-3 w-3 text-red-500" />
                          </div>
                          <span className="font-black text-white uppercase flex-1 truncate">{det.name}</span>
                          <span className="text-primary font-black text-[10px]">T+{Math.round(det.progress * 100)}%</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .leaflet-container { background: #1a2e1a !important; outline: none; }
        ` }} />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-8 p-8 bg-background/50 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2.5 rounded-2xl">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-bark tracking-tighter">Patrol Logs</h2>
          </div>
          <p className="text-sm text-muted-foreground font-bold">All completed patrols and wildlife sightings from previous sessions.</p>
        </div>
        {trips.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 px-5 py-3 rounded-2xl transition-all"
          >
            <Trash2 className="h-4 w-4" /> Clear All
          </button>
        )}
      </div>

      {trips.length === 0 ? (
        <Card className="bg-card border-none shadow-[0_4px_20px_rgba(74,60,49,0.03)] rounded-2xl">
          <CardContent className="p-16 text-center space-y-4">
            <ShieldCheck className="h-12 w-12 text-bark/20 mx-auto" />
            <h3 className="text-xl font-black text-bark/40 tracking-tight">No Patrols Recorded</h3>
            <p className="text-sm text-muted-foreground font-bold max-w-sm mx-auto">
              Complete a simulation run in the Wildlife Tracker to see your patrol history here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Card
              key={trip.id}
              onClick={() => setSelectedTrip(trip)}
              className="bg-card border-none shadow-[0_4px_20px_rgba(74,60,49,0.03)] hover:shadow-[0_8px_30px_rgba(74,60,49,0.08)] rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group overflow-hidden"
            >
              <div className="h-1.5 bg-primary/20 group-hover:bg-primary transition-colors" />
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-black text-bark tracking-widest uppercase">{trip.unitId}</h4>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                      {formatDate(trip.date)} • {formatTime(trip.date)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTrip(trip.id); }}
                    className="h-8 w-8 rounded-xl text-bark/30 hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-bark/5 dark:bg-white/5 rounded-xl p-3 text-center">
                    <Clock className="h-3.5 w-3.5 mx-auto text-primary mb-1" />
                    <p className="text-sm font-black text-bark tabular-nums">{formatDuration(trip.durationMs)}</p>
                    <p className="text-[8px] font-black text-bark/40 uppercase tracking-widest mt-0.5">Time</p>
                  </div>
                  <div className="bg-bark/5 dark:bg-white/5 rounded-xl p-3 text-center">
                    <Eye className="h-3.5 w-3.5 mx-auto text-primary mb-1" />
                    <p className="text-sm font-black text-bark">{trip.totalDetections}</p>
                    <p className="text-[8px] font-black text-bark/40 uppercase tracking-widest mt-0.5">Sightings</p>
                  </div>
                  <div className="bg-bark/5 dark:bg-white/5 rounded-xl p-3 text-center">
                    <MapPin className="h-3.5 w-3.5 mx-auto text-primary mb-1" />
                    <p className="text-sm font-black text-bark">Full</p>
                    <p className="text-[8px] font-black text-bark/40 uppercase tracking-widest mt-0.5">Route</p>
                  </div>
                </div>

                {trip.detections.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {trip.detections.slice(0, 4).map((det, i) => (
                      <span key={i} className="bg-red-500/10 text-red-600 dark:text-red-400 text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-red-500/20">
                        {det.name}
                      </span>
                    ))}
                    {trip.detections.length > 4 && (
                      <span className="bg-bark/5 text-bark/50 text-[9px] font-black px-3 py-1 rounded-full">
                        +{trip.detections.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-bark/5">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">View on Map →</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
