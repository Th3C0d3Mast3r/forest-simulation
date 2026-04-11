import Reg from "../models/reg.model.js";
import express from "express";  

export const createTicket = async (req, res) => {
    try {
        const {uid} = req.body;
        const reg = await Reg.findOne({uid});
        if (!reg) {
            return res.status(404).json({message: "Registration not found"});
        }
        if (!reg.paymentStatus) {
            return res.status(400).json({message: "Payment not completed"});
        }
        // Here you can add logic to create a ticket based on the registration details
        res.status(201).json({message: "Ticket created successfully", reg});
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
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