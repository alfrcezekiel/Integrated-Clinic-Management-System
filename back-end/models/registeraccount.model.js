import conn from "../db/mysql/conn.js";

export const isEmailTaken = async (email) => {
    try {
        const query = `SELECT
            email
            FROM patientsregisteraccount1 WHERE email = ?`;
        const [rows] = await conn.query(query, [email]);

        return rows.length > 0
    } catch (error){
        console.error("Error checking email:", error);
        throw error;
    }
}