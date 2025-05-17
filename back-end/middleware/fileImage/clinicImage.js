import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadPath = "../../uploads";
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
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Please upload an image file (jpeg, png, or webp)"), false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    },
});

export default upload;