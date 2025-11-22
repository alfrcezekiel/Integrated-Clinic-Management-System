import { StatusCodes } from 'http-status-codes';
import conn from "../db/mysql/conn.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import "../main.js";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import Clinic from '../models/Clinic.Model.js';
import validatePatientConsultation from '../middleware/ValidatePatientConsulation.js';
import logger from "../config/winston.js";
import { promisify } from "util";
import asyncHandler from "../middleware/asyncHandler/asyncHandler.js";
import sendResetPasswordEmail from '../utils/resetPassword.js';
import crypto from "crypto";
import PDFDocument from "pdfkit"
import {
    autoGenerateMedicalReportPath,
    saveMedicalReport
} from "../middleware/upload_medical_report/medical_report.js";
dotenv.config();
import {
    sendAppointmentsConfirmation,
    sendFollowUpMessage,
    sendWelcomeEmail,
    sendPatientAccountStatusNotification
} from '../services/automate_notification_service.js';
import { cancelAllRemindersForAppointment } from "../services/automate_notification_service.js";

// controller logic for a global route
export const CMS = async (req, res) => {
    try {
        return res.status(StatusCodes.OK).json({
            title: "Clinic Management System",
            description: "CMS streamlines the operational workflow of a clinic that automates the medical health records (EHR), appointment scheduling, payment integration and inventory of clinical products.",
            ehrText: "Electronic Health Records",
            paymentIntegrationText: "Payment Integration",
            appointmentSchedulingText: "Appointment Scheduling",
            featuresTitle: "Features",
            inventoryText: "Inventory Management of Clinical Products",
            whatWeServeTitle: "Services We Provide",
            healthQuotes: "Your health is an investment, not an expense.",
            firstDescription: "Comprehensive healthcare services for the whole family.",
            secondDescription: "Advanced medical technology for accurate diagnoses and treatments.",
            thirdDescription: "Experienced and compassionate healthcare professionals.",
            fourthDescription: "Personalized care plans tailored to your unique needs.",
            emergencyServices: "Emergency Services avaiable 24/7."
        })
    } catch (error) {
        console.error(`Failed to fetch CMS data: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to fetch CMS data"
        });
    }
}

// controller logic for register patients accounts
export const registerPatientAccount = async (req, res) => {
    const connection = await conn.getConnection();
    try {
        await connection.beginTransaction();
        const {
            firstName,
            lastName,
            email,
            address,
            gender,
            civilStatus,
            dateOfBirth,
            phoneNumber,
            password,
            confirmPassword,
        } = req.body;

        const address_field = String(address);
        const civil_status = String(civilStatus);
        const date_of_birth = String(dateOfBirth);
        const gender_field = String(gender);

        const SECRET_KEY = process.env.JWT_SECRET;

        const saltRounds = 10;
        const status = "Pending"
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = dayjs().add(10, 'minutes').toISOString();

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const hashedConfirmPassword = await bcrypt.hash(confirmPassword, saltRounds);

        const formattedDate = new Date(date_of_birth).toISOString().split('T')[0]; // '2003-02-20'

        // Use formattedDate in your query or insert

        // 1st table of patients register account
        const query1 = `INSERT INTO patientsregisteraccount1 (
            firstName,
            lastName,
            email,
            address,
            gender,
            civilStatus,
            dateOfBirth,
            resetToken,
            resetTokenExpiry
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        // 2nd table of patients register account
        const query2 = `INSERT INTO patientsregisteraccount2 (
            phoneNumber,
            password,
            confirmPassword,
            status,
            patientID
        ) VALUES (?, ?, ?, ?, ?)`;

        const [result] = await connection.query(query1, [
            firstName,
            lastName,
            email,
            address_field,
            gender_field,
            civil_status,
            formattedDate,
            resetToken,
            resetTokenExpiry
        ]);

        logger.log(`info`, `[patientRegisteraccount1] inserted patient id column = ${result.insertId}`);

        const patientID = result.insertId;

        const [second_result] = await connection.query(query2, [
            phoneNumber,
            hashedPassword,
            hashedConfirmPassword,
            status,
            patientID
        ]);

        logger.log(`info`, `[patientregisteraccount2] registerPatientID column = ${second_result.insertId} mapped patientID foreign key column = ${patientID}`);

        await connection.commit();
        try {
            await sendWelcomeEmail({
                email,
                firstName,
                lastName
            })
        } catch (error) {
            logger.log(`error`, `Failed to send a welcome email in controller of registerPatientAccount: ${error}`);
        }

        const payload = {
            id: patientID,
            email: email
        }

        const token = jwt.sign(payload, SECRET_KEY, {
            expiresIn: "1hr"
        });

        return res.status(StatusCodes.OK).json({
            message: "Patient account registered successfully. Your Account is Pending. Please wait for the admin approval",
            token
        })
    } catch (error) {
        const rollbackQuery = await connection.rollback();
        if (!rollbackQuery) {
            logger.log(`error`, `Failed to rollback transaction in register patient account`)
        }
        logger.error(`Failed to register patient account: ${error}`);
    } finally {
        connection.release();
    }
}

// controller logic for contact message in landing page
export const contactMessageManagement = async (req, res) => {
    try {
        const {
            contactName,
            contactEmailAddress,
            contactSubject,
            contactMessage
        } = req.body;

        const query = `INSERT INTO contactmanagement (
            contactName,
            contactEmailAddress, 
            contactSubjectPerson,
            contactMessage
            ) VALUES (?, ?, ?, ?);
        `;

        const [result] = await conn.query(query, [
            contactName,
            contactEmailAddress,
            contactSubject,
            contactMessage]
        );

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                contactMessage: "Request contact has not been submitted!"
            })
        }

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
            pr1.patientID,
            pr1.firstName,
            pr1.lastName,
            pr1.email,
            pr1.civilStatus,
            pr1.gender,
            pr2.password,
            pr2.status
            FROM patientsregisteraccount1 AS pr1
            INNER JOIN patientsregisteraccount2 AS pr2
            ON pr1.patientID = pr2.patientID
            WHERE pr1.email = ?;
        `;

        const [rows] = await conn.query(query, [email]);

        if (rows.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: {
                    email: "Incorrect email address"
                }
            });
        }

        const patients = rows[0];

        const SECRET_KEY = process.env.JWT_SECRET;
        const REFRESH_KEY_SECRET = process.env.REFRESH_KEY_SECRET;
        if (!SECRET_KEY || !REFRESH_KEY_SECRET) {
            logger.log("error", `Enviroment variables for refresh and access token are missing`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to login patient account due to missing environment variables"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, patients.password);

        if (!isPasswordValid) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: {
                    password: "Incorrect password"
                }
            });
        }

        if (patients.status === "Pending") {
            return res.status(StatusCodes.OK).json({
                messageStatus: "Account is still pending for wait for the admin approval!"
            })
        } else if (patients.status === "Declined") {
            return res.status(StatusCodes.NOT_FOUND).json({
                messageStatus: "Your account has been declined"
            })
        }

        let prefix = "Mr. "

        if (patients.gender === "Female") {
            const marital_status = patients.civilStatus;

            if (marital_status === "Married") {
                prefix = "Mrs. "
            } else if (marital_status === "Single") {
                prefix = "Ms. "
            }
        }

        // payload for jwt authentication
        const payload = {
            id: patients.patientID,
            fn: patients.firstName,
            ln: patients.lastName,
            em: patients.email,
            prx: prefix
        }

        // generate a access token
        const accessToken = jwt.sign(payload, SECRET_KEY, {
            expiresIn: "1hr"
        });

        // generate a refresh token
        const refreshToken = jwt.sign(payload, REFRESH_KEY_SECRET, {
            expiresIn: "7d"
        })

        // session token
        const sid = req.session.user = {
            patientID: patients.patientID,
            sfn: patients.firstName,
            sln: patients.lastName,
            sem: patients.email,
            sprefix: prefix
        }

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false, // Set to true if using HTTPS
            sameSite: "lax",
            domain: "localhost",
            path: "/"
        })

        return res.status(StatusCodes.OK).json({
            message: "Login successful",
            token: accessToken,
            sid: sid
        })
    } catch (error) {
        console.error(`Failed to login patient account: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to login patient account"
        });
    }
}

// controller logic for doctors login account 
export const loginDoctorsAccount = async (req, res) => {
    try {
        const { email, password } = req.body;

        const query = `SELECT 
            doctorsID,
            firstName,
            lastName,
            email,
            password FROM doctorsaccount
            WHERE email = ?;
        `;

        const [rows] = await conn.query(query, [email]);

        if (rows.length === 0) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                messageEmail: "Invalid Email Address"
            })
        }

        const doctorsUsers = rows[0];

        const isPasswordValid = await bcrypt.compare(password, doctorsUsers.password)
        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                messagePassword: "Invalid Password"
            })
        }

        const SECRET_KEY = process.env.JWT_SECRET
        if (!SECRET_KEY) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to login doctor account"
            });
        }

        const token = jwt.sign({
            id: doctorsUsers.doctorsID,
            firstName: doctorsUsers.firstName,
            lastName: doctorsUsers.lastName
        }, SECRET_KEY);

        const sid = req.session.user = {
            id: doctorsUsers.doctorsID,
            firstName: doctorsUsers.firstName,
            lastName: doctorsUsers.lastName,
        }

        return res.status(StatusCodes.OK).json({
            message: "Doctors Login Successful",
            token,
            sid: sid
        })
    } catch (error) {
        console.error(`Failed to login doctor account: ${error}`);
    }
}

// controller logic for logging in admin accounts
export const loginAdminAccount = async (req, res) => {
    try {
        const { email, password } = req.body;

        const query = `SELECT
            adminID,
            email,
            password
            FROM cmsadmin 
            WHERE email = ?;`;

        const [rows] = await conn.query(query, [email]);

        if (rows.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: {
                    email: "Incorrect email address"
                }
            })
        }

        const adminUsers = rows[0];

        // Compare password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, adminUsers.password);
        if (!isPasswordValid) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: {
                    password: "Invalid password"
                }
            })
        }

        const SECRET_KEY = process.env.JWT_SECRET
        const REFRESH_KEY_SECRET = process.env.REFRESH_KEY_SECRET;

        if (!SECRET_KEY) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to login admin account"
            });
        }

        if (!REFRESH_KEY_SECRET) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Refresh key enviroment variables is not defined"
            });
        }

        /**
         * jwt token payload details
         */
        const payload = {
            id: adminUsers.adminID,
            email: adminUsers.email
        }

        const accessToken = jwt.sign(payload, SECRET_KEY, {
            expiresIn: "1hr"
        })

        const refreshToken = jwt.sign(payload, REFRESH_KEY_SECRET, {
            expiresIn: "7d"
        })

        /**
         * session details
         */
        const sid = req.session.user = {
            id: adminUsers.adminID,
            email: adminUsers.email
        }

        res.cookie("refreshToken", refreshToken, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false, // Set to true if using HTTPS
            sameSite: "lax",
            domain: "localhost"
        })

        return res.status(StatusCodes.OK).json({
            message: "Admin Login Successful",
            token: accessToken,
            sid: sid
        })
    } catch (error) {
        console.error(`Failed to login admin account: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to login admin account"
        })
    }
}

// get session of the user
export const getLoggedInUser = (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "No active session. Please log in."
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "User session retrieved successfully",
            sid: req.session.user
        });
    } catch (sessionError) {
        console.error(`Failed to retrieve user session: ${sessionError}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error while retrieving user session"
        });
    }
};

// controller logic for checking if the user is authenticated
export const requireLogin = (req, res, next) => {
    try {
        // Check if the user is authenticated
        if (req.session.user) {
            logger.log("info", `Authorization Accepted. Verified Session`)
            return next();
        }

        // If not authenticated, return an unauthorized response
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Access Denied! Invalid token or missing an authorization header"
            });
        }

        // Extract the token from the authorization header
        const token = authorizationHeader.split(" ")[1];
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Access Denied! No token provided in the authorization header"
            });
        }

        // Verify the token
        const SECRET_KEY = process.env.JWT_SECRET;
        if (!SECRET_KEY) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Server configuration error: Missing JWT secret key"
            });
        }

        const decoded = jwt.verify(token, SECRET_KEY);

        req.session.user = decoded;
        logger.info(`Authorization Accepted. Verified session: ${decoded.id}`);
        // req.session.user = {
        //     patientID: decoded.patientID,
        //     sfn: decoded.firstName,
        //     sln: decoded.lastName,
        //     sem: decoded.email,
        //     sprefix: decoded.prefix// Default prefix if not provided
        // }

        next();
    } catch (error) {
        console.error(`Error in requireLogin middleware: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error while checking authentication"
        });
    }
};

// destroy the session request
export const logout = (req, res) => {
    if (!req.session) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "No active session found"
        });
    }

    req.session.destroy((err) => {
        if (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Logout failed"
            });
        }

        res.clearCookie("connect.sid", {
            sameSite: "lax",
            domain: "localhost",
            path: "/",
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: true
        })
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false, // Set to true if using HTTPS
            sameSite: "lax",
            domain: "localhost",
            path: "/"
        }); // remove session details

        return res.status(StatusCodes.OK).json({
            message: "Logged out successfully"
        });
    });
};

// controller logic for counting the total number of patients in row
export const getPatientsDashboard = async (req, res) => {
    try {
        const query = `
            SELECT 
            COUNT(*) AS total_count FROM (
            SELECT patientID FROM patientsregisteraccount1
            ) AS combined_tables;
        `;

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

        /**
         * correction for second table patientsregisteraccount2
         * column before pr2.registerPatientID
         * will back to the original pr2.registerPatientID column in inner joins when there's a issue
         */
        const query = `
            SELECT
                pr1.firstName,
                pr1.lastName,
                pr1.address,
                pr1.email,
                pr1.gender,
                pr2.phoneNumber
                FROM patientsregisteraccount1 AS pr1
                INNER JOIN
                patientsregisteraccount2 AS pr2
                ON pr1.patientID = pr2.patientID 
            WHERE pr1.patientID = ?;
        `;

        logger.log(`info`, `First table patient id column = ${patientID} is match with second table patient id foreign key column = ${patientID}`);

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
    const connection = await conn.getConnection();
    try {
        await connection.beginTransaction();

        const {
            patientID,
            firstName,
            lastName,
            email,
            appointmentDate,
            address,
            phoneNumber,
            gender,
            preferredTime,
            purposeOfAppointment,
            clinicID
        } = req.body;

        const createdAt = new Date()
        const clinic_id = parseInt(clinicID, 10);
        const appointmentDateFormat = dayjs(appointmentDate).format("YYYY-MM-DD");
        const status = String("Pending");
        const appointment_time = String(preferredTime)
        const followUpSent = parseInt(0);
        const reminder_sent = parseInt(0);
        const address_field = String(address);

        // Convert to 24-hour format before inserting into DB
        const normalizeTime = (timeStr) => {
            if (!timeStr || typeof timeStr !== "string") {
                throw new Error("Invalid time format");
            }

            const timeParts = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
            if (!timeParts) {
                throw new Error("Invalid time format");
            }

            let hours = parseInt(timeParts[1], 10);
            let minutes = parseInt(timeParts[2], 10);
            const modifier = timeParts[3].toUpperCase();

            if (modifier === "PM" && hours !== 12) hours += 12;
            if (modifier === "AM" && hours === 12) hours = 0;

            return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
        };

        const query = `INSERT INTO patientsappointment (
            patientID,
            firstName,
            lastName,
            email,
            appointmentDate,
            address,
            phoneNumber,
            gender,
            status,
            preferredTime,
            purposeOfAppointment,
            clinic_id,
            createdAt,
            reminder_sent,
            followUpSent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

        const [result] = await connection.query(query, [
            patientID,
            firstName,
            lastName,
            email,
            appointmentDateFormat,
            address_field,
            phoneNumber,
            gender,
            status,
            normalizeTime(appointment_time),
            purposeOfAppointment,
            clinic_id,
            createdAt,
            reminder_sent,
            followUpSent
        ]);

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Failed to book appointment"
            });
        }

        const retrieveAppointmentIDQuery = `
            SELECT 
                appointmentID,
                patientID,
                firstName,
                lastName,
                email,
                address,
                appointmentDate,
                phoneNumber,
                status,
                gender,
                preferredTime,
                purposeOfAppointment
            FROM patientsappointment
                WHERE appointmentID = ?;
        `

        const [appointmentRows] = await connection.query(retrieveAppointmentIDQuery, [
            result.insertId
        ])

        if (appointmentRows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No appointment found with the provided ID"
            });
        }

        /**
         * retrieve specific clinic information
         */
        const clinicQuery = `
            SELECT
                clinic_name,
                clinic_address
            FROM clinic
            WHERE clinic_id = ?;
        `

        const clinicValue = [
            clinic_id
        ]

        const [clinicRows] = await connection.query(clinicQuery, clinicValue);

        if (clinicRows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No clinic found with the provided ID"
            });
        }

        const clinicData = clinicRows[0];

        // send in background so booking response is not blocked by network issues
        try {
            sendAppointmentsConfirmation({
                ...appointmentRows[0],
                clinicName: clinicData.clinic_name,
                clinicAddress: clinicData.clinic_address
            });
            logger.log('info', `Appointment confirmation sent for appointment ID ${appointmentRows[0].appointmentID}`);
        } catch (error) {
            logger.log('error', `Failed to send appointment via local email: ${error}`);
            // optionally schedule retry by pushing to a queue or DB for later processing
        }

        await connection.commit();

        return res.status(StatusCodes.OK).json({
            message: "Appointment booked successfully",
            appointment: appointmentRows[0]
        });

    } catch (error) {
        const rollbackQuery = await connection.rollback();
        if (rollbackQuery) {
            logger.log(`error`, `Failed to rollback patient booked appointment: ${error}`)
        }

        console.error(`Failed to book appointments: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to book appointment"
        });
    } finally {
        connection.release();
    }
}

// controller logic to confirm the verification of token
export const confirmTokenVerification = (req, res) => {
    try {
        if (!req.user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Access Denied! Invalid token"
            })
        }

        return res.status(StatusCodes.OK).json({
            message: "Authorization Accepted and token verified successfully",
            user: req.user
        })
    } catch (jwtError) {
        console.error(`Failed to verify a token in controller: ${jwtError}`)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to verify a token"
        })
    }
}

/**
 * @function controller logic for protecting a route to verify the token
 */
export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Access Denied! Invalid token or missing an authorization header"
            })
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Access Denied! No token provided in the authorization header"
            })
        }

        const SECRET_KEY = process.env.JWT_SECRET;

        if (!SECRET_KEY) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Server configuration error: Missing JWT secret key"
            });
        }

        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            req.user = decoded;
            logger.info(`Authorization Accepted. Verified token: ${decoded.id}`);
            next();

        } catch (jwtError) {
            logger.error(`Invalid or Expired token in verify token controller : ${jwtError}`);
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Invalid or Expired token"
            });
        }
    } catch (error) {
        logger.error(`Error in verifyToken middleware: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error in verifying token"
        });
    }
}

