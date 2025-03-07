import { StatusCodes } from 'http-status-codes';
import conn from "../db/mysql/conn.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

// controller logic for a global route
export const CMS = async (req, res) => {
    return res.status(StatusCodes.OK).json({
        title: "Clinic Management System",
        description: "CMS streamlines the operational workflow of a dental clinic that automates the medical health records (EHR), appointment scheduling, payment integration and inventory of clinical products.",
        ehrText: "Electronic Health Records",
        paymentIntegrationText: "Payment Integration",
        appointmentSchedulingText: "Appointment Scheduling",
        featuresTitle: "Features",
        inventoryText: "Inventory Management of Clinical Products",
        whatWeServeTitle: "What We Serve",
        teethQuotes: "A smile is a curve that sets everything straight",
        firstDescription: "Comprehensive Dental Care for the whole family.",
        secondDescription: "State of the art technology for pain-free treatments.",
        thirdDescription: "Experienced and Friendly Dental Professional.",
        fourthDescription: "Personalized treatment plans for tailored to your needs.",
        emergencyServices: "Emergency Dental Services avaiable 24/7."
    })
}

// controller logic for register patients accounts
export const registerPatientAccount = async (req, res) => {
    try {
        const {firstName, lastName, email, phoneNumber, password, confirmPassword} = req.body;
        
        const SECRET_KEY = process.env.JWT_SECRET || "authen ni mang juan"
        const query1 = "INSERT INTO patientsregisteraccount1 (firstName, lastName, email) VALUES (?, ?, ?)";
        const query2 = "INSERT INTO patientsregisteraccount2 (phoneNumber, password, confirmPassword) VALUES (?, ?, ?)";
    
        const [result] = await conn.query(query1, [firstName, lastName, email]);
        const patientID = result.insertId;

        await conn.query(query2, [phoneNumber, password, confirmPassword]);

        const token = jwt.sign({id: patientID, email: email}, SECRET_KEY, {expiresIn: "1hr"});
        return res.status(StatusCodes.OK).json({
            message: "Patient account registered successfully",
            token
        })
    } catch (error) {
        console.error(`Failed to register patient account: ${error}`);
    }
}

// controller logic for contact message in landing page
export const contactMessageManagement = async (req, res) => {
    try {
        const {contactName, contactEmailAddress, contactSubject, contactMessage} = req.body;

        const query = "INSERT INTO contactmanagement (contactName, contactEmailAddress, contactSubjectPerson, contactMessage) VALUES (?, ?, ?, ?)";

        await conn.query(query, [contactName, contactEmailAddress, contactSubject, contactMessage])

        return res.status(StatusCodes.OK).json({
            contactMessage: "Request contact has been submitted!"
        })
    } catch(error) {
        console.error(`Failed to manage contact messages: ${error}`);
    }
}

// controller logic for login patients accounts
export const loginPatientsAccount = async (req, res) => {
    try {
        const {email, password} = req.body;

        const query = "SELECT patientsregisteraccount1.email, patientsregisteraccount2.password FROM patientsregisteraccount1 INNER JOIN patientsregisteraccount2 ON patientsregisteraccount1.patientID = patientsregisteraccount2.registerPatientID WHERE patientsregisteraccount1.email = ? AND patientsregisteraccount2.password = ?;";
        await conn.query(query, [email, password]);
        
        return res.status(StatusCodes.OK).json({
            message: "Login successful",
        })
    } catch (error) {
        console.error(`Failed to login patient account: ${error}`);
    }
}