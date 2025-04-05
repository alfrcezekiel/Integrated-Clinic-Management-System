import { body, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

const time12HrRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;

const clinicTypes = ["General Clinic", "Specialist Clinic", "Dental Clinic", "Pediatric Clinic", "Dermatology Clinic", "Psychiatry Clinic", "Physiotherapy Clinic", "Optometry Clinic", "Gynecology Clinic", "Orthopedic Clinic"];

const validateCreateClinicDetails = [
    body("clinicName")
        .notEmpty()
        .withMessage("Clinic name is required"),
    body("clinicAddress")
        .notEmpty()
        .withMessage("Clinic address is required"),
    body("clinicPhoneNumber")
        .notEmpty()
        .withMessage("Clinic phone number is required")
        .isLength({ min: 11, max: 11 })
        .withMessage("Clinic phone number should be 11 digits"),
    body("clinicEmail")
        .notEmpty()
        .withMessage("Clinic email is required")
        .isEmail()
        .withMessage("Invalid email address"),
    body("clinicImage")
        .custom((_value, { req }) => {
            if (!req.file) {
                throw new Error("Clinic image is required");
            }
            const file = req.file;
            const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg",];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new Error("Invalid file type. Only JPEG and PNG are allowed.");
            }
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                throw new Error("File size exceeds 5MB");
            }
            return true;
        }),
    body("openingDays")
        .notEmpty()
        .withMessage("Opening days are required")
        .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        .withMessage("Opening days must be one of the following: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday"),
    body("closingDays")
        .notEmpty()
        .withMessage("Closing days are required")
        .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        .withMessage("Closing days must be one of the following: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday"),
    body("openingHours")
        .notEmpty()
        .withMessage("Opening hours are required")
        .matches(time12HrRegex)
        .withMessage("Start time must be in hh:mm AM/PM format"),
    body("closingHours")
        .notEmpty()
        .withMessage("Closing hours are required")
        .matches(time12HrRegex)
        .withMessage("End time must be in hh:mm AM/PM format")
        .custom((value, { req }) => {
            const parseTimeToMinutes = timeStr => {
                const [time, modifier] = timeStr.toUpperCase().split(" ");
                let [hours, minutes] = time.split(":").map(Number);

                if (modifier === "PM" && hours !== 12) {
                    hours += 12;
                }

                if (modifier === "AM" && hours === 12) {
                    hours = 0;
                }

                return hours * 60 + minutes;
            }

            const startMinutes = parseTimeToMinutes(req.body.openingHours);
            const endMinutes = parseTimeToMinutes(value);

            if (endMinutes <= startMinutes) {
                throw new Error("End time must be later than start time");
            }
            return true;
        }),
    body("consultationFee")
        .notEmpty()
        .withMessage("Consultation fee is required")
        .isNumeric()
        .withMessage("Consultation fee must be a number"),
    body("clinicType")
        .notEmpty()
        .withMessage("Clinic type is required")
        .isIn(clinicTypes)
        .withMessage(`Clinic type must be one of the following: ${clinicTypes.join(", ")}`),
    body("clinicId")
        .optional(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
    body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm password is required")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),
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

export default validateCreateClinicDetails;