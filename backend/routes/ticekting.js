import express from "express";
import {createTicket, getTicket, getTicketByUid} from "../controllers/ticket.js";

const router = express.Router();

router.post("/create", createTicket);
router.get("/get/:id", getTicket);
router.get("/get-by-uid/:uid", getTicketByUid);

export default router;