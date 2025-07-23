import multer from 'multer';
import fs from "fs"
import logger from "../../config/winston.js"

/**
 * @description handles uploading middleware for LTO documents
 */
const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        const uploadPath = "uploads/lto_documents"

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true })
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const dateSuffix = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string
        const sanitizedOriginalName = file.originalname.replace(/\s+/g, "_");
        cb(null, `${dateSuffix}_${randomString}_${sanitizedOriginalName}`);
    }
});

const ltoFileFilter = (_req, file, cb) => {
    const documentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    logger.info(`Received file: ${file.originalname} | Field: ${file.fieldname} | MIME: ${file.mimetype}`);

    if (file.fieldname === "ltoFile" && documentTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file for ${file.fieldname}`), false);
    }
}

const ltoUpload = multer({
    storage: storage,
    fileFilter: ltoFileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10, // 10MB
        files: 1
    },
})

export default ltoUpload;