import pool from "../db/mysql/conn.js";
import logger from "../config/winston.js";

const getNewDatabaseConnection = async () => {
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        logger.log("error", `Error getting database connection: ${error}`);
        throw error;
    }
}

export default getNewDatabaseConnection;