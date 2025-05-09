import { StatusCodes } from 'http-status-codes';
import conn from "../db/mysql/conn.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import "../main.js";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import Clinic from '../models/Clinic.Model.js';
import validatePatientConsultation from '../middleware/ValidatePatientConsulation.js';
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
            civilStatus,
            dateOfBirth,
            phoneNumber,
            password,
            confirmPassword,
        } = req.body;

        const address_field = String(address);
        const civil_status = String(civilStatus);
        const date_of_birth = String(dateOfBirth);

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
        civilStatus,
        dateOfBirth
        ) VALUES (?, ?, ?, ?, ?, ?)`;

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

        const token = jwt.sign({ id: patientID, email: email }, SECRET_KEY, { expiresIn: "1hr" });
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
        const { contactName, contactEmailAddress, contactSubject, contactMessage } = req.body;

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
            patientsregisteraccount1.patientID,
            patientsregisteraccount1.firstName,
            patientsregisteraccount1.lastName,
            patientsregisteraccount1.email,
            patientsregisteraccount2.password,
            patientsregisteraccount2.status
            FROM patientsregisteraccount1
            INNER JOIN patientsregisteraccount2
            ON patientsregisteraccount1.patientID = patientsregisteraccount2.patientID
            WHERE patientsregisteraccount1.email = ?;
        `;

        const [rows] = await conn.query(query, [email]);

        if (rows.length === 0) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                emailMessage: "Incorrect Email Address"
            });
        }
        const patients = rows[0];
        const SECRET_KEY = process.env.JWT_SECRET;
        const isPasswordValid = await bcrypt.compare(password, patients.password);

        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                passwordMessage: "Incorrect Password"
            })
        }

        if (patients.status === "Pending") {
            return res.status(StatusCodes.OK).json({
                messageStatus: "Account is still pending for wait for the admin approval!"
            })
        }
        // generate a token
        const token = jwt.sign({ id: patients.patientID }, SECRET_KEY, { expiresIn: "1hr" });

        // session token
        req.session.user = {
            patientID: patients.patientID,
            sfn: patients.firstName,
            sln: patients.lastName,
            sem: patients.email
        }

        return res.status(StatusCodes.OK).json({
            message: "Login successful",
            token: token,
            sid: req.session.user,
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

        const token = jwt.sign({ id: doctorsUsers.doctorsID, firstName: doctorsUsers.firstName, lastName: doctorsUsers.lastName }, SECRET_KEY, { expiresIn: "1hr" });
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

        const query = `SELECT * FROM cmsadmin WHERE email = ? AND password = ?;`;

        const [rows] = await conn.query(query, [email, password]);

        if (!rows.find((row) => row.email === email)) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                emailMessage: "Invalid Email"
            })
        }

        if (!rows.find((row) => row.password === password)) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                passwordMessage: "Invalid Password"
            })
        }

        const adminUsers = rows[0];

        const SECRET_KEY = process.env.JWT_SECRET
        if (!SECRET_KEY) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to login admin account"
            });
        }

        const token = jwt.sign({ id: adminUsers.adminID, email: adminUsers.email }, SECRET_KEY, { expiresIn: "1hr" });
        const sid = req.session.user = {
            id: adminUsers.adminID,
        }

        return res.status(StatusCodes.OK).json({
            message: "Admin Login Successful",
            token,
            sid: sid
        })
    } catch (error) {
        console.error(`Failed to login admin account: ${error}`);
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
        sid: req.session.user
    });
};

// controller logic for checking if the user is authenticated
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

// controller logic for counting the total number of patients in row
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

        const query = `INSERT INTO patientsappointment (
            patientID,
            firstName,
            lastName,
            email,
            appointmentDate,
            phoneNumber,
            gender,
            preferredTime,
            purposeOfAppointment,
            clinic_id,
            createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

        const [result] = await conn.query(query, [
            patientID,
            firstName,
            lastName,
            email,
            appointmentDateFormat,
            phoneNumber,
            gender,
            preferredTime,
            purposeOfAppointment,
            clinic_id,
            createdAt
        ]);

        if (result.affectedRows === 0) {
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
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Access Denied! No token provided"
        })
    }

    try {
        const SECRET_KEY = process.env.JWT_SECRET
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

// controller logic for getting patients appointments to display in table rows
export const getPatientsAppointments = async (req, res) => {
    try {
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
            ORDER BY appointmentDate ASC
        `;

        const [rows] = await conn.query(query);

        return res.status(StatusCodes.OK).json({
            patientsAppointments: rows
        })
    } catch (error) {
        console.error(`Failed to get patients appointments: ${error}`);
    }
}

