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

        const txnid = uid || ("TXN" + Date.now() + Math.floor(Math.random() * 1000));
        const formattedAmount = parseFloat(amount).toFixed(1);
        
        const key = process.env.PAYU_KEY;
        const salt = process.env.PAYU_SALT;
        const udf1 = "";
        const udf2 = "";
        const udf3 = "";
        const udf4 = "";
        const udf5 = "";
        
        const hashString = `${key}|${txnid}|${formattedAmount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
        
        console.log("[PAYU] Hash input string:", hashString);
        
        const hash = crypto.createHash("sha512").update(hashString).digest("hex");

        console.log("[PAYU] Generated hash:", hash);
        console.log("[PAYU] TxnID:", txnid, "Amount:", formattedAmount);

        res.status(200).json({
            hash,
            txnid,
            key,
            amount: formattedAmount,
            productinfo,
            firstname,
            email,
            phone: phone || "9999999999",
            action: process.env.PAYU_BASE_URL
        });
    } catch (error) {
        console.error("Hash generation error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const paymentResponse = async (req, res) => {
    try {
        const data = req.method === "POST" ? req.body : req.query;
        console.log("[PAYU] Response received:", req.method, data);

        const { status, txnid } = data;

        if (!status || !txnid) {
            return res.redirect(`${process.env.FRONTEND_URL}/dashboard/payment-failure`);
        }

        if (status === "success") {
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
