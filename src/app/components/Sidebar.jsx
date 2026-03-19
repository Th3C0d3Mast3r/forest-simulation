"use client";

import { useSafariStore } from "../lib/store";

const ICONS = {
    zonemap: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
    ),
    tracker: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        </svg>
    ),
    forest3d: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M12 2L2 19h20L12 2z" />
            <path d="M12 7L5 19h14L12 7z" />
        </svg>
    ),
};

const NAV_ITEMS = [
    { key: "zonemap", label: "Zone Map", sub: "2D Leaflet" },
    { key: "tracker", label: "Vehicle Tracker", sub: "Live GPS" },
    { key: "forest3d", label: "3D Forest", sub: "Three.js" },
];

export default function Sidebar() {
    const { activeView, setActiveView, animals, gate, environment, tickets } = useSafariStore();

    return (
        <aside
            style={{
                width: 220,
                minWidth: 220,
                background: "var(--forest-900)",
                borderRight: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    padding: "18px 16px 12px",
                    borderBottom: "1px solid var(--border)",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  
                    <div>
                        <div
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontWeight: 700,
                                fontSize: "0.8rem",
                                color: "var(--amber-light)",
                                lineHeight: 1.2,
                            }}
                        >
                            SAFARI
                        </div>
                        <div
                            style={{
                                fontSize: "0.6rem",
                                color: "var(--text-muted)",
                                letterSpacing: "0.12em",
                            }}
                        >
                            COMMAND CENTER
                        </div>
                    </div>
                </div>
            </div>

            <nav style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
                <div
                    style={{
                        fontSize: "0.6rem",
                        color: "var(--text-muted)",
                        letterSpacing: "0.15em",
                        padding: "4px 6px 8px",
                    }}
                >
                    VIEWS
                </div>
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.key}
                        className={`nav-item ${activeView === item.key ? "active" : ""}`}
                        onClick={() => setActiveView(item.key)}
                        style={{ width: "100%", textAlign: "left", background: "none", border: "none" }}
                    >
                        <span style={{ opacity: 0.9 }}>{ICONS[item.key]}</span>
                        <div>
                            <div style={{ fontSize: "0.82rem", lineHeight: 1.2 }}>{item.label}</div>
                            <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{item.sub}</div>
                        </div>
                    </button>
                ))}
            </nav>

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "0 10px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                }}
            >
                <AnimalFeed animals={animals} />
                <GatePanel gate={gate} />
                <EnvPanel env={environment} />
                <TicketsPanel tickets={tickets} />
            </div>
        </aside>
    );
}

function SectionTitle({ children }) {
    return (
        <div
            style={{
                fontSize: "0.58rem",
                color: "var(--text-muted)",
                letterSpacing: "0.15em",
                padding: "8px 4px 4px",
                borderTop: "1px solid var(--border)",
                marginTop: 4,
            }}
        >
            {children}
        </div>
    );
}

