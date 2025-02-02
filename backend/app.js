const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

app.set("port", process.env.PORT || 2140);
app.set("host", process.env.HOST || "localhost");
app.use(cors({
    origin: "http://localhost:5173",
    methods: "*",
    allowedHeaders: "*",
}));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/icms', (req, res) => {
    res.status(200).json({
        logo: "ICMS",
        title: "Integrated Clinic Management System",
        description: "ICMS streamlines the operational workflow of a clinic that automates the medical health records (EHR), appointment scheduling, payment integration and inventory of clinical products.",
    });
});

app.get('/icms/login', (req, res) => {
    return res.status(200).json({
        loginTitle: "Login Account"
    })
})

app.get('/icms/register', (req, res) => {
    return res.status(200).json({
        registerTitle: "Create Account"
    })
});

app.get('/ICMS/api', (req, res) => {
    return res.json({ message: 'Hello API' });
});

function startServer (){
    app.listen(app.get("port"), app.get("host"), () => {
        console.log(`Server is running on http://${app.get("host")}:${app.get("port")}/icms`);
    });
}

startServer();