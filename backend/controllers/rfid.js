import Rfid from "../models/rfid.model.js";
import Reg from "../models/reg.model.js";
import { EventEmitter } from "events";

export const rfidEvents = new EventEmitter();

export const assignRfid = async (req, res) => {
    try {
        const { rfid, uid } = req.body;

        if (!rfid || !uid) {
            return res.status(400).json({ message: "rfid and uid are required" });
        }

        const mongoose = await import("mongoose");
        const isObjectId = mongoose.default.Types.ObjectId.isValid(uid);
        const reg = await Reg.findOne(
            isObjectId
                ? { $or: [{ uid }, { _id: uid }] }
                : { uid }
        );
        if (!reg) {
            return res.status(404).json({ message: "Registration not found for this UID" });
        }

        if (!reg.ticketCreated) {
            return res.status(400).json({ message: "Ticket has not been created for this registration yet" });
        }

        const existingRfid = await Rfid.findOne({ rfid });
        if (existingRfid) {
            return res.status(409).json({ message: "This RFID tag is already assigned", existingRfid });
        }

        const groupSize = reg.name.length;

        const ttlDate = new Date();
        ttlDate.setDate(ttlDate.getDate() + 1);

        const newRfid = new Rfid({
            rfid,
            value: groupSize,
            ttl: ttlDate,
            regId: reg._id,
        });

        await newRfid.save();

        return res.status(201).json({
            message: "RFID assigned successfully",
            rfid: newRfid,
            groupSize,
            expiresAt: ttlDate,
        });
    } catch (error) {
        console.error("Error assigning RFID:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getRfidByTag = async (req, res) => {
    try {
        const { rfid } = req.params;

        const rfidDoc = await Rfid.findOne({ rfid }).populate("regId", "uid name mobile safariType paymentStatus");
        if (!rfidDoc) {
            return res.status(404).json({ message: "RFID tag not found or has expired" });
        }

        // Emit tap event for real-time dashboard tracking
        rfidEvents.emit("tap", {
            rfid: rfidDoc.rfid,
            groupSize: rfidDoc.value,
            member: rfidDoc.regId?.name?.[0] || "Unknown Member",
            safariType: rfidDoc.regId?.safariType,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        return res.status(200).json({
            message: "RFID found",
            rfid: rfidDoc,
            groupSize: rfidDoc.value,
            expiresAt: rfidDoc.ttl,
        });
    } catch (error) {
        console.error("Error fetching RFID:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getRfidByUid = async (req, res) => {
    try {
        const { uid } = req.params;

        const mongoose = await import("mongoose");
        const isObjectId = mongoose.default.Types.ObjectId.isValid(uid);
        const reg = await Reg.findOne(
            isObjectId
                ? { $or: [{ uid }, { _id: uid }] }
                : { uid }
        );
        if (!reg) {
            return res.status(404).json({ message: "No registration found for this UID" });
        }

        const rfidDoc = await Rfid.findOne({ regId: reg._id });
        if (!rfidDoc) {
            return res.status(404).json({ message: "No RFID assigned to this UID or it has expired" });
        }

        return res.status(200).json({
            message: "RFID found for UID",
            rfid: rfidDoc,
            groupSize: rfidDoc.value,
            expiresAt: rfidDoc.ttl,
        });
    } catch (error) {
        console.error("Error fetching RFID by UID:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deactivateRfid = async (req, res) => {
    try {
        const { rfid } = req.params;

        const deleted = await Rfid.findOneAndDelete({ rfid });
        if (!deleted) {
            return res.status(404).json({ message: "RFID not found" });
        }

        return res.status(200).json({ message: "RFID deactivated and removed", deleted });
    } catch (error) {
        console.error("Error deactivating RFID:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const rfidStream = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send an initial ping to establish connection
    res.write(`data: ${JSON.stringify({ type: "ping" })}\n\n`);

    const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    rfidEvents.on('tap', sendEvent);

    req.on('close', () => {
        rfidEvents.off('tap', sendEvent);
    });
};
