import multer from "multer";
import fs from "fs";
import path from "path";
import logger from "../../config/winston.js";

const storage = multer.diskStorage({
    destination: (_req, file, cb) => {
        // const uploadPath = "uploads/clinic_images"
        let uploadPath = "";
        if (file.fieldname === "clinicImage") {
            uploadPath = path.join("uploads", "clinic_images");
        } else if (file.fieldname === "ltoFile") {
            uploadPath = path.join("uploads", "lto_documents");
        } else {
            return cb(new Error(`Invalid field name for file upload`), null);
        }

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        const dateSuffix = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string
        const sanitizedOriginalName = file.originalname.replace(/\s+/g, "_");
        cb(null, `${dateSuffix}_${randomString}_${sanitizedOriginalName}`);
    }
});

const fileFilter = (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const documentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    logger.info(`Received file: ${file.originalname} | Field: ${file.fieldname} | MIME: ${file.mimetype}`);

    if (file.fieldname === "clinicImage" && allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else if (file.fieldname === "ltoFile" && documentTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file for ${file.fieldname}`), false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10, // Limit file size to 10MB
        files: 2
    },
});

export default upload;