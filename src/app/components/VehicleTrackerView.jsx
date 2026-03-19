"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { useSafariStore } from "../lib/store";

export default function VehicleTrackerView() {
    const { vehicles } = useSafariStore();
    const mapRef = useRef(null);
    const leafletRef = useRef(null);
    const markersRef = useRef({});
    const trailsRef = useRef({});

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (leafletRef.current) return;

        const L = require("leaflet");

        const map = L.map(mapRef.current, {
            center: [-1.293, 36.826],
            zoom: 14,
            zoomControl: false,
        });

        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            { attribution: "© Esri", maxZoom: 19 }
        ).addTo(map);

        L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
            { attribution: "", subdomains: "abcd", maxZoom: 20, opacity: 0.7 }
        ).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);
        leafletRef.current = { map, L };

        return () => {
            map.remove();
            leafletRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!leafletRef.current) return;
        const { map, L } = leafletRef.current;

        vehicles.forEach((v) => {
            const icon = L.divIcon({
                html: `
          <div style="position:relative">
            <div style="
              width:36px;height:36px;
              background:linear-gradient(135deg,#0a300f,#1a5c24);
              border:2px solid #fbbf24;
              border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              font-size:16px;
              box-shadow:0 0 14px rgba(251,191,36,0.6);
              cursor:pointer
            ">🚙</div>
            <div style="
              position:absolute;top:-22px;left:50%;transform:translateX(-50%);
              background:rgba(10,26,14,0.9);
              border:1px solid #fbbf24;
              border-radius:4px;
              padding:1px 6px;
              font-family:'Space Mono',monospace;
              font-size:0.58rem;
              color:#fbbf24;
              white-space:nowrap;
              box-shadow:0 0 8px rgba(251,191,36,0.4)
            ">${v.id}</div>
            ${v.speed === 0 ? '<div style="position:absolute;bottom:-2px;right:-2px;width:8px;height:8px;background:#f87171;border-radius:50%;box-shadow:0 0 6px #f87171"></div>' : ""}
          </div>
        `,
                className: "",
                iconSize: [36, 36],
                iconAnchor: [18, 18],
            });

            const popupHtml = `
        <div style="font-family:'Space Mono',monospace;min-width:200px">
          <div style="font-size:1rem;font-weight:700;color:#fbbf24;margin-bottom:10px">${v.id}</div>
          <div style="font-size:0.72rem;color:#9dbfa5;line-height:2">
            <div>📍 Zone: <b style="color:#e8f5e9">${v.zone}</b></div>
            <div>🦁 Last Animal: <b style="color:#e8f5e9">${v.lastAnimal}</b></div>
            <div>🌐 GPS: <b style="color:#e8f5e9">${v.lat.toFixed(4)}, ${v.lng.toFixed(4)}</b></div>
            <div>⚡ Speed: <b style="color:${v.speed === 0 ? "#f87171" : "#4ade80"}">${v.speed} km/h</b></div>
          </div>
        </div>
      `;

            if (markersRef.current[v.id]) {
                markersRef.current[v.id].setLatLng([v.lat, v.lng]);
                markersRef.current[v.id].setPopupContent(popupHtml);

                if (trailsRef.current[v.id]) {
                    map.removeLayer(trailsRef.current[v.id]);
                }
            } else {
                const marker = L.marker([v.lat, v.lng], { icon })
                    .addTo(map)
                    .bindPopup(popupHtml);
                markersRef.current[v.id] = marker;
            }

            if (v.trail.length > 1) {
                const trail = L.polyline(v.trail, {
                    color: "#fbbf24",
                    weight: 2,
                    opacity: 0.5,
                    dashArray: "4 6",
                }).addTo(map);
                trailsRef.current[v.id] = trail;
            }
        });
    }, [vehicles]);

    return (
        <div className="view-panel" style={{ height: "100%", position: "relative" }}>
            <div
                style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                }}
            >
                <div className="glass-card" style={{ borderRadius: 6, padding: "6px 12px" }}>
                    <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginBottom: 2 }}>VEHICLES ONLINE</div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "1.1rem", color: "#4ade80", fontWeight: 700 }}>
                        {vehicles.length}
                    </div>
                </div>
                <div className="glass-card" style={{ borderRadius: 6, padding: "6px 12px" }}>
                    <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginBottom: 2 }}>POLLING</div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "#fbbf24" }}>
                        ● LIVE / 3s
                    </div>
                </div>
            </div>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}
