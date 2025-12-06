import DeviceDetector from "node-device-detector";

export const getClientInfo = (req) => {
    const userAgent = req.headers["user-agent"] || "Unknown Device";

    const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0] || req.headers["x-real-ip"] || req.socket.remoteAddress;

    const detector = new DeviceDetector({
        clientIndexes: true,
        deviceIndexes: true,
        deviceAliasCode: false
    });

    const result = detector.detect(userAgent);
    const device = result.device;
    const os = result.os;
    const browser = result.client;

    let deviceName;

    if (device.brand) {
        deviceName = `${device.brand} ${device.model}`;
    } else if (device.model) {
        deviceName = device.model;
    } else if (!device.brand && !device.model) {
        deviceName = `${os.name || "Unknown OS"} PC`;
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