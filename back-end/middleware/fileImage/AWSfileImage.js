import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from "dotenv";
dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    endpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com`,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true
});

export const uploadToS3 = async (file) => {
    try {
        // Validate file object
        if (!file || !file.buffer) {
            throw new Error('Invalid file object: File or file buffer is missing');
        }

        // Ensure file has required properties
        if (!file.originalname || !file.mimetype) {
            throw new Error('Invalid file object: Missing originalname or mimetype');
        }

        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: `uploads/${Date.now()} - ${file.originalname.replace(/\s+/g, '-')}`,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: "public-read",
            }
        });

        const result = await upload.done();
        return result.Location;
    } catch (error) {
        console.error('Error uploading to AWS S3 middleware:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }
}   