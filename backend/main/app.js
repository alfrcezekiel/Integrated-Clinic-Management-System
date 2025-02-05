import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import conn from './mysql/conn.js';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("port", process.env.PORT || 2140);
app.set("host", process.env.HOST || "localhost");
app.use(cors({
    origin: "http://localhost:5173",
    methods: "*",
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

app.post('/icms/registerAccount', async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;

        const first_name = String(firstName).trim();
        const last_name = String(lastName).trim();
        const emailAddress = String(email).trim();
        const phone_number = Number(phoneNumber).toString().trim();
        const pass_word = String(password).trim();
        const confirm_password = String(confirmPassword).trim();

        if(!first_name && !last_name && !emailAddress && !phone_number && !pass_word && !confirm_password){
            return res.status(200).json({
                fieldsMessage: "Please fill up all fields",
                statusMessage: "Failed"
            })
        }

        if(first_name.trim() === ""){
            return res.status(200).json({
                fieldsMessage: "First name is required",
                statusMessage: "Failed"
            })
        }

        if(last_name.trim() === ""){
            return res.status(200).json({
                fieldsMessage: "Last name is required",
                statusMessage: "Failed"
            })
        }

        const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if(!regexEmail.test(emailAddress.trim())){
            return res.status(200).json({
                fieldsMessage: "Invalid email address",
                statusMessage: "Failed"
            })
        }

        const phoneNumberPattern = phone_number.trim();
        if(phoneNumberPattern.length !== 11 || isNaN(phone_number)){
            return res.status(200).json({
                fieldsMessage: "Phone Number must be 11 digits",
                statusMessage: "Failed"
            })
        }

        if(pass_word === ""){
            return res.status(200).json({
                fieldsMessage: "Password is required",
                statusMessage: "Failed"
            })
        }

        if(pass_word.length < 8){
            return res.status(200).json({
                fieldsMessage: "Password must be at least 8 characters",
                statusMessage: "Failed"
            })
        }

        if(confirm_password === ""){
            return res.status(200).json({
                fieldsMessage: "Confirm Password is required",
                statusMessage: "Failed"
            })
        }

        if(confirm_password !== pass_word){
            return res.status(200).json({
                fieldsMessage: "Password does not match",
                statusMessage: "Failed"
            })
        }
        
        const insertRegisterAccount_a = "INSERT INTO db_registeraccount_a (firstName, lastName, email) VALUES (?, ?, ?)";
        const insertRegisterAccount_b = "INSERT INTO db_registeraccount_b (phoneNumber, password, confirmPassword) VALUES (?, ?, ?)";

        const [first_result] = await conn.query(insertRegisterAccount_a, [first_name, last_name, emailAddress])
        const [second_result] = await conn.query(insertRegisterAccount_b, [phone_number, pass_word, confirm_password]);

        if (first_result.affectedRows === 0 || second_result.affectedRows === 0) {
            throw new Error("Failed to register account");
        }

        return res.status(200).json({
            successfullRegistration: "Registered Account Successfully!",
            first_result: true,
            second_result: true
        })

    } catch (error) {
        console.error(`Failed to register account: ${error}`);

        return res.status(400).json({
            registrationFailed: "Failed to register account",
            first_result: false,
            second_result: false
        })
    }
})

app.get('/ICMS/api', (req, res) => {
    return res.json({ message: 'Hello API' });
});

function startServer() {
    app.listen(app.get("port"), app.get("host"), () => {
        console.log(`Server is running on http://${app.get("host")}:${app.get("port")}/icms`);
    });
}

startServer();