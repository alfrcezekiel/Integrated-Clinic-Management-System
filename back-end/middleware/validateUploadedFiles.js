import { StatusCodes } from "http-status-codes";

const validateUploadedFiles = (req, res, next) => {
    // const errors = {}
    // if (!req.files) {
    //     errors.clinicImage = "Clinic image is required"
    //     errors.ltoFile = "LTO document is required"

    //     return res.status(StatusCodes.BAD_REQUEST).json({
    //         success: false,
    //         errors
    //     })
    // }

    // const { clinicImage, ltoFile } = req.files;

    // /**
    //  * checks if clinic image and lto file is uploaded
    //  */
    // if (!clinicImage || clinicImage.length === 0) {
    //     errors.clinicImage = "Clinic image is required"
    // }

    // if (!ltoFile || ltoFile.length === 0) {
    //     errors.ltoFile = "LTO document is required"
    // }

    // // if any required field is missing, return error early
    // if (Object.keys(errors).length > 0) {
    //     return res.status(StatusCodes.BAD_REQUEST).json({
    //         success: false,
    //         errors
    //     })
    // }

    // /**
    //  * checks if clinic image and lto file size is valid
    //  */
    // const CLINIC_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
    // const LTO_FILE_MAX_SIZE = 10 * 1024 * 1024;

    // if (clinicImage[0].size > CLINIC_IMAGE_MAX_SIZE) {
    //     errors.clinicImage = "Clinic image size exceeds 5MB"
    // }

    // if (ltoFile[0].size > LTO_FILE_MAX_SIZE) {
    //     errors.ltoFile = "LTO document size exceeds 10MB"
    // }

    // if (Object.keys(errors).length > 0) {
    //     return res.status(StatusCodes.BAD_REQUEST).json({
    //         success: false,
    //         errors
    //     })
    // }

    const errors = {};

    // Check if files were uploaded
    if (!req.files) {
        errors.clinicImage = "Clinic image is required";
        errors.ltoFile = "LTO document is required";
    } else {
        const { clinicImage, ltoFile } = req.files;

        // Check if files are present
        if (!clinicImage || clinicImage.length === 0) {
            errors.clinicImage = "Clinic image is required";
        } else if (clinicImage[0].size === 0) {
            errors.clinicImage = "Clinic image file is empty";
        } else if (clinicImage[0].size > 5 * 1024 * 1024) {
            errors.clinicImage = "Clinic image size exceeds 5MB limit";
        }

        // Check LTO file
        if (!ltoFile || ltoFile.length === 0) {
            errors.ltoFile = "LTO document is required";
        } else if (ltoFile[0].size === 0) {
            errors.ltoFile = "LTO document file is empty";
        } else if (ltoFile[0].size > 10 * 1024 * 1024) {
            errors.ltoFile = "LTO document size exceeds 10MB limit";
        }
    }

    // Store errors in request object to be combined with form validation errors
    req.fileValidationErrors = errors;
    next();
}

export default validateUploadedFiles;
