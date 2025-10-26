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
import initializeSessionStore from "./db/mysql/session_store.js";
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

// app.set("port", process.env.PORT);
app.set("host", process.env.SERVER_HOST);

app.set("trust proxy", 1);

const sessionStore = await initializeSessionStore();

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

await sessionStore.sync()
    .then(() => {
        logger.log(`info`, `Session store synced successfully!`);
    })
    .catch((error) => {
        logger.log(`error`, `Failed to sync session store: ${error}`);
    })
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

// set custom headers for static file image for clinic images
app.use("/uploads/clinic_images", (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Opener-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", process.env.VITE_BASE_CLIENT_URL || "http://localhost:5173");
    next();
})

// Ensure the directory exists before serving it as static content
const clinicImagesPath = path.join(__dirname, "uploads/clinic_images");
app.use("/uploads/clinic_images", express.static(clinicImagesPath));

const corsOptions = {
    origin: [
        process.env.VITE_BASE_CLIENT_URL,
        "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}

app.use(cors(corsOptions));

const medicalReportPath = path.join(__dirname, "uploads/medical_reports");
app.use("/uploads/medical_reports", express.static(medicalReportPath));

// route for CMS
app.use("/", cms);

app.disable("etag");

// error handling for server not found
app.use((req, res) => {
    return res.status(StatusCodes.NOT_FOUND).json({
        routeMessage: "Server route not found"
    })
})

// error handling for server error
app.options("*", cors());

/**
 * error handler
 */
app.use(errorHandler.internalServerError)

// function for statrting the server
const startServer = async () => {
    try {

        if (process.env.NODE_ENV === "production") {
            await initializeScheduler();
        }

        const PORT = process.env.PORT || 3000;

        if (process.env.NODE_ENV === "production") {
            app.listen(PORT, () => {
                logger.log(`info`, `Server is running in ${PORT} for production environment`);
            })
        } else {
            app.listen(PORT, app.get("host"), () => {
                logger.log(`info`, `Server is running in http://${app.get("host")}:${PORT}`);
            })
        }
    } catch (error) {
        logger.error(`Error starting server: ${error}`);
    }
}
startServer();