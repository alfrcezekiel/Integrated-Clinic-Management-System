import dayjs from "dayjs";
import { check, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import Clinic from "../models/Clinic.Model.js";
dayjs.extend(customParseFormat);

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
        .custom(async (value, { req }) => {
            const validDate = dayjs(value, ["YYYY-MM-DD", dayjs.ISO_8601], true);
            if (!validDate.isValid()) {
                throw new Error("Invalid appointment date")
            }

            const {
                bookedAppointmentID,
                type
            } = req.query;

            if (bookedAppointmentID) {
                const clinic_instance = new Clinic();

                const { isValid, message } = await clinic_instance.validatePreviousAppointmentDate({
                    bookedAppointmentID: bookedAppointmentID,
                    appointmentDate: validDate,
                    type: type
                })

                if (!isValid) {
                    throw new Error(message)
                }
            }

            return true;
        }),
    check("appointmentTime")
        .notEmpty()
        .withMessage("Appointment time is required")
        .custom((value, { req }) => {
            const validAppointmentTime = dayjs(value, ["h:mm A", "hh:mm A", "H:mm", "HH:mm", "HH:mm:ss"], true);

            if (!validAppointmentTime.isValid()) {
                throw new Error("Invalid appointment time")
            }

            req.body.appointmentTime = validAppointmentTime.format("HH:mm");

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