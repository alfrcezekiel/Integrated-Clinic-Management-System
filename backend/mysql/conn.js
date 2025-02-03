const mysql = require('mysql2/promise');

function createConnection() {
    try {
        const conn = mysql.createPool({
            host: "localhost",
            user: "kiel",
            password: "aelfric2004",
            database: "clinicmanagement",
            connectionLimit: 10,
            waitForConnections: true,
            queueLimit: 0
        });

        if(!conn){
            throw new Error("Failed to connect to server"); 
        } else {
            console.log("Server connected successfully!");   
        }
    
        return conn;
    } catch (error){
        console.error(`Failed to connect to server: ${error}`);
    }
}
const db = createConnection();
module.exports = db;