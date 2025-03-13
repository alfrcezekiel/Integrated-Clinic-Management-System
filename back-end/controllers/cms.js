import { StatusCodes } from 'http-status-codes';
import conn from "../db/mysql/conn.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import "../main.js";
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
        const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;

        const SECRET_KEY = process.env.JWT_SECRET || "authenmimangjuan";

        // 1st table of patients register account
        const query1 = "INSERT INTO patientsregisteraccount1 (firstName, lastName, email) VALUES (?, ?, ?)";
        // 2nd table of patients register account
        const query2 = "INSERT INTO patientsregisteraccount2 (phoneNumber, password, confirmPassword) VALUES (?, ?, ?)";

        const [result] = await conn.query(query1, [firstName, lastName, email]);
        const patientID = result.insertId;

        await conn.query(query2, [phoneNumber, password, confirmPassword]);

        const token = jwt.sign({ id: patientID, email: email }, SECRET_KEY || "sadadsasdd", { expiresIn: "1hr" });
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
        const { contactName, contactEmailAddress, contactSubject, contactMessage } = req.body;

        const query = "INSERT INTO contactmanagement (contactName, contactEmailAddress, contactSubjectPerson, contactMessage) VALUES (?, ?, ?, ?)";

        await conn.query(query, [contactName, contactEmailAddress, contactSubject, contactMessage])

        return res.status(StatusCodes.OK).json({
            contactMessage: "Request contact has been submitted!"
        })
    } catch (error) {
        console.error(`Failed to manage contact messages: ${error}`);
    }
}

// controller logic for login patients accounts
export const loginPatientsAccount = async (req, res) => {
    try {
        const { email, password } = req.body;

        const query = `SELECT
            patientsregisteraccount1.patientID,
            patientsregisteraccount1.email,
            patientsregisteraccount2.password
            FROM patientsregisteraccount1
            INNER JOIN patientsregisteraccount2
            ON patientsregisteraccount1.patientID = patientsregisteraccount2.registerPatientID 
            WHERE patientsregisteraccount1.email = ? AND patientsregisteraccount2.password = ?;
        `;
        
        const [rows] = await conn.query(query, [email, password]);

        if (!rows.find((row) => row.email === email && row.password === password)) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Invalid email and password"
            })
        }
        
        const patients = rows[0];
        const SECRET_KEY = process.env.JWT_SECRET || "authenmimangjuan";
        
        // generate a token
        const token = jwt.sign({id: patients.patientID}, SECRET_KEY, {expiresIn: "1hr"});

        // session token
        const s = req.session.user = {
            patientID: patients.patientID,
        }   

        return res.status(StatusCodes.OK).json({
            message: "Login successful",
            token,
            req: s
        })
    } catch (error) {
        console.error(`Failed to login patient account: ${error}`);
    }
}

// controller logic for doctors login account 
export const loginDoctorsAccount = async (req, res) => {
    try {
        const {email, password} = req.body;

        const query = `SELECT email, password FROM doctorsaccount WHERE email = ? AND password = ?;`;

        const [rows] = await conn.query(query, [email, password]);

        if (!rows.find((row) => row.email === email && row.password === password)) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Invalid email and password"
            })
        }

        const doctorsUsers = rows[0];

        const SECRET_KEY = process.env.JWT_SECRET || "authenniraul"
        if(!SECRET_KEY){
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to login doctor account"
            });
        }

        const token = jwt.sign({id: doctorsUsers.doctorsID}, SECRET_KEY, {expiresIn: "1hr"});
        const ds = req.session.user = {
            doctorsId: doctorsUsers.doctorsID
        }

        return res.status(StatusCodes.OK).json({
            message: "Doctors Login Successful",
            s: ds,
            token
        })
        
    } catch (error) {
        console.error(`Failed to login doctor account: ${error}`);
    }
}

// get session of the user
export const getLoggedInUser = (req, res) => {
    if (!req.session.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "No active session. Please log in."
        });
    }

    return res.status(StatusCodes.OK).json({
        message: "User session retrieved successfully",
        user: req.session.user
    });
};

export const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Access denied. Please log in."
        });
    }
    next();
};

// destroy the session request
export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Logout failed"
            });
        }

        res.clearCookie("connect.sid"); // remove session details
        return res.status(StatusCodes.OK).json({
            message: "Logged out successfully"
        });
    });
};

export const getPatientsDashboard = async (req, res) => {
    try {
        const query = `SELECT COUNT(*) AS total_count FROM (
        SELECT patientID FROM patientsregisteraccount1
        UNION ALL
        SELECT registerPatientID FROM patientsregisteraccount2
        ) AS combined_tables;`;

        const [rows] = await conn.query(query);

        return res.status(StatusCodes.OK).json({
            patientsDashboard: rows
        })
    } catch (error) {
        console.error(`Failed to get patients dashboard: ${error}`);
    }
}

// controller logic for retrieving the id of patients details to fill the input fields
export const getBookedAppointments = async (req, res) => {
    try {
        const patientID = req.params.id;
        if (!patientID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid patient ID"
            })
        }

        const query = `SELECT
                patientsregisteraccount1.firstName,
                patientsregisteraccount1.lastName,
                patientsregisteraccount1.email,
                patientsregisteraccount2.phoneNumber
                FROM patientsregisteraccount1
                INNER JOIN
                patientsregisteraccount2
                ON patientsregisteraccount1.patientID
                = patientsregisteraccount2.registerPatientID
                WHERE patientsregisteraccount1.patientID = ?;
            `;

        const [rows] = await conn.query(query, [patientID]);

        if (rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No booked appointments found"
            })
        }

        return res.status(StatusCodes.OK).json(
            rows[0]
        );

    } catch (error) {
        console.error(`Failed to get booked appointments: ${error}`);
    }
}

// controller logic for patients booked appointments
export const patientsBookedAppointments = async (req, res) => {
    try {
        const {
            appointmentID,
            firstName,
            lastName,
            email,
            appointmentDate,
            phoneNumber,
            gender,
            doctor,
            status,
            purposeOfAppointment
        } = req.body;

        const query = `INSERT INTO patientsappointment (
            appointmentID,
            firstName,
            lastName,
            email,
            appointmentDate,
            phoneNumber,
            gender,
            doctor,
            status,
            purposeOfAppointment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        const [result] = await conn.query(query, [appointmentID, firstName, lastName, email, appointmentDate, phoneNumber, gender, doctor, status, purposeOfAppointment]);
        
        if(result.affectedRows === 0){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Failed to book appointment"
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "Appointment booked successfully",
        });

    } catch (error) {
        console.error(`Failed to book appointments: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to book appointment"
        });
    }
}

// verify a token to protect routes 
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Access Denied! No token provided"
        })
    }

    try {
        const SECRET_KEY = process.env.JWT_SECRET || "authenmimangjuan";
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        console.error(`Invalid or Expired token: ${error}`);
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Invalid or Expired token"
        })
    }
}

// controller logic for getting patients appointments
export const getPatientsAppointments = async (req, res) => {
    try {
        const query = `SELECT firstName, lastName, appointmentDate, doctor, status, purposeOfAppointment FROM patientsappointment`;

        const [rows] = await conn.query(query);

        return res.status(StatusCodes.OK).json({
            patientsAppointments: rows
        })
    } catch (error) {
        console.error(`Failed to get patients appointments: ${error}`);
    }
}