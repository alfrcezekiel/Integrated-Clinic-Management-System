import logger from "../../config/winston.js";

// Middleware to log incoming requests and responses
/**
 * Middleware to log incoming requests and responses.
 * Logs the request method, URL, user agent, IP address, and response status code.
 */
/**/

const requestLogger = (req, res, next) => {
    const { method, url, headers , body} = req;
    const userAgent = headers['user-agent'] || 'unknown';
    const ip = req.ip || req.connection.remoteAddress;
    const requestBody = typeof body !== "string" ? JSON.stringify(body) : body; 

    logger.info(`Request: ${method} ${url} - User-Agent: ${userAgent} - IP: ${ip} - Request Body: ${requestBody}`);

    const startTime = Date.now();
    res.on('finish', () => {
        const statusCode = res.statusCode;
        const duration = Date.now() - startTime;
        logger.info(`Response: ${statusCode} - ${method} ${url} - Duration: ${duration}ms`);
    });

    next();
}

export default requestLogger;