import { body, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import dayjs from "dayjs";
import Clinic from "../models/Clinic.Model.js";

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
        .custom(async (value, { req }) => {
            const { appointmentDate, clinicID } = req.body;

            if (!clinicID) {
                throw new Error("Clinic ID is required");
            }

            const appointmentTime = dayjs(value, "HH:mm", true);
            if (!appointmentTime.isValid()) {
                throw new Error("Invalid appointment time");
            }

            /**
             * @instance method for checking the clinic operating hours in clinic book appointment
             */
            const checkClinicOperatingHours = await new Clinic().checkClinicOperatingHours({
                appointmentTime: appointmentTime,
                appointmentDate: appointmentDate,
                clinicID: clinicID
            })

            /**
             * @checks the clinic operating hours message if the appointment time is outside the clinic's operating hours
             */
            if (!checkClinicOperatingHours.message) {
                throw new Error(checkClinicOperatingHours.message)
            }
            
            /**
             * @convert the appointment date into YYYY-MM-DD format
             */
            const formatted_appointment_date = dayjs(appointmentDate).format("YYYY-MM-DD");

            /**
             * @format the appointment time into HH:mm format
             */
            const formattedAppointmentTime = appointmentTime.format("HH:mm");
            const book_appointment_status = ["Pending", "Approved"];

            const check_book_appointment_status = await new Clinic().isBookAppointmentIsAlreadyBookedOrAwaitingForApproval(
                formatted_appointment_date,
                formattedAppointmentTime,
                book_appointment_status
            );

            /**
             * @function to normalize and format time to AM/PM
             */
            const normalizeAndFormatTimeToAMPM = (time) => {
                const parsedTime = dayjs(time, ["HH:mm", "h:mm A", "hh:mm A", dayjs.ISO8601], true)

                if (!parsedTime.isValid()) {
                    throw new Error("Invalid appointment time format");
                }

                return parsedTime.format("hh:mm A");

            }

            /**
             * @checks if the appointment time is already booked or awaiting approval
             */
            if (check_book_appointment_status) {
                const formattedAppointmentTime = normalizeAndFormatTimeToAMPM(value);
                const formattedAppointmentDate = dayjs(formatted_appointment_date).format("MMMM D, YYYY");

                throw new Error(`Appointment time ${formattedAppointmentTime} is already booked or awaiting approval on  ${formattedAppointmentDate}.`);
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