import { check, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

/**
 * Middleware to validate the creation of an admin account.
 */

const validateCreatingAdminAccount = [
    check("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address"),
    check("password")
        .notEmpty()
        .withMessage("Password is required")
        // .isLength({ min: 8 })
        // .withMessage("Password must be at least 8 characters"),
        .custom((value) => {
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
            if (!regex.test(value)) {
                throw new Error(
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                );
            }
            return true;
        }),
    check("confirmPassword")
        .notEmpty()
        .withMessage("Confirm Password is required")
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error("Confirm password does not match the password")
            }
            return true;
        }),
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

export default validateCreatingAdminAccount;