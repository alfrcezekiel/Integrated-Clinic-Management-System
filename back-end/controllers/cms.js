import { StatusCodes } from 'http-status-codes';
import conn from "../db/mysql/conn.js";
import dotenv from "dotenv";
dotenv.config();

export const CMS = async (req, res) => {
    return res.status(StatusCodes.OK).json({
        title: "Dental Clinic Management System",
        description: "CMS streamlines the operational workflow of a dental clinic that automates the medical health records (EHR), appointment scheduling, payment integration and inventory of clinical products.",
        ehrText: "Electronic Health Records",
        paymentIntegrationText: "Payment Integration",
        appointmentSchedulingText: "Appointment Scheduling",
        featuresTitle: "Features",
        inventoryText: "Inventory Management of Clinical Products",
        whatWeServeTitle: "What We Serve",
        teethQuotes: "A smile is a curve that sets everything straight"
    })
}

export const registerPatientAccount = async (req, res) => {
    try {
        const {firstName, lastName, email, phoneNumber, password, confirmPassword} = req.body;
    
        const query1 = "INSERT INTO db_registeraccount_a (firstName, lastName, email) VALUES (?, ?, ?)";
        const query2 = "INSERT INTO db_registeraccount_b (phoneNumber, password, confirmPassword) VALUES (?, ?, ?)";
    
        await conn.query(query1, [firstName, lastName, email]);
        await conn.query(query2, [phoneNumber, password, confirmPassword]);
        
        return res.status(StatusCodes.OK).json({
            message: "Patient account registered successfully"
        })
    } catch (error) {
        console.error(`Failed to register patient account: ${error}`);
    }
}