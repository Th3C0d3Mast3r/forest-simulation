import Reg from "../models/reg.model.js";

export const createTicket = async (req, res) => {
    try {
        const { uid, name, mobile, safariType, paymentStatus } = req.body;

        // Check if a registration with this UID already exists
        let reg = await Reg.findOne({ uid });

        if (reg) {
            // If it exists, update it and set ticketCreated to true
            reg.name = name || reg.name;
            reg.mobile = mobile || reg.mobile;
            reg.safariType = safariType || reg.safariType;
            reg.paymentStatus = paymentStatus !== undefined ? paymentStatus : reg.paymentStatus;
            reg.ticketCreated = true;
            await reg.save();
            return res.status(200).json({ message: "Registration updated and ticket created", reg });
        } else {
            // If it doesn't exist, create a new one
            const newReg = new Reg({
                uid,
                name,
                mobile,
                safariType,
                paymentStatus: paymentStatus || false,
                ticketCreated: true
            });
            await newReg.save();
            return res.status(201).json({ message: "New registration and ticket created successfully", reg: newReg });
        }
    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getTicket = async (req, res) => {
    try {
        const {id} = req.params;
        const reg = await Reg.findById(id);
        if (!reg) {
            return res.status(404).json({message: "Ticket not found"});
        }
        res.status(200).json({message: "Ticket retrieved successfully", reg});
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};