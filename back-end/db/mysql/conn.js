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
        const baseConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DATABASE_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            waitForConnections: true,
            connectTimeout: 30000, // 30 seconds
            enableKeepAlive: true,
            keepAliveInitialDelay: 10000, // 10 seconds
            queueLimit: 0,
            connectionLimit: process.env.NODE_ENV === "production" ? 20 : 10
        }

        /**
         * Create a connection pool to the MySQL database
         * between railway and local development database
         */
        const connectionConfig = process.env.NODE_ENV === "production" ? {
            ...baseConfig,
            ssl: {
                rejectUnauthorized: false
            }
        } : {
            ...baseConfig
        }

        const pool = mysql.createPool(connectionConfig);

        logger.log(`info`, `MySQL Server connected successfully! Host: ${connectionConfig.host} Database: ${connectionConfig.database} Port: ${process.env.DB_PORT} in ${process.env.NODE_ENV} environment.`);

        return pool;
    } catch (error) {
        logger.error(`Failed to connect to MySQL server: ${error}`);
    }
}

const db = await createConnection();

export default db;