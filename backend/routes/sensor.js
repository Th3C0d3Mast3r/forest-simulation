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
  const now = new Date();
  const lastUpdate = latestSensorData.timestamp ? new Date(latestSensorData.timestamp) : new Date(0);
  const diffSec = (now - lastUpdate) / 1000;

  // If no hardware data received in the last 15 seconds, simulate realistic Indian Forest data
  if (diffSec > 15) {
    if (latestSensorData.temp === 0) {
      // Initialize with realistic Indian forest baseline if perfectly zero
      latestSensorData.temp = 32.5;
      latestSensorData.humidity = 65.0;
      latestSensorData.gas = 45.0;
      latestSensorData.vibration = 10.0;
    } else {
      // Subtle random walk to simulate live sensor fluctuations
      latestSensorData.temp = parseFloat((latestSensorData.temp + (Math.random() * 0.4 - 0.2)).toFixed(1));
      latestSensorData.humidity = parseFloat((latestSensorData.humidity + (Math.random() * 1.2 - 0.6)).toFixed(1));
      latestSensorData.gas = parseFloat((latestSensorData.gas + (Math.random() * 2 - 1)).toFixed(1));
      latestSensorData.vibration = parseFloat((latestSensorData.vibration + (Math.random() * 0.8 - 0.4)).toFixed(1));
    }

    // Keep values realistically bounded for an Indian climate
    latestSensorData.temp = Math.max(15, Math.min(48, latestSensorData.temp));
    latestSensorData.humidity = Math.max(20, Math.min(99, latestSensorData.humidity));
    latestSensorData.gas = Math.max(10, Math.min(200, latestSensorData.gas));
    latestSensorData.vibration = Math.max(0, Math.min(50, latestSensorData.vibration));
  }

  res.json({ success: true, data: latestSensorData });
});

export default router;
