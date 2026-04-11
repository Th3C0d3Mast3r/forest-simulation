import express from "express";
import {createTicket, getTicket} from "../controllers/ticket.js";

const router = express.Router();

router.post("/create", createTicket);
router.get("/get/:id", getTicket);

export default router;