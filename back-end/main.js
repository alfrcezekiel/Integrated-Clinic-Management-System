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

/**
 * @function validateRequireEnvVars - Validates required environment variables
 */
const validateRequireEnvVars = () => {
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    const required = [
        ...(hasDatabaseUrl ? [] : [
            "DB_HOST",
            "DB_USER",
            "DB_PASSWORD",
            "DATABASE_NAME"
        ])
    ]

    const missing = required.filter((k) => !process.env[k]);

    if (missing.length > 0) {
        logger.log(`error`, `Missing required environment variables: ${missing.join(", ")}`);
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }

    if (process.env.DB_PORT && isNaN(Number(process.env.DB_PORT))) {
        logger.log(`warn`, `DB_PORT env variable is not numeric: ${process.env.DB_PORT}. Falling back to 3306`);
        process.env.DB_PORT = "3306";
    }

    if (process.env.SMTP_PORT && isNaN(Number(process.env.SMTP_PORT))) {
        logger.log(`warn`, `SMTP_PORT env variable is not numeric: ${process.env.SMTP_PORT}. Falling back to 587`);
        delete process.env.SMTP_PORT;
    }
}

try {
    validateRequireEnvVars()
} catch (error) {
    logger.log(`error`, `Startup validation env variables failed: ${error}`);
}

// global safety handlers - log and prevent uncaught rejections from crashing requests
process.on('unhandledRejection', (reason) => {
    logger.log('error', `Unhandled Rejection: ${reason}`);
});
process.on('uncaughtException', (err) => {
    logger.log('error', `Uncaught Exception: ${err}`);
});

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


// set custom headers for static file image for clinic images
// app.use("/uploads/clinic_images", (req, res, next) => {
//     res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
//     res.setHeader("Cross-Origin-Opener-Policy", "cross-origin");
//     res.setHeader("Access-Control-Allow-Origin", env === "production" ? process.env.VITE_BASE_CLIENT_URL : "http://localhost:5173");
//     next();
// })
app.use("/uploads/clinic_images", (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Opener-Policy", "cross-origin");

    // Allow multiple origins for static files
    const allowedOrigins = env === "production"
        ? [process.env.VITE_BASE_CLIENT_URL, "https://integrated-clinic-management-system.vercel.app"].filter(Boolean)
        : ["http://localhost:5173", "http://localhost:3000"];

    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    next();
})

// Ensure the directory exists before serving it as static content
const clinicImagesPath = path.join(__dirname, "uploads/clinic_images");
app.use("/uploads/clinic_images", express.static(clinicImagesPath));

const medicalReportPath = path.join(__dirname, "uploads/medical_reports");
app.use("/uploads/medical_reports", express.static(medicalReportPath));

// route for CMS
app.use("/", cms);

// error handling for server error
app.options("*", cors(corsOptions));

app.disable("etag");

// error handling for server not found
app.use((req, res) => {
    return res.status(StatusCodes.NOT_FOUND).json({
        routeMessage: `Server route ${req.originalUrl} ${StatusCodes.NOT_FOUND} not found`
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
            app.listen(PORT, "::", () => {
                logger.log(`info`, `Server is running in host::${PORT} for ${process.env.NODE_ENV} environment`);
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