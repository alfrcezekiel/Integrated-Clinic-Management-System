import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function createConnection() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "kiel",
            password: process.env.DB_PASSWORD || "aelfric2004",
            database: process.env.DATABASE_NAME || "clinicmanagement",
            connectionLimit: 10,
            waitForConnections: true,
            queueLimit: 0
        });

        if(!pool){
            throw new Error("Failed to connect to server"); 
        } else {
            console.log("Server connected successfully!");   
        }
    
        return pool;
    } catch (error){
        console.error(`Failed to connect to server: ${error}`);
    }
}
const db = await createConnection();

export default db;