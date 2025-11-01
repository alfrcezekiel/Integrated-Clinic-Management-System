import MySQLStoreFactory from 'express-mysql-session';
import session from 'express-session';
import dotenv from 'dotenv';
import logger from "../../config/winston.js";
dotenv.config();

let sessionStore;
try {
    const MySQLStore = MySQLStoreFactory(session);

    const sessionConfig = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || 3306, 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DATABASE_NAME,
        clearExpired: true,
        connectTimeout: 30000, // 30 seconds
        acquireTimeout: 30000, // 30 seconds
        checkExpirationInterval: 900000, // 15 minutes
        expiration: 86400000, // 1 day
        createDatabaseTable: true,
        schema: {
            tableName: "sessions",
            columnNames: {
                session_id: "sid",
                expires: "expires",
                data: "data",
            }
        }
    }

    sessionStore = new MySQLStore(sessionConfig);

    logger.log(`info`, `Session store initialized successfully in ${process.env.NODE_ENV} environment. Host: ${process.env.DB_HOST} Database: ${process.env.DATABASE_NAME} Port: ${process.env.DB_PORT}`);
} catch (error) {
    logger.log(`error`, `Failed to initialize session store in ${process.env.NODE_ENV} environment: ${error}`);
}

export default sessionStore;