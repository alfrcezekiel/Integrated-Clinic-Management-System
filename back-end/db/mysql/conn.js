import mysql from "mysql2/promise";
import dotenv from "dotenv";
import logger from "../../config/winston.js";
dotenv.config();
/**
 * Function to create a connection pool to the MySQL database for develpoment and production enviroment
 * @returns {Promise} - A promise that resolves to the connection pool
 */
async function createConnection() {
    try {
        /**
         * Create a connection pool to the MySQL database
         * betwwen railway and local development database
         */
        const connectionConfig = process.env.NODE_ENV === "production" ? {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DATABASE_NAME,
            password: process.env.DB_PASSWORD,
            connectionLimit: 10,
            waitForConnections: true,
            queueLimit: 0
        } : {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DATABASE_NAME,
            password: process.env.DB_PASSWORD,
            connectionLimit: 10,
            waitForConnections: true,
            queueLimit: 0
        }

        const pool = mysql.createPool(connectionConfig);

        logger.log(`info`, `MySQL Server connected successfully!`);

        return pool;
    } catch (error) {
        logger.error(`Failed to connect to MySQL server: ${error}`);
    }
}

const db = await createConnection();

export default db;