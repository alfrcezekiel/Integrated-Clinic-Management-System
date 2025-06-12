import multer from 'multer';

export const handleMulterError = (multerUpload) => {
    return (req, res, next) => {
        multerUpload(req, res, (err) =>  {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        errors: {
                            file: "File size exceeds the limit of 10MB."
                        }
                    });
                }
                return res.status(400).json({
                    errors: {
                        file: "An error occurred while uploading the file. Please try again."
                    }
                });
            } else if (err) {
                return res.status(500).json({
                    errors: {
                        file: "An unexpected error occurred. Please try again."
                    }
                });
            }

            next();
        });
    };
}