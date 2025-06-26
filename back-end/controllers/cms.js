import { StatusCodes } from 'http-status-codes';
import conn from "../db/mysql/conn.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import "../main.js";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import Clinic from '../models/Clinic.Model.js';
import validatePatientConsultation from '../middleware/ValidatePatientConsulation.js';
import logger from "../config/winston.js";
import { promisify } from "util";
import asyncHandler from "../middleware/asyncHandler/asyncHandler.js";
dotenv.config();

// controller logic for a global route
export const CMS = async (req, res) => {
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
}

// controller logic for register patients accounts
export const registerPatientAccount = async (req, res) => {
    try {
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
            dateOfBirth
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        // 2nd table of patients register account
        const query2 = `INSERT INTO patientsregisteraccount2 (
            phoneNumber,
            password,
            confirmPassword,
            patientID,
            status
        ) VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await conn.query(query1, [
            firstName,
            lastName,
            email,
            address_field,
            gender_field,
            civil_status,
            formattedDate
        ]);
        const patientID = result.insertId;

        await conn.query(query2, [
            phoneNumber,
            hashedPassword,
            hashedConfirmPassword,
            patientID,
            status
        ]);

        const payload = {
            id: patientID,
            email: email
        }

        const token = jwt.sign(payload, SECRET_KEY, {
            expiresIn: "15mins"
        });

        return res.status(StatusCodes.OK).json({
            message: "Patient account registered successfully. Your Account is Pending. Please wait for the admin approval",
            token
        })
    } catch (error) {
        console.error(`Failed to register patient account: ${error}`);
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
            return res.status(StatusCodes.UNAUTHORIZED).json({
                emailMessage: "Incorrect Email Address"
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
            return res.status(StatusCodes.UNAUTHORIZED).json({
                passwordMessage: "Incorrect Password"
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
            expiresIn: "15mins"
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
            secure: false, // Set to true if using HTTPS
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
            return res.status(StatusCodes.UNAUTHORIZED).json({
                emailMessage: "Invalid Email"
            })
        }

        const adminUsers = rows[0];

        // Compare password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, adminUsers.password);
        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                passwordMessage: "Invalid Password"
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

        const payload = {
            id: adminUsers.adminID,
            email: adminUsers.email
        }

        const accessToken = jwt.sign(payload, SECRET_KEY, {
            expiresIn: "15mins"
        })

        const refreshToken = jwt.sign(payload, REFRESH_KEY_SECRET, {
            expiresIn: "7d"
        })

        const sid = req.session.user = {
            id: adminUsers.adminID,
            email: adminUsers.email
        }

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            sameSite: "strict"
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

        const query = `
            SELECT
                pr1.firstName,
                pr1.lastName,
                pr1.email,
                pr2.phoneNumber
                FROM patientsregisteraccount1 AS pr1
                INNER JOIN
                patientsregisteraccount2 AS pr2
                ON pr1.patientID = pr2.registerPatientID
            WHERE pr1.patientID = ?;
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
            patientID,
            firstName,
            lastName,
            email,
            appointmentDate,
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
            phoneNumber,
            gender,
            status,
            preferredTime,
            purposeOfAppointment,
            clinic_id,
            createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

        const [result] = await conn.query(query, [
            patientID,
            firstName,
            lastName,
            email,
            appointmentDateFormat,
            phoneNumber,
            gender,
            status,
            normalizeTime(appointment_time),
            purposeOfAppointment,
            clinic_id,
            createdAt
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
                appointmentDate,
                phoneNumber,
                gender,
                preferredTime,
                purposeOfAppointment
            FROM patientsappointment
                WHERE appointmentID = ?;
        `

        const [appointmentRows] = await conn.query(retrieveAppointmentIDQuery, [
            result.insertId
        ])

        if (appointmentRows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No appointment found with the provided ID"
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "Appointment booked successfully",
            appointment: appointmentRows[0]
        });

    } catch (error) {
        console.error(`Failed to book appointments: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to book appointment"
        });
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
            firstName,
            lastName,
            email,
            appointmentDate,
            phoneNumber,
            status,
            preferredTime,
            purposeOfAppointment
            FROM patientsappointment
            WHERE email = ?
            ORDER BY appointmentDate ASC;
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
            p.phoneNumber,
            p.status,
            p.purposeOfAppointment
            FROM patientsappointment p
            INNER JOIN clinic c
            ON p.clinic_id = c.clinic_id
            WHERE p.clinic_id = ?
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

// controller logic for updating patients appointments details
export const updatePatientsAppointments = async (req, res) => {
    try {
        const { appointmentID } = req.params;

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
            phoneNumber,
            gender,
            status,
            preferredTime,
            purposeOfAppointment
        } = req.body;

        // Debug log to check the received appointmentID and body
        console.log(`Received appointmentID: ${appointmentID}`);

        const formattedAppointmentDate = dayjs(appointmentDate).format("YYYY-MM-DD");
        const formattedPreferredTime = preferredTime ? preferredTime.slice(0, 5) : null;

        const query = `
            UPDATE patientsappointment
            SET
                firstName = ?,
                lastName = ?,
                email = ?,
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

        // Return success response
        return res.status(StatusCodes.OK).json({
            message: "Patients appointments updated successfully"
        });

    } catch (error) {
        console.error(`Failed to update patients appointments: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to update patients appointments"
        });
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
        const lto_document = req.files?.ltoFile?.[0]?.filename;
        const clinic_image = req.files?.clinicImage?.[0]?.filename;

        if (!lto_document) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Please upload a valid LTO document'
            });
        }

        if (!clinic_image) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Please upload a valid clinic image'
            });
        }

        const query = `INSERT INTO clinic (
            clinic_name,
            clinic_address,
            clinic_date_open,
            clinic_time,
            consultation_fee,
            phoneNumber,
            email,
            password,
            confirm_password,
            clinic_type,
            clinic_image,
            clinic_close_date,
            clinic_close_time,
            created_by,
            lto_document
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

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
            clinic_image,
            clinic_close_date,
            clinic_close_time,
            admin_id,
            lto_document
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
            message: "Internal server error",
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
        const { clinicName, clinicType, clinicAddress } = req.query;

        const clinic_name = String(clinicName)
        const clinic_type = String(clinicType);
        const clinic_address = String(clinicAddress);

        let query = `SELECT
            clinic_name,
            clinic_address,
            clinic_type
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
        const query = `
            SELECT 
            clinic_id,
            clinic_name,
            email,
            password
            FROM
            clinic
            WHERE email = ?;`;

        const [rows] = await conn.query(query, [email]);

        if (rows.length === 0) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                emailMessage: "Incorrect email"
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
            return res.status(StatusCodes.UNAUTHORIZED).json({
                passwordMessage: "Incorrect Password"
            })
        }

        const payload = {
            id: clinicUsers.clinic_id,
            email: clinicUsers.email,
            clinic_name: clinicUsers.clinic_name
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
            sem: clinicUsers.email
        }

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
            patientsappointment.phoneNumber,
            patientsappointment.preferredTime,
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
            p.preferredTime,
            p.gender,
            p.phoneNumber,
            p.status,
            p.purposeOfAppointment
            FROM patientsappointment p
            INNER JOIN clinic c
            ON p.clinic_id = c.clinic_id
            WHERE p.clinic_id = ? AND p.status = ?
            ORDER BY p.appointmentDate ASC;
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
            p.appointmentID,
            p.firstName,
            p.lastName,
            p.email,
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
            ORDER BY p.appointmentDate ASC;
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
            ORDER BY p.appointmentDate ASC;
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
    try {
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

        const [result] = await conn.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No registered patients account found with the provided ID"
            })
        }

        return res.status(StatusCodes.OK).json({
            message: "Registered patients account updated successfully"
        })

    } catch (error) {
        console.error(`Failed to update registered patients account: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to update registered patients account"
        })
    }
}

// controller logic for inserting a consult patient data
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
            admin_id,
            appointmentID
        } = req.body;


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

        const clinic_name_field = String(clinic_name);

        // Parse IDs with validation
        const admin_id_field = parseInt(admin_id, 10);
        if (isNaN(admin_id_field)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid admin_id var format"
            });
        }

        const appointment_id = parseInt(appointmentID, 10);
        if (isNaN(appointmentID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid appointment_id var format"
            });
        }

        const consent = "Yes";

        const values = [
            appointmentID,
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
            consent,
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

        console.error(`Failed to insert consult patient data: ${error}`);
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
        const { clinicID } = req.params;

        if (!clinicID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid clinic ID"
            })
        }

        const clinic_id = parseInt(clinicID, 10);

        // instance of clinic model with a method to retrieved all appointment history
        const consulted_patient = await new Clinic().getAppointmentHistory(clinic_id);

        if (!consulted_patient.length) {
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
        const { step } = req.params;

        if (isNaN(step) || step < 0 || step > 4) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter a valid step"
            });
        }

        const validationMiddleWare = validatePatientConsultation(step);

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

        if (!result || result.affectedRows === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No appointment id found"
            })
        }

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

// controller logic for inserting a book appointment in clinic side
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
        const appointment_time = dayjs(appointmentTime).format("hh:mm");
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

// controller logic for calculating the total number of pending booked appointments in specific clinic
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
        } = req.body;

        const email_address = String(email)
        const password_hash = String(password);

        const admin_account_data = {
            email: email_address,
            password: password_hash
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
            expiresIn: "15mins"
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
 */
export const findBookedAppointmentByIdToModifyBookedAppointmentDetails = asyncHandler(
    async (req, res) => {
        const { bookedAppointmentID } = req.query;

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
        const selected_appointment_time = dayjs(appointmentTime).format("hh:mm");
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
            clinic_modify_booked_appointment_details: clinic_modify_booked_appointment_details
        });

        if(!all_appointments_modify_booked_appointments_result || all_appointments_modify_booked_appointments_result.length === 0) {
            logger.log("warn", "No booked appointments found");
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No booked appointments found"
            })
        }

        logger.log("info", `Modify Booked Appointment Details in All Appointments Clinic Side Table: ${all_appointments_modify_booked_appointments_result}`);
        return res.status(StatusCodes.OK).json({
            message: "Booked Appointment Details Modified Successfully!"
        })
    }
)