// controller logic for getting patients appointments to display in table rows
export const getPatientsAppointments = async (req, res) => {
    try {
        const { email } = req.params;

        const email_address = String(email);

        if (!email_address) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid email address"
            })
        }

        const query = `SELECT
            c.clinic_name,
            p.appointmentID,
            p.firstName,
            p.lastName,
            p.email,
            p.address,
            p.appointmentDate,
            p.gender,
            p.preferredTime,
            p.phoneNumber,
            p.status,
            p.purposeOfAppointment
            FROM patientsappointment p
            INNER JOIN clinic c
            ON p.clinic_id = c.clinic_id
            WHERE p.email = ?
            ORDER BY p.appointmentDate DESC;
        `;

        const value = [
            email_address
        ]

        const [rows] = await conn.query(query, value);

        return res.status(StatusCodes.OK).json({
            patientsAppointments: rows
        })
    } catch (error) {
        console.error(`Failed to get patients appointments: ${error}`);
    }
}

// controller logic for retrieving the patients booked appointments to display in tables in clinic dashboard appointments
export const getBookedAppointmentsToDisplayInDoctorsDashboard = async (req, res) => {
    try {

        const { clinicID } = req.params;
        const query = `SELECT
            c.clinic_name,
            p.appointmentID,
            p.firstName,
            p.lastName,
            p.email,
            p.appointmentDate,
            p.gender,
            p.preferredTime,
            p.address,
            p.phoneNumber,
            p.status,
            p.purposeOfAppointment
            FROM patientsappointment p
            INNER JOIN clinic c
            ON p.clinic_id = c.clinic_id
            WHERE p.clinic_id = ?
            ORDER BY p.appointmentDate DESC, p.preferredTime DESC;
        `;

        const [rows] = await conn.query(query, [clinicID]);

        if (!rows.length) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No appointments found for the specified clinic"
            })
        }

        return res.status(StatusCodes.OK).json({
            patientsAppointments: rows
        });
    } catch (error) {
        console.error(`Failed to get booked appointments: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve booked appointments"
        })
    }
}

/**
 * @function controller logic for updating patients appointments details in clinic side
 * it will send a automated reminder to the patient email if the clinic staff updated the patient status
 * @access - {private}
 * @route doctors-dashboard/updateAppointment/:appointmentID
 */
export const updatePatientsAppointments = async (req, res) => {
    const connection = await conn.getConnection();
    try {
        const { appointmentID } = req.params;

        await connection.beginTransaction();
        if (!appointmentID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid appointment ID"
            });
        }

        const {
            firstName,
            lastName,
            appointmentDate,
            email,
            address,
            phoneNumber,
            gender,
            status,
            preferredTime,
            purposeOfAppointment
        } = req.body;

        // Debug log to check the received appointmentID and body
        console.log(`Received appointmentID: ${appointmentID}`);

        const status_query = `
            SELECT status
            FROM patientsappointment
            WHERE appointmentID = ?;
        `
        const [current_appointment] = await conn.query(status_query, [appointmentID]);

        if (current_appointment.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No appointments found with the provided Patient ID"
            });
        }

        const formattedAppointmentDate = dayjs(appointmentDate).format("YYYY-MM-DD");
        const formattedPreferredTime = preferredTime ? preferredTime.slice(0, 5) : null;

        const query = `
            UPDATE patientsappointment
            SET
                firstName = ?,
                lastName = ?,
                email = ?,
                address = ?,
                appointmentDate = ?,
                preferredTime = ?,
                phoneNumber = ?,
                gender = ?,
                status = ?,
                purposeOfAppointment = ?
            WHERE appointmentID = ?;
            `;

        // Execute the query
        const [result] = await conn.query(query, [
            firstName,
            lastName,
            email,
            address,
            formattedAppointmentDate,
            formattedPreferredTime,
            phoneNumber,
            gender,
            status,
            purposeOfAppointment,
            appointmentID
        ]);

        // Check if any rows were affected
        if (result.affectedRows === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No appointments found with the provided Patient ID"
            });
        }

        await connection.commit();

        /**
         * if the status of the appointment has been changed, trigger the automated status update
         */
        if (current_appointment.length > 0 && current_appointment[0].status !== status) {
            try {
                const clinic_instance = new Clinic();
                await clinic_instance.handleAutomatedUpdateStatus({
                    appointmentID: parseInt(appointmentID),
                    status: status
                })
            } catch (error) {
                logger.error(`Failed to update patients appointments: ${error}`);
            }
        }
        // Return success response
        return res.status(StatusCodes.OK).json({
            message: "Patients appointments updated successfully"
        });

    } catch (error) {
        const rollbackQuery = await connection.rollback();
        if (!rollbackQuery) {
            logger.log(`error`, `Failed to rollback transaction: ${error}`);
        }

        console.error(`Failed to update patients appointments: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to update patients appointments"
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// controller logic for adding a new doctor in admin dashboard
export const addDoctor = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            medicalSpecialties,
            yearsOfExperience,
            consultationFee,
            gender,
            password
        } = req.body;

        const saltRounds = 10;

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = `INSERT INTO doctorsaccount (
            firstName,
            lastName,
            email,
            medicalSpecialties,
            yearsOfExperience,
            consultationFee,
            gender,
            password
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;

        const [result] = await conn.query(query, [
            firstName,
            lastName,
            email,
            medicalSpecialties,
            yearsOfExperience,
            consultationFee,
            gender,
            hashedPassword
        ]);

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Failed to add doctor"
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "Doctor added successfully"
        });
    } catch (error) {
        console.error(`Failed to add doctor: ${error}`);
    }
}

// controller logic for getting the total number of doctors in the row
export const getDoctorsLists = async (req, res) => {
    try {
        const query = `SELECT
            doctorsID,
            firstName,
            lastName,
            email,
            medicalSpecialties,
            yearsOfExperience,
            consultationFee,
            gender
            FROM doctorsaccount ORDER BY doctorsID ASC;`;

        const [rows] = await conn.query(query);

        if (rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No doctors found"
            });
        }

        return res.status(StatusCodes.OK).json({
            doctors: rows
        })
    } catch (error) {
        console.error(`Failed to get doctors lists: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve doctors lists"
        })
    }
}

// controller logic for updating doctors details
export const updateDoctorsDetails = async (req, res) => {
    try {
        const { doctorsID } = req.params;
        const {
            firstName,
            lastName,
            email,
            medicalSpecialties,
            yearsOfExperience,
            consultationFee,
            gender,
            password
        } = req.body;

        const first_name = String(firstName);
        const last_name = String(lastName);
        const email_address = String(email);
        const medical_specialties = String(medicalSpecialties);
        const years_of_experience = String(yearsOfExperience);
        const consultation_fee = String(consultationFee);
        const sex = String(gender);
        const pass_word = String(password);

        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(pass_word, saltRound);

        const query = `
            UPDATE doctorsaccount
            SET
                firstName = ?,
                lastName = ?,
                email = ?,
                medicalSpecialties = ?,
                yearsOfExperience = ?,
                consultationFee = ?,
                gender = ?,
                password = ?
            WHERE doctorsID = ?;
        `;

        const [result] = await conn.query(query, [
            first_name,
            last_name,
            email_address,
            medical_specialties,
            years_of_experience,
            consultation_fee,
            sex,
            hashedPassword,
            doctorsID
        ]);

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No doctors found with the provided ID"
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "Doctors account updated successfully"
        });
    } catch (error) {
        console.error(`Failed to update doctors account: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to update doctors account"
        });
    }
}

// controller logic for deleting doctors details in admin dashboard
export const deleteDoctorsDetails = async (req, res) => {
    try {
        const { doctorsID } = req.params;

        const query = `DELETE FROM doctorsaccount WHERE doctorsID = ?;`;

        const [result] = await conn.query(query, [doctorsID]);

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No doctors found with the provided ID"
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "Doctors account deleted successfully"
        });
    } catch (error) {
        console.error(`Failed to delete doctors account: ${error}`);
    }
}

// controller logic for creating a new clinic in admin dashboard
export const createClinic = async (req, res) => {
    const connection = await conn.getConnection();
    try {
        await connection.beginTransaction();
        const {
            clinicName,
            clinicAddress,
            clinicEmail,
            password,
            confirmPassword,
            clinicType,
            clinicPhoneNumber,
            openingDays,
            closingDays,
            openingHours,
            closingHours,
            consultationFee,
            adminID,
        } = req.body;

        const formatTimeTo24HR = (time) => {
            if (!time) return null;

            // Match HH:MM and optional AM/PM (case-insensitive)
            const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
            if (!match) return null;

            let [_, hourStr, minuteStr, ampm] = match;
            let hour = parseInt(hourStr, 10);
            const minute = parseInt(minuteStr, 10);

            if (ampm) {
                ampm = ampm.toUpperCase();
                if (ampm === 'PM' && hour < 12) hour += 12;
                if (ampm === 'AM' && hour === 12) hour = 0;
            }

            return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
        };

        const clinic_name = String(clinicName);
        const clinic_address = String(clinicAddress);
        const clinic_date_open = String(openingDays);
        const clinic_time_open = formatTimeTo24HR(openingHours);
        const consultation_fee = String(consultationFee);
        const clinic_PhoneNumber = String(clinicPhoneNumber);
        const email_address = String(clinicEmail);
        const clinic_password = String(password);
        const clinic_confirm_password = String(confirmPassword);
        const clinic_type = String(clinicType);
        const clinic_close_date = String(closingDays);
        const clinic_close_time = formatTimeTo24HR(closingHours);
        const admin_id = parseInt(adminID);

        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(clinic_password, saltRound);
        const hashedConfirmPassword = await bcrypt.hash(clinic_confirm_password, saltRound);

        const MAX_CLINIC_IMAGE_SIZE = 1024 * 1024 * 10; // 10MB
        const MAX_PRC_LICENSE_PHOTO_SIZE = 1024 * 1024 * 10; // 10MB

        if (!req.files || !req.files.clinicImage) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: {
                    clinicImage: "Clinic image is required"
                }
            });
        }

        if (!req.files || !req.files.prcLicensePhoto) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: {
                    prcLicensePhoto: "PRC license photo is required"
                }
            });
        }

        const clinic_image = req.files.clinicImage[0];
        const prc_license_photo = req.files.prcLicensePhoto[0];

        if (req.files?.clinicImage?.[0]?.size > MAX_CLINIC_IMAGE_SIZE) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: {
                    clinicImage: "Clinic image size exceeds 10MB limit"
                }
            });
        }

        if (req.files?.prcLicensePhoto?.[0]?.size > MAX_PRC_LICENSE_PHOTO_SIZE) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: {
                    prcLicensePhoto: "PRC license photo size exceeds 10MB limit"
                }
            });
        }

        const clinic_columns = [
            "clinic_name",
            "clinic_address",
            "clinic_date_open",
            "clinic_time",
            "consultation_fee",
            "phoneNumber",
            "email",
            "password",
            "confirm_password",
            "clinic_type",
            "clinic_image",
            "prc_license_photo",
            "clinic_close_date",
            "clinic_close_time",
            "created_by"
        ];

        const clinic_values_placeholders = clinic_columns.map(() => `?`).join(", ");
        const query = `INSERT INTO clinic (
            ${clinic_columns.join(", ")}
        ) VALUES (${clinic_values_placeholders});`;

        const [result] = await conn.query(query, [
            clinic_name,
            clinic_address,
            clinic_date_open,
            clinic_time_open,
            consultation_fee,
            clinic_PhoneNumber,
            email_address,
            hashedPassword,
            hashedConfirmPassword,
            clinic_type,
            clinic_image.filename,
            prc_license_photo.filename,
            clinic_close_date,
            clinic_close_time,
            admin_id,
        ]);

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Failed to create clinic"
            });
        }

        const commitQuery = await connection.commit();
        if (!commitQuery) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to commit transaction"
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "Clinic created successfully"
        });
    } catch (error) {
        const rollbackQuery = await connection.rollback();
        if (!rollbackQuery) {
            console.error(`Failed to rollback transaction: ${error}`);
        }

        console.error(`Failed to create clinic: ${error}`);
        return res.status(500).json({
            message: `Failed to create clinic account in admin access: ${error.message}`,
            error: error.message
        });
    } finally {
        if (connection) {
            connection.release(); // Release the connection back to the pool
        }
    }
}

// controller logic for getting the list of clinics in the admin dashboard
export const getClinics = async (req, res) => {
    try {
        const query = `SELECT
            clinic_id,
            clinic_name,
            clinic_address,
            clinic_date_open,
            clinic_time,
            consultation_fee,
            clinic_type,
            phoneNumber,
            email,
            clinic_type,
            clinic_image,
            clinic_close_date,
            clinic_close_time
            FROM clinic
        `;

        const [rows] = await conn.query(query);

        if (rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No clinics found"
            });
        }

        return res.status(StatusCodes.OK).json({
            clinics: rows
        });

    } catch (error) {
        console.error(`Failed to get clinics: ${error}`);
    }
}

// controller logic for filtering the clinic details in search field in patients dashboard
export const filterClinicDetails = async (req, res) => {
    try {
        const {
            clinicName,
            clinicType,
            clinicAddress,
            phoneNumber,
            emailAddress,
            clinicImage,
            businessOpenHours,
            businessClosingHours
        } = req.query;

        const clinic_name = String(clinicName)
        const clinic_type = String(clinicType);
        const clinic_address = String(clinicAddress);
        const phone_number = String(phoneNumber);
        const email_address = String(emailAddress);
        const clinic_image = String(clinicImage);
        const business_open_hours = String(businessOpenHours);
        const business_closing_hours = String(businessClosingHours);

        let query = `SELECT
            clinic_name,
            clinic_address,
            clinic_type,
            clinic_image,
            clinic_time,
            clinic_id,
            phoneNumber,
            clinic_date_open,
            clinic_close_date,
            consultation_fee,
            clinic_close_time,
            email
            FROM clinic
        `

        const params = [];

        if (clinicName) {
            query += `WHERE clinic_name LIKE ?`;
            params.push(`%${clinic_name}%`);
        }

        if (clinic_address) {
            if (params.length > 0) {
                query += `OR clinic_address LIKE ?`;
            } else {
                query += `WHERE clinic_address LIKE ?`
            }
            params.push(`%${clinic_address}%`);
        }

        if (clinic_type) {
            if (params.length > 0) {
                query += `OR clinic_type LIKE ?`;
            } else {
                query += `WHERE clinic_type LIKE ?`;
            }
            params.push(`%${clinic_type}%`);
        }

        if (clinic_image) {
            if (params.length > 0) {
                query += `OR clinic_image LIKE ?`;
            } else {
                query += `WHERE clinic_image LIKE ?`
            }
            params.push(`%${clinic_image}%`);
        }

        if (phone_number) {
            if (params.length > 0) {
                query += `OR phoneNumber LIKE ?`;
            } else {
                query += `WHERE phoneNumber LIKE ?`
            }
            params.push(`%${phone_number}%`);
        }

        if (email_address) {
            if (params.length > 0) {
                query += `OR email LIKE ?`;
            } else {
                query += `WHERE email LIKE ?`
            }
            params.push(`%${email_address}%`);
        }

        if (business_open_hours) {
            if (params.length > 0) {
                query += `OR clinic_time LIKE ?`;
            } else {
                query += `WHERE clinic_time LIKE ?`
            }
            params.push(`%${business_open_hours}%`);
        }

        if (business_closing_hours) {
            if (params.length > 0) {
                query += `OR clinic_close_time LIKE ?`;
            } else {
                query += `WHERE clinic_close_time LIKE ?`
            }
            params.push(`%${business_closing_hours}%`);
        }

        query += `ORDER BY clinic_id ASC`

        const [rows] = await conn.query(query, params);

        if (rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No filter clinic details"
            });
        }

        return res.status(StatusCodes.OK).json({
            clinics: rows
        })
    } catch (error) {
        console.error(`Failed to filter clinic details: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to filter clinic details"
        });
    }
}

// controller logic for getting the patients pending status in patients dashboard
export const getPatientPendingStatus = async (req, res) => {
    try {
        const status = "Pending";

        const { email } = req.params

        if (!email) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid email address"
            })
        }

        const emailAddress = String(email)

        const query = `
            SELECT
            clinic.clinic_name,
            patientsappointment.firstName,
            patientsappointment.lastName,
            patientsappointment.email,
            patientsappointment.phoneNumber,
            patientsappointment.preferredTime,
            patientsappointment.address,
            patientsappointment.appointmentDate,
            patientsappointment.status,
            patientsappointment.purposeOfAppointment
            FROM patientsappointment
            INNER JOIN clinic ON patientsappointment.clinic_id = clinic.clinic_id
            WHERE patientsappointment.status = ? AND patientsappointment.email = ? 
            ORDER BY patientsappointment.appointmentDate DESC;
        `

        const [rows] = await conn.query(query, [status, emailAddress]);

        if (rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No pending status found"
            });
        }

        return res.status(StatusCodes.OK).json({
            patientsPendingStatus: rows
        })

    } catch (error) {
        console.error(`Failed to get patients pending status: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to get patients pending status"
        });
    }
}

// controller logic for logging in clinic's account
export const loggedInClinicAccount = async (req, res) => {
    const { email, password } = req.body;
    try {
        const emailAddress = String(email).toLowerCase();
        const query = `
            SELECT 
            clinic_id,
            clinic_name,
            email,
            clinic_type,
            password
            FROM
            clinic
            WHERE email = ?;`;

        const [rows] = await conn.query(query, [emailAddress]);

        if (rows.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: {
                    email: "Incorrect email address"
                }
            })
        }

        const clinicUsers = rows[0];

        const SECRET_KEY = process.env.JWT_SECRET;
        if (!SECRET_KEY) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to login clinic account"
            });
        }

        const REFRESH_KEY = process.env.REFRESH_KEY_SECRET;
        if (!REFRESH_KEY) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to login clinic account"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, clinicUsers.password);
        if (!isPasswordValid) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: {
                    password: "Incorrect password"
                }
            })
        }

        const payload = {
            id: clinicUsers.clinic_id,
            email: clinicUsers.email,
            clinic_name: clinicUsers.clinic_name,
            clinic_type: clinicUsers.clinic_type
        }

        /**
         * @description generate a access token for the clinic account
         * expires in 1 hour
         */
        const accessToken = jwt.sign(payload, SECRET_KEY, {
            expiresIn: "1hr"
        });

        const refreshToken = jwt.sign(payload, REFRESH_KEY, {
            expiresIn: "7d"
        });

        const sid = req.session.user = {
            id: clinicUsers.clinic_id,
            scn: clinicUsers.clinic_name,
            sem: clinicUsers.email,
            stype: clinicUsers.clinic_type
        }

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: "lax",
            domain: "localhost",
            path: "/"
        })

        return res.status(StatusCodes.OK).json({
            message: "Clinic Login Successful",
            accessToken: accessToken,
            sid: sid
        })
    } catch (error) {
        console.error(`Failed to login clinic account: ${error}`);
    }
}

// controller logic for getting the approved patients status
export const getPatientApprovedStatus = async (req, res) => {
    try {
        const status = "Approved";

        const { email } = req.params

        if (!email) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid email address"
            })
        }

        const emailAddress = String(email)

        const query = `
            SELECT
            clinic.clinic_name,
            patientsappointment.firstName,
            patientsappointment.lastName,
            patientsappointment.email,
            patientsappointment.address,
            patientsappointment.phoneNumber,
            patientsappointment.preferredTime,
            patientsappointment.appointmentDate,
            patientsappointment.status,
            patientsappointment.purposeOfAppointment
            FROM patientsappointment
            INNER JOIN clinic ON patientsappointment.clinic_id = clinic.clinic_id
            WHERE patientsappointment.status = ? AND patientsappointment.email = ?
            ORDER BY patientsappointment.appointmentDate DESC, patientsappointment.preferredTime DESC;
        `

        const [rows] = await conn.query(query, [status, emailAddress]);

        if (rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No approved status found"
            });
        }

        return res.status(StatusCodes.OK).json({
            patientsApprovedStatus: rows
        })

    } catch (error) {
        console.error(`Failed to get patients approved status: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to get patients approved status"
        });
    }
}

