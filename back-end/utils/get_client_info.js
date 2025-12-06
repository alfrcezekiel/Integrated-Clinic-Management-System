import { UAParser } from "ua-parser-js";

export const getClientInfo = (req) => {
    const userAgent = req.headers["user-agent"] || "Unknown Device";

    const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0] || req.headers["x-real-ip"] || req.socket.remoteAddress;

    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const os = parser.getOS();
    const browser = parser.getBrowser();

    let deviceName;

    if (device.vendor && device.model) {
        // example: Samsung SM-G991B
        deviceName = `${device.vendor} ${device.model}`;
    } else if (device.model && !device.vendor) {
        // example: iPhone users (often only model detected)
        deviceName = device.model;
    } else if (!device.vendor && !device.model) {
        // Desktop fallback (common case)
        deviceName = `${os.name || "Unknown OS"} Desktop Device`;
    }

    const deviceOS = os.name ? `${os.name} ${os.version}` : "Unknown OS";
    const deviceBrowser = browser.name ? `${browser.name} ${browser.version ? browser.version.split("-")[0] : ""}` : "Unknown Browser";

    return {
        userAgent,
        ipAddress,
        deviceName,
        deviceOS,
        deviceBrowser
    }
}