import express from "express";
import path from "path";
import bodyParser from "body-parser";
import morgan from "morgan";
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

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("port", process.env.SERVER_PORT);
app.set("host", process.env.SERVER_HOST);
app.set("baseURL", process.env.SERVER_BASE_URL)

// session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: true
    },
}))
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true , limit: "20mb" }));
// app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
// security middleware to set various HTTP headers
app.use(helmet());
// limiting the number of requests to the server
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 100 requests per windowMs
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
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    next();
})

// Ensure the directory exists before serving it as static content
const clinicImagesPath = path.join(__dirname, "uploads/clinic_images");
app.use("/uploads/clinic_images", express.static(clinicImagesPath));
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}))

// route for CMS
app.use("/CMS", cms);

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
        app.listen(app.get("port"), app.get("host"), () => {
            console.log(`Server is running on http://${app.get("host")}:${app.get("port")}${app.get("baseURL")}`);
        })
    } catch (error){
        console.error("Error starting server:", error);
    }
}
startServer();