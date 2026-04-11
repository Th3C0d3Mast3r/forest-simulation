"use client";
import { create } from "zustand";
import {
    mockVehicles,
    mockZones,
    mockAnimals,
    mockGate,
    mockEnvironment,
    mockTickets,
} from "./mockData";

function jitter(val, range = 0.0008) {
    return val + (Math.random() - 0.5) * range;
}

function animateVehicles(vehicles) {
    return vehicles.map((v) => {
        const newLat = jitter(v.lat, 0.001);
        const newLng = jitter(v.lng, 0.001);
        const trail = [...v.trail.slice(-4), [newLat, newLng]];
        return { ...v, lat: newLat, lng: newLng, trail };
    });
}

function animateAnimals(animals) {
    return animals.map((a) => ({
        ...a,
        lat: jitter(a.lat, 0.0005),
        lng: jitter(a.lng, 0.0005),
    }));
}

export const useSafariStore = create((set) => ({
    activeView: "zonemap",
    vehicles: mockVehicles,
    zones: mockZones,
    animals: mockAnimals,
    gate: mockGate,
    environment: mockEnvironment,
    tickets: mockTickets,
    lastUpdated: Date.now(),

    setActiveView: (view) => set({ activeView: view }),

    tick: () =>
        set((state) => ({
            vehicles: animateVehicles(state.vehicles),
            animals: animateAnimals(state.animals),
            lastUpdated: Date.now(),
        })),
}));
