import express from "express";
const router = express.Router();

// State to hold latest sensor readings
let latestSensorData = {
  temp: 0,
  humidity: 0,
  gas: 0,
  vibration: 0,
  timestamp: null
};

router.post("/", (req, res) => {
  const { temp, humidity, gas, vibration } = req.body || {};
  
  latestSensorData = {
    temp: temp || 0,
    humidity: humidity || 0,
    gas: gas || 0,
    vibration: vibration || 0,
    timestamp: new Date().toISOString()
  };

  console.log("[IOT] Sensor data received:", latestSensorData);
  res.json({ success: true, message: "Sensor data updated", data: latestSensorData });
});

router.get("/data", (req, res) => {
  res.json({ success: true, data: latestSensorData });
});

export default router;
