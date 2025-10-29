import { StatusCodes } from "http-status-codes";

/**
 * Middleware to handle unsupported HTTP request methods.
 */
const requestMethod = (req, res, next) => {
    const method = req.method || 'UNKNOWN';

    return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
        success: false,
        status: StatusCodes.METHOD_NOT_ALLOWED,
        message: `HTTP ${method} method is not allowed on this endpoint.`,
    })
}

export default requestMethod;