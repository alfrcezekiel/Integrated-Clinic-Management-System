import { StatusCodes} from "http-status-codes";
import { body, validationResult } from "express-validator";

const validateResetPassword = [
    body("newPassword")
        .notEmpty()
        .withMessage("New password is required"),
    body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm password is required")
        .custom((value, {req}) => {
            if (value !== req.body.newPassword) {
                throw new Error("Confirm Password does not match new password");
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

export default validateResetPassword;