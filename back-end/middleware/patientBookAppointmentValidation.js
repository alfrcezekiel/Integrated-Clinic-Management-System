import { body, validationResult } from 'express-validator';
import { StatusCodes } from "http-status-codes"
import conn from "../db/mysql/conn.js"
import dayjs from 'dayjs';
import Clinic from '../models/Clinic.Model.js';
import logger from "../config/winston.js";

// validation for patient book appointment
const validatePatientBookAppointment = [
    body("firstName")
        .notEmpty()
        .withMessage("First name is required"),
    body("lastName")
        .notEmpty()
        .withMessage("Last name is required"),
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .custom(async (email, { req }) => {
            if (req && req.body.patientID) {
                const verifyEmailQuery = `
                    SELECT 
                        email
                    FROM
                        patientsregisteraccount1
                    WHERE
                        patientID = ?
                        AND
                        email = ?
                `;

                const values = [
                    req.body.patientID,
                    email
                ]
                const [verifyRows] = await conn.query(verifyEmailQuery, values)

                if (verifyRows.length === 0) {
                    throw new Error(`You can't use a different email rather than your registered email`);
                }
            }
            return true;
        }),
    body("appointmentDate")
        .notEmpty()
        .withMessage("Appointment date is required")
        .custom((value) => {
            const appointmentDate = dayjs(value);
            if (!dayjs(appointmentDate).isValid()) {
                throw new Error("Invalid appointment date format");
            }

            const currentDate = dayjs().startOf("day");
            // Ensure the appointment date is within one month from the current date
            const oneMonthFromNow = dayjs().add(1, "month").startOf("day");

            if (appointmentDate.isBefore(currentDate, "day")) {
                throw new Error("Appointment date must be not earlier than the current date");
            } else if (appointmentDate.isAfter(oneMonthFromNow, "day")) {
                throw new Error("Appointment date must not be later than one month from current date");
            }

            return true;
        }),
    body("phoneNumber")
        .notEmpty()
        .withMessage("Phone number is required")
        .isLength({ min: 11, max: 11 })
        .withMessage("Phone number should be 11 digits"),
    body("gender")
        .notEmpty()
        .withMessage("Gender is required")
        .isIn(["Male", "Female"])
        .withMessage("Gender must be either Male or Female"),
    body("preferredTime")
        .notEmpty()
        .withMessage("Preferred time is required")
        .custom(async (value, { req }) => {
            try {
                if (!value || typeof value !== "string") {
                    throw new Error("Preferred time must be a valid string");
                }

                const { appointmentDate, clinicID } = req.body;

                const appointmentDateValue = dayjs(appointmentDate, "YYYY-MM-DD", true);

                if (!appointmentDateValue.isValid()) {
                    throw new Error("Invalid appointment date format for appointment time validation");
                }

                if (!clinicID) {
                    throw new Error("Clinic ID is required to validate appointment time");
                }

                // Normalize the time to 24-hour format for comparison
                const normalizeTime = (timeStr) => {
                    if (!timeStr || typeof timeStr !== "string") {
                        throw new Error("Invalid appointment time format")
                    }

                    // Match pattern like 08:32 AM, 1:05 PM, 12:00 AM
                    const timeParts = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
                    if (!timeParts) {
                        throw new Error("Preferred time must be in the format HH:mm AM/PM");
                    }

                    let hours = parseInt(timeParts[1], 10);
                    let minutes = parseInt(timeParts[2], 10);
                    const modifier = timeParts[3].toUpperCase();

                    if (isNaN(hours) || isNaN(minutes) || hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
                        throw new Error("Preferred time has invalid hour or minute value");
                    }

                    if (modifier === "PM" && hours !== 12) hours += 12;
                    if (modifier === "AM" && hours === 12) hours = 0;

                    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
                };

                const formatTo12Hour = (timeStr) => {
                    let [hours, minutes] = timeStr.split(":").map(Number);

                    const parseHours = parseInt(hours, 10);
                    const parseMinutes = parseInt(minutes, 10);

                    if (isNaN(parseHours) || isNaN(parseMinutes)) {
                        return "Invalid time format";
                    }

                    const ampm = parseHours >= 12 ? "PM" : "AM";
                    const adjustedHours = parseHours % 12 || 12; // Convert 0 to 12 for 12 AM

                    return `${adjustedHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
                };

                // Normalize the preferred time to 24-hour format
                const normalizedTime = normalizeTime(value);

                //  retrieve clinic opening hours method
                const clinicRows = await new Clinic().retrieveClinicOpeningHours(clinicID);

                if (clinicRows.length === 0) {
                    throw new Error("Clinic not found or has no clinic operating hours");
                }

                const { clinic_time, clinic_close_time } = clinicRows[0];

                // Check if the preferred time is within the clinic's opening hours
                const timeToMinutes = (time) => {
                    const [hours, minutes] = time.split(":").slice(0, 2).map(Number);
                    return hours * 60 + minutes;
                }

                // Convert clinic opening and closing times to minutes for comparison
                const preferredMinutes = timeToMinutes(normalizedTime);
                const openingMinutes = timeToMinutes(clinic_time);
                const closingMinutes = timeToMinutes(clinic_close_time);

                let isWithInOperatingHours = false;

                if (closingMinutes > openingMinutes) {
                    isWithInOperatingHours = preferredMinutes >= openingMinutes && preferredMinutes < closingMinutes;
                } else {
                    isWithInOperatingHours = preferredMinutes >= openingMinutes || preferredMinutes < closingMinutes;
                }

                // Validate that the preferred time is within the clinic's operating hours
                if (!isWithInOperatingHours) {
                    throw new Error(`Appointment time (${formatTo12Hour(normalizedTime)}) is outside business hours (${formatTo12Hour(clinic_time)} - ${formatTo12Hour(clinic_close_time)})`);
                }

                // Check if the appointment time is already booked
                const status = ["Pending", "Approved"]

                const query = `
                    SELECT
                        preferredTime,
                        appointmentDate,
                        status
                    FROM patientsappointment
                    WHERE 
                        appointmentDate = ? 
                    AND
                        preferredTime = ?
                    AND
                    status IN (${status.map(() => '?').join(',')})
                `;

                const formattedDate = appointmentDateValue.format("YYYY-MM-DD");

                const [rows] = await conn.execute(query, [
                    formattedDate,
                    normalizedTime,
                    ...status
                ]);

                if (rows.length > 0) {
                    throw new Error(`Appointment time ${formatTo12Hour(normalizedTime)} is already booked or awaiting approval on ${appointmentDateValue.format("MMMM D, YYYY")}`);
                }
            } catch (error) {
                throw new Error(error.message || "An error occurred during appointment time validation");
            }
        }),
    body("purposeOfAppointment")
        .notEmpty()
        .withMessage("Purpose of appointment is required"),
    // body("patientID")
    //     .notEmpty()
    //     .withMessage("Patient ID is required")
    //     .custom(async (patientID, { req }) => {
    //         try {
    //             const { appointmentDate } = req.body;
    //             /**
    //              * Get today's date at midnight
    //             */
    //             const MAX_APPOINTMENTS_PER_DAY = 1;

    //             const today = dayjs(appointmentDate).format('YYYY-MM-DD');
    //             /**
    //              * Query to count today's appointments for this patient
    //               */
    //             const clinic_instance = new Clinic();

    //             /**
    //              *  instance of clinic class with method name of check daily book appointment of patient
    //              * particularly in patient side book appointment
    //              */
    //             const appointmentCount = await clinic_instance.checkDailyBookAppointmentOfPatient({
    //                 patientID,
    //                 today,
    //             });

    //             if (!appointmentCount) {
    //                 throw new Error(`You have reached the maximum number of appointments (${MAX_APPOINTMENTS_PER_DAY}) allowed for today. Please try again tomorrow.`);
    //             }

    //             return true;
    //         } catch (error) {
    //             // Log the error for debugging
    //             logger.log(`error`, `Appointment limit validation error: ${error}`);

    //             throw new Error(error.message || "Failed to validate appointment limit. Please try again later.");
    //         }
    //     }),
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: errors.formatWith((error) => error.msg).mapped()
            })
        }
        next();
    }
]

export default validatePatientBookAppointment;