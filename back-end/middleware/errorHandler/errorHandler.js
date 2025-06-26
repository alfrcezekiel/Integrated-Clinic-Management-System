import { StatusCodes } from "http-status-codes"

export const internalServerError = (err, req, res) => {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: err.message,
        routeMessage: "Internal server error"
    })
}