import { body, validationResult } from 'express-validator';
import { StatusCodes } from "http-status-codes"
import conn from "../db/mysql/conn.js"
import dayjs from 'dayjs';
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
            const appointmentDate = new Date(value);
            const currentDate = new Date();

            if (appointmentDate < currentDate) {
                throw new Error("Appointment date must be not earlier than the current date");
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
                const { email, appointmentDate } = req.body;

                const emailAddress = String(email);
                const appointmentDateValue = dayjs(appointmentDate).format("YYYY-MM-DD");

                if (!emailAddress || !appointmentDateValue) {
                    throw new Error("Email and appointment date are required for preferred time validation");
                }

                const status = "Approved"
                const query = `SELECT
                    preferredTime,
                    email,
                    appointmentDate,
                    status
                    FROM patientsappointment
                    WHERE email = ? AND appointmentDate = ? AND preferredTime = ? AND status = ?
                `;

                const normalizeTime = (timeStr) => {
                    const [time, modifier] = timeStr.split(" ");
                    let [hours, minutes] = time.split(":").map(Number);

                    if (modifier === "PM" && hours !== 12) hours += 12;
                    if (modifier === "AM" && hours === 12) hours = 0;

                    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
                };

                const normalizedTime = normalizeTime(value);
                const [rows] = await conn.execute(query, [
                    emailAddress,
                    appointmentDateValue,
                    normalizedTime,
                    status
                ]);

                if (rows.length > 0) {
                    throw new Error("You already have a booked appointment at this time date and time");
                }
            } catch (error) {
                throw new Error(error.message || "An error occurred during preferred time validation");
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