/*
    controller logic for getting the declined patients status in patients dashboard
*/

export const getPatientsDeclinedStatus = async (req, res) => {
    try {
        const status = "Declined";

        const { email } = req.params

        if (!email) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid email address"
            })
        }

        const emailAddress = String(email)

        const query = `
            SELECT
            clinic.clinic_name,
            patientsappointment.firstName,
            patientsappointment.lastName,
            patientsappointment.email,
            patientsappointment.phoneNumber,
            patientsappointment.preferredTime,
            patientsappointment.address,
            patientsappointment.appointmentDate,
            patientsappointment.status,
            patientsappointment.purposeOfAppointment
            FROM patientsappointment
            INNER JOIN clinic ON patientsappointment.clinic_id = clinic.clinic_id
            WHERE patientsappointment.status = ? AND patientsappointment.email = ?
            ORDER BY patientsappointment.appointmentDate ASC;
        `

        const [rows] = await conn.query(query, [status, emailAddress]);

        if (rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No declined status found"
            });
        }

        return res.status(StatusCodes.OK).json({
            patientsDeclinedStatus: rows
        })

    } catch (error) {
        console.error(`Failed to get patients declined status: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to get patients declined status"
        });
    }
}
/*

    controller logic for getting the pending patients status in clinic's dashboard

*/
export const getPendingAppointmentStatus = async (req, res) => {
    try {
        const { clinicID } = req.params;

        if (!clinicID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid clinic ID"
            })
        }

        const status = "Pending";

        const query = `SELECT
            c.clinic_name,
            p.appointmentID,
            p.firstName,
            p.lastName,
            p.email,
            p.appointmentDate,
            p.address,
            p.preferredTime,
            p.gender,
            p.phoneNumber,
            p.status,
            p.purposeOfAppointment
            FROM patientsappointment p
            INNER JOIN clinic c
            ON p.clinic_id = c.clinic_id
            WHERE p.clinic_id = ? AND p.status = ?
            ORDER BY p.appointmentDate DESC, p.preferredTime DESC;
        `;

        const [rows] = await conn.query(query, [clinicID, status]);

        if (!rows.length) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No pending status found"
            })
        }

        return res.status(StatusCodes.OK).json({
            patientsPendingStatus: rows
        });
    } catch (error) {
        console.error(`Failed to get pending status appointments: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to pending status booked appointments"
        })
    }
}

// controller logic for getting the approved patients status in clinic's dashboard
export const getApprovedAppointmentStatusInClinic = async (req, res) => {
    try {
        const { clinicID } = req.params;

        if (!clinicID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid clinic ID"
            })
        }

        const status = "Approved";

        // query of two tables clinic and patients appointment
        const query = `SELECT
            c.clinic_name,
            c.clinic_type,
            p.appointmentID,
            p.firstName,
            p.lastName,
            p.email,
            p.address,
            p.appointmentDate,
            p.preferredTime,
            p.gender,
            p.phoneNumber,
            p.status,
            p.purposeOfAppointment
            FROM patientsappointment p
            INNER JOIN clinic c
            ON p.clinic_id = c.clinic_id
            WHERE p.clinic_id = ? AND p.status = ?
            ORDER BY p.appointmentDate DESC, p.preferredTime DESC;
        `;

        const [rows] = await conn.query(query, [clinicID, status]);

        if (!rows.length) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No approved status found"
            })
        }

        return res.status(StatusCodes.OK).json({
            patientsApprovedStatus: rows
        });
    } catch (error) {
        console.error(`Failed to get approved status appointments: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve approved status appointments"
        })
    }
}
// controller logic for getting the declined patients status in clinic's dashboard
export const getDeclinedAppointmentStatusInClinic = async (req, res) => {
    try {
        const { clinicID } = req.params;

        if (!clinicID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid clinic ID"
            })
        }

        const status = "Declined";

        const query = `SELECT
            c.clinic_name,
            p.appointmentID,
            p.firstName,
            p.lastName,
            p.email,
            p.address,
            p.appointmentDate,
            p.preferredTime,
            p.gender,
            p.phoneNumber,
            p.status,
            p.purposeOfAppointment
            FROM patientsappointment p
            INNER JOIN clinic c
            ON p.clinic_id = c.clinic_id
            WHERE p.clinic_id = ? AND p.status = ?
            ORDER BY p.appointmentDate DESC, p.preferredTime DESC;
        `;

        const [rows] = await conn.query(query, [clinicID, status]);

        if (!rows.length) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No declined status found"
            })
        }

        return res.status(StatusCodes.OK).json({
            patientsDeclinedStatus: rows
        });
    } catch (error) {
        console.error(`Failed to get declined status appointments: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve declined status appointments"
        })
    }
}

// controller logic for getting the registered patients account in admin dashboard
export const getRegisteredPatientsAccountInAdmin = async (req, res) => {
    try {
        const query = `
            SELECT
            patientsregisteraccount1.patientID,
            patientsregisteraccount1.firstName,
            patientsregisteraccount1.lastName,
            patientsregisteraccount1.email,
            patientsregisteraccount1.address,
            patientsregisteraccount1.gender,
            patientsregisteraccount1.civilStatus,
            patientsregisteraccount1.dateOfBirth,
            patientsregisteraccount2.phoneNumber,
            patientsregisteraccount2.status
            FROM patientsregisteraccount1
            INNER JOIN patientsregisteraccount2
            ON patientsregisteraccount1.patientID = patientsregisteraccount2.patientID
            ORDER BY patientsregisteraccount1.patientID DESC;
        `

        const [rows] = await conn.query(query);

        if (rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No registered patients account found"
            })
        }

        return res.status(StatusCodes.OK).json({
            registeredPatientsAccount: rows
        })
    } catch (error) {
        console.error(`Failed to get registered patients account: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve registered patients account"
        })
    }
}

// controller logic for updating the registered patients account in admin dashboard
export const updateRegisteredPatientsAccountInAdmin = async (req, res) => {
    const connection = await conn.getConnection();
    try {
        await connection.beginTransaction();

        const {
            firstName,
            lastName,
            email,
            address,
            civilStatus,
            dateOfBirth,
            phoneNumber,
            status
        } = req.body;

        const { patientID } = req.params;

        const first_name = String(firstName);
        const last_name = String(lastName);
        const email_address = String(email);
        const patient_address = String(address);
        const civil_status = String(civilStatus);
        const date_of_birth = dayjs(dateOfBirth).format("YYYY-MM-DD");
        const phone_number = String(phoneNumber);
        const patient_status = String(status);

        const query = `
            UPDATE patientsregisteraccount1 AS p1
            INNER JOIN patientsregisteraccount2 AS p2
            ON p1.patientID = p2.patientID
            SET
            p1.firstName = ?,
            p1.lastName = ?,
            p1.email = ?,
            p1.address = ?,
            p1.civilStatus = ?,
            p1.dateOfBirth = ?,
            p2.phoneNumber = ?,
            p2.status = ?
            WHERE p1.patientID = ?;
        `

        const values = [
            first_name,
            last_name,
            email_address,
            patient_address,
            civil_status,
            date_of_birth,
            phone_number,
            patient_status,
            patientID
        ];

        const [result] = await connection.query(query, values);

        await connection.commit();

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No registered patients account found with the provided ID"
            })
        }

        try {
            await sendPatientAccountStatusNotification({
                email: email_address,
                firstName: first_name,
                lastName: last_name,
                status: patient_status
            });
        } catch (error) {
            logger.log(`error`, `Failed to send a patient account status update via email: ${error}`);
        }

        return res.status(StatusCodes.OK).json({
            message: "Registered patients account updated successfully"
        })

    } catch (error) {
        const rollbackQuery = await connection.rollback();
        if (!rollbackQuery) {
            logger.log(`error`, `Failed to rollback transaction when updating the registered patients account: ${error}`);
        }

        logger.log(`error`, `Failed to update registered patients account: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to update registered patients account"
        })
    } finally {
        connection.release();
    }
}
/**
 * @function controller logic consulting a patient based on clinic questionnaires and clncic types
 * @access {private}
 * @route {POST} /clinic-dashboard/consultPatient - patient side
 */
export const consultPatientInClinicDashboard = async (req, res) => {
    const connection = await conn.getConnection();

    try {
        await connection.beginTransaction();

        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            appointmentDate, //patient information req.body
            preferredTime,
            allergiesDetails,
            takingPrescriptionMedicationDetails,
            chronicConditionDetails,
            surgeriesDetails,
            jawPainDetails,
            experiencedExcessiveBleedingDetails,
            heartProblemsDetails,
            advisedTakingAntibioticsDetails, //medical history req.body
            smokeDetails,
            consumeSugaryFoodsOrDrinksDetails,
            dentalFlossDetails,
            consumeAlcoholDetails,
            participateInSportsDetails,
            balancedDietDetails,
            regularExerciseDetails,
            eatingDisordersDetails, //lifestyle information req.body
            experienceBleedingDetails,
            toothSensitivityDetails,
            dentalAppearanceDetails,
            looseTeethDetails,
            badBreathOrBadTasteDetails,
            dentalXraysDetails,
            dentalRestorationDetails,
            orthodonticTreatmentDetails, //clinical assessment req.body
            brushFrequencyDetails,
            useMouthWashDetails,
            replaceToothbrushDetails,
            cleanTongueDetails,
            regularCheckupDetails,
            dentalAnxietyDetails,
            dentalTraumaDetails, // oral hygiene habits req.body
            clinic_name,
            consent,
            admin_id,
            appointmentID
        } = req.body;

        /**
         * Pschiatry request body 
         */
        const {
            /**
             * mental health history req.body
             */
            diagnosedMentalHealthConditionDetails,
            takingPsychiatricMedicationDetails,
            hospitalizedForMentalHealthReasonDetails,
            familyHistoryOfMentalHealthConditionsDetails,
            suicidalThoughtsOrBehaviorsDetails,
            selfHarmOrSuicideDetails,
            counselingOrTherapyDetails,
            emotionalOrBehavioralPatternsDetails,
            /**
             * current symtoms req.body
             */
            moodDetails,
            excessiveWorryOrAnxietyDetails,
            sleepPatternsDetails,
            appetiteOrWeightDetails,
            sleepChangesDetails,
            hopelessnessOrWorthlessnessDetails,
            agitationOrImpulsivityDetails,
            difficultyConcentratingDetails,
            /**
             * lifestyle factors req.body
             */
            stressLevelsDetails,
            supportSystemDetails,
            majorLifeChangesDetails,
            substancesDetails,
            sleepHoursDetails,
            socialGroupsDetails,
            livingSituationDetails,
            copingWithStressDetails,
            /**
             * treatment history req.body
             */
            mentalHealthTreatmentDetails,
            treatmentHistoryDetails,
            currentlyInTherapyDetails,
            negativeExperienceWithMentalHealthTreatmentDetails,
            currentlyUnderCareOfPsychiatristDetails,
            stoppedTakingPsychiatricMedicationsDetails,
            sideEffectsFromPsychiatricMedicationsDetails,
            consistentWithAttendingTherapyOrTakingMedicationsDetails
        } = req.body

        const { clinicType } = req.query;

        const clinic_type = decodeURIComponent(String(clinicType))

        // Format and validate fields
        const first_name = String(firstName)
        const last_name = String(lastName)
        const email_address = String(email);
        const phone_number = String(phoneNumber)
        const appointment_date = dayjs(appointmentDate).format("YYYY-MM-DD")
        const appointment_time = dayjs(preferredTime).format("hh:mm")

        /*
            Medical history variable
        */
        const allergies_details = String(allergiesDetails)
        const taking_prescription_medication_details = String(takingPrescriptionMedicationDetails)
        const chronic_condition_details = String(chronicConditionDetails)
        const surgeries_details = String(surgeriesDetails)
        const jaw_pain_details = String(jawPainDetails)
        const experienced_excessive_bleeding_details = String(experiencedExcessiveBleedingDetails)
        const heart_problems_details = String(heartProblemsDetails)
        const advised_taking_antibiotics_details = String(advisedTakingAntibioticsDetails)
        /* 
            Lifestyle information variable
        */
        const smoking_frequency_details = String(smokeDetails)
        const sugary_foods_or_drinks_details = String(consumeSugaryFoodsOrDrinksDetails)
        const dental_floss_details = String(dentalFlossDetails)
        const consume_alcohol_details = String(consumeAlcoholDetails)
        const sports_participation_details = String(participateInSportsDetails)
        const balanced_diet_details = String(balancedDietDetails)
        const regular_exercise_details = String(regularExerciseDetails)
        const eating_disorders_details = String(eatingDisordersDetails)
        /* 
            Clinical assessments variable
        */
        const experience_bleeding_details = String(experienceBleedingDetails)
        const tooth_sensitivity_details = String(toothSensitivityDetails)
        const dental_appearance_details = String(dentalAppearanceDetails)
        const loose_teeth_details = String(looseTeethDetails)
        const bad_breath_or_bad_taste_details = String(badBreathOrBadTasteDetails)
        const dental_xrays_details = String(dentalXraysDetails)
        const dental_restoration_details = String(dentalRestorationDetails)
        const orthodontic_treatment_details = String(orthodonticTreatmentDetails)
        /*
            Oral hygiene habits variable
        */
        const brush_frequency_details = String(brushFrequencyDetails);
        const use_mouthwash_details = String(useMouthWashDetails);
        const replace_toothbrush_details = String(replaceToothbrushDetails);
        const clean_tongue_details = String(cleanTongueDetails);
        const regular_checkup_details = String(regularCheckupDetails);
        const dental_anxiety_details = String(dentalAnxietyDetails);
        const dental_trauma_details = String(dentalTraumaDetails);

        /**
         * Psychiatry Clinic variables
         */
        /**
         * mental health history variables
         */
        const diagnosed_mental_health_condition_details = String(diagnosedMentalHealthConditionDetails);
        const taking_psychiatric_medication_details = String(takingPsychiatricMedicationDetails);
        const hospitalized_for_mental_health_reason_details = String(hospitalizedForMentalHealthReasonDetails);
        const family_history_of_mental_health_conditions_details = String(familyHistoryOfMentalHealthConditionsDetails);
        const suicidal_thoughts_or_behaviors_details = String(suicidalThoughtsOrBehaviorsDetails);
        const self_harm_or_suicide_details = String(selfHarmOrSuicideDetails);
        const counseling_or_therapy_details = String(counselingOrTherapyDetails);
        const emotional_or_behavioral_patterns_details = String(emotionalOrBehavioralPatternsDetails);

        /**
         * current symptoms variables
         */
        const mood_details = String(moodDetails);
        const excessive_worry_or_anxiety_details = String(excessiveWorryOrAnxietyDetails);
        const sleep_patterns_details = String(sleepPatternsDetails);
        const appetite_or_weight_details = String(appetiteOrWeightDetails);
        const sleep_changes_details = String(sleepChangesDetails);
        const hopelessness_or_worthlessness_details = String(hopelessnessOrWorthlessnessDetails);
        const agitation_or_impulsivity_details = String(agitationOrImpulsivityDetails);
        const difficulty_concentrating_details = String(difficultyConcentratingDetails);

        /**
         * Lifestyle factors variables
         */
        const stress_levels_details = String(stressLevelsDetails);
        const support_system_details = String(supportSystemDetails);
        const major_life_changes_details = String(majorLifeChangesDetails);
        const substances_details = String(substancesDetails);
        const sleep_hours_details = String(sleepHoursDetails);
        const social_groups_details = String(socialGroupsDetails);
        const living_situation_details = String(livingSituationDetails);
        const coping_with_stress_details = String(copingWithStressDetails);

        /**
         * Treatment history variables
         */
        const mental_health_treatment_details = String(mentalHealthTreatmentDetails);
        const treatment_history_details = String(treatmentHistoryDetails);
        const currently_in_therapy_details = String(currentlyInTherapyDetails);
        const negative_experience_with_mental_health_treatment_details = String(negativeExperienceWithMentalHealthTreatmentDetails);
        const currently_under_care_of_psychiatrist_details = String(currentlyUnderCareOfPsychiatristDetails);
        const stopped_taking_psychiatric_medications_details = String(stoppedTakingPsychiatricMedicationsDetails);
        const side_effects_from_psychiatric_medications_details = String(sideEffectsFromPsychiatricMedicationsDetails);
        const consistent_with_attending_therapy_or_taking_medications_details = String(consistentWithAttendingTherapyOrTakingMedicationsDetails);

        const consent_value = Number(consent);
        const clinic_name_field = String(clinic_name);

        // Parse IDs with validation
        const admin_id_field = parseInt(admin_id, 10);
        if (isNaN(admin_id_field)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid admin_id var format"
            });
        }

        const appointment_id = parseInt(appointmentID, 10);
        if (isNaN(appointment_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid appointment_id var format"
            });
        }

        if (clinic_type === "Dental Clinic") {
            const values = [
                appointment_id,
                first_name,
                last_name,
                email_address,
                phone_number,
                appointment_date,
                appointment_time, // patient information values
                allergies_details,
                taking_prescription_medication_details,
                chronic_condition_details,
                surgeries_details,
                jaw_pain_details,
                experienced_excessive_bleeding_details,
                heart_problems_details,
                advised_taking_antibiotics_details, // medical history values
                smoking_frequency_details,
                sugary_foods_or_drinks_details,
                dental_floss_details,
                consume_alcohol_details,
                sports_participation_details,
                balanced_diet_details,
                regular_exercise_details,
                eating_disorders_details, // lifestyle information values
                experience_bleeding_details,
                tooth_sensitivity_details,
                dental_appearance_details,
                loose_teeth_details,
                bad_breath_or_bad_taste_details,
                dental_xrays_details,
                dental_restoration_details,
                orthodontic_treatment_details, // clinical assessment values
                brush_frequency_details,
                use_mouthwash_details,
                replace_toothbrush_details,
                clean_tongue_details,
                regular_checkup_details,
                dental_anxiety_details,
                dental_trauma_details, // oral hygiene habits values
                clinic_name_field,
                consent_value,
                admin_id_field
            ]

            const query = `INSERT INTO consultedpatients (
                appointmentID,
                patient_first_name,
                patient_last_name,
                patient_email,
                phone_number,
                appointment_date,
                appointment_time,
                allergy_details,
                taking_prescription_medication_details,
                chronic_condition_details,
                past_surgeries_details,
                history_of_jaw_pain_details,
                experienced_excessive_bleeding_details,
                past_history_of_cardiovascular_issues,
                advised_taking_antibiotics_details,
                smoke_frequency_details,
                consume_sugary_foods_or_beverages_details,
                dental_floss_details,
                consume_alcohol_details,
                participate_in_sports_details,
                balanced_diet_details,
                regular_exercise_details,
                eating_disorder_details,
                experience_bleeding_details,
                tooth_sensitivity_details,
                dental_appearance_details,
                loose_teeth_details,
                bad_breath_or_bad_taste_details,
                dental_xrays_details,
                dental_restoration_details,
                orthodontic_treatment_details,
                brush_frequency_details,
                use_mouthwash_details,
                replace_toothbrush_details,
                clean_tongue_details,
                regular_checkup_details,
                dental_anxiety_details,
                dental_trauma_details,
                clinic_name,
                consent,
                created_by
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                );
            `

            const [result1] = await connection.query(query, values);

            if (result1.affectedRows === 0) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Failed to insert consult patient data"
                })
            }

            const updateQuery = `UPDATE patientsappointment SET status = ? WHERE appointmentID = ?;`;
            const status = "Consulted";

            const [result2] = await connection.query(updateQuery, [
                status,
                appointment_id
            ]);

            if (result2.affectedRows === 0) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Failed to update appointment status"
                })
            }

            const commitQuery = await connection.commit();
            if (!commitQuery) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: "Failed to commit transaction in consult patient data"
                })
            }
        } else if (clinic_type === "Psychiatry Clinic") {
            const psychiatry_consultation_values = {
                appointmentID: appointment_id,
                first_name: first_name,
                last_name: last_name,
                email: email_address,
                phone_number: phone_number,
                appointment_date: appointment_date,
                appointment_time: appointment_time,
                diagnosed_mental_health_condition_details: diagnosed_mental_health_condition_details,
                taking_psychiatric_medication_details: taking_psychiatric_medication_details,
                hospitalized_for_mental_health_reason_details: hospitalized_for_mental_health_reason_details,
                family_history_of_mental_health_conditions_details: family_history_of_mental_health_conditions_details,
                suicidal_thoughts_or_behaviors_details: suicidal_thoughts_or_behaviors_details,
                self_harm_or_suicide_details: self_harm_or_suicide_details,
                counseling_or_therapy_details: counseling_or_therapy_details,
                emotional_or_behavioral_patterns_details: emotional_or_behavioral_patterns_details,
                mood_details: mood_details,
                excessive_worry_or_anxiety_details: excessive_worry_or_anxiety_details,
                sleep_patterns_details: sleep_patterns_details,
                appetite_or_weight_details: appetite_or_weight_details,
                sleep_changes_details: sleep_changes_details,
                hopelessness_or_worthlessness_details: hopelessness_or_worthlessness_details,
                agitation_or_impulsivity_details: agitation_or_impulsivity_details,
                difficulty_concentrating_details: difficulty_concentrating_details,
                stress_levels_details: stress_levels_details,
                support_system_details: support_system_details,
                major_life_changes_details: major_life_changes_details,
                substances_details: substances_details,
                sleep_hours_details: sleep_hours_details,
                social_groups_details: social_groups_details,
                living_situation_details: living_situation_details,
                coping_with_stress_details: coping_with_stress_details,
                mental_health_treatment_details: mental_health_treatment_details,
                treatment_history_details: treatment_history_details,
                currently_in_therapy_details: currently_in_therapy_details,
                negative_experience_with_mental_health_treatment_details: negative_experience_with_mental_health_treatment_details,
                currently_under_care_of_psychiatrist_details: currently_under_care_of_psychiatrist_details,
                stopped_taking_psychiatric_medications_details: stopped_taking_psychiatric_medications_details,
                side_effects_from_psychiatric_medications_details: side_effects_from_psychiatric_medications_details,
                consistent_with_attending_therapy_or_taking_medications_details: consistent_with_attending_therapy_or_taking_medications_details,
                consent_value: consent_value,
                clinic_name_field: clinic_name_field,
                admin_id_field: admin_id_field
            }

            const clinicInstance = new Clinic();
            const result = await clinicInstance.consultingPatientInPsychiatry(psychiatry_consultation_values);

            if (!result || result.affectedRows === 0) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Failed to insert consult patient data"
                })
            }
        }

        return res.status(StatusCodes.OK).json({
            message: "Patient Consulted Successfully"
        })

    } catch (error) {
        const rollbackQuery = await connection.rollback();
        if (!rollbackQuery) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to rollback transaction"
            })
        }

        logger.log(`error`, `Failed to insert consult patient data controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to insert consult patient data"
        })
    } finally {
        connection.release();
    }
}

// controller logic for getting the appointment history in clinic dashboard
export const getAppointmentHistoryInClinic = async (req, res) => {
    try {
        const { clinicID, clinicType } = req.query;

        if (!clinicID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid clinic ID"
            })
        }

        if (!clinicType) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid clinic type"
            })
        }

        const clinic_id = parseInt(clinicID, 10);
        const clinic_type = String(clinicType);

        // instance of clinic model with a method to retrieved all appointment history
        const consulted_patient = await new Clinic().getAppointmentHistory(clinic_id, clinic_type);

        if (consulted_patient.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No appointment history found"
            })
        }

        return res.status(StatusCodes.OK).json({
            appointmentHistory: consulted_patient
        })

    } catch (error) {
        console.error(`Failed to get appointment history: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve appointment history"
        })
    }
}

