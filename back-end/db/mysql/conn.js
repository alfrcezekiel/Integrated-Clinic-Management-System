import mysql from "mysql2/promise";
import dotenv from "dotenv";
import logger from "../../config/winston.js";
dotenv.config();
/**
 * Function to create a connection pool to the MySQL database
 * @returns {Promise} - A promise that resolves to the connection pool
 */
async function createConnection() {
    try {
        /**
         * Create a connection pool to the MySQL database
         * betwwen railway and local development database
         */
        const connectionConfig = process.env.NODE_ENV === "production" && process.env.RAILWAY_DATABASE_URL ? {
            uri: process.env.RAILWAY_DATABASE_URL,
            connectionLimit: 10,
            waitForConnections: true,
            queueLimit: 0
        } : {
            host: process.env.RAILWAY_DATABASE_HOST || process.env.DB_HOST,
            user: process.env.RAILWAY_DATABASE_USER || process.env.DB_USER,
            database: process.env.RAILWAY_DATABASE_NAME || process.env.DATABASE_NAME,
            password: process.env.RAILWAY_DATABASE_PASSWORD || process.env.DB_PASSWORD,
            connectionLimit: 10,
            waitForConnections: true,
            queueLimit: 0
        }

        const pool = mysql.createPool(connectionConfig);

        logger.log(`info`, `MySQL Server connected successfully!`);

        return pool;
    } catch (error) {
        logger.error(`Failed to connect to MySQL server: ${error}`);
        process.exit(1);
    }
}

const db = await createConnection();

export default db;