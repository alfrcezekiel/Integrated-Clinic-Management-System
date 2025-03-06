import { StatusCodes } from "http-status-codes";
import {body, validationResult} from "express-validator"

const validateContacts = [
    body("contactFirstName")
        .trim()
        .notEmpty()
        .withMessage("This field is required")
    
]