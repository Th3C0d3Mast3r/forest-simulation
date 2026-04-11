"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { useSafariStore } from "../lib/store";

const ZONE_COLORS = {
    green: { fill: "rgba(74,222,128,0.15)", stroke: "#4ade80" },
    yellow: { fill: "rgba(251,191,36,0.15)", stroke: "#fbbf24" },
    red: { fill: "rgba(248,113,113,0.2)", stroke: "#f87171" },
};

export default function ZoneMapView() {
    const { zones, vehicles, animals } = useSafariStore();
    const mapRef = useRef(null);
    const leafletRef = useRef(null);
    const vehicleMarkersRef = useRef({});
    const animalMarkersRef = useRef({});

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (leafletRef.current) return;

        const L = require("leaflet");

        const map = L.map(mapRef.current, {
            center: [-1.293, 36.826],
            zoom: 13,
            zoomControl: false,
        });

        L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            {
                attribution: "© CartoDB",
                subdomains: "abcd",
                maxZoom: 20,
            }
        ).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        leafletRef.current = { map, L };

        zones.forEach((zone) => {
            const col = ZONE_COLORS[zone.color] || ZONE_COLORS.green;
            const poly = L.polygon(zone.polygon, {
                color: col.stroke,
                fillColor: col.fill,
                fillOpacity: 1,
                weight: 2,
                opacity: 0.9,
            }).addTo(map);

            const isFull = zone.currentVehicles >= zone.maxCapacity;
            const popupHtml = `
        <div style="font-family:'Space Mono',monospace;min-width:180px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:0.9rem;font-weight:700;color:#fbbf24">${zone.name}</span>
            ${isFull ? '<span style="background:rgba(239,68,68,0.2);border:1px solid #f87171;color:#f87171;font-size:0.6rem;padding:1px 6px;border-radius:3px">FULL</span>' : ""}
          </div>
          <div style="font-size:0.72rem;color:#9dbfa5;line-height:1.8">
            <div>🚙 Vehicles: <b style="color:#e8f5e9">${zone.currentVehicles}/${zone.maxCapacity}</b></div>
            <div>🦁 Animals: <b style="color:#e8f5e9">${zone.animalsSpotted.join(", ")}</b></div>
            ${isFull && zone.nearestAvailable ? `<div style="margin-top:6px;color:#fbbf24">↗ Route to: ${zone.nearestAvailable}</div>` : ""}
          </div>
        </div>
      `;
            poly.bindPopup(popupHtml, { className: "" });

            const center = poly.getBounds().getCenter();
            const labelIcon = L.divIcon({
                html: `<div style="
          font-family:'Space Mono',monospace;
          font-size:0.65rem;font-weight:700;
          color:${col.stroke};
          text-shadow:0 0 8px ${col.stroke};
          white-space:nowrap;
          pointer-events:none
        ">
          ${zone.name}
          ${isFull ? '<span style="margin-left:4px;font-size:0.55rem;background:rgba(239,68,68,0.3);border:1px solid #f87171;color:#f87171;padding:0 3px;border-radius:2px">FULL</span>' : ""}
        </div>`,
                className: "",
                iconAnchor: [40, 10],
            });
            L.marker(center, { icon: labelIcon, interactive: false }).addTo(map);
        });

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
                html: `<div style="
          width:28px;height:28px;
          background:linear-gradient(135deg,#1a3320,#2d5c37);
          border:2px solid #4ade80;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:14px;
          box-shadow:0 0 10px rgba(74,222,128,0.5);
          cursor:pointer
        ">🚙</div>
        <div style="
          font-family:'Space Mono',monospace;
          font-size:0.55rem;color:#4ade80;
          text-align:center;margin-top:2px;
          text-shadow:0 0 6px rgba(74,222,128,0.8)
        ">${v.id}</div>`,
                className: "",
                iconSize: [40, 40],
                iconAnchor: [20, 20],
            });

            if (vehicleMarkersRef.current[v.id]) {
                vehicleMarkersRef.current[v.id].setLatLng([v.lat, v.lng]);
            } else {
                const marker = L.marker([v.lat, v.lng], { icon }).addTo(map);
                marker.bindTooltip(
                    `<b>${v.id}</b><br>${v.zone}<br>🦁 ${v.lastAnimal}<br>⚡ ${v.speed} km/h`,
                    { direction: "top", offset: [0, -20] }
                );
                vehicleMarkersRef.current[v.id] = marker;
            }
        });
    }, [vehicles]);

    useEffect(() => {
        if (!leafletRef.current) return;
        const { map, L } = leafletRef.current;

        animals.forEach((a) => {
            const icon = L.divIcon({
                html: `<div style="
          width:22px;height:22px;
          background:rgba(217,119,6,0.3);
          border:2px solid #d97706;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:11px;
          box-shadow:0 0 8px rgba(217,119,6,0.5)
        ">🦁</div>`,
                className: "",
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            });

            if (animalMarkersRef.current[a.id]) {
                animalMarkersRef.current[a.id].setLatLng([a.lat, a.lng]);
            } else {
                const marker = L.marker([a.lat, a.lng], { icon }).addTo(map);
                marker.bindTooltip(`<b>${a.name}</b><br>${a.zone}<br>${a.time} · ${a.confidence}%`, {
                    direction: "top",
                    offset: [0, -14],
                });
                animalMarkersRef.current[a.id] = marker;
            }
        });
    }, [animals]);

    return (
        <div className="view-panel" style={{ height: "100%", position: "relative" }}>
            <div
                style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    zIndex: 1000,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                }}
            >
                <div className="glass-card" style={{ borderRadius: 6, padding: "4px 10px", fontSize: "0.62rem", display: "flex", gap: 12 }}>
                    <span style={{ color: "#4ade80" }}>■ Low</span>
                    <span style={{ color: "#fbbf24" }}>■ Medium</span>
                    <span style={{ color: "#f87171" }}>■ At Capacity</span>
                </div>
            </div>
            <div ref={mapRef} style={{ width: "100%", height: "100%", borderRadius: 0 }} />
        </div>
    );
}