// controller logic for inserting a payment information in patient side
export const addPatientPaymentInformation = async (req, res) => {
    try {
        const {
            appointmentID,
            modeOfPayment,
            amount,
            firstName,
            lastName,
            email,
            cardNumber,
            cardHolderName,
            expiryDate,
            cvv
        } = req.body;

        const date = new Date();
        const current_date = date.toISOString().split('T')[0];

        const paymentStatus = "Paid"

        const payment_mode = String(modeOfPayment);
        const payment_amount = parseFloat(amount);
        const first_name = String(firstName);
        const last_name = String(lastName);
        const email_address = String(email);
        const card_number = String(cardNumber);
        const card_holder_name = String(cardHolderName);
        const expiry_date = String(expiryDate);
        const cvv_number = String(cvv);
        const appointment_id = parseInt(appointmentID, 10);

        const paymentData = {
            appointmentID: appointment_id,
            modeOfPayment: payment_mode,
            amount: payment_amount,
            firstName: first_name,
            lastName: last_name,
            email: email_address,
            payment_date: current_date,
            payment_status: paymentStatus
        }

        if (payment_mode === "Card") {
            paymentData.cardNumber = card_number;
            paymentData.cardHolderName = card_holder_name;
            paymentData.expiryDate = expiry_date;
            paymentData.cvv = cvv_number;
        }

        await new Clinic().addPatientPaymentInformation(paymentData)

        return res.status(StatusCodes.OK).json({
            message: "Payment successful"
        })
    } catch (error) {
        console.error(`Failed to insert payment information in controller function: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to insert payment information"
        })
    }
}

// controller logic for getting the patient appointment details to populate the fields in the payment dialog box
export const retrievePatientDetailsInPaymentDialog = async (req, res) => {
    try {
        const { patientID } = req.params;

        if (!patientID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid patient ID"
            })
        }

        const result = await new Clinic().retrievePatientsDetailsToRenderInPaymentDialog(patientID);

        if (!result.length) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No patient details found to render in payment dialog box"
            })
        }

        return res.status(StatusCodes.OK).json({
            patientDetails: result
        })
    } catch (error) {
        console.error(`Failed to retrieve patient details in payment dialog by retrievePatientDetailsInPaymentDialog controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve patient details in payment dialog"
        })
    }
}

// controller logic for retrieving the payment confirmation details in the payment dialog box
export const retrievedPaymentConfirmedDetails = async (req, res) => {
    try {
        const { patientID } = req.params;

        if (!patientID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid patient ID"
            })
        }

        const patient_id = parseInt(patientID, 10);

        if (isNaN(patient_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid patient ID format"
            })
        }

        // instance of model clinic with a method to reterieved the confirmed payment details
        const result = await new Clinic().retrievedConfirmedPaymentDetails(patient_id);

        if (result.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No payment confirmation details found"
            });
        }

        return res.status(StatusCodes.OK).json({
            paymentConfirmationDetails: result
        })
    } catch (error) {
        console.error(`Failed to retrieve payment confirmation details function controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve payment confirmation details"
        })
    }
}

// controller logic to delete the payment details when the patient clicked the cancel payment
export const cancelledPaymentDetails = async (req, res) => {
    try {
        /**
         * @param {string} paymentID - The ID of the payment to be cancelled
         */
        const { paymentID } = req.params;

        const payment_id = parseInt(paymentID, 10);

        if (isNaN(payment_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid payment ID format"
            })
        }

        // instance of clinic model and the method of cancelled payment details confirmed payment
        const result = new Clinic().cancelledPaymentDetailsInConfirmedPaymentDialog(payment_id);

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No payment details found has been cancelled"
            })
        }

        return res.status(StatusCodes.OK).json({
            message: "Payment details cancelled successfully"
        })
    } catch (error) {
        console.error(`Failed to cancelled payment details in controller function: ${error}`)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to cancelled payment details"
        })
    }
}

// controller logic for validating the stepper component in clinic side
export const validateStep = async (req, res, next) => {
    try {
        const { step, clinicType } = req.query;

        if (isNaN(step) || step < 0 || step > 5) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid step"
            });
        }

        const clinic_type = decodeURIComponent(String(clinicType));

        const validationMiddleWare = validatePatientConsultation(step, clinic_type);

        // Execute each middleware sequentially
        for (const middleware of validationMiddleWare) {
            await new Promise((resolve, reject) => {
                middleware(req, res, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "Step validated successfully"
        });
    } catch (error) {
        console.error(`Error in validateStep controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to validate step"
        });
    }
};

// controller logic for deleting the patient registered account in admin side
export const deleteRegisteredPatientAccount = async (req, res) => {
    try {
        const { patientID } = req.params;

        const patient_id = parseInt(patientID)

        if (isNaN(patient_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid patienID"
            })
        }

        const result = await new Clinic().deletePatientRegisteredAccount(patient_id)

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No registered patient account found"
            })
        }

        return res.status(StatusCodes.OK).json({
            message: "Patient registered accouunt deleted successfully"
        })
    } catch (error) {
        console.error("Failed to delete the patient registered account in function controller")
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to delete the patient register account"
        })
    }
}

// controller logic for consultation questionnaire for clinics attached in admin side
export const consultationQuestionnaire = async (req, res) => {
    try {
        const { responses } = req.body;

        if (!responses || !Array.isArray(responses) || responses.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "No questionnaires responses provided"
            });
        }

        const result = await new Clinic().insertConsultationQuestionnaire(responses);

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Failed to insert consultation questionnaires"
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "Consultation questionnaires inserted successfully"
        });

    } catch (error) {
        console.error(`Failed to insert consultation questionnaires in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to insert consultation questionnaires"
        })
    }
}

// controller logic for getting the consultation questionnaires in clinic dashboard
export const retrievedMedicalHistoryConsultationQuestionnaires = async (req, res) => {
    try {
        const { clinicID } = req.params;

        if (!clinicID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid clinic ID"
            })
        }

        const clinic_id = parseInt(clinicID, 10);

        if (isNaN(clinic_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid clinic ID format"
            })
        }

        const result = await new Clinic().retrievedMedicalHistoryQuestionnaire(clinic_id);
        if (result.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No medical history questionnaires found"
            })
        }

        return res.status(StatusCodes.OK).json({
            consultationQuestionnaires: result
        })
    } catch (error) {
        console.error(`Failed to retrieve medical history questionnaires in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve medical history consultation questionnaires"
        })
    }
}

// controller logic for retrieving the lifestyle information consultation questionnaires in admin side
export const retrieveLifestyleInformationQuestionnaires = async (req, res) => {
    try {
        const { clinicID } = req.params;

        if (!clinicID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid clinic ID"
            })
        }

        const clinic_id = parseInt(clinicID, 10);

        if (isNaN(clinic_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid clinic ID is not a number"
            })
        }

        const result = await new Clinic().retrieveLifestyleInformationQuestionnaire(clinic_id);

        if (result.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No lifestyle information questionnaires found"
            })
        }

        if (result.length > 0) {
            return res.status(StatusCodes.OK).json({
                lifestyleInformationQuestionnaires: result
            })
        }
    } catch (error) {
        console.error(`Failed to retrieve lifestyle information questionnaires in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve lifestyle information questionnaires"
        })
    }
}

// controller logic for retrieving the clical assessment questionnaires to render in clinic side
export const retrieveClinicalAssessmentQuestionnaires = async (req, res) => {
    try {
        const { clinicID } = req.params;

        if (!clinicID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid clinic ID"
            })
        }

        const clinic_id = parseInt(clinicID, 10);

        if (isNaN(clinic_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid clinic ID is not a number"
            })
        }

        const result = await new Clinic().retrieveClinicalAssessmentQuestionnaire(clinic_id);

        if (result.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No clinical assessment questionnaires found"
            })
        }

        return res.status(StatusCodes.OK).json({
            clinicalAssessmentQuestionnaires: result
        })
    } catch (error) {
        console.error(`Failed to retrieve clinical assessment questionnaires in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve clinical assessment questionnaires"
        })
    }
}

// controller logic for retrieving the oral hygiene questionnaires in admin side
export const retrieveOralHygieneQuestionnaires = async (req, res) => {
    try {
        const { clinicID } = req.params;

        if (!clinicID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid clinic ID"
            })
        }

        const clinic_id = parseInt(clinicID, 10);
        if (isNaN(clinic_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid clinic ID is not a number"
            })
        }

        const sectionType = "Oral Hygiene Habits";
        const limit = 7;

        const result = await new Clinic().retrieveOralHygieneQuestionnaire(clinic_id, sectionType, limit);

        if (result.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No oral hygiene questionnaires found"
            })
        }

        return res.status(StatusCodes.OK).json({
            oralHygieneQuestionnaires: result
        })
    } catch (error) {
        console.error(`Failed to retrieve oral hygiene questionnaires in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve oral hygiene questionnaires"
        })
    }
}

// controller logic for cancelling the booked appointment in patient side
export const cancelBookedAppointment = async (req, res) => {
    try {
        const { appointmentID } = req.params;

        if (!appointmentID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid appointment ID"
            })
        }

        const appointment_id = parseInt(appointmentID, 10);

        if (isNaN(appointment_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid appointment ID format"
            })
        }

        const status = "Cancelled";
        const result = await new Clinic().cancelBookedAppointment(appointment_id, status);

        const appointmentDetails = result[0];

        if (!result || result.affectedRows === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No appointment id found"
            })
        }

        await sendAppointmentsConfirmation({
            ...appointmentDetails,
            status: status,
            clinicName: appointmentDetails.clinic_name,
            clinicAddress: appointmentDetails.clinic_address
        }).catch((error) => {
            console.error(`Failed to send appointment confirmation in controller: ${error}`);
        });

        await cancelAllRemindersForAppointment(appointment_id);

        logger.log(`info`, `Appointment cancelled successfully for appointment ID: ${appointment_id}`);
        return res.status(StatusCodes.OK).json({
            cancelledBookedAppoinment: "Cancelled Booked Appointment Successfully",
            appointment_id
        })
    } catch (error) {
        console.error(`Failed to cancel booked appointment in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to cancel booked appointment"
        })
    }
}

// controller logic for deleting the booked appointment in clinic side
export const deleteBookedAppointment = async (req, res) => {
    try {
        const { appointmentID } = req.params;

        if (!appointmentID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid appointment ID"
            })
        }

        const appointment_id = parseInt(appointmentID, 10)

        if (isNaN(appointment_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid appointment id format"
            })
        }

        const booked_appointment_result = await new Clinic().deleteBookedAppointment(appointment_id);

        if (booked_appointment_result.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No booked appointment found"
            })
        }

        return res.status(StatusCodes.OK).json({
            deletedBookedAppointment: "Delete booked appointment successfully"
        })
    } catch (error) {
        console.error(`Failed to delete booked appointment in controller: ${error}`)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to delete the booked appointment"
        })
    }
}

/**
 * @function controller logic for inserting a book appointment in clinic side
 */
export const addBookAppointmentInClinic = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            address,
            email,
            phoneNumber,
            appointmentDate,
            appointmentTime,
            gender,
            purposeOfAppointment,
            clinicID,
            clinicName
        } = req.body

        const first_name = String(firstName);
        const last_name = String(lastName);
        const patient_address = String(address);
        const email_address = String(email);
        const phone_number = String(phoneNumber);
        const appointment_date = dayjs(appointmentDate).format("YYYY-MM-DD");
        const appointment_time = String(appointmentTime)
        const sex = String(gender);
        const purpose_of_appointment = String(purposeOfAppointment);
        const clinic_id = parseInt(clinicID, 10);
        const clinic_name = String(clinicName);
        const created_date = dayjs().format("YYYY-MM-DD");
        const status = String("Pending");

        if (isNaN(clinic_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid clinic ID format"
            })
        }

        const bookAppointmentsData = {
            firstName: first_name,
            lastName: last_name,
            address: patient_address,
            email: email_address,
            phoneNumber: phone_number,
            appointmentDate: appointment_date,
            appointmentTime: appointment_time,
            gender: sex,
            purposeOfAppointment: purpose_of_appointment,
            clinicID: clinic_id,
            clinicName: clinic_name,
            createdDate: created_date,
            status: status
        }

        const book_appointment_result = await new Clinic().insertBookedAppointment(bookAppointmentsData);
        if (book_appointment_result.affectedRows === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Failed to add book appointment"
            })
        }

        return res.status(StatusCodes.OK).json({
            message: "Book appointment added successfully",
        })
    } catch (error) {
        console.error(`Failed to add book appointment in controller function: ${error}`)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to add book appointment"
        })
    }
}

// controller logic for retrieving the clinic all appointments 
export const retrieveAllBookedAppointmentsOfClinic = async (req, res) => {
    try {
        const { clinicID } = req.params;

        if (!clinicID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid clinic id format"
            })
        }

        const clinic_id = parseInt(clinicID, 10)
        if (isNaN(clinic_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Clinic ID is not a number format"
            })
        }

        const booked_appointments = await new Clinic().retrieveBookedAppointmentOfClinicAppointments(clinic_id);

        if (!booked_appointments || booked_appointments.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No booked appointments found for this clinic"
            })
        }

        return res.status(StatusCodes.OK).json({
            bookedAppointments: booked_appointments
        })
    } catch (error) {
        console.error(`Failed to retrieve clinic booked appointments in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve clinic book appointments"
        });
    }
}

// controller loic for calculating the total number of all booked appointments in clinic side stats
export const calculateTotalBookedAppointmentsOfClinic = async (req, res) => {
    try {
        // param of clinicID in route
        const { clinicID } = req.query;

        if (!clinicID || typeof clinicID !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid clinic ID"
            });
        };

        // convert the clinic id to an integer
        const clinic_id = parseInt(clinicID, 10);

        if (isNaN(clinic_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid clinic ID is not a number"
            });
        }

        // instance of clinic model with a method to calculate the total number of booked appointments
        const total_booked_appointments = await new Clinic().calculateTotalNumberOfBookedAppointemnts(clinic_id);
        if (total_booked_appointments.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No booked appointments found for this clinic"
            });
        }

        return res.status(StatusCodes.OK).json({
            totalBookedAppointments: total_booked_appointments[0].total_all_booked_appointments
        });
    } catch (error) {
        console.error(`Failed to calculate total booked appointments in clinic in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to calculate total booked appointments"
        });
    }
}

