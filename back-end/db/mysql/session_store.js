import { Sequelize } from "sequelize";
import connectSessionSequelize from "connect-session-sequelize";
import session from "express-session";
import logger from "../../config/winston.js";
import dotenv from "dotenv";
import db from "./conn.js";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const rawPort = process.env.DB_PORT ?? 3306;
const rawDatabase = process.env.DATABASE_NAME;
const rawUser = process.env.DB_USER;
const rawPassword = process.env.DB_PASSWORD;
const rawHost = process.env.DB_HOST;

/* Normalize & trim quotes from env values (Railway sometimes shows values with surrounding quotes) */
const trim = (v) => (v === undefined || v === null) ? v : String(v).replace(/^['"]|['"]$/g, '').trim();

const dbConfig = {
    database: trim(rawDatabase),
    user: trim(rawUser),
    password: trim(rawPassword),
    host: trim(rawHost),
    port: trim(rawPort) || 3306,
}

// Initialize Sequelize with retry logic
let sequelize;
try {
    const rawDatabaseURL = process.env.DATABASE_URL;
    const databaseURL = trim(rawDatabaseURL);

    logger.log('info', `SessionStore: using ${databaseURL ? 'DATABASE_URL' : 'individual env vars'} for sequelize initialization`);

    if (databaseURL) {
        sequelize = new Sequelize(databaseURL,
            {
                dialect: "mysql",
                logging: !isProduction ? console.log : false,
                dialectOptions: isProduction ? {
                    ssl: {
                        rejectUnauthorized: false,
                    }
                } : {},
                retry: {
                    max: 5,
                    timeout: 60000
                }
            }
        );
    } else {
        const portNumber = parseInt(dbConfig.port, 10);
        const finalPort = Number.isInteger(portNumber) && portNumber > 0 ? portNumber : 3306;

        if (!dbConfig.database || !dbConfig.user) {
            throw new Error("Missing database name or user in environment variables");
        }

        sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
            host: dbConfig.host,
            port: finalPort,
            dialect: "mysql",
            logging: !isProduction ? console.log : false,
            dialectOptions: isProduction ? { ssl: { rejectUnauthorized: false } } : {},
            retry: {
                max: 5,
                timeout: 60000
            }
        })
    }
} catch (error) {
    logger.log(`error`, `Sequelize initialization error: ${error.message}`);
    throw error;
}

// Add retry logic to database connection
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;

// Test the database connection first
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.log('info', 'Sequelize Database connection has been established successfully for either prod or dev env.');
        return true;
    } catch (error) {
        logger.log('error', `Unable to connect to the database: ${error.message}`);
        return false;
    }
};

const testConnectionWithRetry = async (retries = MAX_RETRIES) => {
    for (let i = 0; i < retries; i++) {
        try {
            const isConnected = await testConnection();
            if (isConnected) {
                return true;
            }
        } catch (error) {
            logger.log('error', `Database connection attempt ${i + 1} failed: ${error.message}`);
        }

        logger.log('warn', `Retrying database connection attempt ${i + 1}...`);
        if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        }
    }
    return false;
}

// Initialize session store only after successful connection
let sessionStore;
const initializeSessionStore = async () => {
    const isConnected = await testConnectionWithRetry();
    if (!isConnected) {
        throw new Error('All database connection attempts failed! Please check your database connection.');
    }

    const SequelizeStore = connectSessionSequelize(session.Store);

    sessionStore = new SequelizeStore({
        db: sequelize,
        tableName: 'sessions',
        checkExpirationInterval: 60 * 60 * 1000, // Clean up expired sessions every hour
        expiration: 24 * 60 * 60 * 1000, // 1 day
    });

    try {
        await sessionStore.sync();
        logger.log(`info`, `Session table synced successfully`);
    } catch (error) {
        logger.log(`error`, `Failed to sync session store table: ${error}`);
    }
    return sessionStore;
};

// Export a promise that resolves to the session store
export default initializeSessionStore;