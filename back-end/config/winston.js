import {
    createLogger,
    transports,
    format
} from "winston";
import fs from "fs";
import DailyRotateFile from "winston-daily-rotate-file";

const LOG_DIR = process.env.LOG_DIR || "logs"; // Directory for log files
const LOG_LEVEL = process.env.LOG_LEVEL || "info"; // Default log level

// Ensure the log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logger = createLogger({
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        // Console transport for logging messages to the console
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple(),
            ),
            level: LOG_LEVEL,
        }),
        // DailyRotateFile transport for logging info level messages
        new DailyRotateFile({
            filename: `${LOG_DIR}/info/%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            level: LOG_LEVEL,
        }),
        // DailyRotateFile transport for logging log level messages
        new DailyRotateFile({
            filename: `${LOG_DIR}/log/%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            level: process.env.LOG_LEVEL_LOG || "info",
        }),
        // DailyRotateFile transport for logging error level messages
        new DailyRotateFile({
            filename: `${LOG_DIR}/error/%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            level: process.env.LOG_LEVEL_ERROR || "error",
        }),
        // DailyRotateFile transport for logging debug level messages
        new DailyRotateFile({
            filename: `${LOG_DIR}/debug/%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            level: process.env.LOG_LEVEL_DEBUG || "debug",
        }),
        // DailyRotateFile transport for logging warn level messages
        new DailyRotateFile({
            filename: `${LOG_DIR}/warn/%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            level: process.env.LOG_LEVEL_WARN || "warn",
        }),
    ]
})

export default logger;