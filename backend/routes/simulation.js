import { log } from "console";
import express from "express";
const router = express.Router();

let simulationState = {
  running: false,
  triggeredAt: null,
  speed: 1,
  detections: [] // Array of { name, progress, id }
};

router.post("/start", (req, res) => {
  const { speed } = req.body || {};
  simulationState = {
    running: true,
    triggeredAt: Date.now(),
    speed: speed || 1,
    detections: [] // Clear detections on new start
  };
  log("Simulation started", simulationState);
  res.json({ success: true, message: "Simulation started", state: simulationState });
});

router.post("/detect", (req, res) => {
  const { name } = req.body || {};
  if (!name) {
    return res.status(400).json({ success: false, message: "Missing name" });
  }
  
  const detection = {
    id: Date.now() + Math.random(), // Ensure uniqueness
    name,
    timestamp: new Date().toISOString()
  };
  
  simulationState.detections.push(detection);
  res.json({ success: true, message: "Detection recorded", detection });
});

router.post("/stop", (req, res) => {
  simulationState.running = false;
  res.json({ success: true, message: "Simulation stopped", state: simulationState });
});

router.get("/status", (req, res) => {
  // Debug log to terminal
  console.log(`[SIM] Status requested. Running: ${simulationState.running}, Detections: ${simulationState.detections.length}`);
  res.json({ success: true, state: simulationState });
});

export default router;
