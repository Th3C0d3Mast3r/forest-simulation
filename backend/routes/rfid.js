import express from "express";
import { assignRfid, getRfidByTag, getRfidByUid, deactivateRfid, rfidStream } from "../controllers/rfid.js";

const router = express.Router();

router.get("/stream", rfidStream);
router.post("/assign", assignRfid);
router.get("/tag/:rfid", getRfidByTag);
router.get("/uid/:uid", getRfidByUid);
router.delete("/deactivate/:rfid", deactivateRfid);

export default router;
