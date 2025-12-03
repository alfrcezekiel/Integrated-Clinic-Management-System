export const getClientInfo = (req) => {
    const userAgent = req.headers["user-agent"] || "Unknown Device";

    const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0] || req.headers["x-real-ip"] || req.socket.remoteAddress;

    return {
        userAgent,
        ipAddress
    }
}