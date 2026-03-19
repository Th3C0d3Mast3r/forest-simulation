"use client";

import { useSafariStore } from "../lib/store";

export default function TopBar() {
    const { vehicles, animals, gate, zones } = useSafariStore();

    const totalActive = vehicles.length;
    const detectedToday = animals.length;
    const isEntryOpen = gate.entry.barrierOpen;
    const isExitOpen = gate.exit.barrierOpen;

    const totalCapacity = zones.reduce((s, z) => s + z.maxCapacity, 0);
    const usedCapacity = zones.reduce((s, z) => s + z.currentVehicles, 0);
    const capPct = Math.round((usedCapacity / totalCapacity) * 100);

    const stats = [
        {
            label: "ACTIVE VEHICLES",
            value: totalActive,
            icon: "🚙",
            color: "#4ade80",
        },
        {
            label: "ANIMALS DETECTED",
            value: detectedToday,
            icon: "🦁",
            color: "#fbbf24",
        },
        {
            label: "ENTRY GATE",
            value: isEntryOpen ? "OPEN" : "CLOSED",
            icon: "🚦",
            color: isEntryOpen ? "#4ade80" : "#f87171",
        },
        {
            label: "EXIT GATE",
            value: isExitOpen ? "OPEN" : "CLOSED",
            icon: "🚦",
            color: isExitOpen ? "#4ade80" : "#f87171",
        },
        {
            label: "PARK CAPACITY",
            value: `${usedCapacity}/${totalCapacity}`,
            icon: "📊",
            color: capPct >= 90 ? "#f87171" : capPct >= 70 ? "#fbbf24" : "#4ade80",
        },
    ];

    return (
        <header
            style={{
                height: 58,
                background: "var(--forest-900)",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                gap: 0,
                flexShrink: 0,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginRight: 24,
                    paddingRight: 24,
                    borderRight: "1px solid var(--border)",
                }}
            >
                <div
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#4ade80",
                        boxShadow: "0 0 8px #4ade80",
                        animation: "pulse-red 2s infinite",
                    }}
                />
                <span
                    style={{
                        fontSize: "0.62rem",
                        fontFamily: "'Space Mono', monospace",
                        color: "#4ade80",
                        letterSpacing: "0.1em",
                    }}
                >
                    LIVE
                </span>
            </div>

            <div style={{ display: "flex", gap: 2, flex: 1 }}>
                {stats.map((s) => (
                    <div
                        key={s.label}
                        style={{
                            flex: 1,
                            padding: "0 12px",
                            borderRight: "1px solid var(--border)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <div style={{ fontSize: "0.55rem", color: "var(--text-muted)", letterSpacing: "0.12em" }}>
                            {s.icon} {s.label}
                        </div>
                        <div
                            style={{
                                fontSize: "1rem",
                                fontFamily: "'Space Mono', monospace",
                                fontWeight: 700,
                                color: s.color,
                                lineHeight: 1.3,
                            }}
                        >
                            {s.value}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ paddingLeft: 16, fontSize: "0.6rem", color: "var(--text-muted)", fontFamily: "'Space Mono', monospace", textAlign: "right" }}>
                <div>{new Date().toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}</div>
                <LiveClock />
            </div>
        </header>
    );
}

function LiveClock() {
    const [time, setTime] = React.useState("");

    React.useEffect(() => {
        const tick = () =>
            setTime(
                new Date().toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                })
            );
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return <div style={{ color: "var(--amber-light)", fontSize: "0.75rem" }}>{time}</div>;
}

import React from "react";
