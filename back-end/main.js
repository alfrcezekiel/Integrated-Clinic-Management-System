import express from "express";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from "url";
import cms from "./routes/userRoutes.js";
import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";
import session from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import requestLogger from "./middleware/logger/requestLogger.js";
import cookieParser from "cookie-parser";
import * as errorHandler from "./middleware/errorHandler/errorHandler.js";
import {
    scheduleBackup,
    getNextBackupRun
} from "./config/backup_database_schema.js";
import parser from "cron-parser"
import logger from "./config/winston.js";
import initializeScheduler from "./config/appointment_scheduler.js";
import sessionStore from "./db/mysql/session_store.js";
import fs from "fs";
dotenv.config();

const nextRuns = await getNextBackupRun(5);
logger.log(`info`, `Upcoming backup runs (Asia/Manila)`)
nextRuns.forEach((run, index) => {
    logger.log(`info`, `Run ${index + 1}: ${run.toLocaleString("en-US", { timeZone: "Asia/Manila" })}`)
})

const backupConfig = {
    development: {
        enabled: true,
        schedule: process.env.BACKUP_SCHEDULE_DEV || "0 */6 * * *", // every 6 hours
        log: "Database backup scheduler initialized. (developement enviroment - running every 6 hours)"
    },
    production: {
        enabled: true,
        schedule: process.env.BACKUP_SCHEDULE_PROD || "0 2 * * *", // daily at 2 AM
        log: "Database backup schedule initialized (production enviroment - running daily at 2 AM)"
    },
    test: {
        enabled: false,
        log: "Database backup schedule disabled in the test enviroment"
    }
}

const env = process.env.NODE_ENV || "development";
const config = backupConfig[env] || backupConfig.development

let nextRun = null;
try {
    const it = parser.parse(config.schedule);
    nextRun = it.next().toDate();
} catch (error) {
    logger.log(`error`, `Invalid! cron expression for backup schedule: - (${error})`);
}


if (config.enabled) {
    try {
        const schedule = await scheduleBackup(config.schedule);

        logger.log(`info`, `${config.log} - Next backup scheduled at: ${schedule} - (${nextRun ? `Next Run: ${nextRun.toLocaleString("en-US", { timeZone: "Asia/Manila" })}` : ""})`);
    } catch (error) {
        logger.log(`error`, `Failed to initialize backup scheduler: ${error}`)
    }
} else {
    logger.log(`info`, config.log);
}

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("trust proxy", 1);

// session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: "lax"
    },
}))

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
// app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
// security middleware to set various HTTP headers
app.use(helmet());
// limiting the number of requests to the server
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Limit each IP to 1000 requests per windowMs
    message: "Too many requests from this IP, please try again later."
}))

// cookie parser middleware to parse cookies
app.use(cookieParser());

// logging middleware for requests
app.use(requestLogger);

// const corsOptions = {
//     origin: env === "production" ? process.env.VITE_BASE_CLIENT_URL : "http://localhost:5173",
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
// }

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        const allowedOrigins = env === "production"
            ? [
                process.env.VITE_BASE_CLIENT_URL, // Your Railway frontend URL
                process.env.CLIENT_VERCEL_DOMAIN,
                // Add any other production frontend URLs here
            ].filter(Boolean) // Remove any undefined values
            : ["http://localhost:5173", "http://localhost:3000"];

        const normalizedOrigin = origin.replace(/\/$/, "");
        const isAllowed = allowedOrigins.some(allowed => allowed.replace(/\/$/, "") === normalizedOrigin);

        if (isAllowed) {
            callback(null, true);
        } else {
            // Log for debugging
            logger.log("warn", `CORS blocked origin: ${origin} | Allowed: [${allowedOrigins.join(", ")}]`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400 // Cache preflight for 24 hours
}

app.use(cors(corsOptions));

// error handling for server error
app.options("*", cors(corsOptions));

// Serve static files with proper CORS and caching headers
const serveStaticOptions = {
    setHeaders: (res, path) => {
        // Cache control for static files (1 day)
        res.setHeader('Cache-Control', 'public, max-age=86400');

        // Set CORS headers for static files
        const allowedOrigins = env === "production"
            ? [process.env.VITE_BASE_CLIENT_URL, process.env.CLIENT_VERCEL_DOMAIN].filter(Boolean)
            : ["http://localhost:5173", "http://localhost:3000"];

        const origin = res.req?.headers?.origin;
        if (origin) {
            // Check if origin is in allowedOrigins or if it's a subdomain of our main domain
            const isAllowed = allowedOrigins.some(allowed =>
                origin === allowed ||
                (allowed && origin.endsWith(new URL(allowed).hostname.replace('www.', '')))
            );

            if (isAllowed) {
                res.setHeader('Access-Control-Allow-Origin', origin);
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
                res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
                res.setHeader('X-Content-Type-Options', 'nosniff');
            }
        }
    },
    fallthrough: false
};

// Custom 404 handler for static files
const staticFileHandler = (req, res, next) => {
    const filePath = path.join(__dirname, req.path);

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // If file doesn't exist, return a transparent 1x1 pixel PNG
            const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Type': 'image/jpeg',
                'Content-Type': 'image/jpg',
                'Content-Type': 'image/webp',
                'Content-Length': transparentPixel.length,
                'Cache-Control': 'public, max-age=300' // Cache 404s for 5 minutes
            });
            return res.end(transparentPixel);
        }
        next();
    });
};

// Serve clinic images
const clinicImagesPath = path.join(__dirname, "uploads/clinic_images");
app.use("/uploads/clinic_images", staticFileHandler, express.static(clinicImagesPath, serveStaticOptions));

// Serve medical reports
const medicalReportPath = path.join(__dirname, "uploads/medical_reports");
app.use("/uploads/medical_reports", staticFileHandler, express.static(medicalReportPath, serveStaticOptions));

// route for CMS
app.use("/", cms);

app.disable("etag");

// error handling for server not found
app.use((req, res) => {
    return res.status(StatusCodes.NOT_FOUND).json({
        routeMessage: `Server route ${req.url} ${StatusCodes.NOT_FOUND} not found`
    })
})

/**
 * error handler
 */
app.use(errorHandler.internalServerError)

// function for statrting the server
const startServer = async () => {
    try {

        if (process.env.NODE_ENV === "production") {
            await initializeScheduler();
        } else {
            await initializeScheduler();
        }

        const PORT = process.env.PORT || 3000;

        if (process.env.NODE_ENV === "production") {
            app.listen(PORT, () => {
                logger.log(`info`, `Server is running in ${PORT} for ${process.env.NODE_ENV} environment`);
            })
        } else {
            app.listen(PORT, () => {
                logger.log(`info`, `Server is running in http://localhost:${PORT} for ${process.env.NODE_ENV} environment`);
            })
        }
    } catch (error) {
        logger.error(`Error starting server: ${error}`);
    }
}
startServer();