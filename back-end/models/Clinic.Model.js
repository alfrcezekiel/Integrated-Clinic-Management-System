import conn from "../db/mysql/conn.js";

// created a new instance of class Clinic Models
class Clinic {
    getAppointmentHistory = async (clinicID) => {
        try {
            const status = "Consulted";

            const query = `SELECT
                pa.appointmentID,
                c.clinic_name,
                pa.firstName,
                pa.lastName,
                pa.email,
                cp.created_by,
                cp.has_medical_condition,
                cp.appointmentID,
                cp.medical_condition_details,
                cp.taking_medication,
                cp.medication_details,
                cp.smokes,
                cp.smoke_frequency,
                cp.has_allergies,
                cp.allergies_details,
                cp.drinks_alcohol,
                cp.alcohol_details,
                cp.diagnosis,
                cp.symptoms,
                cp.prescription,
                pa.appointmentDate,
                pa.preferredTime,
                pa.phoneNumber,
                pa.gender,
                pa.status
                FROM patientsappointment AS pa
                INNER JOIN clinic AS c
                ON pa.clinic_id = c.clinic_id
                INNER JOIN consultedpatients AS cp
                ON pa.appointmentID = cp.appointmentID
                WHERE pa.clinic_id  = ?  AND pa.status = ?
                ORDER BY pa.appointmentDate ASC
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

    isEmailTaken = async (email) => {
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
}

export default Clinic;