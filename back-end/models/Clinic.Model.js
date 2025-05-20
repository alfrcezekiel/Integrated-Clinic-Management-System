import { response } from "express";
import conn from "../db/mysql/conn.js";

// created a new instance of class Clinic Models
class Clinic {

    // method of retrieving all appointment history to render in appointment history in clinic side
    getAppointmentHistory = async (clinicID) => {
        try {
            const status = "Consulted";

            const query = `SELECT
                pa.appointmentID,
                c.clinic_name,
                cp.patient_first_name,
                cp.patient_last_name,
                cp.patient_email,
                cp.created_by,
                cp.appointmentID,
                cp.past_surgeries_details,
                cp.treatment_plan,
                cp.allergy_details,
                cp.taking_prescription_medication_details,
                cp.chronic_condition_details,
                cp.past_surgeries_details,
                cp.history_of_jaw_pain_details,
                cp.experienced_excessive_bleeding_details,
                cp.past_history_of_cardiovascular_issues,
                cp.advised_taking_antibiotics_details,
                cp.blood_pressure_details,
                cp.heart_rate_details,
                cp.smoke_frequency_details,
                cp.consume_sugary_foods_or_beverages_details,
                cp.dental_floss_details,
                cp.consume_alcohol_details,
                cp.participate_in_sports_details,
                cp.balanced_diet_details,
                cp.regular_exercise_details,
                cp.eating_disorder_details,
                cp.diagnosis,
                cp.symptoms,
                cp.prescription,
                cp.appointment_date,
                cp.appointment_time,
                pa.phoneNumber,
                pa.gender,
                pa.status,
                pa.purposeOfAppointment
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
                pp.id,
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

    // method for cancelliing the patients payment
    cancelledPaymentDetailsInConfirmedPaymentDialog = async (paymentID) => {
        try {
            const paymentStatus = "Non Paid"
            const query = `
                UPDATE patientspayment
                SET payment_status = ?
                WHERE patient_id = ?;
            `

            const value = [
                paymentStatus,
                paymentID
            ]

            const [result] = await conn.query(query, value);

            return result;
        } catch (error) {
            console.error("Error cancelling patients details in retrievedConfirmedPaymentDetails model function:", error);
            throw error;
        }
    }

    // method for deleting the patient registered account in admin side
    deletePatientRegisteredAccount = async (patientID) => {
        try {
            const query = `
                DELETE pr1, pr2 
                FROM patientsregisteraccount1 AS pr1
                INNER JOIN patientsregisteraccount2 as pr2
                ON pr1.patientID = pr2.registerPatientID
                WHERE pr1.patientID = ?;
            `

            const value = [
                patientID
            ]

            const [result] = await conn.query(query, value);

            return result;
        } catch(error){
            console.error(`Error deleting the patient registered account in model function: ${error}`)
            throw error;
        }
    }

    // method for inserting a consultation questionnaire varies in different clinic field in admin side
    insertConsultationQuestionnaire = async (responses) => {
        try {
            const query = `
                INSERT INTO consultation_questionnaires (
                    clinic_id,
                    clinic_name,
                    clinic_type,
                    section,
                    question,
                    answer,
                    createdBy
                ) VALUES ?
            `

            const values = responses.map(response => [
                response.clinic_id,
                response.clinic_name,
                response.clinic_type,
                response.section,
                response.question,
                response.answer,
                response.adminID
            ]);

            const [result] = await conn.query(query, [values]);

            return result;
        } catch (error) {
            console.error(`Error inserting the consultation questionnaire in model function: ${error}`)
            throw error;
        }
    }

    // method for retrieving the consultation questionnaire to render in clinic side
    retrievedMedicalHistoryQuestionnaire = async (clinicID) => {
        try {
            const answer = "Yes";
            const sectionType = "Medical History"

            const query = `
                SELECT 
                id,
                clinic_id,
                clinic_name,
                clinic_type,
                section, 
                question,
                answer
                FROM consultation_questionnaires
                WHERE clinic_id = ?
                AND answer = ?
                AND section = ?
                LIMIT 8;
            `

            const value = [
                clinicID,
                answer,
                sectionType
            ]

            const [rows] = await conn.query(query, value);

            return rows;
        } catch (error){
            console.error(`Error retrieving the consultation questionnaire in model method: ${error}`)
            throw error;
        }
    }

    // method for retrieving the lifestle info consultation questionnaires to render in clinic side
    retrieveLifestyleInformationQuestionnaire = async (clinicID) => {
        try {
            if(!Number.isInteger(clinicID) || clinicID <= 0){
                throw new Error("Invalid clinic ID");
            }

            const MAX_LIMIT = 10;
            const limit = 8;
            const safeLimit = Math.min(Number(limit) || 8, MAX_LIMIT);

            const answer = "Yes";
            const sectionType = "Lifestyle Information"

            const query = `
                SELECT 
                    id,
                    clinic_id,
                    clinic_name,
                    clinic_type,
                    section, 
                    question,
                    answer
                FROM consultation_questionnaires
                WHERE clinic_id = ?
                    AND answer = ?
                    AND section = ?
                LIMIT ?;
            `

            const value = [
                clinicID,
                answer,
                sectionType,
                safeLimit
            ]

            const [rows] = await conn.query(query, value);

            return rows;
        } catch (error) {
            console.error(`Error retrieving the lifestyle information questionnaire in model method: ${error}`)
            throw error;
        }
    }
}

export default Clinic;