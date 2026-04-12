import express from "express";
import { generateHash, paymentResponse } from "../controllers/payment.js";

const router = express.Router();

router.post("/hash", generateHash);
router.all("/success", paymentResponse);
router.all("/failure", paymentResponse);

export default router;
