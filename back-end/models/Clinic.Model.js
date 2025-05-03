import { CONFLICT } from "http-status-codes";
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
                "patient_id",
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
            if (modeOfPayment === "Card") {
                fields.push("card_number", "cardholder_name", "expiry_date", "cvv")
                values.push(cardNumber, cardHolderName, expiryDate, cvv)
                placeholder += ", ?, ?, ?, ?"
            }

            const query = `
                INSERT INTO patientspayment (
                    ${fields.join(", ")}
                ) VALUES (
                    ${placeholder}
                )
            `;

            const [result] = await conn.query(query, values);

            if (result.affectedRows === 0) {
                throw new Error("Failed to insert payment information");
            }

            return result;
        } catch (error) {
            console.error(`Failed to insert payment in model: ${error}`)
            throw error;
        }
    }

    // model for retrieving the patients details to populate the payment dialog box
    retrievePatientsDetailsToRenderInPaymentDialog = async (patientID) => {
        try {
            const query = `
                SELECT
                pa.firstName,
                pa.lastName,
                pa.email,
                c.consultation_fee
                FROM patientsappointment AS pa
                LEFT JOIN clinic AS c
                ON pa.clinic_id = c.clinic_id
                WHERE pa.patientID = ?
                ORDER BY pa.createdAt DESC
                LIMIT 1;
            `
            
            const value = [
                patientID
            ]

            const [rows] = await conn.query(query, value);

            return rows;
        } catch (error) {
            console.error("Error retrieving patients details in retrievePatientDetailsToRenderInPaymentDialog model function:", error);
        }
    }

    // model for retrieving the patients details payment to render in confirmed payment dialog box
    retrievedConfirmedPaymentDetails = async (patientID) => {
        try {
            const paymentStatus = "Paid";
            const methodOfPayment = ["Cash", "Card"];

            const mode_placeholders = methodOfPayment.map(() => "?").join(", ")
            const query = `
                SELECT
                pp.amount,
                pp.first_name,
                pp.last_name,
                pp.email,
                pp.mode_of_payment,
                pp.payment_date,
                pp.payment_status,
                pp.card_number,
                pp.cardholder_name,
                pp.expiry_date
                FROM patientspayment AS pp
                WHERE pp.patient_id = ?
                AND pp.payment_status = ?
                AND pp.mode_of_payment IN (${mode_placeholders})
                ORDER BY pp.payment_date DESC
                LIMIT 1;
            `

            const value = [
                patientID,
                paymentStatus,
                ...methodOfPayment
            ]

            if(query.match(/\?/g).length !== value.length){
                throw new Error("Number of placeholders and values do not match")
            }

            const [rows] = await conn.query(query, value);

            return rows;
        } catch (error) {
            console.error("Error retrieving patients details in retrievedConfirmedPaymentDetails model function:", error);
            throw error;
        }
    }
}

export default Clinic;