import { body, validationResult } from 'express-validator';
import { StatusCodes } from "http-status-codes"
import conn from "../db/mysql/conn.js"
import dayjs from 'dayjs';
import Clinic from '../models/Clinic.Model.js';

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
        .withMessage("Invalid email address"),
    body("appointmentDate")
        .notEmpty()
        .withMessage("Appointment date is required")
        .custom((value) => {
            const appointmentDate = dayjs(value, "YYYY-MM-DD", true);
            if (!appointmentDate.isValid()) {
                throw new Error("Invalid appointment date format");
            }

            const currentDate = dayjs().startOf("day");
            // Ensure the appointment date is within one month from the current date
            const oneMonthFromNow = dayjs().add(1, "month").startOf("day");

            if (appointmentDate.isBefore(currentDate, "day") || appointmentDate.isSame(currentDate, "day")) {
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
                    const [time, modifier] = timeStr.split(" ");
                    let [hours, minutes] = time.split(":").map(Number);

                    if (modifier === "PM" && hours !== 12) hours += 12;
                    if (modifier === "AM" && hours === 12) hours = 0;

                    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
                };

                const formatTo12Hour = (timeStr) => {
                    let [hours, minutes] = timeStr.split(":").map(Number);
                    const ampm = hours >= 12 ? "PM" : "AM";

                    hours = hours % 12;
                    hours = hours ? hours : 12; // hour '0' should be '12'

                    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
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
                    const [hours, minutes] = time.split(":").map(Number);
                    return hours * 60 + minutes;
                }

                // Convert clinic opening and closing times to minutes for comparison
                const preferredMinutes = timeToMinutes(normalizedTime);
                const openingMinutes = timeToMinutes(clinic_time);
                const closingMinutes = timeToMinutes(clinic_close_time);

                // Validate that the preferred time is within the clinic's operating hours
                if (preferredMinutes < openingMinutes || preferredMinutes >= closingMinutes) {
                    throw new Error(`Appointment time (${formatTo12Hour(value)}) is outside clinic operating hours (${formatTo12Hour(clinic_time)} - ${formatTo12Hour(clinic_close_time)})`);
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
                    throw new Error(`Appointment time ${formatTo12Hour(normalizedTime)} is already booked on ${appointmentDateValue.format("MMMM D, YYYY")}`);
                }
            } catch (error) {
                throw new Error(error.message || "An error occurred during appointment time validation");
            }
        }),
    body("purposeOfAppointment")
        .notEmpty()
        .withMessage("Purpose of appointment is required"),
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