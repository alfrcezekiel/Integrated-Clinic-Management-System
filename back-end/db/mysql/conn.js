import mysql from "mysql2/promise";
import dotenv from "dotenv";
import logger from "../../config/winston.js";
dotenv.config();

/**
 * 
 * @function established a connection in local development and production enviroment connection
 */
const createConnection = async () => {
    let pool;

    if (pool) return pool;
    try {
        const isProd = process.env.NODE_ENV === "production";

        logger.log(`info`, `DB config in ${process.env.NODE_ENV} environment:`, {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            database: process.env.DATABASE_NAME,
        });

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
        };

        pool = mysql.createPool(baseConfig);
        logger.info(`MySQL Server connected successfully! Host: ${baseConfig.host} Database: ${baseConfig.database} Port: ${baseConfig.port} Environment: ${process.env.NODE_ENV}`);
        return pool;
    } catch (error) {
        logger.error(`Failed to connect to MySQL server: ${error.message}`);
        throw error;
    }
}

const conn = await createConnection();

export default conn;