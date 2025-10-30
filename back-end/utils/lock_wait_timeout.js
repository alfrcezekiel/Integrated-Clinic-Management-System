import logger from "../config/winston.js";

/**
 * helper to execute a DB operation with retries on lock-wait timeouts
 */
export const executeDbOperationWithRetry = async (operationLabel, operationFn, maxRetries = 5, baseBackOffMs = 500) => {
    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
        let conn;
        try {
            conn = await conn.getConnection();

            if (typeof conn.beginTransaction === "function") {
                await conn.beginTransaction();
            }

            const result = await operationFn(conn);

            if (typeof conn.comiit === "function") {
                await conn.commit();
            }

            if (conn && typeof conn.release === "function") {
                conn.release();
            }

            return result;
        } catch (error) {
            lastError = error;

            /**
             * attempt to rollabck if possible
             */
            try {
                if (conn && typeof conn.rollback === "function") {
                    await conn.rollback();
                }
            } catch (error) {
                logger.log(`warn`, `${operationLabel} - rollback failed: ${error}`);
            } finally {
                if (conn && typeof conn.release === "function") {
                    try {
                        conn.release();
                    } catch (error) {
                        logger.log(`warn`, `${operationLabel} - release connection failed: ${error}`);
                    }
                }
            }

            const isLockWait = String(error).includes("Lock wait timeout") || String(error).includes("ER_LOCK_WAIT_TIMEOUT");

            if (isLockWait) {
                attempt++;
                const backoff = baseBackOffMs * Math.pow(2, attempt);

                logger.log(`warn`, `${operationLabel} - Lock wait timeout. Retry ${attempt}/${maxRetries} in ${backoff}ms`);
                await new Promise((resolve) => setTimeout(resolve, backoff));
                continue;
            }

            logger.log(`error`, `${operationLabel} - non-retryable DB error: ${error}`);
            throw error;
        }
    }

    logger.log(`error`, `${operationLabel} - exhausted retries: ${lastError}`);
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