import logger from "../config/winston.js";
import conn from "../db/mysql/conn.js";

/**
 * helper to execute a DB operation with retries on lock-wait timeouts
 */
export const executeDbOperationWithRetry = async (operationLabel, operationFn, maxRetries = 5, baseBackOffMs = 500) => {
    let attempt = 0;
    let lastError = null;

    while (attempt <= maxRetries) {
        let connection;
        try {
            connection = await conn.getConnection();

            if (typeof connection.beginTransaction === "function") {
                await connection.beginTransaction();
            }

            const result = await operationFn(connection);

            if (typeof connection.commit === "function") {
                await connection.commit();
            }

            if (connection && typeof connection.release === "function") {
                connection.release();
            }

            return result;
        } catch (error) {
            lastError = error;

            /**
             * attempt to rollabck if possible
             */
            try {
                if (connection && typeof connection.rollback === "function") {
                    await connection.rollback();
                }
            } catch (error) {
                logger.log(`warn`, `[${operationLabel}] - rollback failed: ${error}`);
            } finally {
                if (connection && typeof connection.release === "function") {
                    try {
                        connection.release();
                    } catch (error) {
                        logger.log(`warn`, `[${operationLabel}] - release connection failed: ${error}`);
                    }
                }
            }

            const isLockWait = String(error).includes("Lock wait timeout") || String(error).includes("ER_LOCK_WAIT_TIMEOUT");

            if (isLockWait) {
                attempt++;
                const backoff = baseBackOffMs * Math.pow(2, attempt);

                logger.log(`warn`, `[${operationLabel}] - Lock wait timeout. Retry ${attempt}/${maxRetries} in ${backoff}ms`);
                await new Promise((resolve) => setTimeout(resolve, backoff));
                continue;
            }

            logger.log(`error`, `[${operationLabel}] - non-retryable DB error: ${error}`);
            throw error;
        }
    }

    logger.log(`error`, `[${operationLabel}] - exhausted retries: ${lastError}`);
}

/**
 * helper: send email with an increased timeout wrapper
 */
export const sendEmailWithTimeout = async (sendFn, timeoutMs = 120000) => {
    return await Promise.race([
        sendFn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Email send timed out")), timeoutMs))
    ]);
}