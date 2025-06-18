import multer from 'multer';

export const handleMulterError = (multerUpload) => {
    return (req, res, next) => {
        multerUpload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                // Handle file size errors
                if (err.code === 'LIMIT_FILE_SIZE') {
                    // Check which file caused the error
                    if (req.files && req.files.clinicImage) {
                        return res.status(400).json({
                            errors: {
                                file: "File size exceeds 5MB."
                            }
                        });
                    } else if (req.files && req.files.ltoFile) {
                        return res.status(400).json({
                            errors: {
                                file: "File size exceeds 10MB."
                            }
                        });
                    }
                    return res.status(400).json({
                        errors: {
                            file: "File size exceeds the limit"
                        }
                    });
                }

                // Handle file type errors
                if (err.message.includes('Only JPEG, PNG, JPG, and WEBP are allowed')) {
                    return res.status(400).json({
                        errors: {
                            file: "Invalid file type. Only JPEG, PNG, JPG, and WEBP are allowed."
                        }
                    });
                } else if (err.message.includes('Only PDF, DOC, DOCX, XLS, and XLSX are allowed')) {
                    return res.status(400).json({
                        errors: {
                            file: "Invalid file type. Only PDF, DOC, DOCX, XLS, and XLSX are allowed."
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