/**
 * @function controller logic for calculating the total number of pending booked appointments in specific clinic
 * @route GET /clinicDashboard/calculatePendingBookedAppointments
 * @access Private
 */
export const calculatePendingBookedAppointments = async (req, res) => {
    try {
        const { clinicID } = req.query;

        //  check if clinicID is provided and is a string
        if (!clinicID || typeof clinicID !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid clinic ID"
            });
        }

        // convert te clinic id to number
        const clinic_id = parseInt(clinicID, 10);
        if (isNaN(clinic_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid clinic ID is not a number"
            });
        }

        const booked_appointment_status = String("Pending");

        // instance of clinic model with a method to calculate the pending booked appointments
        const pending_booked_appointments_result = await new Clinic().calculateTotalNumberOfPendingBookedAppointments(clinic_id, booked_appointment_status);
        if (pending_booked_appointments_result.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No pending booked appointments found for this clinic"
            });
        }

        logger.log(`info`, `Total pending booked appointments in clinic side: ${pending_booked_appointments_result[0].total_pending_booked_appointments}`);

        return res.status(StatusCodes.OK).json({
            totalPendingBookedAppointments: pending_booked_appointments_result[0].total_pending_booked_appointments
        });
    } catch (error) {
        console.error(`Failed to calculate pending booked appointments in clinic in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to calculate pending booked appointments"
        });
    }
}

// controller logic for calculating the total approved booked appointemnts of specific clinic
export const calculateApprovedBookedAppointments = async (req, res) => {
    try {
        const { clinicID } = req.query;

        // check if clinicID is provided and is a string
        if (!clinicID || typeof clinicID !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid clinic ID"
            });
        }

        // convert the clinic id to number
        const clinic_id = parseInt(clinicID, 10);
        if (isNaN(clinic_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid clinic ID is not a number"
            });
        }

        const booked_appointment_status = String("Approved");

        // instance of clinic model with a method to calculate the approved booked appointments
        const approved_booked_appointments_result = await new Clinic().calculateTotalNumberOfApprovedBookedAppointments(clinic_id, booked_appointment_status);
        if (approved_booked_appointments_result.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No approved booked appointments found for this clinic"
            });
        }

        return res.status(StatusCodes.OK).json({
            totalApprovedBookedAppointments: approved_booked_appointments_result[0].total_approved_booked_appointments
        });
    } catch (error) {
        console.error(`Failed to calculate approved booked appointments in clinic in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to calculate approved booked appointments"
        });
    }
}

// controller logic for calculating the declined booked appointment of specific clinic
export const calculateDeclinedBookedAppointments = async (req, res) => {
    try {
        /**
         * @param {string} clinicID - The ID of the clinic to calculate declined booked appointments
         */
        const { clinicID } = req.query;

        if (!clinicID || typeof clinicID !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Clinic id must be a string"
            });
        }

        // convert the clinic id to number
        const clinic_id = parseInt(clinicID, 10);
        if (isNaN(clinic_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid clinic ID is not a number"
            });
        }

        const booked_appointment_status = String("Declined");

        // instance of clinic model with a method to calculate the declined booked appointments
        const declined_booked_appointments_result = await new Clinic().calculateTotalNumberOfDeclinedBookedAppointments(clinic_id, booked_appointment_status);

        if (declined_booked_appointments_result.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No declined booked appointments found for this clinic"
            });
        }

        return res.status(StatusCodes.OK).json({
            totalDeclinedBookedAppointments: declined_booked_appointments_result[0].total_declined_booked_appointments
        });
    } catch (error) {
        logger.error(`Failed to calculate declined booked appointments of specific clinic in controller: ${error}`)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to calculate declined booked appointments"
        })
    }
}

// controller logic for retrieving the pending booked appointments of specific clinic side
export const retrievePendingBookedAppointments = async (req, res) => {
    try {
        /**
         * @param {string} clinicID - The ID of the clinic to retrieve pending booked appointments
         */
        const { clinicID } = req.query;

        if (!clinicID || typeof clinicID !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Clinic id must be a string"
            })
        }

        // convert the clinic id to number
        const clinic_id = parseInt(clinicID, 10);
        if (isNaN(clinic_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! clinic ID is not a number"
            });
        }

        const booked_appointment_status = String("Pending");

        // instance of clinic model with a method to retrieve the pending booked appointments54
        const pending_booked_appointments_result = await new Clinic().retrieveClinicPendingBookedAppointments(clinic_id, booked_appointment_status);
        if (pending_booked_appointments_result.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No pending booked appointments found for this clinic"
            });
        }

        return res.status(StatusCodes.OK).json({
            pendingBookedAppointments: pending_booked_appointments_result
        });
    } catch (error) {
        logger.log("error", `Failed to retrieve the pending booked appointment in specific clinic in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve pending booked appointments"
        });
    }
}

// controller logic for creating admin account in admin side 
export const createAdminAccount = async (req, res) => {
    try {
        const {
            email,
            password,
            confirmPassword
        } = req.body;

        const email_address = String(email)
        const password_hash = String(password);
        const confirm_password_hash = String(confirmPassword);
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = dayjs().add(10, 'minutes').toISOString();

        const admin_account_data = {
            email: email_address,
            password: password_hash,
            confirmPassword: confirm_password_hash,
            resetToken: resetToken,
            resetTokenExpiry: resetTokenExpiry
        }

        // instance of clinic model with a method to create admin account
        const created_admin_account_result = await new Clinic().createAdminAccount(admin_account_data);
        if (created_admin_account_result.affectedRows === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Failed to create admin account"
            });
        }

        const tokenPayload = {
            id: created_admin_account_result.insertId,
            email: created_admin_account_result.email,
        }

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET)

        return res.status(StatusCodes.CREATED).json({
            message: "Admin account created successfully",
            token: token,
            adminAccountID: created_admin_account_result.insertId
        });
    } catch (error) {
        logger.log("error", `Failed to create admin account in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to create admin account"
        });
    }
}

// controller logic for refresh token in all sides in admin, clinic and patient
export const refreshAccessToken = async (req, res) => {
    try {
        /**
         * @param {string} refreshToken - The refresh token from the cookies
         */
        const refreshToken = req.cookies?.refreshToken;
        logger.info(`Received refresh token: ${refreshToken}`);

        if (!refreshToken) {
            logger.warn(`Refresh token is missing in cookies`)
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "No refresh token provided",
                errors: {
                    refreshToken: "Refresh token is missing in cookies"
                }
            });
        }

        const REFRESH_KEY_SECRET = process.env.REFRESH_KEY_SECRET;
        const ACCESS_KEY_SECRET = process.env.JWT_SECRET;

        if (!REFRESH_KEY_SECRET || !ACCESS_KEY_SECRET) {
            logger.error("Environment variables for refresh and access key secrets are not set");
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Server configuration error"
            });
        }

        const verifyAsynncJWT = promisify(jwt.verify);

        // Verify the refresh token
        const decoded = await verifyAsynncJWT(refreshToken, REFRESH_KEY_SECRET)

        const payload = {
            id: decoded.id,
            email: decoded.email,
        }

        const newAccessToken = jwt.sign(payload, ACCESS_KEY_SECRET, {
            expiresIn: "1hr"
        })

        logger.log("info", `Access token refreshed successfully for user ID: ${decoded.id}`);

        return res.status(StatusCodes.OK).json({
            message: "Access token refreshed successfully",
            accessToken: newAccessToken
        })

    } catch (refreshTokenError) {
        logger.error(`Failed to refresh access token in controller: ${refreshTokenError}`);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to refresh access token"
        });
    }
}

/**
 * @function controller logic to calculate the number of registered clinics in admin side
 */

export const totalNumberOfRegisteredClinics = async (req, res) => {
    try {
        const total_number_of_registered_clinics = await new Clinic().calculateTotalNumberOfRegisteredClinics();
        if (total_number_of_registered_clinics.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No registered clinics found"
            });
        }

        return res.status(StatusCodes.OK).json({
            totalNumberOfRegisteredClinics: total_number_of_registered_clinics[0].total_number_of_clinics
        });
    } catch (error) {
        logger.error(`Failed to calculate the number of registered clinics in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to calculate the number of registered clinics"
        });
    }
}

/**
 * @function controller logic to calculate the registered patients accounts in admin side
 */

export const calculateRegisteredPatientsAccounts = async (req, res) => {
    try {
        const total_number_of_registered_patients_accounts = await new Clinic().calculateRegisteredPatientsAccounts();
        if (total_number_of_registered_patients_accounts.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No registered patients accounts found"
            });
        }

        return res.status(StatusCodes.OK).json({
            totalNumberOfRegisteredPatientsAccounts: total_number_of_registered_patients_accounts[0].total_number_of_patients
        });
    } catch (error) {
        logger.error(`Failed to calculate the registered patients accounts in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to calculate the registered patients accounts"
        });
    }
}

/**
 * @function controller logic to calculate the number of admin account in admin side
 */

export const calculateNumberOfAdminAccounts = async (req, res) => {
    try {
        const clinicInstance = new Clinic();
        const total_number_of_admin_accounts = await clinicInstance.calculateNumberOfAdminAccounts();

        if (!total_number_of_admin_accounts || total_number_of_admin_accounts.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No admin accounts found"
            });
        }

        return res.status(StatusCodes.OK).json({
            totalNumberOfAdminAccounts: total_number_of_admin_accounts[0].total_number_of_admin_accounts
        });
    } catch (error) {
        logger.error(`Failed to calculate the number of admin accounts in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to calculate the number of admin accounts"
        });
    }
}

/**
 * @ function controller logic  to calculate the consulted patients in specific clinic side
 */

export const calculateConsultedPatients = async (req, res) => {
    try {
        /**
         * @param for specific clinic id
         */
        const { clinicID } = req.query;

        if (!clinicID || typeof clinicID !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Clinic ID must be a string"
            })
        }

        //  convert the clinic id to number
        const clinic_id = parseInt(clinicID);
        if (isNaN(clinic_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Clinic ID must be a number"
            })
        }

        const booked_appointment_status = String("Consulted");

        const total_consulted_patients = await new Clinic().calculateConsultedPatients(clinic_id, booked_appointment_status);
        if (!total_consulted_patients || total_consulted_patients.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No consulted patients found"
            })
        }

        return res.status(StatusCodes.OK).json({
            totalConsultedPatients: total_consulted_patients[0].total_consulted_patients
        })
    } catch (error) {
        logger.error(`Failed to calculate the consulted patients in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to calculate the consulted patients"
        });
    }
}

/**
 * @function controller logic to calculate the cancelled booked appointments in specific clinic side
 */

export const calculateCancelledBookedAppointments = async (req, res) => {
    try {
        /**
         * @param for specific clinic id
         */

        const { clinicID } = req.query;

        if (!clinicID || typeof clinicID !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Clinic ID must be a string"
            })
        }

        // convert the clinic id into number
        const clinic_id = parseInt(clinicID);
        if (isNaN(clinic_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Clinic ID must be a number"
            })
        }

        const booked_appointment_status = String("Cancelled");

        const total_cancelled_booked_appointments = await new Clinic().calculateCancelledBookedAppointments(clinic_id, booked_appointment_status);
        if (!total_cancelled_booked_appointments || total_cancelled_booked_appointments.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No cancelled booked appointments found"
            })
        }

        return res.status(StatusCodes.OK).json({
            totalCancelledBookedAppointments: total_cancelled_booked_appointments[0].total_cancelled_booked_appointments
        })
    } catch (error) {
        logger.error(`Failed to calculate the cancelled booked appointments in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to calculate the cancelled booked appointments"
        });
    }
}

/**
 * @function controller logic to calculate the all booked appointments in specific patient account 
 */

export const calculateTotalBookedAppointmentsOfPatient = async (req, res) => {
    try {

        /**
         * @param for specific patient email
         */
        const { patientEmail } = req.query;

        if (!patientEmail || typeof patientEmail !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Patient email must be a string"
            })
        }

        const all_booked_appointments = await new Clinic().calculateAllBookedAppointmentsOfPatient(patientEmail);
        if (!all_booked_appointments || all_booked_appointments.length === 0) {
            logger.warn("No booked appointments found");
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No booked appointments found"
            })
        }

        logger.log("info", `Total booked appointments of patient: ${all_booked_appointments[0].all_booked_appointments}`);
        return res.status(StatusCodes.OK).json({
            totalBookedAppointmentsOfPatient: all_booked_appointments[0].all_booked_appointments
        })
    } catch (error) {
        logger.error(`Failed to calculate the total booked appointments of patient in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to calculate the total booked appointments of patient"
        });
    }
}

/**
 * @function controller to calculate the pending booked appointment of specifc patient account
 * @description controller logic to calculate the pending booked appointment of specifc patient account
 */

export const calculatePendingBookedAppointmentsOfPatient = async (req, res) => {
    try {
        /**
         * @param of specific patient account email
         * @description retrieves the patient email address to calculate the pending booked appointments
         */
        const { patientEmail } = req.query;

        if (!patientEmail || typeof patientEmail !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Patient email must be a string"
            })
        }

        const booked_appointment_status = String("Pending");

        const pending_booked_appointment_result = await new Clinic().calculatePendingBookedAppointmentOfPatient(patientEmail, booked_appointment_status);
        if (!pending_booked_appointment_result || pending_booked_appointment_result.length === 0) {
            logger.warn("No pending booked appointments found");
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No pending booked appointments found"
            })
        }

        logger.log("info", `Total pending booked appointments of patient: ${pending_booked_appointment_result[0].pending_booked_appointment}`);
        return res.status(StatusCodes.OK).json({
            totalPendingBookedAppointmentsOfPatient: pending_booked_appointment_result[0].pending_booked_appointment
        })
    } catch (error) {
        logger.log("error", `Failed to calculate the pending booked appointments of patient in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to calculate the pending booked appointments of patient"
        });
    }
}

/**
 * @function controller logic to calculate the approved booked appointment of specific patient account
 */

export const calculateApprovedBookedAppointmentOfPatient = async (req, res) => {
    try {
        /**
         * @param to retrieve the patient account email
         */

        const { patientEmail } = req.query;

        if (!patientEmail || typeof patientEmail !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Patient email must be a string"
            })
        }

        const booked_appointment_status = String("Approved");
        const calculated_approved_booked_appointment_result = await new Clinic().calculateApprovedBookedAppointmentOfPatientAccount(patientEmail, booked_appointment_status);

        if (!calculated_approved_booked_appointment_result || calculated_approved_booked_appointment_result.length === 0) {
            logger.warn("No approved booked appointments found");
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No approved booked appointments found"
            })
        }

        logger.log("info", `Total approved booked appointments of patient: ${calculated_approved_booked_appointment_result[0].approved_booked_appointment}`);
        return res.status(StatusCodes.OK).json({
            totalApprovedBookedAppointmentsOfPatient: calculated_approved_booked_appointment_result[0].approved_booked_appointment
        })
    } catch (error) {
        logger.log("error", `Failed to calculate the approved booked appointment of patient in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to calculate the approved booked appointment of patient"
        })
    }
}

/**
 * @function controller logic to calculate the consulted booked appointment of specific patient account
 */

export const calculateConsultedBookedAppointmentOfPatient = async (req, res) => {
    try {
        /**
         * @param for specific patient account email
         */

        const { patientEmail } = req.query;

        if (!patientEmail || typeof patientEmail !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Patient email must be a string"
            })
        }

        const booked_appointment_status = String("Consulted");
        const calculated_consulted_booked_appointment_result = await new Clinic().calculateConsultedBookedAppointmentOfPatientAccount(patientEmail, booked_appointment_status);
        if (!calculated_consulted_booked_appointment_result || calculated_consulted_booked_appointment_result.length === 0) {
            logger.warn("No consulted booked appointments found");
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No consulted booked appointments found"
            })
        }

        logger.log("info", `Total consulted booked appointments of patient: ${calculated_consulted_booked_appointment_result[0].consulted_booked_appointment}`);
        return res.status(StatusCodes.OK).json({
            totalConsultedBookedAppointmentsOfPatient: calculated_consulted_booked_appointment_result[0].consulted_booked_appointment
        })
    } catch (error) {
        logger.log("error", `Failed to calculate the consulted booked appointment of patient in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to calculate the consulted booked appointment of patient"
        })
    }
}

/**
 * @function controller logic to calculate the cancelled booked appointments of specific patient account
 */

export const calculateCancelledBookedAppointmentsOfPatient = async (req, res) => {
    try {
        /**
         * @param for specific patient email account
         */

        const { patientEmail } = req.query;

        if (!patientEmail || typeof patientEmail !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Patient email must be a string"
            })
        }

        const booked_appointment_status = String("Cancelled");

        const calculated_cancelled_booked_appointment_result = await new Clinic().calculateCancelledBookedAppointmentOfPatientAccount(patientEmail, booked_appointment_status);

        if (!calculated_cancelled_booked_appointment_result || calculated_cancelled_booked_appointment_result.length === 0) {
            logger.warn("No cancelled booked appointments found");
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No cancelled booked appointments found"
            })
        }

        logger.log("info", `Total cancelled booked appointments of patient: ${calculated_cancelled_booked_appointment_result[0].cancelled_booked_appointment}`);
        return res.status(StatusCodes.OK).json({
            totalCancelledBookedAppointmentsOfPatient: calculated_cancelled_booked_appointment_result[0].cancelled_booked_appointment
        })
    } catch (error) {
        logger.log("error", `Failed to calculate the cancelled booked appointment of specific patient account in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to calculate the cancelled booked appointment of specific patient account"
        })
    }
}

/**
 * @function controller logic to calculate the declined booked appointment of specific patient account
 */

