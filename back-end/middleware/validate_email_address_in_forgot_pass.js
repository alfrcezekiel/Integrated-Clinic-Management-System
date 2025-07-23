import { check, validationResult } from "express-validator"
import { StatusCodes } from "http-status-codes"

/**
 * validate email address in forgot password
 */
const validateEmailAddressInForgotPassword = [
    check("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address"),
    check("userType")
        .notEmpty()
        .withMessage("Selecting user type is required")
        .isIn(["patient", "clinic", "admin"])
        .withMessage("Invalid user type"),
    (req, res, next) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: errors.formatWith((err) => err.msg).mapped()
            })
        }
        next();
    }
]

export default validateEmailAddressInForgotPassword;