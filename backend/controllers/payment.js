import crypto from "crypto";
import dotenv from "dotenv";
import Reg from "../models/reg.model.js";

dotenv.config();

export const generateHash = async (req, res) => {
    try {
        const { amount, productinfo, firstname, email, phone, uid } = req.body;
        
        if (!amount || !productinfo || !firstname || !email) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const txnid = uid || ("T" + Date.now() + Math.floor(Math.random() * 1000));
        
        const key = process.env.PAYU_KEY;
        const salt = process.env.PAYU_SALT;
        
        // Hash Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
        const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
        const hash = crypto.createHash("sha512").update(hashString).digest("hex");

        res.status(200).json({
            hash,
            txnid,
            key,
            udf1: "",
            udf2: "",
            udf3: "",
            udf4: "",
            udf5: "",
            amount,
            productinfo,
            firstname,
            email,
            phone,
            action: process.env.PAYU_BASE_URL
        });
    } catch (error) {
        console.error("Hash generation error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const paymentResponse = async (req, res) => {
    try {
        // PayU sends data in body for POST, and sometimes in query for GET
        const data = req.method === "POST" ? req.body : req.query;
        const { status, txnid, amount, productinfo, firstname, email, hash } = data;

        if (!status || !txnid) {
            // If no data is present (e.g. manual GET or cancel), redirect to failure
            return res.redirect(`${process.env.FRONTEND_URL}/dashboard/payment-failure`);
        }

        const salt = process.env.PAYU_SALT;
        const key = process.env.PAYU_KEY;

        if (status === "success") {
             // Hash verification (Simplified for now)
             await Reg.findOneAndUpdate({ uid: txnid }, { paymentStatus: true });
             return res.redirect(`${process.env.FRONTEND_URL}/dashboard/payment-success?txid=${txnid}`);
        } else {
             return res.redirect(`${process.env.FRONTEND_URL}/dashboard/payment-failure?txid=${txnid}`);
        }
    } catch (error) {
        console.error("Payment response error:", error);
        res.redirect(`${process.env.FRONTEND_URL}/dashboard/payment-failure`);
    }
};
