import multer from "multer";
import path from "path";
import { StatusCodes } from "http-status-codes";
import fs from "fs";

/**
 * @description handles uploading middleware for clinic images and LTO documents
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = "";

        if (file.fieldname === "clinicImage") {
            uploadPath = path.join("uploads", "clinic_images");
        } else if (file.fieldname === "ltoFile") {
            uploadPath = path.join("uploads", "lto_documents");
        } else {
            return cb(new Error("Invalid field name for file upload"), null);
        }

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const dateSuffix = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const sanitizedOriginalName = file.originalname.replace(/\s+/g, "_");
        cb(null, `${dateSuffix}_${randomString}_${sanitizedOriginalName}`);
    }
});

const clinicUploadedFiles = (req, res, next) => {
    const clinicUpload = multer({
        storage: storage,
        fileFilter: (req, file, cb) => {
            const imageMimeTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/jpg"
            ];
            const documentMimeTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ];

            const mimeType = file.mimetype.toLowerCase();

            if (file.fieldname === "clinicImage" && !imageMimeTypes.includes(mimeType)) {
                return cb(new Error(`Invalid file type. Only JPG, PNG, WEBP, and JPG are allowed.`))
            }

            if (file.fieldname === "ltoFile" && !documentMimeTypes.includes(mimeType)) {
                return cb(new Error(`Invalid file type. Only PDF, DOC, DOCX, XLS, and XLSX are allowed.`))
            }

            cb(null, true);
        },
        limits: {
            fileSize: 1024 * 1024 * 10, // 10MB
        }
    }).fields([{
        name: "clinicImage",
        maxCount: 1
    }, {
        name: "ltoFile",
        maxCount: 1
    }]);

    clinicUpload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            const errorMessage = err.message;

            const errorFields = errorMessage.includes(".jpg")
                || errorMessage.includes(".jpeg")
                || errorMessage.includes(".png")
                || errorMessage.includes(".webp")
                ? "clinicImage"
                : 
                errorMessage.includes(".pdf")
                || errorMessage.includes(".doc")
                || errorMessage.includes(".docx")
                || errorMessage.includes(".xls")
                || errorMessage.includes(".xlsx")
                ? "ltoFile"
                : "file";

            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: {
                    [errorFields] : errorMessage
                }
            });
        }
        next();
    })
}

export default clinicUploadedFiles;