// controller logic for retrieving the patients booked appointments to display in tables in doctors dashboard appointments
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
    try {
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
            clinicId,
            adminID
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
        const clinic_id_field = Number(clinicId);
        const admin_id = String(adminID);

        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(clinic_password, saltRound);
        const hashedConfirmPassword = await bcrypt.hash(clinic_confirm_password, saltRound);

        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please upload a valid clinic image' });
        }
        const clinic_image = req.file.path;

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
            clinic_id_field,
            created_by
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
            clinic_id_field,
            admin_id
        ]);

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Failed to create clinic"
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "Clinic created successfully"
        });
    } catch (error) {
        console.error(`Failed to create clinic: ${error}`);
        return res.status(500).json({ message: "Internal server error", error: error.message });
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

        const isPasswordValid = await bcrypt.compare(password, clinicUsers.password);
        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                passwordMessage: "Incorrect Password"
            })
        }

        const token = jwt.sign({ id: clinicUsers.clinic_id, email: clinicUsers.email }, SECRET_KEY, { expiresIn: "1hr" });
        const sid = req.session.user = {
            id: clinicUsers.clinic_id,
            scn: clinicUsers.clinic_name,
            sem: clinicUsers.email
        }

        return res.status(StatusCodes.OK).json({
            message: "Clinic Login Successful",
            token,
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
        const date_of_birth = String(dateOfBirth);
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

        const formattedDate = new Date(date_of_birth).toISOString().split('T')[0];
        const values = [
            first_name,
            last_name,
            email_address,
            patient_address,
            civil_status,
            formattedDate,
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
    try {
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            appointmentDate,
            preferredTime,
            medicalConditionDetails,
            medicationDetails,
            cardioVascularDetails,
            smokeFrequency,
            allergyDetails,
            alcoholFrequency,
            exerciseFrequency,
            diagnosis,
            symptoms,
            prescription,
            treatmentPlan,
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
        const medical_condition_details = String(medicalConditionDetails)
        const medication_details = String(medicationDetails)
        const cardiovascular_details = String(cardioVascularDetails);
        const smoke_frequency = String(smokeFrequency)
        const allergy_details = String(allergyDetails)
        const alcohol_details = String(alcoholFrequency)
        const exercise_frequency_details = String(exerciseFrequency)
        const diagnosis_field = String(diagnosis)
        const symptoms_field = String(symptoms)
        const prescription_field = String(prescription)
        const treatment_plan = String(treatmentPlan)
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
            appointment_time,
            medical_condition_details,
            medication_details,
            cardiovascular_details,
            smoke_frequency,
            allergy_details,
            alcohol_details,
            exercise_frequency_details,
            diagnosis_field,
            symptoms_field,
            prescription_field,
            treatment_plan,
            clinic_name_field,
            consent,
            admin_id_field,
        ]

        const query = `INSERT INTO consultedpatients (
            appointmentID,
            patient_first_name,
            patient_last_name,
            patient_email,
            phone_number,
            appointment_date,
            appointment_time,
            medical_condition_details,
            medication_details,
            high_blood_details,    
            smoke_frequency,
            allergies_details,
            alcohol_details,
            exercise_frequency_details,
            diagnosis,
            symptoms,
            prescription,
            treatment_plan,
            clinic_name,
            consent,
            created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `

        const [result1] = await conn.query(query, values);

        if (result1.affectedRows === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Failed to insert consult patient data"
            })
        }

        const updateQuery = `UPDATE patientsappointment SET status = ? WHERE appointmentID = ?;`;
        const status = "Consulted";

        const [result2] = await conn.query(updateQuery, [status, appointment_id]);

        if (result2.affectedRows === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Failed to update appointment status"
            })
        }

        return res.status(StatusCodes.OK).json({
            message: "Patient Consulted Successfully"
        })

    } catch (error) {
        console.error(`Failed to insert consult patient data: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to insert consult patient data"
        })
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
        // @param 
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