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
        } catch (error) {
            console.error("Error checking email:", error);
            throw error;
        }
    }

    addPatientPaymentInformation = async (paymentData) => {
        try {
            const {
                appointmentID,
                modeOfPayment,
                amount,
                firstName,
                lastName,
                email,
                cardNumber,
                cardHolderName,
                expiryDate,
                cvv,
            } = paymentData;

            const date = new Date();
            const current_date = date.toISOString().split('T')[0];
            const paymentStatus = "Paid"

            // this is the field for cash fields payment
            let fields = [
                "amount",
                "appointment_id",
                "first_name",
                "last_name",
                "email",
                "mode_of_payment",
                "payment_date",
                "payment_status"
            ]

            let values = [
                amount,
                appointmentID,
                firstName,
                lastName,
                email,
                modeOfPayment,
                current_date,
                paymentStatus
            ]
            let placeholder = "?, ?, ?, ?, ?, ?, ?, ?"
            
            // this is the field for card fields payment
            if(modeOfPayment === "Card") {
                fields.push("card_number", "cardholder_name", "expiry_date", "cvv")
                values.push(cardNumber, cardHolderName, expiryDate, cvv)
                placeholder += ", ?, ?, ?, ?"
            }

            const query = `
                INSERT INTO patientpayment (
                    ${fields.join(", ")}
                ) VALUES (
                    ${placeholder}
                )
            `;

            const [result] = await conn.query(query, values)
            return result;
        } catch (error) {
            console.error(`Failed to add payment: ${error}`)
            throw error;
        }
    }
}

export default Clinic;