export const calculateDeclinedBookedAppointmentsOfPatient = async (req, res) => {
    try {
        /**
         * @param for specific patient email account
         */

        const { patientEmail } = req.query;

        if (!patientEmail || typeof patientEmail !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Patient email must be a string"
            })
        }

        const booked_appointment_status = String("Declined");

        const calculated_declined_booked_appointment_result = await new Clinic().calculateDeclinedBookedAppointmentOfPatientAccount(patientEmail, booked_appointment_status);

        if (!calculated_declined_booked_appointment_result || calculated_declined_booked_appointment_result.length === 0) {
            logger.warn("No declined booked appointments found");
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No declined booked appointments found"
            })
        }

        logger.log("info", `Total declined booked appointments of patient: ${calculated_declined_booked_appointment_result[0].declined_booked_appointment}`);
        return res.status(StatusCodes.OK).json({
            totalDeclinedBookedAppointmentsOfPatient: calculated_declined_booked_appointment_result[0].declined_booked_appointment
        })
    } catch (error) {
        logger.log("error", `Failed to calculate the declined booked appointment of specific patient account in controller: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to calculate the declined booked appointment of specific patient account"
        })
    }
}

/**
 * @function controller logic to retrieve the approved booked appointment to render in clinic side table
 */

export const retrieveClinicByIdApprovedBookedAppointments = asyncHandler(async (req, res) => {
    /**
     * @param {string} clinicID - The ID of the clinic to retrieve approved booked appointments
     */
    const { clinicID } = req.query;

    if (!clinicID || typeof clinicID !== "string") {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Invalid! Clinic ID must be a string"
        })
    }

    /**
     * convert the clinic id to number
     */

    const clinic_id = parseInt(clinicID);
    if (isNaN(clinic_id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Invalid clinic ID is not a number"
        })
    }

    const booked_appointment_status = "Approved";

    /**
     * @argument (clinicID, bookedAppointmentStatus) passed an object
     * @description instantiate the clinic class and call the retrieve clinic by id approved booked appointment model
     */

    const retrieve_approved_booked_appointment_result = await new Clinic().retrieveClinicByIdApprovedBookedAppointments({
        clinicID: clinic_id,
        bookedAppointmentStatus: booked_appointment_status
    });

    if (!retrieve_approved_booked_appointment_result || retrieve_approved_booked_appointment_result.length === 0) {
        logger.log("warn", "No approved booked appointments found");
        return res.status(StatusCodes.NOT_FOUND).json({
            message: "No approved booked appointments found"
        })
    }

    logger.log("info", `Retrieve Approved Booked Appointment in clinic side table: ${retrieve_approved_booked_appointment_result}`)
    return res.status(StatusCodes.OK).json({
        retrievedApprovedBookedAppointments: retrieve_approved_booked_appointment_result
    });
})

/**
 * @function controller logic to retrieve declined booked appointment to render in clinic side table
 */
export const retrieveClinicByIdDeclinedBookedAppointments = asyncHandler(
    async (req, res) => {
        /**
         * @params {clinicID}
         */
        const { clinicID } = req.query;

        if (!clinicID || typeof clinicID !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Clinic ID must be a string"
            })
        }

        /**
         * convert the clinic id to number
         */

        const clinic_id = parseInt(clinicID);

        if (isNaN(clinic_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid clinic ID is not a number"
            })
        }

        const booked_appointment_status = "Declined";

        const retrieve_declined_booked_appointment_result = await new Clinic().retrieveClinicByIdDeclinedBookedAppointments({
            clinicID: clinic_id,
            bookedAppointmentStatus: booked_appointment_status
        })

        if (!retrieve_declined_booked_appointment_result || retrieve_declined_booked_appointment_result.length === 0) {
            logger.log("warn", "No declined booked appointments found");
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No declined booked appointments found"
            })
        }

        logger.log("info", `Retrieve Declined Booked Appointment in clinic side table: ${retrieve_declined_booked_appointment_result}`)
        return res.status(StatusCodes.OK).json({
            retrievedDeclinedBookedAppointments: retrieve_declined_booked_appointment_result
        })
    }
)

/**
 * @function controller logic to modify the booked appointment details of patient in all booked appointments in clinic side table
 * @access {private}
 * @route /cms.api.com/clinic/dashboard/modifyBookedAppointmentDetails
 */
export const findBookedAppointmentByIdToModifyBookedAppointmentDetails = asyncHandler(
    async (req, res) => {
        const { bookedAppointmentID, type } = req.query;

        if (!bookedAppointmentID || typeof bookedAppointmentID !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Booked appointment ID must be a string"
            })
        }

        /**
         * convert the booked appointment ID to number
         */

        const clinic_booked_appointment_id = parseInt(bookedAppointmentID);

        if (isNaN(clinic_booked_appointment_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Booked appointment ID must be a number"
            })
        }

        const {
            firstName,
            lastName,
            address,
            email,
            phoneNumber,
            appointmentDate,
            appointmentTime,
            gender,
            status,
            purposeOfAppointment
        } = req.body;

        const first_name = String(firstName);
        const last_name = String(lastName);
        const present_address = String(address);
        const email_address = String(email);
        const phone_number = String(phoneNumber);
        const selected_appointment_date = dayjs(appointmentDate).format("YYYY-MM-DD");
        const selected_appointment_time = String(appointmentTime);
        const selected_gender = String(gender);
        const selected_status = String(status);
        const selected_purpose_of_appointment = String(purposeOfAppointment);

        /**
         * @argument booked appointment details to passed in instance of clinic class
         * @description to modify the booked appointment details of patient in clinic side table
         */
        const clinic_modify_booked_appointment_details = {
            bookedAppointmentID: clinic_booked_appointment_id,
            firstName: first_name,
            lastName: last_name,
            address: present_address,
            email: email_address,
            phoneNumber: phone_number,
            appointmentDate: selected_appointment_date,
            appointmentTime: selected_appointment_time,
            gender: selected_gender,
            status: selected_status,
            purposeOfAppointment: selected_purpose_of_appointment
        }

        /**
         * @instance of clinic class
         * @description to modify the booked appointment details of patient in clinic side table
         */
        const clinic_instance = new Clinic();
        const all_appointments_modify_booked_appointments_result = await clinic_instance.findBookedAppointmentByIdToModifyBookedAppointmentsInAllAppointments({
            clinic_modify_booked_appointment_details: clinic_modify_booked_appointment_details,
            type: type
        });

        if (!all_appointments_modify_booked_appointments_result || all_appointments_modify_booked_appointments_result.length === 0) {
            logger.log("warn", "No booked appointments found");
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No booked appointments found"
            })
        }

        try {
            const clinic_instance = new Clinic();
            await clinic_instance.handleAutomatedUpdateStatusInClinicSideAppointments({
                appointmentID: clinic_booked_appointment_id,
                status: selected_status,
                type: type
            });
        } catch (error) {
            logger.log(`error`, `Failed to update the patient book appointment in table of clinic appointmetns: ${error}`);
        }

        logger.log("info", `Modify Booked Appointment Details in All Appointments Clinic Side Table: ${clinic_booked_appointment_id}`);
        return res.status(StatusCodes.OK).json({
            message: "Booked Appointment Details Modified Successfully!"
        })
    }
)

/**
 * @function controller logic to delete all booked appointments details in specific booked appointment details in clinic side table
 */
export const deleteBookedAppointmentDetailsInClinicSideTable = asyncHandler(
    async (req, res) => {
        const { bookedAppointmentID } = req.query;

        if (!bookedAppointmentID || typeof bookedAppointmentID !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Booked appointment ID must be a string"
            })
        }

        /**
         * convert the booked appointment id to number
         */
        const clinic_booked_appointment_id = parseInt(bookedAppointmentID);

        if (isNaN(clinic_booked_appointment_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid Booked Appointment ID must be a number"
            })
        }

        /**
         * instantiate  a clinic instance model
         */
        const clinic_instance = new Clinic();
        if (!clinic_instance instanceof Clinic) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to instantiate clinic instance model"
            })
        }

        const delete_booked_appointment_result = await clinic_instance.deleteBookedAppointmentDetailsInClinicSideTable({
            bookedAppointmentID: clinic_booked_appointment_id
        });

        if (!delete_booked_appointment_result || delete_booked_appointment_result.length === 0) {
            logger.log("warn", "No booked appointments found");
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No booked appointments found"
            })
        }

        logger.log("info", `Delete Booked Appointment Details in Clinic Side Table: ${delete_booked_appointment_result}`);
        return res.status(StatusCodes.OK).json({
            message: "Booked Appointment Details Deleted Successfully!"
        })
    }
)

/**
 * function controller logic to send a reset email in patient and clinic side
 */
export const sendResetEmail = asyncHandler(
    async (req, res) => {
        try {
            const { email, userType } = req.body;

            if (!email || typeof email !== "string") {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Invalid! Email must be a string"
                })
            }

            if (userType !== "patient" && userType !== "clinic" && userType !== "admin") {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Invalid! User type whether Patient, Clinic or Admin"
                })
            }

            const email_address = String(email);

            /**
             * instantiate a clinic class model
             */
            const clinicInstance = new Clinic();
            if (!(clinicInstance instanceof Clinic)) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: "Failed to instantiate clinic instance model"
                })
            }

            try {
                /**
                 * @argument email and user type to passed in instance of clinic class
                 * @description to send a reset email in patient and clinic side
                 */
                const checkEmailResult = await clinicInstance.sendResetEmail({
                    email: email_address,
                    userType: userType
                })

                if (!checkEmailResult || !checkEmailResult.success) {
                    logger.log("warn", `No existing ${userType} email found: ${email_address}`)
                    return res.status(StatusCodes.NOT_FOUND).json({
                        message: `No ${userType} account found with this email address`
                    })
                }

                const reset_link = `${process.env.FRONTEND_ENDPOINT}/ResetPassword?token=${checkEmailResult.data.resetToken}&type=${userType}`;
                /**
                 * try catch block to send a reset email
                 */
                try {
                    /**
                     * SMTP email to send a link  to reset the password
                    */
                    await sendResetPasswordEmail(
                        email_address,
                        checkEmailResult.data.name,
                        reset_link
                    )

                    return res.status(StatusCodes.OK).json({
                        message: "Reset Email has been sent successfully"
                    })
                } catch (error) {
                    await clinicInstance.resetPassword({
                        token: checkEmailResult.data.resetToken,
                        userType: userType
                    });

                    logger.log("error", `Failed to send reset password link: ${error}`)
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                        message: "Failed to send reset password link"
                    })
                }
            } catch (error) {
                if (error.message === "No existing email address found in our records") {
                    logger.log("warn", `No existing ${userType} email found: ${email_address}`)
                    return res.status(StatusCodes.NOT_FOUND).json({
                        message: `No ${userType} account found with this email address`
                    })
                }

                logger.log("error", `Error in no existing email address found in our records: ${error}`)
                throw error;
            }

        } catch (error) {
            logger.log("error", `Failed to send reset link in controller: ${error}`)
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to send reset link in controller"
            })
        }
    }
)

/**
 * @function controller logic to reset the password in clinic and patient side
 */
export const resetPassword = asyncHandler(
    async (req, res) => {
        try {
            const { token, type } = req.query;
            const { newPassword, confirmPassword, userType: bodyUserType } = req.body;

            const userType = type || bodyUserType;

            if (!userType) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "User type is required"
                });
            }

            const normalizedUserType = userType.toLowerCase();
            if (normalizedUserType !== 'clinic' && normalizedUserType !== 'patient' && normalizedUserType !== "admin") {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid user type. Either 'admin', 'clinic' or 'patient'"
                });
            }

            if (!token || !newPassword || !confirmPassword) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Token, new password and confirm password are required"
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Passwords do not match"
                });
            }

            const reset_token = String(token);
            const new_password = String(newPassword);
            const confirm_password = String(confirmPassword);
            const user_type = String(userType);

            /**
             * instantiate a clinic class model
             */
            const clinicInstance = new Clinic();
            if (!(clinicInstance instanceof Clinic)) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: "Failed to instantiate clinic instance model"
                })
            }

            /**
             * clinic class with a method of reset password
             * @returns {object}
             * @param {string} token
             * @param {string} newPassword
             * @param {string} confirmPassword
             * @param {string} userType
             */
            const resetPasswordResult = await clinicInstance.resetPassword({
                token: reset_token,
                newPassword: new_password,
                confirmPassword: confirm_password,
                userType: user_type
            })

            /**
             * checks if the reset password result is empty
             */
            if (!resetPasswordResult || resetPasswordResult.length === 0) {
                logger.log("warn", "No existing email found in the table")
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "No existing email found in the table"
                })
            }

            logger.log("info", `Reset Password: ${resetPasswordResult}`);
            return res.status(StatusCodes.OK).json({
                message: "Password reset successfully",
                model_message: resetPasswordResult.message
            })
        } catch (error) {
            logger.log("error", `Failed to reset password in controller: ${error}`)
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to reset password in controller"
            })
        }
    }
)

/**
 * @function controller logic to logout refresh access token 
 */
export const logoutRefreshToken = asyncHandler(
    async (req, res) => {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: "lax",
            domain: "localhost",
            path: "/"
        })

        return res.status(StatusCodes.OK).json({
            message: "Refresh token cleared successfully"
        })
    }
)

/**
 * @function controller logic to delete the pending booked appointment details in clinic side table
 */
export const deletePendingBookedAppointmentDetailsByFindingId = asyncHandler(
    async (req, res) => {
        const { pendingBookedAppointmentID } = req.query;

        if (!pendingBookedAppointmentID || typeof pendingBookedAppointmentID !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Pending booked appointment ID must be a string"
            })
        }

        /**
         * @convert the pending booked appointment into int
         */
        const pending_booked_appointment_id = parseInt(pendingBookedAppointmentID);

        if (isNaN(pending_booked_appointment_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Pending booked appointment ID must be a number"
            })
        }

        /**
         * @create a instance of clinic class model
         */
        const clinicInstance = new Clinic();

        if (!(clinicInstance instanceof Clinic)) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to instantiate clinic instance model"
            })
        }

        try {
            const delete_pending_booked_appointment_result = await clinicInstance.deletePendingBookedAppointmentDetailsByFindingId({
                pendingBookedAppointmentId: pending_booked_appointment_id
            })

            if (!delete_pending_booked_appointment_result || delete_pending_booked_appointment_result.length === 0) {
                logger.log("warn", `Delete pending booked appointment details is not found`)
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "Delete pending booked appointment details is not found"
                })
            }

            logger.log("info", `Delete pending booked appointment details successfully`)
            return res.status(StatusCodes.OK).json({
                message: "Delete pending booked appointment details successfully"   ``
            })
        } catch (error) {
            if (error.message === "Invalid! Pending booked appointment ID not found") {
                logger.log("warn", `Delete pending booked appointment details is not found`)
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "Delete pending booked appointment details is not found"
                })
            }

            logger.log("error", `Failed to delete pending booked appointment details: ${error}`)
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to delete pending booked appointment details"
            })
        }
    }
)

/**
 * @function controller logic to consult a patient using questionnaires provided in clinic side table and questionnaires
 * @inserting a patient information in clinic side table
 * @access {Private}
 * @route /cms.api.com/clinic/dashboard/clinicConsultPatient" {POST}
 */
export const consultPatientInClinicSideAppointment = asyncHandler(
    async (req, res) => {
        /**
         * Dental Clinic Request Body
         */
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            appointmentDate,
            preferredTime,
            allergiesDetails,
            takingPrescriptionMedicationDetails,
            chronicConditionDetails,
            surgeriesDetails,
            jawPainDetails,
            experiencedExcessiveBleedingDetails,
            heartProblemsDetails,
            advisedTakingAntibioticsDetails,
            smokeDetails,
            consumeSugaryFoodsOrDrinksDetails,
            dentalFlossDetails,
            consumeAlcoholDetails,
            participateInSportsDetails,
            balancedDietDetails,
            regularExerciseDetails,
            eatingDisordersDetails,
            experienceBleedingDetails,
            toothSensitivityDetails,
            dentalAppearanceDetails,
            looseTeethDetails,
            badBreathOrBadTasteDetails,
            dentalXraysDetails,
            dentalRestorationDetails,
            orthodonticTreatmentDetails,
            brushFrequencyDetails,
            useMouthWashDetails,
            replaceToothbrushDetails,
            cleanTongueDetails,
            regularCheckupDetails,
            dentalAnxietyDetails,
            dentalTraumaDetails,
            consent,
            admin_id,
            clinic_name,
            appointmentID
        } = req.body

        /**
         * Psychiatry Clinic Requests Body
         */
        const {
            /**
             * Mental Health History
             */
            counselingOrTherapyDetails,
            diagnosedMentalHealthConditionDetails,
            emotionalOrBehavioralPatternsDetails,
            familyHistoryOfMentalHealthConditionsDetails,
            hospitalizedForMentalHealthReasonDetails,
            selfHarmOrSuicideDetails,
            suicidalThoughtsOrBehaviorsDetails,
            takingPsychiatricMedicationDetails,
            /**
             * current symptoms
             */
            agitationOrImpulsivityDetails,
            appetiteOrWeightDetails,
            difficultyConcentratingDetails,
            excessiveWorryOrAnxietyDetails,
            hopelessnessOrWorthlessnessDetails,
            moodDetails,
            sleepChangesDetails,
            sleepPatternsDetails,
            /**
             * lifestyle factors
             */
            stressLevelsDetails,
            supportSystemDetails,
            majorLifeChangesDetails,
            substancesDetails,
            sleepHoursDetails,
            socialGroupsDetails,
            livingSituationDetails,
            copingWithStressDetails,
            /**
             * treatment history
             */
            mentalHealthTreatmentDetails,
            treatmentHistoryDetails,
            currentlyInTherapyDetails,
            negativeExperienceWithMentalHealthTreatmentDetails,
            currentlyUnderCareOfPsychiatristDetails,
            stoppedTakingPsychiatricMedicationsDetails,
            sideEffectsFromPsychiatricMedicationsDetails,
            consistentWithAttendingTherapyOrTakingMedicationsDetails,
            type,
            clinic_appointment_id
        } = req.body;

        /**
         * mental health history variables
         */
        const counseling_or_therapy_details = String(counselingOrTherapyDetails);
        const diagnosed_mental_health_condition_details = String(diagnosedMentalHealthConditionDetails);
        const emotional_or_behavioral_patterns_details = String(emotionalOrBehavioralPatternsDetails);
        const family_history_of_mental_health_condition_details = String(familyHistoryOfMentalHealthConditionsDetails);
        const hospitalized_for_mental_health_reason_details = String(hospitalizedForMentalHealthReasonDetails);
        const self_harm_or_suicide_details = String(selfHarmOrSuicideDetails);
        const suicidal_thoughts_or_behaviors_details = String(suicidalThoughtsOrBehaviorsDetails);
        const taking_psychiatric_medication_details = String(takingPsychiatricMedicationDetails);

        /**
         * current symptoms variables
         */
        const agitation_or_impulsivity_details = String(agitationOrImpulsivityDetails);
        const appetite_or_weight_details = String(appetiteOrWeightDetails);
        const difficulty_concentrating_details = String(difficultyConcentratingDetails);
        const excessive_worry_or_anxiety_details = String(excessiveWorryOrAnxietyDetails);
        const hopelessness_or_worthlessness_details = String(hopelessnessOrWorthlessnessDetails);
        const mood_details = String(moodDetails);
        const sleep_changes_details = String(sleepChangesDetails);
        const sleep_patterns_details = String(sleepPatternsDetails);

        /**
         * lifestyle factors variables
         */
        const stress_levels_details = String(stressLevelsDetails);
        const support_system_details = String(supportSystemDetails);
        const major_life_changes_details = String(majorLifeChangesDetails);
        const substances_details = String(substancesDetails);
        const sleep_hours_details = String(sleepHoursDetails);
        const social_groups_details = String(socialGroupsDetails);
        const living_situation_details = String(livingSituationDetails);
        const coping_with_stress_details = String(copingWithStressDetails);

        /**
         * treatment history variables
         */
        const mental_health_treatment_details = String(mentalHealthTreatmentDetails);
        const treatment_history_details = String(treatmentHistoryDetails);
        const currently_in_therapy_details = String(currentlyInTherapyDetails);
        const negative_experience_with_mental_health_treatment_details = String(negativeExperienceWithMentalHealthTreatmentDetails);
        const currently_under_care_of_psychiatrist_details = String(currentlyUnderCareOfPsychiatristDetails);
        const stopped_taking_psychiatric_medications_details = String(stoppedTakingPsychiatricMedicationsDetails);
        const side_effects_from_psychiatric_medications_details = String(sideEffectsFromPsychiatricMedicationsDetails);
        const consistent_with_attending_therapy_or_taking_medications_details = String(consistentWithAttendingTherapyOrTakingMedicationsDetails);

        const { clinicType } = req.query;

        const clinic_type = decodeURIComponent(String(clinicType))

        const patient_type = String(type);

        const first_name = String(firstName);
        const last_name = String(lastName);
        const email_address = String(email);
        const phone_number = String(phoneNumber);
        const appointment_date = dayjs(appointmentDate).format("YYYY-MM-DD");
        const appointment_time = dayjs(preferredTime).format("hh:mm");

        const allergies_details = String(allergiesDetails);
        const taking_prescription_medication_details = String(takingPrescriptionMedicationDetails);
        const chronic_condition_details = String(chronicConditionDetails);
        const surgeries_details = String(surgeriesDetails);
        const jaw_pain_details = String(jawPainDetails);
        const experienced_excessive_bleeding_details = String(experiencedExcessiveBleedingDetails);
        const heart_problems_details = String(heartProblemsDetails);
        const advised_taking_antibiotics_details = String(advisedTakingAntibioticsDetails);

        const smoke_details = String(smokeDetails);
        const consume_sugary_foods_or_drinks_details = String(consumeSugaryFoodsOrDrinksDetails);
        const dental_floss_details = String(dentalFlossDetails);
        const consume_alcohol_details = String(consumeAlcoholDetails);
        const participate_in_sports_details = String(participateInSportsDetails);
        const balanced_diet_details = String(balancedDietDetails);
        const regular_exercise_details = String(regularExerciseDetails);
        const eating_disorder_details = String(eatingDisordersDetails);

        const experience_bleeding_details = String(experienceBleedingDetails);
        const tooth_sensitivity_details = String(toothSensitivityDetails);
        const dental_appearance_details = String(dentalAppearanceDetails);
        const loose_teeth_details = String(looseTeethDetails);
        const bad_breath_or_bad_taste_details = String(badBreathOrBadTasteDetails);
        const dental_xrays_details = String(dentalXraysDetails);
        const dental_restoration_details = String(dentalRestorationDetails);
        const orthodontic_treatment_details = String(orthodonticTreatmentDetails);

        const brush_frequency_details = String(brushFrequencyDetails);
        const use_mouth_wash_details = String(useMouthWashDetails);
        const replace_toothbrush_details = String(replaceToothbrushDetails);
        const clean_tongue_details = String(cleanTongueDetails);
        const regular_checkup_details = String(regularCheckupDetails);
        const dental_anxiety_details = String(dentalAnxietyDetails);
        const dental_trauma_details = String(dentalTraumaDetails);
        const consent_field = String(consent);

        const admin_id_field = parseInt(admin_id);
        const clinic_name_field = String(clinic_name);
        const appointment_id_field = parseInt(appointmentID);
        const clinic_appointment_id_field = parseInt(clinic_appointment_id);

        if (!first_name && !last_name && !email_address && !phone_number && !appointment_date && !appointment_time && !allergies_details && !taking_prescription_medication_details && !chronic_condition_details && !surgeries_details && !jaw_pain_details && !experienced_excessive_bleeding_details && !heart_problems_details && !advised_taking_antibiotics_details && !smoke_details && !consume_sugary_foods_or_drinks_details && !dental_floss_details && !consume_alcohol_details && !participate_in_sports_details && !balanced_diet_details && !regular_exercise_details && !eating_disorder_details && !experience_bleeding_details && !tooth_sensitivity_details && !dental_appearance_details && !loose_teeth_details && !bad_breath_or_bad_taste_details && !dental_xrays_details && !dental_restoration_details && !orthodontic_treatment_details && !brush_frequency_details && !use_mouth_wash_details && !replace_toothbrush_details && !clean_tongue_details && !regular_checkup_details && !dental_anxiety_details && !dental_trauma_details && !consent_field && !admin_id_field && !clinic_name_field && !appointment_id_field) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! All fields are required"
            })
        }

        if (isNaN(admin_id_field) || isNaN(appointment_id_field)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid! Admin ID and appointment ID must be a number"
            })
        }
        const clinic_instance = new Clinic();

        if (!(clinic_instance instanceof Clinic)) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to instantiate clinic instance model"
            })
        }

        try {
            if (clinic_type === "Dental Clinic") {
                const consult_patient_values = {
                    firstName: first_name,
                    lastName: last_name,
                    emailAddress: email_address,
                    phoneNumber: phone_number,
                    appointmentDate: appointment_date,
                    appointmentTime: appointment_time,
                    allergiesDetails: allergies_details,
                    takingPrescriptionMedicationDetails: taking_prescription_medication_details,
                    chronicConditionDetails: chronic_condition_details,
                    surgeriesDetails: surgeries_details,
                    jawPainDetails: jaw_pain_details,
                    experiencedExcessiveBleedingDetails: experienced_excessive_bleeding_details,
                    heartProblemsDetails: heart_problems_details,
                    advisedTakingAntibioticsDetails: advised_taking_antibiotics_details,
                    smokeDetails: smoke_details,
                    consumeSugaryFoodOrDrinksDetails: consume_sugary_foods_or_drinks_details,
                    dentalFlossDetails: dental_floss_details,
                    consumeAlcoholDetails: consume_alcohol_details,
                    participateInSportsDetails: participate_in_sports_details,
                    balancedDietDetails: balanced_diet_details,
                    regularExerciseDetails: regular_exercise_details,
                    eatingDisorderDetails: eating_disorder_details,
                    experienceBleedingDetails: experience_bleeding_details,
                    toothSensitivityDetails: tooth_sensitivity_details,
                    dentalAppearanceDetails: dental_appearance_details,
                    looseTeethDetails: loose_teeth_details,
                    badBreathOrBadTasteDetails: bad_breath_or_bad_taste_details,
                    dentalXraysDetails: dental_xrays_details,
                    dentalRestorationDetails: dental_restoration_details,
                    orthodonticTreatmentDetails: orthodontic_treatment_details,
                    brushFrequencyDetails: brush_frequency_details,
                    useMouthWashDetails: use_mouth_wash_details,
                    replaceToothbrushDetails: replace_toothbrush_details,
                    cleanTongueDetails: clean_tongue_details,
                    regularCheckupDetails: regular_checkup_details,
                    dentalAnxietyDetails: dental_anxiety_details,
                    dentalTraumaDetails: dental_trauma_details,
                    consent: consent_field,
                    adminId: admin_id_field,
                    clinicName: clinic_name_field,
                    appointmentId: appointment_id_field
                }

                const consulted_patient_result = await clinic_instance.consultPatientInClinicSideAppointment(consult_patient_values);

                if (!consulted_patient_result || consulted_patient_result.length === 0) {
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                        message: "Failed to consult patient in clinic side appointment"
                    })
                }
            } else if (clinic_type === "Psychiatry Clinic") {
                const psychiatry_consultation_values = {
                    clinic_appointment_id_field: clinic_appointment_id_field,
                    appointmentID: appointment_id_field,
                    first_name: first_name,
                    last_name: last_name,
                    email: email_address,
                    phone_number: phone_number,
                    appointment_date: appointment_date,
                    appointment_time: appointment_time,
                    diagnosed_mental_health_condition_details: diagnosed_mental_health_condition_details,
                    taking_psychiatric_medication_details: taking_psychiatric_medication_details,
                    hospitalized_for_mental_health_reason_details: hospitalized_for_mental_health_reason_details,
                    family_history_of_mental_health_conditions_details: family_history_of_mental_health_condition_details,
                    suicidal_thoughts_or_behaviors_details: suicidal_thoughts_or_behaviors_details,
                    self_harm_or_suicide_details: self_harm_or_suicide_details,
                    counseling_or_therapy_details: counseling_or_therapy_details,
                    emotional_or_behavioral_patterns_details: emotional_or_behavioral_patterns_details,
                    mood_details: mood_details,
                    excessive_worry_or_anxiety_details: excessive_worry_or_anxiety_details,
                    sleep_patterns_details: sleep_patterns_details,
                    appetite_or_weight_details: appetite_or_weight_details,
                    sleep_changes_details: sleep_changes_details,
                    hopelessness_or_worthlessness_details: hopelessness_or_worthlessness_details,
                    agitation_or_impulsivity_details: agitation_or_impulsivity_details,
                    difficulty_concentrating_details: difficulty_concentrating_details,
                    stress_levels_details: stress_levels_details,
                    support_system_details: support_system_details,
                    major_life_changes_details: major_life_changes_details,
                    substances_details: substances_details,
                    sleep_hours_details: sleep_hours_details,
                    social_groups_details: social_groups_details,
                    living_situation_details: living_situation_details,
                    coping_with_stress_details: coping_with_stress_details,
                    mental_health_treatment_details: mental_health_treatment_details,
                    treatment_history_details: treatment_history_details,
                    currently_in_therapy_details: currently_in_therapy_details,
                    negative_experience_with_mental_health_treatment_details: negative_experience_with_mental_health_treatment_details,
                    currently_under_care_of_psychiatrist_details: currently_under_care_of_psychiatrist_details,
                    stopped_taking_psychiatric_medications_details: stopped_taking_psychiatric_medications_details,
                    side_effects_from_psychiatric_medications_details: side_effects_from_psychiatric_medications_details,
                    consistent_with_attending_therapy_or_taking_medications_details: consistent_with_attending_therapy_or_taking_medications_details,
                    consent_value: consent_field,
                    clinic_name_field: clinic_name_field,
                    admin_id_field: admin_id_field,
                    patient_type: patient_type
                }

                const psychiatry_consulted_result = await clinic_instance.consultingPatientInPsychiatryClinicSideTable(psychiatry_consultation_values);

                if (!psychiatry_consulted_result || psychiatry_consulted_result.length === 0) {
                    return res.status(StatusCodes.NOT_FOUND).json({
                        message: "No psychiatry patients found to be consulted in clinic side tables"
                    })
                }
            }

            return res.status(StatusCodes.OK).json({
                message: "Patient Consulted Succesfully in Clinic Side Appointment"
            })
        } catch (error) {
            if (error.message === "Failed to consult a patient in clinic side appointment with consultation questionnaires") {
                logger.log("error", `Failed to consult a patient in clinic side appointment with consultation questionnaires: ${error}`)
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: "Failed to consult a patient in clinic side appointment with consultation questionnaires"
                })
            }

            logger.log("error", `Failed to consult patient in clinic side appointment: ${error}`)
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to consult patient in clinic side appointment"
            })
        }
    }
)

/**
 * @function to add a section header
 */
const addSection = (doc, title, yPos, margin, pageWidth) => {
    const pageHeight = doc.page.height - 50;
    const requiredSpace = 30;

    if (yPos + requiredSpace > pageHeight) {
        doc.addPage();
        yPos = 20;
    }

    doc.font("Helvetica-Bold")
        .fontSize(14)
        .text(title.toUpperCase(), margin, yPos, {
            width: pageWidth - margin * 2
        });
    doc.moveTo(margin, yPos + 14)
        .lineTo(pageWidth - margin, yPos + 14)
        .lineWidth(0.5)
        .strokeColor("#2980b9")
        .stroke()
    return yPos + 25
}

/**
 * @function to add a key-value in PDF
 */
const addKeyValue = (doc, key, value, yPos, margin, maxWidth, isSubItem = false) => {
    const pageHeight = doc.page.height - 50;
    const requiredSpace = 20;

    if (yPos + requiredSpace > pageHeight) {
        doc.addPage();
        yPos = 20;
    }

    const startX = isSubItem ? margin + 45 : margin + 5;
    const keyWidth = isSubItem ? 130 : 250;
    const spacing = 80; // Consistent spacing between key and value
    const valueStart = startX + keyWidth + spacing;
    const valueWidth = maxWidth - (valueStart - margin); // Calculate remaining width for value

    /**
     * set the font of key
     */
    doc.font("Helvetica-Bold")
        .fontSize(10)
        .text(key, startX, yPos, {
            width: keyWidth,
            align: "left",
        })

    /**
     * set the font of value
     */
    doc.font("Helvetica")
        .fontSize(10)
        .text(value || "N/A", valueStart, yPos, {
            width: valueWidth,
            align: "left"
        })

    const valueHeight = doc.heightOfString(value || "N/A", {
        width: valueWidth
    })

    return yPos + Math.max(14, valueHeight + 6);
}

// Field configurations for different clinic types
const clinicFieldConfigs = {
    "Dental Clinic": {
        patientInfo: {
            firstName: "patient_first_name",
            lastName: "patient_last_name",
            email: "patient_email",
            phoneNumber: "phone_number"
        },
        medicalHistory: [
            { label: "Documented Allergic Reactions", field: "allergy_details" },
            { label: "Current Prescription Medications", field: "taking_prescription_medication_details" },
            { label: "Chronic Health Conditions", field: "chronic_condition_details" },
            { label: "Temporomandibular Joint (TMJ) or Jaw Pain History", field: "history_of_jaw_pain_details" },
            { label: "History of Excessive Bleeding", field: "experienced_excessive_bleeding_details" },
            { label: "Cardiovascular History", field: "past_history_of_cardiovascular_issues" },
            { label: "Prophylactic Antibiotic Recommendation", field: "advised_taking_antibiotics_details" },
            { label: "Surgical History", field: "past_surgeries_details" }
        ],
        lifestyleAssessment: [
            { label: "Gingival Bleeding History", field: "experience_bleeding_details" },
            { label: "Dental Sensitivity Description", field: "tooth_sensitivity_details" },
            { label: "Concerns Regarding Dental Aesthetics", field: "dental_appearance_details" },
            { label: "Tooth Mobility Observations", field: "loose_teeth_details" },
            { label: "Regular Physical Activity", field: "regular_exercise_details" },
            { label: "Alcohol Consumption Habits", field: "consume_alcohol_details" },
            { label: "Dental Floss Usage", field: "dental_floss_details" },
            { label: "Intake of Sugary Foods or Beverages", field: "consume_sugary_foods_or_beverages_details" },
            { label: "Oral Malodor or Dysgeusia", field: "bad_breath_or_bad_taste_details" },
            { label: "Recent Dental Radiographs", field: "dental_xrays_details" },
            { label: "Nutritional Balance and Diet Quality", field: "balanced_diet_details" },
            { label: "Tobacco Use Frequency", field: "smoke_frequency_details" },
            { label: "Engagement in Athletic Activities", field: "participate_in_sports_details" },
            { label: "Previous Dental Restorations", field: "dental_restoration_details" },
            { label: "History of Orthodontic Interventions", field: "orthodontic_treatment_details" },
            { label: "Brushing Frequency", field: "brush_frequency_details" },
            { label: "Mouthwash Usage", field: "use_mouthwash_details" },
            { label: "Toothbrush Replacement Frequency", field: "replace_toothbrush_details" },
            { label: "Tongue Cleaning Practices", field: "clean_tongue_details" },
            { label: "Regular Dental Check-up Attendance", field: "regular_checkup_details" },
            { label: "Dental Anxiety Level", field: "dental_anxiety_details" },
            { label: "History of Dental Trauma", field: "dental_trauma_details" },
            { label: "Eating Disorder History", field: "eating_disorder_details" }
        ]
    },
    "Psychiatry Clinic": {
        patientInfo: {
            firstName: "first_name",
            lastName: "last_name",
            email: "email",
            phoneNumber: "phone_number"
        },
        medicalHistory: [
            { label: "Diagnosed Mental Health Conditions", field: "diagnosed_mental_health_condition_details" },
            { label: "Current Psychiatric Medications", field: "taking_psychiatric_medication_details" },
            { label: "History of Psychiatric Hospitalization", field: "hospitalized_for_mental_health_reason_details" },
            { label: "Family History of Mental Health Conditions", field: "family_history_of_mental_health_condition_details" },
            { label: "Suicidal Thoughts or Behaviors", field: "suicidal_thoughts_or_behavior_details" },
            { label: "Self-Harm or Suicide Attempts", field: "self_harm_or_suicide_details" },
            { label: "Counseling or Therapy History", field: "counseling_or_therapy_details" },
            { label: "Emotional or Behavioral Patterns", field: "emotional_or_behavioral_patterns_details" }
        ],
        lifestyleAssessment: [
            { label: "Mood Patterns", field: "mood_details" },
            { label: "Excessive Worry or Anxiety", field: "excessive_worry_or_anxiety_details" },
            { label: "Sleep Patterns", field: "sleep_patterns_details" },
            { label: "Appetite or Weight Changes", field: "appetite_or_weight_details" },
            { label: "Sleep Changes", field: "sleep_changes_details" },
            { label: "Feelings of Hopelessness or Worthlessness", field: "hopelessness_or_worthlessness_details" },
            { label: "Agitation or Impulsivity", field: "agitation_or_impulsivity_details" },
            { label: "Difficulty Concentrating", field: "difficulty_concentrating_details" },
            { label: "Stress Levels", field: "stress_level_details" },
            { label: "Support System", field: "support_system_details" },
            { label: "Major Life Changes", field: "major_life_changes_details" },
            { label: "Substance Use", field: "substances_details" },
            { label: "Sleep Hours", field: "sleep_hours_details" },
            { label: "Social Groups", field: "social_group_details" },
            { label: "Living Situation", field: "living_situation_details" },
            { label: "Coping with Stress", field: "coping_with_stress_details" },
            { label: "Mental Health Treatment History", field: "mental_health_treatment_details" },
            { label: "Previous Treatment History", field: "treatment_history_details" },
            { label: "Currently in Therapy", field: "currently_in_therapy_details" },
            { label: "Negative Experience with Mental Health Treatment", field: "negative_experience_with_mental_health_treatment_details" },
            { label: "Currently Under Care of Psychiatrist", field: "currently_undercare_of_psychiatrist_details" },
            { label: "Stopped Taking Psychiatric Medications", field: "stopped_taking_psychiatric_medication_details" },
            { label: "Side Effects from Psychiatric Medications", field: "side_effects_from_psychiatric_medication_details" },
            { label: "Consistent with Therapy/Medication Attendance", field: "consistent_with_attending_therapy_or_taking_medication_details" }
        ]
    }
};

/**
 * @function controller logic to auto-generate a medical history and appointment details and download PDF
 */
export const autoGenerateMedicalReport = asyncHandler(
    async (req, res) => {
        try {
            const { patient } = req.body;
            const { appointmentID } = req.query;

            if (!patient) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Patient details are required"
                })
            }

            if (!appointmentID) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Appointment ID is required"
                })
            }

            // Get clinic type from patient data
            const clinicType = patient.clinic_type || "Dental Clinic";
            const fieldConfig = clinicFieldConfigs[clinicType];

            if (!fieldConfig) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Unsupported clinic type: ${clinicType}`
                })
            }

            const doc = new PDFDocument({ margin: 15 });

            const pathInfo = await autoGenerateMedicalReportPath(patient);

            const pageWidth = doc.page.width;
            const margin = 50;
            const maxWidth = pageWidth - 2 * margin;
            let yPos = 30;

            /**
             * Header
             */
            doc.fontSize(18)
                .font("Helvetica-Bold")
                .text("Medical Consultation Result", margin, yPos, {
                    align: "center",
                    width: maxWidth
                });
            yPos += 25;

            /**
             * Clinic Name
             */
            doc.fontSize(12)
                .font("Helvetica-Bold")
                .text(patient.clinic_name, margin, yPos, {
                    align: "center",
                    width: maxWidth
                });
            yPos += 35;

            const appointmentDate = dayjs(patient.appointment_date).format("MMM D, YYYY");
            const timeStr = patient.appointment_time;
            const [hours, minutes] = timeStr.split(":");
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? "PM" : "AM";
            const adjustedHours = hour % 12 || 12;
            const formattedTime = `${adjustedHours}:${minutes} ${ampm}`;

            /**
             * Patient Information Details
             */
            yPos = addSection(doc, "Patient Information", yPos, margin, pageWidth);
            yPos = addKeyValue(doc, "Name", `${patient[fieldConfig.patientInfo.firstName]} ${patient[fieldConfig.patientInfo.lastName]}`, yPos, margin, maxWidth);
            yPos = addKeyValue(doc, "Email", `${patient[fieldConfig.patientInfo.email]}`, yPos, margin, maxWidth);
            yPos = addKeyValue(doc, "Phone Number", `${patient[fieldConfig.patientInfo.phoneNumber]}`, yPos, margin, maxWidth);
            yPos = addKeyValue(doc, "Appointment Date", `${appointmentDate}`, yPos, margin, maxWidth);
            yPos = addKeyValue(doc, "Appointment Time", `${formattedTime}`, yPos, margin, maxWidth);
            yPos = addKeyValue(doc, "Gender", `${patient.gender}`, yPos, margin, maxWidth);
            yPos = addKeyValue(doc, "Status", `${patient.status}`, yPos, margin, maxWidth);
            yPos = addKeyValue(doc, "Purpose of Appointment", `${patient.purposeOfAppointment}`, yPos, margin, maxWidth);

            yPos += 5;

            /**
             * Medical History Details
             */
            yPos = addSection(doc, "Medical History", yPos, margin, pageWidth);
            fieldConfig.medicalHistory.forEach((field, index) => {
                yPos = addKeyValue(doc, field.label, `${patient[field.field]}`, yPos, margin, maxWidth);
            })
            /**
             * Lifestyle Assessment
             */
            yPos += 15;
            yPos = addSection(doc, "Lifestyle Assessment", yPos, margin, pageWidth);
            fieldConfig.lifestyleAssessment.forEach((field, index) => {
                yPos = addKeyValue(doc, field.label, `${patient[field.field]}`, yPos, margin, maxWidth);
            })

            const remainingSpace = doc.page.height - 50;

            if (yPos > remainingSpace) {
                doc.addPage();
                yPos = margin
            } else {
                yPos = doc.page.height - 45
            }

            /**
             * Footer
             */
            try {
                doc.fontSize(10)
                    .font("Helvetica-Oblique")
                    .text("This is a system-generated documented. No signature is required", margin, yPos, {
                        align: "center",
                        width: maxWidth
                    })
                doc.fontSize(10)
                    .font("Helvetica-Oblique")
                    .text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPos + 15, {
                        align: "center",
                        width: maxWidth
                    })
            } catch (error) {
                logger.log("error", `Failed to add footer in controller: ${error}`);
            }

            const pdfBuffer = await new Promise((resolve, reject) => {
                const chunks = [];
                doc.on("data", (chunk) => chunks.push(chunk));
                doc.on("end", () => {
                    try {
                        const pdfBuffer = Buffer.concat(chunks);
                        resolve(pdfBuffer);
                    } catch (error) {
                        reject(error);
                    }
                })

                doc.on("error", reject);

                if (doc.bufferedPageRange().count === 0) {
                    doc.addPage();
                }
                doc.end();
            })

            const baseURL = `${req.protocol}://${req.get("host")}`;
            const relativePath = await saveMedicalReport(pdfBuffer, pathInfo);
            const downloadURL = `${baseURL}/${relativePath}`;

            res.status(StatusCodes.OK).json({
                success: true,
                downloadURL,
                message: "Medical report generated successfully",
                appointmentID: appointmentID
            })
        } catch (error) {
            logger.log("error", `Failed to auto-generate a medical report in controller: ${error}`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to auto-generate a medical report"
            })
        }
    }
)

