import { Sequelize } from "sequelize";
import connectSessionSequelize from "connect-session-sequelize";
import session from "express-session";
import logger from "../../config/winston.js";

const isProduction = process.env.NODE_ENV === "production";

const dbConfig = {
    database: process.env.DATABASE_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
}

// Initialize Sequelize with retry logic
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.user,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: Number(dbConfig.port),
        dialect: "mysql",
        logging: !isProduction ? console.log : false,
        dialectOptions: isProduction ? {
            ssl: {
                rejectUnauthorized: false,
                require: true,
            }
        } : {},
        retry: {
            max: 5,
            timeout: 60000
        }
    }
);

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

    return sessionStore;
};

// Export a promise that resolves to the session store
export default initializeSessionStore;