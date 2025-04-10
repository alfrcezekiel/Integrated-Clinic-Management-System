import multer from "multer";
import path from "path"
import { StatusCodes } from "http-status-codes";

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "uploads/clinic_images/")
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
})

const fileFilter = (_req, file, cb) => {
    if(file.mimetype.startsWith('image/')){
        cb(null, true);
    } else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Please upload an image file"), false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    },
})

export default upload;