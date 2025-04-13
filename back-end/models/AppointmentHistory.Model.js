import conn from "../db/mysql/conn.js";

export const getAppointmentHistory = async (clinicID) => {
    try {
        const status = "Consulted";

        const query = `SELECT
            pa.appointmentID,
            c.clinic_name,
            pa.firstName,
            pa.lastName,
            pa.appointmentDate,
            pa.preferredTime,
            pa.phoneNumber,
            pa.gender,
            pa.status
            FROM patientsappointment AS pa
            INNER JOIN clinic AS c
            ON pa.clinic_id = c.clinic_id
            WHERE pa.clinic_id  = ?  AND pa.status = ?
        `

        const [rows] = await conn.query(query, [
            clinicID,
            status
        ])

        return rows;
    } catch (error) {
        console.error("Error fetching appointment history:", error);
        throw error;
    }
}