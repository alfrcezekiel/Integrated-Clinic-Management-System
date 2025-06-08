import {
    createLogger,
    transports,
    format
} from "winston";
import fs from "fs";
import DailyRotateFile from "winston-daily-rotate-file";

const LOG_DIR = process.env.LOG_DIR; // Directory for log files

// Ensure the log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logger = createLogger({
    level: process.env.LOG_LEVEL,
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
        }),
        // DailyRotateFile transport for logging info level messages
        new DailyRotateFile({
            filename: `${LOG_DIR}/info/%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            level: process.env.LOG_LEVEL,
        }),
        // DailyRotateFile transport for logging log level messages
        new DailyRotateFile({
            filename: `${LOG_DIR}/log/%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            level: process.env.LOG_LEVEL_LOG,
        }),
        // DailyRotateFile transport for logging error level messages
        new DailyRotateFile({
            filename: `${LOG_DIR}/error/%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            level: process.env.LOG_LEVEL_ERROR,
        }),
        // DailyRotateFile transport for logging debug level messages
        new DailyRotateFile({
            filename: `${LOG_DIR}/debug/%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            level: process.env.LOG_LEVEL_DEBUG,
        }),
    ]
})

export default logger;