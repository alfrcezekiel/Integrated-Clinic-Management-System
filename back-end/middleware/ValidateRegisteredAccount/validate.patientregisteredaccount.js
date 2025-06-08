import { check, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import dayjs from 'dayjs';

const validatePatientRegisteredAccount = [
    check("firstName")
        .notEmpty()
        .withMessage("First name is required"),
    check("lastName")
        .notEmpty()
        .withMessage("Last name is required"),
    check("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address"),
    check("address")
        .notEmpty()
        .withMessage("Address is required"),
    check("civilStatus")
        .notEmpty()
        .withMessage("Civil status is required")
        .isIn(["Single", "Married", "Widowed", "Divorced", "Separated"])
        .withMessage("Invalid civil status"),
    check("dateOfBirth")
        .notEmpty()
        .withMessage("Date of birth is required")
        .custom((value) => {
            const dateOfBirth = dayjs(value);
            const currentDate = dayjs();

            if (!dayjs(dateOfBirth).isValid()) {
                throw new Error("Invalid date of birth format.");
            }

            if (dateOfBirth.isAfter(currentDate, "day")) {
                throw new Error("Date of birth must not be in the future");
            } else if (dateOfBirth.isBefore(currentDate.subtract(100, "year"), "day")) {
                throw new Error("Date of birth must not be more than 100 years ago");
            }
            return true;
        }),
    check("phoneNumber")
        .notEmpty()
        .withMessage("Phone number is required")
        .custom((value) => {
            const isLocal = /^09\d{9}$/.test(value);
            if (!isLocal) {
                throw new Error("Phone number must start with 09 and must contain 11 digits");
            }
            return true;
        }),
    check("status")
        .notEmpty()
        .withMessage("Status is required")
        .isIn(["Pending", "Approved", "Declined", "Blocked"])
        .withMessage("Invalid status"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: errors.formatWith((err) => err.msg).mapped()
            });
        }
        next();
    }
]

export default validatePatientRegisteredAccount;