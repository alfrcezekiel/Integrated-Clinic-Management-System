import { body, check, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

const validatePaymentFields = [
    check("amount")
        .notEmpty()
        .withMessage("Amount is required")
        .isNumeric()
        .withMessage("Amount must be a number"),
    check("modeOfPayment")
        .notEmpty()
        .withMessage("Mode of payment is required")
        .isIn(["Card", "Cash"])
        .withMessage("Mode of payment must be either Card or Cash"),
    check("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address"),
    // Card-specific validations
    check("cardNumber")
        .if(body("modeOfPayment").equals("Card"))
        .notEmpty()
        .withMessage("Card number is required")
        .matches(/^\d{16}$/)
        .withMessage("Card number must be 16 digits"),
    check("cardHolderName")
        .if(body("modeOfPayment").equals("Card"))
        .notEmpty()
        .withMessage("Card holder name is required"),
    check("cvv")
        .if(body("modeOfPayment").equals("Card"))
        .notEmpty()
        .withMessage("CVV is required")
        .matches(/^\d{3,4}$/)
        .withMessage("CVV must be 3 or 4 digits"),
    check("expiryDate")
        .if(body("modeOfPayment").equals("Card"))
        .notEmpty()
        .withMessage("Expiry date is required")
        .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
        .withMessage("Expiry date must be in MM/YY format")
        .custom((value) => {
            const [month, year] = value.split("/");
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear() % 100;

            if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                throw new Error("Card has expired");
            }
            return true;
        }),
    // Cash-specific validations
    check("firstName")
        .if(body("modeOfPayment").equals("Cash"))
        .notEmpty()
        .withMessage("First name is required"),

    check("lastName")
        .if(body("modeOfPayment").equals("Cash"))
        .notEmpty()
        .withMessage("Last name is required"),
    // Validation result
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: errors.formatWith(err => err.msg).mapped()
            });
        }
        next();
    }
];

export default validatePaymentFields;