function AnimalFeed({ animals }) {
    return (
        <div>
            <SectionTitle>ANIMAL FEED</SectionTitle>
            <div className="glass-card" style={{ borderRadius: 8, padding: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {animals.slice(0, 5).map((a) => (
                        <div
                            key={a.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "5px 4px",
                                borderBottom: "1px solid rgba(45,92,55,0.2)",
                            }}
                        >
                            <div>
                                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>{a.name}</div>
                                <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>
                                    {a.zone} · {a.time}
                                </div>
                            </div>
                            <div
                                style={{
                                    fontSize: "0.62rem",
                                    fontFamily: "'Space Mono', monospace",
                                    color: a.confidence >= 90 ? "#4ade80" : a.confidence >= 80 ? "#fbbf24" : "#f87171",
                                }}
                            >
                                {a.confidence}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function GatePanel({ gate }) {
    const gates = [gate.entry, gate.exit];
    return (
        <div>
            <SectionTitle>GATE STATUS</SectionTitle>
            <div className="glass-card" style={{ borderRadius: 8, padding: 8 }}>
                {gates.map((g) => (
                    <div
                        key={g.label}
                        style={{
                            padding: "6px 4px",
                            borderBottom: "1px solid rgba(45,92,55,0.2)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 3,
                            }}
                        >
                            <span style={{ fontSize: "0.72rem", fontWeight: 600 }}>{g.label}</span>
                            <span className={g.barrierOpen ? "status-green" : "status-red"} style={{ fontSize: "0.62rem", fontFamily: "'Space Mono', monospace" }}>
                                {g.barrierOpen ? "● OPEN" : "● CLOSED"}
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>RFID: {g.rfidScanned}</span>
                            <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>
                                {g.vehicleCount}/{g.maxVehicles}
                            </span>
                        </div>
                        <div
                            style={{
                                marginTop: 4,
                                height: 3,
                                background: "rgba(45,92,55,0.3)",
                                borderRadius: 2,
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: `${(g.vehicleCount / g.maxVehicles) * 100}%`,
                                    background:
                                        g.vehicleCount >= g.maxVehicles ? "#f87171" : g.vehicleCount >= g.maxVehicles * 0.7 ? "#fbbf24" : "#4ade80",
                                    borderRadius: 2,
                                    transition: "width 0.5s ease",
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Gauge({ value, max, label, unit, color }) {
    const radius = 22;
    const circ = 2 * Math.PI * radius;
    const pct = Math.min(value / max, 1);
    const offset = circ * (1 - pct * 0.75);
    return (
        <div style={{ textAlign: "center", flex: 1 }}>
            <svg width="58" height="40" viewBox="0 0 58 40">
                <path
                    d="M 7 38 A 22 22 0 0 1 51 38"
                    fill="none"
                    stroke="rgba(45,92,55,0.3)"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <path
                    d="M 7 38 A 22 22 0 0 1 51 38"
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${circ * 0.75} ${circ}`}
                    strokeDashoffset={circ - circ * 0.75 * pct}
                    style={{ transition: "stroke-dashoffset 0.7s ease" }}
                />
                <text
                    x="29"
                    y="36"
                    textAnchor="middle"
                    fontSize="9"
                    fill={color}
                    fontFamily="'Space Mono', monospace"
                    fontWeight="700"
                >
                    {value}
                </text>
            </svg>
            <div style={{ fontSize: "0.55rem", color: "var(--text-muted)", marginTop: -4 }}>
                {label}
                <br />
                <span style={{ color: "var(--text-secondary)" }}>{unit}</span>
            </div>
        </div>
    );
}

function EnvPanel({ env }) {
    return (
        <div>
            <SectionTitle>ENVIRONMENT</SectionTitle>
            <div className="glass-card" style={{ borderRadius: 8, padding: "8px 4px" }}>
                <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <Gauge value={env.temperature} max={45} label="TEMP" unit="°C" color="#f97316" />
                    <Gauge value={env.humidity} max={100} label="HUM" unit="%" color="#60a5fa" />
                    <Gauge value={env.windSpeed} max={60} label="WIND" unit="km/h" color="#a78bfa" />
                </div>
                <div
                    style={{
                        textAlign: "center",
                        marginTop: 4,
                        fontSize: "0.62rem",
                        color: "var(--text-muted)",
                    }}
                >
                    ☀ {env.condition} · UV {env.uvIndex}
                </div>
            </div>
        </div>
    );
}

function TicketsPanel({ tickets }) {
    const statusStyle = {
        full: { class: "badge-full" },
        "almost-full": { class: "badge-almost" },
        available: { class: "badge-available" },
    };

    return (
        <div>
            <SectionTitle>SAFARI SLOTS</SectionTitle>
            <div className="glass-card" style={{ borderRadius: 8, padding: 8 }}>
                {tickets.map((t) => (
                    <div
                        key={t.slot}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "5px 4px",
                            borderBottom: "1px solid rgba(45,92,55,0.2)",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: "0.72rem",
                                    fontFamily: "'Space Mono', monospace",
                                    color: "var(--amber-light)",
                                }}
                            >
                                {t.slot}
                            </div>
                            <div style={{ fontSize: "0.58rem", color: "var(--text-muted)" }}>
                                {t.booked}/{t.booked + t.available} booked
                            </div>
                        </div>
                        <span className={statusStyle[t.status].class}>
                            {t.status === "full" ? "FULL" : t.status === "almost-full" ? "~FULL" : "OPEN"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
