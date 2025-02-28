import express from "express";
import path from "path";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import { fileURLToPath } from "url";
import CMS from "./routes/userRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("port", process.env.PORT || 5003);
app.set("host", process.env.HOST || "localhost");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}))

app.use("/CMS", CMS);

const startServer = () => {
    app.listen(app.get("port"), app.get("host"), () => {
        console.log(`Server is running on http://${app.get("host")}:${app.get("port")}`);
    })
}
startServer();