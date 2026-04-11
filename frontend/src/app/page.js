"use client";

import { useEffect, Suspense, lazy } from "react";
import { useSafariStore } from "./lib/store";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

const ZoneMapView = lazy(() => import("./components/ZoneMapView"));
const VehicleTrackerView = lazy(() => import("./components/VehicleTrackerView"));
const ForestViewerView = lazy(() => import("./components/ForestViewerView"));

function ViewContent({ view }) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid var(--forest-700)",
              borderTopColor: "var(--amber-light)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "'Space Mono', monospace" }}>
            LOADING VIEW...
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      {view === "zonemap" && <ZoneMapView />}
      {view === "tracker" && <VehicleTrackerView />}
      {view === "forest3d" && <ForestViewerView />}
    </Suspense>
  );
}

export default function DashboardPage() {
  const { activeView, tick } = useSafariStore();

  useEffect(() => {
    const interval = setInterval(tick, 3000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "var(--forest-950)",
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <TopBar />
        <main
          style={{
            flex: 1,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <ViewContent view={activeView} />
        </main>
      </div>
    </div>
  );
}
