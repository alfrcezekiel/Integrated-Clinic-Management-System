import logger from "../../config/winston.js";

const modelErrorHandling = (fn, contextName) => async (...args) => {
    let connection;
    try {
        // Handle case where first argument is not an object with conn property
        const context = typeof args[0] === 'object' && args[0] !== null ? args[0] : {};
        
        // Only try to get connection if conn exists
        if (context.conn) {
            connection = await context.conn.getConnection();
            context.connection = connection;
        }

        // If first arg was not an object, create a new args array with the context
        const callArgs = typeof args[0] === 'object' && args[0] !== null 
            ? [context, ...args.slice(1)] 
            : [context, ...args];

        const result = await fn.apply(context, callArgs);
        return result;

    } catch (error) {
        logger.log("error", `[${contextName}] Error: ${error.message}`);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.release();
            } catch (releaseError) {
                logger.log("error", `Connection release error: ${releaseError.message}`);
            }
        }
    }
}

export default modelErrorHandling;