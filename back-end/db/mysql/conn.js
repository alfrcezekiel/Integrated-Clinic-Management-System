import mysql from "mysql2/promise";
import dotenv from "dotenv";
import logger from "../../config/winston.js";
dotenv.config();

const createConnection = async () => {
    let pool;

    if (pool) return pool;
    try {
        const isProd = process.env.NODE_ENV === "production";

        logger.log(`info`, `DB Config in Production:`, {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            database: process.env.DATABASE_NAME,
        });

        const requiredEnvVars = [
            "DB_HOST",
            "DB_PORT",
            "DB_USER",
            "DB_PASSWORD",
            "DATABASE_NAME"
        ];

        for (const key of requiredEnvVars) {
            if (!process.env[key]) {
                throw new Error(`Missing environment variable: ${key}`);
            }
        }
        const baseConfig = {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DATABASE_NAME,
            waitForConnections: true,
            queueLimit: 0,
            connectTimeout: 30000,
            enableKeepAlive: true,
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

        pool = mysql.createPool(baseConfig);
        logger.info(`MySQL Server connected successfully! Host: ${baseConfig.host} Database: ${baseConfig.database} Port: ${baseConfig.port} Environment: ${process.env.NODE_ENV}`);
        return pool;
    } catch (error) {
        logger.error(`Failed to connect to MySQL server: ${error.message}`);
        throw error;
    }
}

const db = await createConnection();

export default db;