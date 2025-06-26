import { StatusCodes } from "http-status-codes";

const validateUploadedFiles = (req, res, next) => {
    const { clinicImage, ltoFile } = req.files;

    const CLINIC_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
    const LTO_FILE_MAX_SIZE = 10 * 1024 * 1024;
    
    if(clinicImage && clinicImage[0].size > CLINIC_IMAGE_MAX_SIZE) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors: {
                clinicImage: "File size exceeds 5MB"
            }
        })
    }

    if (ltoFile && ltoFile[0].size > LTO_FILE_MAX_SIZE) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors: {
                ltoFile: "File size exceeds 10MB"
            }
        })
    }

    next();
}

export default validateUploadedFiles;
