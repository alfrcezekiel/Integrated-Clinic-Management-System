import { body, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import dayjs from "dayjs";

const validateBookAppointmentInClinic = [
    body("firstName")
        .notEmpty()
        .withMessage("First name is required"),
    body("lastName")
        .notEmpty()
        .withMessage("Last name is required"),
    body("address")
        .notEmpty()
        .withMessage("Address is required"),
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address"),
    body("phoneNumber")
        .notEmpty()
        .withMessage("Phone number is required")
        .custom((value) => {
            const isLocal = /^09\d{9}$/.test(value);
            // const isInternational = /^\+639\d{9}$/.test(value);
            if (!isLocal) {
                throw new Error("Phone number must start with 09 and must contain 11 digits");
            }
            return true;
        }),
        // .isLength({ min: 11, max: 11 })
        // .withMessage("Phone number should be 11 digits"),
    body("appointmentDate")
        .notEmpty()
        .withMessage("Appointment date is required")
        .custom((value) => {
            const appointmentDate = dayjs(value);
            const currentDate = dayjs();

            if (!dayjs(appointmentDate).isValid()) {
                throw new Error("Invalid appointment date format.");
            }

            if (appointmentDate.isBefore(currentDate, "day") || appointmentDate.isSame(currentDate, "day")) {
                throw new Error("Appointment date must not be earlier than the current date");
            } else if (appointmentDate.isAfter(currentDate.add(1, "month"), "day")) {
                throw new Error("Appointment date must not be later than one month from now");
            }
            return true;
        }),
    body("appointmentTime")
        .notEmpty()
        .withMessage("Appointment time is required")
        .custom((value) => {
            const appointmentTime = dayjs(value, "HH:mm", true);
            if (!appointmentTime.isValid()) {
                throw new Error("Invalid appointment time");
            }
            return true;
        }),
    body("gender")
        .notEmpty()
        .withMessage("Gender is required"),
    body("purposeOfAppointment")
        .notEmpty()
        .withMessage("Purpose of appointment is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: errors.formatWith((error) => error.msg).mapped()
            });
        }
        next();
    }
]

export default validateBookAppointmentInClinic;