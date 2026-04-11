import express from "express";
const router = express.Router();

let simulationState = {
  running: false,
  triggeredAt: null,
  speed: 1,
};

router.post("/start", (req, res) => {
  const { speed } = req.body || {};
  simulationState = {
    running: true,
    triggeredAt: Date.now(),
    speed: speed || 1,
  };
  res.json({ success: true, message: "Simulation started", state: simulationState });
});

router.post("/stop", (req, res) => {
  simulationState.running = false;
  res.json({ success: true, message: "Simulation stopped", state: simulationState });
});

router.get("/status", (req, res) => {
  res.json({ success: true, state: simulationState });
});

export default router;
