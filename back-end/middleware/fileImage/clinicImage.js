import multer from "multer";

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "uploads/")
    },
    filename: (_req, file, cb) => {
        const dateSuffix = Date.now();
        cb(null, `${dateSuffix} - ${file.originalname}`);
    }
})

const fileFilter = (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Please upload an image file (jpeg, png, or webp)"), false);
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    },
}).single('clinicImage');

export default upload;