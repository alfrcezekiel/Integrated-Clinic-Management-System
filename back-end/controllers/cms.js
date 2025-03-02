import { StatusCodes } from 'http-status-codes';
import conn from "../db/mysql/conn.js";
import dotenv from "dotenv";
dotenv.config();
import validateRegister from '../middleware/validation.js';

export const CMS = async (req, res) => {
    return res.status(StatusCodes.OK).json({
        title: "Dental Clinic Management System",
        description: "CMS streamlines the operational workflow of a dental clinic that automates the medical health records (EHR), appointment scheduling, payment integration and inventory of clinical products.",
        ehrText: "Electronic Health Records",
        paymentIntegrationText: "Payment Integration",
        appointmentSchedulingText: "Appointment Scheduling",
        featuresTitle: "Features",
        inventoryText: "Inventory of Clinical Products",
        whatWeServeTitle: "What We Serve",
        teethQuotes: "A smile is a curve that sets everything straight"
    })
}

export const registerPatientAccount = [ validateRegister, async (req, res) => {  
        const { firstName } = req.body;

        res.status(StatusCodes.OK).json({
            firstName
        });
    }
]