/**
 * @controller Check the daily appointment count for a patient
 * @route GET /cms.api.com/patient/dashboard/appointments/daily-count
 * @access Private
 */
export const getDailyAppointmentCount = asyncHandler(async (req, res) => {
    try {
        const {
            patientID,
            appointmentDate
        } = req.query;

        const patient_id = parseInt(patientID);

        if (isNaN(patient_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Patient ID is required'
            });
        }

        if (!appointmentDate) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Appointment date is required"
            })
        }

        const formattedDate = dayjs(appointmentDate).format("YYYY-MM-DD");
        if (formattedDate === "Invalid Date") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid appointment date"
            })
        }

        const clinic = new Clinic();
        const count = await clinic.countDailyAppointments({
            patientID: patient_id,
            appointmentDate: formattedDate
        });

        logger.log(`info`, `Daily appointment count for patient ${patient_id} on ${formattedDate}: ${count}`);

        return res.status(StatusCodes.OK).json({
            success: true,
            count: count,
            message: "Daily appointment count retrieved successfully"
        });
    } catch (error) {
        logger.error(`Error getting daily appointment count: ${error.message}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to get daily appointment count',
            error: error.message
        });
    }
});

/**
 * @controller controller logic to filter all booked appointment of a patient in patient side
 */
export const filterAllBookedAppointments = asyncHandler(
    async (req, res) => {
        try {
            const { search = "", page = 1, limit = 10, email } = req.query;

            if (!email) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Please enter a valid email address"
                })
            }

            const email_address = String(email);
            const search_value = String(search);
            const page_value = parseInt(page);
            const limit_value = parseInt(limit);

            const clinic_instance = new Clinic();

            if (!search_value.trim()) {
                const result = await clinic_instance.returnAllBookedAppointments({
                    page: page_value,
                    limit: limit_value,
                    email: email_address,
                });

                if (!result || result.length === 0) {
                    return res.status(StatusCodes.NOT_FOUND).json({
                        message: "No returned all booked appointments found"
                    });
                }

                return res.status(StatusCodes.OK).json({
                    success: true,
                    data: result.data,
                    pagination: result.pagination,
                    message: "Returned all booked appointment successfully"
                });
            }

            const result = await clinic_instance.filterAllBookedAppointments({
                search: search_value,
                page: page_value,
                limit: limit_value,
                email: email_address
            });

            return res.status(StatusCodes.OK).json({
                success: true,
                data: result.data,
                pagination: result.pagination,
                message: "Filtered all booked appointment successfully"
            });
        } catch (error) {
            logger.log(`error`, `Failed to filter all booked appointments of a patient in controller: ${error}`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to filter all booked appointments of a patient"
            })
        }
    }
)

/**
 * @function controller loigc for searching the pending booked appointment of a patient in patient side
 */
export const searchPendingBookedAppointments = asyncHandler(
    async (req, res) => {
        try {
            const {
                search = "",
                page = 1,
                limit = 10,
                email
            } = req.query;

            if (!email) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Please enter a valid email address"
                })
            }

            const email_address = String(email);
            const search_value = String(search);
            const page_value = parseInt(page);
            const limit_value = parseInt(limit);

            const clinic_instance = new Clinic();

            const patient_status = String("Pending");

            if (!search_value.trim()) {
                const result = await clinic_instance.returnPendingBookedAppointments({
                    page: page_value,
                    limit: limit_value,
                    email: email_address,
                    status: patient_status
                });

                if (!result || result.length === 0) {
                    return res.status(StatusCodes.NOT_FOUND).json({
                        message: "No pending booked appointments found"
                    })
                }

                return res.status(StatusCodes.OK).json({
                    success: true,
                    data: result.appointments,
                    pagination: result.pagination,
                    message: "Returned pending booked appointments successfully"
                })
            }

            const result = await clinic_instance.searchPendingBookedAppointments({
                search: search_value,
                page: page_value,
                limit: limit_value,
                email: email_address
            });

            if (!result || result.length === 0) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "No pending booked appointments found"
                })
            }
            return res.status(StatusCodes.OK).json({
                success: true,
                data: result.appointments,
                pagination: result.pagination,
                message: "Filtered pending booked appointments successfully"
            })
        } catch (error) {
            logger.log(`error`, `Failed to search pending booked appointments of a patient in controller: ${error}`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to search pending booked appointments of a patient"
            })
        }
    }
)

/**
 * @function controller to handle appointment status changes to automate reminder/confirmation in patient side
 */
export const handleAutomatedUpdateStatus = asyncHandler(
    async (req, res) => {
        try {
            const { appointmentID, status } = req.body;

            const appointment_id = parseInt(appointmentID);
            const patient_status = String(status);

            const clinic_instance = new Clinic();
            const result = await clinic_instance.handleAutomatedUpdateStatus({
                appointmentID: appointment_id,
                status: patient_status
            });

            return res.status(StatusCodes.OK).json({
                success: true,
                result
            })
        } catch (error) {
            logger.log(`error`, `Failed to handle automated update status in controller: ${error}`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to handle automated update status"
            })
        }
    }
)

/**
 * @function controller logic to scheedule reminders for upcoming appointments
 */
export const scheduleReminderForUpcomingAppointments = asyncHandler(
    async (req, res) => {
        try {
            const clinic_instance = new Clinic();
            const result = await clinic_instance.scheduleRemindersForUpcomingAppointments({});

            if (!result || result.length === 0) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "No appointments found for scheduling upcoming reminders in the next hour",
                })
            };

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Reminders scheduled successfully",
                data: result,
                process_appointments: result.process_appointments,
                model_message: result.success
            });
        } catch (error) {
            logger.log(`error`, `Failed to schedule reminder for upcoming appointments in controller: ${error}`);

            if (error.message.includes("No appointments found for scheduling upcoming reminders")) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: error.message
                })
            }

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to schedule reminder for upcoming appointments"
            })
        }
    }
)

/**
 * @function controller logic to process a follow up message via sms, email
 */
export const processFollowUpMessage = asyncHandler(
    async (req, res) => {
        try {
            const clinic = new Clinic();

            if (!(clinic instanceof Clinic)) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: "Failed to instantiate clinic model"
                })
            }

            const appointments = await clinic.getCompletedAppointmentsForFollowUp({
                daysAfter: 1,
                clinicID: req.user.id
            });

            if (!appointments || appointments.length === 0) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "No appointments found for follow up message"
                })
            }

            for (const appt of appointments) {
                try {
                    await sendFollowUpMessage(appt);
                    await clinic.markFollowUpSent({
                        appointmentID: appt.appointmentID
                    });
                    logger.log(`info`, `Follow up message sent successfully for appointment ID: ${appt.appointmentID}`);
                } catch (error) {
                    logger.error(`Failed to process follow up message in controller: ${error}`);
                    continue;
                }
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Follow up message processed successfully"
            })
        } catch (error) {
            logger.log(`error`, `Failed to process follow up message in controller: ${error}`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to process follow up message"
            })
        }
    }
)

/**
 * @function controller search logic to filter the approved booked appointment details of patient in patient side table
 */
export const searchApprovedBookedAppointments = asyncHandler(
    async (req, res) => {
        try {

            const {
                search = "",
                page = 1,
                limit = 10,
                email
            } = req.query;

            const search_term = String(search);
            const page_value = parseInt(page);
            const limit_value = parseInt(limit);
            const email_address = String(email);

            const clinic_instance = new Clinic();

            if (!clinic_instance instanceof Clinic) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: "Failed to instantiate clinic instance in filtering approved booked appointments"
                })
            }

            const patientStatus = String("Approved");

            if (!search_term.trim()) {
                /**
                 * returns all approved boooked appointment when no search term is provided
                 */
                const result = await clinic_instance.getAllApprovedBookedAppoinmentsByPatient({
                    page: page_value,
                    limit: limit_value,
                    patientEmail: email_address,
                    status: patientStatus
                });

                if (!result || result.length === 0) {
                    return res.status(StatusCodes.NOT_FOUND).json({
                        message: "No approved booked appointments found"
                    })
                }

                return res.status(StatusCodes.OK).json({
                    sucess: true,
                    message: "No filtered approved booked appointments found",
                    result: result.appointments,
                    pagination: result.pagination,
                    model_message: result.message
                })
            }

            const result = await clinic_instance.searchApprovedBookedAppointments({
                search: search_term,
                page: page_value,
                limit: limit_value,
                email: email_address
            })

            if (result.length === 0) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "No approved booked appointments found"
                })
            }

            return res.status(StatusCodes.OK).json({
                sucess: true,
                message: "Filtered approved booked appointments found",
                result: result.appointments,
                pagination: result.pagination,
                model_message: result.message
            })
        } catch (error) {
            logger.log(`error`, `Failed to search approved booked appointments in controller: ${error}`);

            if (error.message === "No approved booked appointments found") {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: error.message
                })
            }

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to search approved booked appointments"
            })
        }
    }
)

/**
 * @function controller logic to filter declined booked appointemtn details in patient side table
 */
export const searchDeclinedBookedAppointments = asyncHandler(
    async (req, res) => {
        try {
            const {
                search = "",
                page = 1,
                limit = 10,
                email
            } = req.query;

            const search_term = String(search);
            const page_value = parseInt(page);
            const limit_value = parseInt(limit);
            const email_address = String(email);

            const patient_status = String("Declined");

            const clinic_instance = new Clinic();
            if (!clinic_instance instanceof Clinic) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: "Failed to instantiate clinic instance in filtering declined booked appointments"
                })
            }

            if (!search_term.trim()) {
                /**
                 * return declined booked appointment when there is no search term provided
                 */

                const result = await clinic_instance.returnDeclinedBookedAppointments({
                    page: page_value,
                    limit: limit_value,
                    email: email_address,
                    status: patient_status
                });

                if (!result || result.length === 0) {
                    return res.status(StatusCodes.NOT_FOUND).json({
                        message: "No returned declined booked appointments found"
                    })
                }

                return res.status(StatusCodes.OK).json({
                    message: "Successfully returned declined booked appointments",
                    success: true,
                    data: result.appointments,
                    pagination: result.pagination,
                    model_message: result.message
                })
            }

            /**
             * @method searchDeclinedBookedAppointments
             * filter declined booked appointments based on search term provided
             */
            const result = await clinic_instance.searchDeclinedBookedAppointments({
                search: search_term,
                page: page_value,
                limit: limit_value,
                email: email_address,
                status: patient_status
            });

            if (!result || result.length === 0) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "No returned declined booked appointments found"
                })
            }

            return res.status(StatusCodes.OK).json({
                message: "Successfully filtered declined booked appointments",
                success: true,
                data: result.appointments,
                pagination: result.pagination,
                model_message: result.message
            })
        } catch (error) {
            logger.log(`error`, `Failed to filter declined booked appointment in controller: ${error}`);

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to filter declined booked appointment"
            })
        }
    }
)

/**
 * @controller function to retrieve the popular appointment date, appointment time and days being a data analytics
 * @access {private}
 * @route /cms.api.com/clinic/analytics/popular_appointments
 */
export const getPopularAppointmentsAnalytics = asyncHandler(
    async (req, res) => {
        const {
            clinicID,
            startDate,
            endDate
        } = req.query;

        const clinic_id = parseInt(clinicID);

        if (!clinic_id || isNaN(clinic_id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please provide a valid clinic id"
            })
        }

        let start_date = startDate ? dayjs(startDate).format("YYYY-MM-DD") : null;
        let end_date = endDate ? dayjs(endDate).format("YYYY-MM-DD") : null;

        if (start_date === "Invalid Date") start_date = null;

        if (end_date === "Invalid Date") end_date = null;

        const clinic_instance = new Clinic();

        const result = await clinic_instance.getPopularAppointmentAnalytics({
            clinicID: clinic_id,
            startDate: start_date,
            endDate: end_date
        })

        if (!result) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No popularity analytics found"
            })
        }

        logger.log(`info`, `Successfully filtered popularity based in appointment dates, appointments times and days for clinic ID: ${clinic_id}`);

        return res.status(StatusCodes.OK).json({
            success: true,
            dates: result.dates.labels,
            datesCounts: result.dates.counts,
            times: result.times.labels,
            timesCounts: result.times.counts,
            days: result.days.labels,
            daysCounts: result.days.counts,
            model_message: result.message,
            controller_message: "Successfully filtered popularity based in appointment dates, appointments times and days"
        });
    }
)

/**
 * @function controller retrieve the unqiue columns of consultation questionnaires based on clinic type of accounts
 * @access {private}
 * @route /cms.api.com/clinic/consultation_questionnaire_sections
 */
export const getConsultationSections = asyncHandler(
    async (req, res) => {
        try {
            const { clinicID } = req.query;

            const clinic_id = parseInt(clinicID);

            if (isNaN(clinicID)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Clinic id must be a number"
                })
            }

            const clinic_instance = new Clinic();

            const result = await clinic_instance.getConsultationSections({
                clinicID: clinic_id
            })

            if (!result) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "No consultation questionnaire sections found"
                })
            }

            const defaultSections = [
                "Patient Information",
                "Consent and Agreement"
            ];

            const dynamicSections = result.sections.filter(
                (section) => !defaultSections.includes(section)
            );

            const allSections = [
                "Patient Information",
                ...dynamicSections,
                "Consent and Agreement"
            ];

            logger.log(`info`, `Successfully retrieved the unique section columns of consultation questionnaires for clinic ID: ${clinic_id}`);

            return res.status(StatusCodes.OK).json({
                success: true,
                sections: allSections,
                model_message: result.message,
                controller_message: "Successfully retrieved the unique section columns of consultation questionnaires"
            });
        } catch (error) {
            logger.log(`error`, `Failed to retrieve the unique section columns of consultation questionnaires: ${error}`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to retrieve the unique section columns of consultation questionnaires"
            })
        }
    }
)

/**
 * @function controller retrieve the questions of n questionnaires based on section
 * @access {private}
 * @route /cms.api.com/clinic/consultation_questionnaire_questions
 */
export const getConsultationQuestionsBySection = asyncHandler(
    async (req, res) => {
        try {
            const { section, clinicID, clinicType } = req.query;

            const clinic_id = parseInt(clinicID);
            const clinic_type = String(clinicType);

            if (isNaN(clinicID)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Clinic id must be a number"
                })
            }

            const clinic_instance = new Clinic();

            const result = await clinic_instance.getConsultationQuestionsBySection({
                section: section,
                clinicID: clinic_id,
                clinicType: clinic_type
            })

            if (!result) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "No consultation questionnaire questions found"
                })
            }

            logger.log(`info`, `Successfully retrieved the consultation questions based on section for clinic ID: ${clinic_id}`);

            return res.status(StatusCodes.OK).json({
                success: true,
                questions: result.questions,
                model_message: result.message,
                controller_message: "Successfully retrieved the consultation questions based on section"
            });
        } catch (error) {
            logger.log(`error`, `Failed to retrieve the consultation questions based on section: ${error}`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to retrieve the consultation questions based on section"
            })
        }
    }
)