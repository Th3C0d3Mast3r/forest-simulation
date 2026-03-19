"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment, Float, useGLTF, Center } from "@react-three/drei";
import { useSafariStore } from "../lib/store";

useGLTF.preload("/model/scene.gltf");

function ForestModel() {
    const { scene } = useGLTF("/model/scene.gltf");

    scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    return (
        <Center>
            <primitive object={scene} />
        </Center>
    );
}

function VehiclePin({ position, vehicleId, zone, lastAnimal }) {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.8;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
            <group position={position}>
                <mesh
                    ref={meshRef}
                    onPointerEnter={() => setHovered(true)}
                    onPointerLeave={() => setHovered(false)}
                >
                    <cylinderGeometry args={[0.05, 0.18, 0.6, 6]} />
                    <meshStandardMaterial
                        color={hovered ? "#60d080" : "#22c55e"}
                        emissive="#22c55e"
                        emissiveIntensity={0.4}
                    />
                </mesh>
                <mesh position={[0, 0.5, 0]}>
                    <sphereGeometry args={[0.14, 16, 16]} />
                    <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={0.8} />
                </mesh>
                {hovered && (
                    <Html position={[0.3, 0.7, 0]} style={{ pointerEvents: "none" }}>
                        <div
                            style={{
                                background: "rgba(10,26,14,0.95)",
                                border: "1px solid #4ade80",
                                borderRadius: 6,
                                padding: "6px 10px",
                                fontFamily: "'Space Mono', monospace",
                                fontSize: "0.65rem",
                                color: "#e8f5e9",
                                whiteSpace: "nowrap",
                                boxShadow: "0 0 14px rgba(74,222,128,0.3)",
                            }}
                        >
                            <div style={{ color: "#4ade80", fontWeight: 700 }}>{vehicleId}</div>
                            <div style={{ color: "#9dbfa5" }}>{zone}</div>
                            <div>🦁 {lastAnimal}</div>
                        </div>
                    </Html>
                )}
            </group>
        </Float>
    );
}

function AnimalPin({ position, name, zone, time, confidence }) {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.08;
        }
    });

    return (
        <group position={position}>
            <group ref={meshRef}>
                <mesh
                    onPointerEnter={() => setHovered(true)}
                    onPointerLeave={() => setHovered(false)}
                >
                    <coneGeometry args={[0.18, 0.55, 6]} />
                    <meshStandardMaterial
                        color={hovered ? "#fb923c" : "#ea580c"}
                        emissive="#ea580c"
                        emissiveIntensity={0.5}
                    />
                </mesh>
                <mesh position={[0, 0.4, 0]}>
                    <sphereGeometry args={[0.13, 16, 16]} />
                    <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={1} />
                </mesh>
            </group>
            {hovered && (
                <Html position={[0.3, 0.6, 0]} style={{ pointerEvents: "none" }}>
                    <div
                        style={{
                            background: "rgba(10,26,14,0.95)",
                            border: "1px solid #d97706",
                            borderRadius: 6,
                            padding: "6px 10px",
                            fontFamily: "'Space Mono', monospace",
                            fontSize: "0.65rem",
                            color: "#e8f5e9",
                            whiteSpace: "nowrap",
                            boxShadow: "0 0 14px rgba(217,119,6,0.4)",
                        }}
                    >
                        <div style={{ color: "#fbbf24", fontWeight: 700 }}>🦁 {name}</div>
                        <div style={{ color: "#9dbfa5" }}>{zone}</div>
                        <div>
                            {time} · {confidence}%
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

function SceneContent({ vehicles, animals }) {
    const vehiclePositions = vehicles.map((v) => [
        (v.lng - 36.826) * 300,
        2,
        (v.lat + 1.293) * 300,
    ]);

    const animalPositions = animals.map((a) => [
        (a.lng - 36.826) * 300,
        2,
        (a.lat + 1.293) * 300,
    ]);

    return (
        <>
            <fog attach="fog" args={["#040d07", 30, 120]} />

            <ambientLight intensity={0.5} color="#c8e6c9" />
            <directionalLight
                position={[20, 40, 20]}
                intensity={1.5}
                color="#fde68a"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={200}
                shadow-camera-left={-50}
                shadow-camera-right={50}
                shadow-camera-top={50}
                shadow-camera-bottom={-50}
            />
            <pointLight position={[0, 10, 0]} intensity={0.5} color="#2d5c37" distance={60} />
            <hemisphereLight skyColor="#1a4a25" groundColor="#0a1a0e" intensity={0.4} />

            <Suspense fallback={null}>
                <ForestModel />
            </Suspense>

            {vehicles.map((v, i) => (
                <VehiclePin
                    key={v.id}
                    position={vehiclePositions[i]}
                    vehicleId={v.id}
                    zone={v.zone}
                    lastAnimal={v.lastAnimal}
                />
            ))}

            {animals.map((a, i) => (
                <AnimalPin
                    key={a.id}
                    position={animalPositions[i]}
                    name={a.name}
                    zone={a.zone}
                    time={a.time}
                    confidence={a.confidence}
                />
            ))}

            <OrbitControls
                enablePan
                enableZoom
                enableRotate
                maxPolarAngle={Math.PI / 2.1}
                minDistance={5}
                maxDistance={120}
            />
            <Environment preset="forest" />
        </>
    );
}

function LoadingFallback() {
    return (
        <div
            style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 16,
                background: "#040d07",
            }}
        >
            <div
                style={{
                    width: 44,
                    height: 44,
                    border: "3px solid rgba(45,92,55,0.3)",
                    borderTopColor: "#4ade80",
                    borderRadius: "50%",
                    animation: "spin 0.9s linear infinite",
                }}
            />
            <div
                style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.72rem",
                    color: "#5a8065",
                    letterSpacing: "0.12em",
                }}
            >
                LOADING FOREST MODEL...
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function ForestViewerView() {
    const { vehicles, animals } = useSafariStore();

    return (
        <div
            className="view-panel"
            style={{ height: "100%", position: "relative", background: "#040d07" }}
        >
            <div
                style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    zIndex: 10,
                    display: "flex",
                    gap: 8,
                }}
            >
                <div
                    className="glass-card"
                    style={{ borderRadius: 6, padding: "4px 12px", fontSize: "0.62rem" }}
                >
                    <span style={{ color: "#4ade80" }}>● Vehicle</span>
                    <span style={{ color: "#9dbfa5", margin: "0 8px" }}>|</span>
                    <span style={{ color: "#fb923c" }}>● Animal Sighting</span>
                </div>
            </div>

            <div
                style={{
                    position: "absolute",
                    bottom: 12,
                    right: 12,
                    zIndex: 10,
                }}
            >
                <div
                    className="glass-card"
                    style={{
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: "0.6rem",
                        color: "var(--text-muted)",
                    }}
                >
                    Drag to rotate · Scroll to zoom · Right-click to pan
                </div>
            </div>

            <Canvas
                shadows
                camera={{ position: [0, 20, 40], fov: 50 }}
                gl={{ antialias: true }}
                style={{ width: "100%", height: "100%" }}
            >
                <Suspense fallback={null}>
                    <SceneContent vehicles={vehicles} animals={animals} />
                </Suspense>
            </Canvas>
        </div>
    );
}
