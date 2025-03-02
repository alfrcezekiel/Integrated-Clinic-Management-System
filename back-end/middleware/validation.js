import {body, validationResult} from 'express-validator';
import { StatusCodes } from 'http-status-codes';

const validateRegister = [
    body("firstName").notEmpty().withMessage("First name is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: errors.array().reduce((acc, err) => {
                    acc[err.param] = err.msg;
                    return acc;
                }, {})
            })
        }
        next();
    }
]

export default validateRegister;