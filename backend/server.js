import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ticketRoutes from "./routes/ticekting.js";
import rfidRoutes from "./routes/rfid.js";
import simulationRoutes from "./routes/simulation.js";

const app = express();
dotenv.config();

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("[SUCCESS] MongoDB Connected");
//   } catch (err) {
//     console.error("[FAILED] MongoDB Connection:", err.message);
//     process.exit(1);
//   }
// };
// connectDB();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Base Route Running");
});

app.use("/ticket", ticketRoutes);
app.use("/rfid", rfidRoutes);
app.use("/simulation", simulationRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
