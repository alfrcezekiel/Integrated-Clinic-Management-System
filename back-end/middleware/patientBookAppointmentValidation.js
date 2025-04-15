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
                const { appointmentDate } = req.body;

                const appointmentDateValue = dayjs(appointmentDate).format("YYYY-MM-DD");

                if (!appointmentDateValue) {
                    throw new Error("Appointment date is required for preferred time validation");
                }
                
                const status = ["Pending", "Approved"]

                const query = `SELECT
                    preferredTime,
                    appointmentDate,
                    status
                    FROM patientsappointment
                    WHERE appointmentDate = ? AND preferredTime = ? AND status IN (${status.map(() => '?').join(',')})
                `;

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
                
                const normalizedTime = normalizeTime(value);

                const formatDate = (dateStr) => dayjs(dateStr).format("M/D/YYYY");

                const [rows] = await conn.execute(query, [
                    appointmentDateValue,
                    normalizedTime,
                    ...status
                ]);

                if (rows.length > 0) {
                    throw new Error(`Preferred time ${formatTo12Hour(normalizedTime)} is already booked on ${formatDate(appointmentDateValue)}`);
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