import logger from "../config/winston.js";
/**
 * @function provides timeout protection for async operations
 */
export const withTimeout = (promise, timeoutMs = 300000, operationName = "Operation") => {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`${operationName} timeout after ${timeoutMs}ms`)), timeoutMs);
        })
    ])
}

/**
 * @function measures execution time of async operations
 */
export const measureExecutionTime = async (asyncFn, operationName = "Operation") => {
    const startTime = Date.now();
    try {
        const result = await asyncFn();
        const duration = Date.now() - startTime;
        logger.log(`info`, `${operationName} cycle completed in ${duration}ms`);
        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        logger.log(`info`, `${operationName} failed after ${duration}ms: ${error.message}`);
        throw error;
    }
}