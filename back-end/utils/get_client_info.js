import { UAParser } from "ua-parser-js";

const chineseBrands = ["Realme", "Xiaomi", "Redmi", "Oppo", "Vivo", "Tecno", "OnePlus", "Honor", "Huawei", "Infinix"];

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
        if (/iphone/i.test(device.model)) {
            deviceName = device.model.replace(/iphone/i, "iPhone").replace(/\s+/g, " ").trim();
        } else {
            // Check if the model belongs to a Chinese brand
            const modelUpper = device.model.toUpperCase();
            const matchedBrand = chineseBrands.find(brand => modelUpper.includes(brand.toUpperCase()));
            if (matchedBrand) {
                // Format dynamically: "Realme C11", "Xiaomi Redmi Note 10", etc.
                const formattedModel = device.model
                    .replace(/_/g, " ")      // Replace underscores with spaces
                    .replace(/-/g, " ")      // Replace dashes with spaces
                    .replace(/\s+/g, " ")    // Remove extra spaces
                    .trim();
                deviceName = `${matchedBrand} ${formattedModel}`;
            } else {
                // Default fallback if unknown model
                deviceName = device.model;
            }
        }
    } else if (!device.vendor && !device.model) {
        // Desktop fallback (common case)
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