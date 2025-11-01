import mysql from "mysql2/promise";
import dotenv from "dotenv";
import logger from "../../config/winston.js";

dotenv.config();

async function createConnection() {
    try {
        const isProd = process.env.NODE_ENV === "production";

        const baseConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DATABASE_NAME,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
            waitForConnections: true,
            connectTimeout: 30000,
            enableKeepAlive: true,
            keepAliveInitialDelay: 10000,
            queueLimit: 0,
            connectionLimit: isProd ? 20 : 10,
            ...(isProd ? {
                ssl: {
                    rejectUnauthorized: false
                }
            } : {}),
        };

        // Check if any required field is missing
        if (!baseConfig.host || !baseConfig.user || !baseConfig.database) {
            throw new Error(`Missing required MySQL config values: ${JSON.stringify(baseConfig)}`);
        }

        const pool = mysql.createPool(baseConfig);
        logger.info(`MySQL Server connected successfully! Host: ${baseConfig.host} Database: ${baseConfig.database} Port: ${baseConfig.port} Environment: ${process.env.NODE_ENV}`);
        return pool;
    } catch (error) {
        logger.error(`Failed to connect to MySQL server: ${error.message}`);
        throw error;
    }
}

const db = await createConnection();

export default db;