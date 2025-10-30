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
            port: process.env.DB_PORT,
            waitForConnections: true,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 10000, // 10 seconds
            connectTimeout: 60000, // 60 seconds
        } : {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            port: process.env.DB_PORT,
            database: process.env.DATABASE_NAME,
            password: process.env.DB_PASSWORD,
            connectionLimit: 10,
            waitForConnections: true,
            connectTimeout: 60000, // 60 seconds
            enableKeepAlive: true,
            keepAliveInitialDelay: 10000, // 10 seconds
            queueLimit: 0,
        }

        const pool = mysql.createPool(connectionConfig);

        logger.log(`info`, `MySQL Server connected successfully! Host: ${connectionConfig.host} Database: ${connectionConfig.database} in ${process.env.NODE_ENV} environment.`);

        return pool;
    } catch (error) {
        logger.error(`Failed to connect to MySQL server: ${error}`);
    }
}

const db = await createConnection();

export default db;