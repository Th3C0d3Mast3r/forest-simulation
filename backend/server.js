import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ticketRoutes from "./routes/ticekting.js";
import rfidRoutes from "./routes/rfid.js";
import simulationRoutes from "./routes/simulation.js";
import sensorRoutes from "./routes/sensor.js";
import paymentRoutes from "./routes/payment.js";

const app = express();
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[SUCCESS] MongoDB Connected");
  } catch (err) {
    console.error("[FAILED] MongoDB Connection:", err.message);
  }
};
connectDB();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Base Route Running");
});

app.use("/ticket", ticketRoutes);
app.use("/rfid", rfidRoutes);
app.use("/simulation", simulationRoutes);
app.use("/sensor", sensorRoutes);
app.use("/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`[SUCCESS] Simulation Server running on port ${PORT}`);
});

export default app;
