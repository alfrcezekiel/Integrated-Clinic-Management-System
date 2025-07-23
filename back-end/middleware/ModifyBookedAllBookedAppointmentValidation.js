import dayjs from "dayjs";
import { check, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

/**
 * Validates Booked Appointment Details in All Appointments in clinic side table
 */
const validateAllBookedAppointmentSpecificDetails = [
    check("firstName")
        .notEmpty()
        .withMessage("First name is required"),
    check("lastName")
        .notEmpty()
        .withMessage("Last name is required"),
    check("address")
        .notEmpty()
        .withMessage("Address is required"),
    check("email")
        .notEmpty()
        .withMessage("Email address is required")
        .isEmail()
        .withMessage("Invalid email address"),
    check("phoneNumber")
        .notEmpty()
        .withMessage("Phone number is required")
        .isLength({ min: 11, max: 11 })
        .withMessage("Phone number must contain 11 digits"),
    check("appointmentDate")
        .notEmpty()
        .withMessage("Appointment date is required")
        .custom((value) => {
            const validDate = dayjs(value, ["YYYY-MM-DD", dayjs.ISO_8601], true).isValid();
            if(!validDate) {
                throw new Error("Invalid appointment date")
            }
            return true;
        }),
    check("appointmentTime")
        .notEmpty()
        .withMessage("Appointment time is required")
        .custom((value) => {
            const validAppointmentTime = dayjs(value, ["HH:mm"], dayjs.ISO_8601, true).isValid();
            if(!validAppointmentTime) {
                throw new Error("Invalid appointment time")
            }
            return true;
        }),
    check("gender")
        .notEmpty()
        .withMessage("Gender is required"),
    check("status")
        .notEmpty()
        .withMessage("Status is required"),
    check("purposeOfAppointment")
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

export default validateAllBookedAppointmentSpecificDetails;