import { Sequelize } from "sequelize";
import connectSessionSequelize from "connect-session-sequelize";
import session from "express-session";
import logger from "../../config/winston.js";

// Initialize Sequelize with retry logic
const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: "mysql",
        logging: process.env.NODE_ENV !== "production" ? console.log : false,
        dialectOptions: {
            ssl: process.env.NODE_ENV === "production"
                ? { rejectUnauthorized: false }
                : false
        },
        retry: {
            max: 5,
            timeout: 60000
        }
    }
);

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

// Initialize session store only after successful connection
let sessionStore;
const initializeSessionStore = async () => {
    const isConnected = await testConnection();
    if (!isConnected) {
        throw new Error('Failed to connect to database');
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