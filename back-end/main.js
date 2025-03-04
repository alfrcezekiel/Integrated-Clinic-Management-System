import express from "express";
import path from "path";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import { fileURLToPath } from "url";
import cms from "./routes/userRoutes.js";
import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("port", process.env.PORT || 5003);
app.set("host", process.env.HOST || "localhost");

app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}))

// route for CMS
app.use("/CMS", cms);

// error handling for server not found
app.use((req, res) => {
    return res.status(StatusCodes.NOT_FOUND).json({
        routeMessage: "Server route not found"
    })
})

// function for statrting the server
const startServer = () => {
    app.listen(app.get("port"), app.get("host"), () => {
        console.log(`Server is running on http://${app.get("host")}:${app.get("port")}/CMS`);
    })
}
startServer();