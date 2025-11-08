import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

const combineRequestsBodyAndFile = (req, res, next) => {
    const fileErrors = req.fileValidationErrors || {};
    const formErrors = validationResult(req).formatWith(error => error.msg).mapped();

    const combinedErrors = { ...fileErrors, ...formErrors };

    if (Object.keys(combinedErrors).length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            errors: combinedErrors
        });
    }

    next();
}

export default combineRequestsBodyAndFile