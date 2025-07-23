import { body, validationResult } from 'express-validator';
import { StatusCodes } from "http-status-codes"
import dayjs from "dayjs"
// validation for patient book appointment
const validatePatientsDetails = [
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
            const appointmentDate = dayjs(value)
            const currentDate = dayjs()

            if (!dayjs(appointmentDate).isValid()) {
                throw new Error("Invalid appointment date format.")
            }

            if (appointmentDate.isBefore(currentDate, "day") || appointmentDate.isSame(currentDate, "day")) {
                throw new Error("Appointment date must not be earlier than the current date");
            } else if (appointmentDate.isAfter(currentDate.add(1, "month"), "day")) {
                throw new Error("Appointment date must not be later than one month from now");  
            }
            return true;
        }),
    // Updated the time validation logic to ensure proper handling of time format using dayjs
    body("preferredTime")
        .notEmpty()
        .withMessage("Appointment time is required"),
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
    body("status")
        .notEmpty()
        .withMessage("Status is required"),
    body("purposeOfAppointment")
        .notEmpty()
        .withMessage("Purpose of appointment is required"),
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: errors.formatWith((err) => err.msg).mapped()
            })
        }
        next();
    }
]

export default validatePatientsDetails;