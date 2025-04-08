import { StatusCodes } from 'http-status-codes';
import conn from "../db/mysql/conn.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import "../main.js";
import bcrypt from "bcrypt";
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
        healthQuotes: "Your health is an investment, not an expense.",
        firstDescription: "Comprehensive healthcare services for the whole family.",
        secondDescription: "Advanced medical technology for accurate diagnoses and treatments.",
        thirdDescription: "Experienced and compassionate healthcare professionals.",
        fourthDescription: "Personalized care plans tailored to your unique needs.",
        emergencyServices: "Emergency Dental Services avaiable 24/7."
    })
}

// controller logic for register patients accounts
export const registerPatientAccount = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;

        const SECRET_KEY = process.env.JWT_SECRET || "authenmimangjuan";

        const saltRounds = 10;

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const hashedConfirmPassword = await bcrypt.hash(confirmPassword, saltRounds);
        // 1st table of patients register account
        const query1 = "INSERT INTO patientsregisteraccount1 (firstName, lastName, email) VALUES (?, ?, ?)";
        // 2nd table of patients register account
        const query2 = "INSERT INTO patientsregisteraccount2 (phoneNumber, password, confirmPassword) VALUES (?, ?, ?)";

        const [result] = await conn.query(query1, [firstName, lastName, email]);
        const patientID = result.insertId;

        await conn.query(query2, [phoneNumber, hashedPassword, hashedConfirmPassword]);

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
            patientsregisteraccount2.password
            FROM patientsregisteraccount1
            INNER JOIN patientsregisteraccount2
            ON patientsregisteraccount1.patientID = patientsregisteraccount2.registerPatientID
            WHERE patientsregisteraccount1.email = ?;
        `;

        const [rows] = await conn.query(query, [email]);

        if (rows.length === 0) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                emailMessage: "Invalid Email Address"
            });
        }
        const patients = rows[0];
        const SECRET_KEY = process.env.JWT_SECRET || "authenmimangjuan";
        const isPasswordValid = await bcrypt.compare(password, patients.password);

        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                passwordMessage: "Invalid Password"
            })
        }

        // generate a token
        const token = jwt.sign({ id: patients.patientID }, SECRET_KEY, { expiresIn: "1hr" });

        // session token
        const s = req.session.user = {
            patientID: patients.patientID,
            sfn: patients.firstName,
            sln: patients.lastName,
            sem: patients.email
        }

        return res.status(StatusCodes.OK).json({
            message: "Login successful",
            token: token,
            sid: s
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

        const SECRET_KEY = process.env.JWT_SECRET || "authenniraul"
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

        if (!rows.find((row) => row.email === email && row.password === password)) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Invalid email and password"
            })
        }

        const adminUsers = rows[0];

        const SECRET_KEY = process.env.JWT_SECRET || "authenmimangjuan";
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

        const clinic_id = String(clinicID);

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
            clinic_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

        const [result] = await conn.query(query, [
            patientID,
            firstName,
            lastName,
            email,
            appointmentDate,
            phoneNumber,
            gender,
            preferredTime,
            purposeOfAppointment,
            clinic_id
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
        const {
            firstName,
            lastName,
            appointmentDate,
            email,
            phoneNumber,
            gender,
            status,
            purposeOfAppointment
        } = req.body;

        // Debug log to check the received appointmentID and body
        console.log(`Received appointmentID: ${appointmentID}`);

        const query = `
            UPDATE patientsappointment
            SET
                firstName = ?,
                lastName = ?,
                email = ?,
                appointmentDate = ?,
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
            appointmentDate,
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

        const formatTimeToAMPM = (time) => {
            if (!time) return null;

            // Check if time is already in AM/PM format
            if (time.includes("AM") || time.includes("PM")) {
                // Ensure consistent format (e.g., "2:30 PM" instead of "2:30PM")
                const [timePart, meridian] = time.includes(" ") ?
                    [time.split(" ")[0], time.split(" ")[1]] :
                    [time.replace(/[APM]/g, ""), time.match(/[APM]{2}/)[0]];

                // Ensure minutes are present
                const [hours, minutes] = timePart.includes(":") ?
                    timePart.split(":") :
                    [timePart, "00"];

                return `${hours}:${minutes} ${meridian.toUpperCase()}`;
            }

            // Handle 24-hour format (e.g., "14:30")
            try {
                const [hours, minutes] = time.split(":");
                let hour = parseInt(hours, 10);
                const ampm = hour >= 12 ? "PM" : "AM";

                // Convert to 12-hour format
                hour = hour % 12;
                hour = hour ? hour : 12; // Convert 0 to 12

                return `${hour}:${minutes || "00"} ${ampm}`;
            } catch (error) {
                console.error("Error formatting time:", error);
                return time; // Return original if parsing fails
            }
        };

        const clinic_name = String(clinicName);
        const clinic_address = String(clinicAddress);
        const clinic_date_open = String(openingDays);
        const clinic_time_open = formatTimeToAMPM(String(openingHours));
        const consultation_fee = String(consultationFee);
        const clinic_PhoneNumber = String(clinicPhoneNumber);
        const email_address = String(clinicEmail);
        const clinic_password = String(password);
        const clinic_confirm_password = String(confirmPassword);
        const clinic_type = String(clinicType);
        const clinic_close_date = String(closingDays);
        const clinic_close_time = formatTimeToAMPM(String(closingHours));
        const clinic_id_field = String(clinicId);
        const admin_id = String(adminID);

        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(clinic_password, saltRound);
        const hashedConfirmPassword = await bcrypt.hash(clinic_confirm_password, saltRound);

        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please upload a clinic image' });
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
        const query = `SELECT clinic_id, clinic_name, email, password FROM clinic WHERE email = ?;`;

        const [rows] = await conn.query(query, [email]);

        if (rows.length === 0) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Invalid email"
            })
        }

        const clinicUsers = rows[0];

        const SECRET_KEY = process.env.JWT_SECRET || "authenmimangjuan";
        if (!SECRET_KEY) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to login clinic account"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, clinicUsers.password);
        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Invalid Password"
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