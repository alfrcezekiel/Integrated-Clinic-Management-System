import conn from "../db/mysql/conn.js";
import logger from "../config/winston.js";
import bcrypt from "bcryptjs";
import modelErrorHandling from "../middleware/asyncHandler/modelHandler.js";
import dayjs from "dayjs";
import crypto from "crypto";
import {
    scheduleAppointmentsReminder,
    sendStatusUpdateReminder
} from "../services/automate_notification_service.js";

/**
 * @class Clinic Model
 * @description This class represents the clinic model and provides methods for interacting with the clinic table in the database.
 */
class Clinic {
    constructor() {
        this.conn = conn;
    }

    // method of retrieving all appointment history to render in appointment history in clinic side
    getAppointmentHistory = async (clinicID) => {
        const connection = await conn.getConnection();
        try {
            await connection.beginTransaction(); // starts a transaction in retrieving all appointment history
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
                cp.allergy_details,
                cp.taking_prescription_medication_details,
                cp.chronic_condition_details,
                cp.past_surgeries_details,
                cp.history_of_jaw_pain_details,
                cp.experienced_excessive_bleeding_details,
                cp.past_history_of_cardiovascular_issues,
                cp.advised_taking_antibiotics_details,
                cp.smoke_frequency_details,
                cp.consume_sugary_foods_or_beverages_details,
                cp.dental_floss_details,
                cp.consume_alcohol_details,
                cp.participate_in_sports_details,
                cp.balanced_diet_details,
                cp.regular_exercise_details,
                cp.brush_frequency_details,
                cp.use_mouthwash_details,
                cp.replace_toothbrush_details,
                cp.clean_tongue_details,
                cp.regular_checkup_details,
                cp.dental_anxiety_details,
                cp.dental_trauma_details,
                cp.eating_disorder_details,
                cp.appointment_date,
                cp.appointment_time,
                pa.phoneNumber,
                pa.gender,
                pa.status,
                pa.purposeOfAppointment,
                cp.experience_bleeding_details,
                cp.tooth_sensitivity_details,
                cp.dental_appearance_details,
                cp.loose_teeth_details,
                cp.bad_breath_or_bad_taste_details,
                cp.dental_xrays_details,
                cp.dental_restoration_details,
                cp.orthodontic_treatment_details
                FROM patientsappointment AS pa
                INNER JOIN clinic AS c
                ON pa.clinic_id = c.clinic_id
                INNER JOIN consultedpatients AS cp
                ON pa.appointmentID = cp.appointmentID
                WHERE pa.clinic_id  = ?  AND pa.status = ?
                ORDER BY pa.appointmentDate ASC
            `

            const [rows] = await connection.query(query, [
                clinicID,
                status
            ])

            const commitQuery = await connection.commit();
            if (!commitQuery) {
                throw new Error(`Failed to commit transaction in retrieving all appoinment history`)
            }

            return rows;
        } catch (error) {
            const rollbackQuery = await connection.rollback();
            if (!rollbackQuery) {
                console.error(`Failed to rollback transaction in retrieving all appointments: ${error} `)
            }

            console.error(`Error fetching appointment history: ${error}`);
            throw error;
        } finally {
            connection.release();
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

            if (query.match(/\?/g).length !== value.length) {
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
        } catch (error) {
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
        const connection = await conn.getConnection();

        try {
            await connection.beginTransaction(); // start a transaction

            const answer = "Yes";
            const sectionType = "Medical History"

            const query = `
                SELECT 
                MAX(id) AS id,
                clinic_id,
                MAX(clinic_name) AS clinic_name,
                MAX(clinic_type) AS clinic_type,
                section, 
                question,
                MAX(answer) AS answer
                FROM consultation_questionnaires
                WHERE clinic_id = ?
                AND answer = ?
                AND section = ?
                GROUP BY section, question, clinic_id
                ORDER BY id ASC
                LIMIT 8;
            `

            const value = [
                clinicID,
                answer,
                sectionType
            ]

            const [rows] = await connection.query(query, value);

            const commitQuery = await connection.commit()

            if (!commitQuery) {
                throw new Error("Failed to commit transaction in retrieving medical history questionnaire");
            }

            return rows;
        } catch (error) {
            const rollbackQuery = await connection.rollback();
            if (!rollbackQuery) {
                console.error(`Error rolling back transaction in medical history method model: ${error}`);
            }

            console.error(`Error retrieving the consultation questionnaire in model method: ${error}`)
            throw error;
        } finally {
            connection.release();
        }
    }

    // method for retrieving the lifestle info consultation questionnaires to render in clinic side
    retrieveLifestyleInformationQuestionnaire = async (clinicID) => {
        const connection = await conn.getConnection();
        try {

            await connection.beginTransaction(); // start a transaction

            if (!Number.isInteger(clinicID) || clinicID <= 0) {
                throw new Error("Invalid clinic ID");
            }

            const MAX_LIMIT = 10;
            const limit = 8;
            const safeLimit = Math.min(Number(limit) || 8, MAX_LIMIT);

            const answer = "Yes";
            const sectionType = "Lifestyle Information"

            const query = `
                SELECT 
                    MAX(id) AS id,
                    clinic_id,
                    MAX(clinic_name) AS clinic_name,
                    MAX(clinic_type) AS clinic_type,
                    section, 
                    question,
                    MAX(answer) AS answer
                FROM consultation_questionnaires
                WHERE clinic_id = ?
                    AND answer = ?
                    AND section = ?
                GROUP BY section, question, clinic_id
                ORDER BY id ASC
                LIMIT ?;
            `

            const value = [
                clinicID,
                answer,
                sectionType,
                safeLimit
            ]

            const [rows] = await connection.query(query, value);

            const commitQuery = await connection.commit();  // commit the transaction query if successful

            if (!commitQuery) {
                throw new Error("Failed to commit transaction in retrieving lifestyle information questionnaire");
            }

            return rows;
        } catch (error) {
            const rollbackQuery = await connection.rollback();
            if (!rollbackQuery) {
                console.error(`Error rolling back transaction in lifestyle information: ${error}`);
            }

            console.error(`Error retrieving the lifestyle information questionnaire in model method: ${error}`)
            throw error;
        } finally {
            connection.release();
        }
    }

    // method for retrieving the clinical assessment questionnaire to render in clinic side
    retrieveClinicalAssessmentQuestionnaire = async (clinicID) => {
        const connection = await conn.getConnection();
        try {
            await connection.beginTransaction(); // start a transaction

            if (!Number.isInteger(clinicID) || clinicID <= 0) {
                throw new Error("Invalid clinic ID");
            }
            const MAX_LIMIT = 10;
            const limit = 8;

            const safeLimit = Math.min(Number(limit) || 8, MAX_LIMIT);

            const answer = "Yes";
            const sectionType = "Clinical Assessments"

            const fields = [
                "MAX(id) AS id",
                "clinic_id",
                "MAX(clinic_name) AS clinic_name",
                "MAX(clinic_type) AS clinic_type",
                "section",
                "question",
                "MAX(answer) AS answer"
            ]

            const query = `
                SELECT
                    ${fields.join(", ")}
                FROM consultation_questionnaires
                WHERE clinic_id = ?
                    AND answer = ?
                    AND section = ?
                GROUP BY section, question, clinic_id
                ORDER BY id ASC
                LIMIT ?;
            `

            const value = [
                clinicID,
                answer,
                sectionType,
                safeLimit
            ]

            const [rows] = await connection.query(query, value);

            const commitQuery = await connection.commit();  // commit the transaction query if successful

            if (!commitQuery) {
                throw new Error("Failed to commit transaction in retrieving clinical assessment questionnaire");
            }

            return rows;
        } catch (error) {
            const rollbackQuery = await connection.rollback();
            if (!rollbackQuery) {
                console.error(`Error rolling back transaction in clinical assessment questionnaire: ${error}`);
            }

            console.error(`Error retrieving the clinical assessment questionnaire in model method: ${error}`)
            throw error
        } finally {
            connection.release();
        }
    }

    // method for retrieving the oral hygiene questionnaire to render in clinic side
    retrieveOralHygieneQuestionnaire = async (clinicID, sectionType, limit) => {
        const connection = await conn.getConnection();
        try {
            await connection.beginTransaction(); // start a transaction

            if (!Number.isInteger(clinicID) || clinicID <= 0) {
                throw new Error("Invalid clinic ID");
            }

            if (!sectionType || typeof sectionType !== "string") {
                throw new Error("Invalid section type");
            }

            if (!limit || isNaN(limit) || limit <= 0) {
                throw new Error("Invalid limit value");
            }

            const MAX_LIMIT = 10;
            const safeLimit = Math.min(Number(limit) || 7, MAX_LIMIT);

            const answer = "Yes"

            const fields = [
                "MAX(id) AS id",
                "clinic_id",
                "MAX(clinic_name) AS clinic_name",
                "MAX(clinic_type) AS clinic_type",
                "section",
                "question",
                "MAX(answer) AS answer"
            ]

            const query = `
                SELECT
                    ${fields.join(", ")}
                FROM consultation_questionnaires
                WHERE clinic_id = ?
                    AND answer = ?
                    AND section = ?
                GROUP BY section, question, clinic_id
                ORDER BY id ASC
                LIMIT ?;
            `

            const values = [
                clinicID,
                answer,
                sectionType,
                safeLimit
            ]

            if (query.match(/\?/g).length !== values.length) {
                throw new Error("Number of placeholders and values do not match");
            }

            const [rows] = await connection.query(query, values);

            const commitQuery = await connection.commit();  // commit the transaction query if successful
            if (!commitQuery) {
                throw new Error("Failed to commit transaction in retrieving oral hygiene questionnaire");
            }

            return rows;
        } catch (error) {
            const rollbackQuery = await connection.rollback();
            if (!rollbackQuery) {
                console.error(`Error rolling back transaction in oral hygiene questionnaire: ${error}`);
            }

            console.error(`Error retrieving the oral hygiene questionnaire in model method: ${error}`)
            throw error;
        } finally {
            connection.release();
        }
    }

    // method for cancelling the booked appointment in patient side
    cancelBookedAppointment = async (appointmentID, status) => {
        const connection = await conn.getConnection();
        try {
            await connection.beginTransaction(); // start a transaction

            if (!appointmentID || typeof appointmentID !== "number") {
                throw new Error("Invalid appointment ID");
            }

            const patient_appointment_cols = [
                "c.clinic_name",
                "c.clinic_address",
                "pa.firstName",
                "pa.lastName",
                "pa.email",
                "pa.appointmentDate",
                "pa.phoneNumber",
                "pa.preferredTime",
                "pa.status",
                "pa.purposeOfAppointment",
                "pa.appointmentID"
            ]

            const retrieveAppointmentQuery = `
                SELECT 
                    ${patient_appointment_cols.join(", ")}
                FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.appointmentID = ?;
            `

            const [rows] = await connection.query(retrieveAppointmentQuery, [appointmentID]);
            const appointment = rows[0];

            if (!appointment) {
                throw new Error("Appointment details not found");
            }

            const query = `
                UPDATE patientsappointment
                    SET status = ?
                WHERE appointmentID = ?;
            `

            const value = [
                status,
                appointmentID
            ]

            const [result] = await connection.query(query, value);

            if (!result) {
                throw new Error("Failed to cancel booked appointment");
            }

            const commitQuery = await connection.commit(); // commit the transaction query if successful
            if (!commitQuery) {
                throw new Error("Failed to commit transaction in cancelling booked appointment");
            }

            return rows;
        } catch (error) {
            const rollbackQuery = await connection.rollback();
            if (!rollbackQuery) {
                console.error(`Error rolling back transaction in cancelling booked appointment: ${error}`);
            }

            console.error(`Error cancelling the booked appointment in model function: ${error}`);
            throw error;
        } finally {
            connection.release();
        }
    }

    // method for retrieving the clinic operating hours
    retrieveClinicOpeningHours = async (clinicID) => {
        const connection = await conn.getConnection();
        try {
            await connection.beginTransaction(); // start a transaction

            if (!clinicID || typeof clinicID !== "number") {
                throw new Error("Invalid clinic ID");
            }

            const query = `
                SELECT 
                    clinic_time,
                    clinic_close_time
                FROM clinic
                    WHERE clinic_id = ?;
            `
            const value = [clinicID];

            const [rows] = await connection.execute(query, value);

            const commitQuery = await connection.commit(); // commit the transaction query if successful
            if (!commitQuery) {
                throw new Error("Failed to commit transaction in retrieving opening hours");
            }

            return rows;
        } catch (error) {
            const rollbackQuery = await connection.rollback();
            if (!rollbackQuery) {
                console.error(`Error rolling back transaction in retrieving opening hours: ${error}`);
            }

            console.error(`Error retrieving opening hours in model function: ${error}`);
            throw error;
        } finally {
            connection.release();
        }
    }

    // method for deleting the booked appointment in clinic side
    deleteBookedAppointment = async (appointmentID) => {
        const connection = await conn.getConnection(); // retrieve the connection from the pool
        try {
            await connection.beginTransaction();

            if (!appointmentID || typeof appointmentID !== "number") {
                throw new Error("Invalid appointment id")
            }

            const query = `
                DELETE pa, c
                FROM patientsappointment AS pa
                LEFT JOIN clinic AS c
                ON pa.appointmentID = pa.clinic_id
                WHERE pa.appointmentID = ?;
            `

            const value = [
                appointmentID
            ]

            const [rows] = await connection.query(query, value)

            // commits the transaction in deleting the booked appointment
            const commitQuery = await connection.commit();
            if (!commitQuery) {
                console.error(`Failed to commit transaction in deleting booked appointment`)
            }

            return rows;
        } catch (error) {
            const rollbackQuery = await connection.rollback(); // rollback the transaction in deleting booked appointment
            if (!rollbackQuery) {
                console.error(`Error rolling back transaction in deleting the booked appointments: ${error}`)
            }

            console.error(`Error in deleting the booked appointment in model method: ${error}`)
            throw error;
        } finally {
            connection.release();
        }
    }

    // method for adding book appointment in clinic side
    insertBookedAppointment = async (bookAppointment) => {
        const connection = await conn.getConnection(); // retrieve the connection from the pool
        try {
            await connection.beginTransaction(); // starts a transaction in inserting booked appointment

            if (!bookAppointment || typeof bookAppointment !== "object") {
                throw new Error("Invalid book appointment data");
            }

            const {
                firstName,
                lastName,
                address,
                email,
                phoneNumber,
                appointmentDate,
                appointmentTime,
                gender,
                purposeOfAppointment,
                clinicID,
                clinicName,
                createdDate,
                status
            } = bookAppointment;

            const first_name = String(firstName)
            const last_name = String(lastName)
            const patient_address = String(address)
            const patient_email = String(email)
            const phone_number = String(phoneNumber)
            const appointment_date = String(appointmentDate)
            const appointment_time = String(appointmentTime)
            const sex = String(gender)
            const purpose_of_appointment = String(purposeOfAppointment)
            const clinic_id = Number(clinicID)
            const clinic_name = String(clinicName)
            const created_at = String(createdDate)
            const book_appointment_status = String(status)

            const fields = [
                "firstName",
                "lastName",
                "address",
                "email",
                "phoneNumber",
                "appointmentDate",
                "appointmentTime",
                "gender",
                "purposeOfAppointment",
                "clinic_id",
                "clinic_name",
                "created_at",
                "status"
            ]

            const values = [
                first_name,
                last_name,
                patient_address,
                patient_email,
                phone_number,
                appointment_date,
                appointment_time,
                sex,
                purpose_of_appointment,
                clinic_id,
                clinic_name,
                created_at,
                book_appointment_status
            ]

            const placeholders = fields.map(() => "?").join(", ");

            const query = `
                INSERT INTO clinic_appointments (
                    ${fields.join(", ")}
                ) VALUES (
                    ${placeholders}
                )
            `

            const [result] = await connection.query(query, values);

            const commitQuery = await connection.commit(); // commit the transaction in inserting booked appointment
            if (!commitQuery) {
                throw new Error("Failed to commit transaction in inserting booked appointment");
            }

            return result;
        } catch (error) {
            const rollbackQuery = await connection.rollback(); // rollback the transaction in inserting booked appointment
            if (!rollbackQuery) {
                console.error(`Error rolling back transaction in inserting booked appointment: ${error}`);
            }

            console.error(`Error in inserting booked appointment in model method: ${error}`);
            throw error;
        } finally {
            connection.release();
        }
    }

    // method for retrieving all clinic booked appointment
    retrieveBookedAppointmentOfClinicAppointments = async (clinicID) => {
        const connection = await conn.getConnection();
        try {
            await connection.beginTransaction(); // starts a transaction in retrieving all clinic booked appointment

            if (!clinicID || typeof clinicID !== "number") {
                throw new Error("Invalid clinic id")
            }

            const clinicId = Number(clinicID);
            if (isNaN(clinicId)) {
                throw new Error("Clinic id is not a number in method")
            }

            const fields = [
                "firstName",
                "lastName",
                "address",
                "email",
                "phoneNumber",
                "appointmentDate",
                "appointmentTime",
                "gender",
                "purposeOfAppointment",
                "clinic_id",
                "id",
                "clinic_name",
                "status"
            ]

            const value = [
                clinicId,
            ]

            const query = `
                SELECT 
                    ${fields.join(", ")}
                FROM clinic_appointments
                WHERE clinic_id = ?;
            `

            const [rows] = await connection.query(query, value);
            const commitQuery = await connection.commit(); // commits the transaction in retrieving all clinic booked appointment
            if (!commitQuery) {
                throw new Error("Failed to commit transaction in retrieving all clinic booked appointment");
            }

            return rows;
        } catch (error) {
            const rollbackQuery = await connection.rollback(); // rollback the transaction in retrieving all clinic booked appointment
            if (!rollbackQuery) {
                console.error(`Error rolling back transaction in retrieving all clinic booked appointment: ${error}`);
            }

            console.error(`Error in retrieving all clinic booked appointment in method model: ${error}`);
            throw error;
        } finally {
            connection.release(); // release the connection back to the pool
        }
    }

    // method for checking if the book appointment is already booked or awaits for approval
    isBookAppointmentIsAlreadyBookedOrAwaitingForApproval = async (appointmentDate, appointmentTime, status) => {
        const connection = await conn.getConnection();
        try {
            const fields = [
                "appointmentDate",
                "appointmentTime",
                "status"
            ]

            const statusPlaceholder = status.map(() => "?").join(", ");

            const query = `
                SELECT 
                    ${fields.join(", ")}
                FROM clinic_appointments
                WHERE 
                    appointmentDate = ?
                AND 
                    appointmentTime = ? 
                AND 
                    status IN (${statusPlaceholder})
            `;

            const value = [
                appointmentDate,
                appointmentTime,
                ...status
            ];

            const [rows] = await connection.execute(query, value);

            return rows.length > 0; // returns true if there are rows found, indicating the appointment is booked or awaiting approval
        } catch (error) {
            console.error(`Error in checking if the book appointment is already booked or awaiting for approval in method model: ${error}`);
            throw error;
        } finally {
            connection.release(); // release the connection back to the pool
        }
    }

    // method for calculating the total number of all booked appointments for a specific clinic
    calculateTotalNumberOfBookedAppointemnts = async (clinicID) => {
        const connection = await conn.getConnection();
        try {
            await connection.beginTransaction(); // starts transcation to total the sum of booked appointments

            if (!clinicID || typeof clinicID !== "number") {
                throw new Error("Invalid clinic ID");
            }

            const query = `
                SELECT COUNT(*) AS total_all_booked_appointments
                FROM (
                    SELECT appointmentID FROM patientsappointment WHERE clinic_id = ?
                    UNION ALL
                    SELECT id FROM clinic_appointments WHERE clinic_id = ?
                ) AS combined_appointments;
            `

            const values = [
                clinicID,
                clinicID
            ]

            const [rows] = await connection.query(query, values);

            await connection.commit(); // commits the transaction in calculating the total number of booked appointments

            return rows;
        } catch (error) {
            await connection.rollback(); // rollback the transaction in calculating the total number of booked appointments

            console.error(`Error in calculating the total number of booked appointments in method model: ${error}`);
            throw error;
        } finally {
            connection.release(); // release the connection back to the pool
        }
    }

    // method for calculating the total number of pending booked appoinments in specific clinic
    calculateTotalNumberOfPendingBookedAppointments = async (clinicID, bookAppointmentStatus) => {
        const connection = await conn.getConnection();
        try {
            if (!clinicID || typeof clinicID !== "number") {
                throw new Error("Invalid! clinic id must be a number");
            }

            if (!bookAppointmentStatus || typeof bookAppointmentStatus !== "string") {
                throw new Error("Invalid! book appointment status must be a string");
            }

            const query = `
                SELECT COUNT(*) AS total_pending_booked_appointments
                FROM (
                    SELECT appointmentID FROM patientsappointment
                    WHERE clinic_id = ? 
                    AND status = ?
                    UNION ALL
                    SELECT id FROM clinic_appointments
                    WHERE clinic_id = ?
                    AND 
                    status = ?
                ) AS combined_pending_appointments;
            `

            const values = [
                clinicID,
                bookAppointmentStatus,
                clinicID,
                bookAppointmentStatus
            ]

            const [rows] = await connection.query(query, values);

            return rows;
        } catch (error) {
            console.error(`Error in calculating the total number of pending booked appointments in method model: ${error}`);
            throw error;
        } finally {
            connection.release();
        }
    }

    // method for calculating the total number of approved booked appointments in specific clinic
    calculateTotalNumberOfApprovedBookedAppointments = async (clinicID, booked_appointment_status) => {
        const connection = await conn.getConnection();
        try {
            if (!clinicID || typeof clinicID !== "number") {
                throw new Error("Invalid! clinic is must me a number")
            }

            if (!booked_appointment_status || typeof booked_appointment_status !== "string") {
                throw new Error("Invalid! booked appointment status must be a string")
            }

            const query = `
                SELECT COUNT (*) AS total_approved_booked_appointments
                FROM (
                    SELECT appointmentID FROM patientsappointment
                    WHERE clinic_id = ?
                    AND status = ?
                    UNION ALL
                    SELECT id FROM clinic_appointments
                    WHERE clinic_id = ?
                    AND
                    status = ?
                ) AS combined_approved_appointments;
            `

            const values = [
                clinicID,
                booked_appointment_status,
                clinicID,
                booked_appointment_status
            ]

            const [rows] = await connection.execute(query, values)

            return rows;
        } catch (methodError) {
            console.error(`Error in calculating the total number of approved booked appointment in method model: ${methodError}`)
            throw methodError;
        } finally {
            connection.release();
        }
    }

    // method for calculating the total number of declined booked appointmets in specific clinic
    calculateTotalNumberOfDeclinedBookedAppointments = async (clinicID, booked_appointment_status) => {
        this.connection = await this.conn.getConnection();
        try {
            if (!clinicID || typeof clinicID !== "number") {
                throw new Error("Invalid! clinic id must be a number");
            }

            if (!booked_appointment_status || typeof booked_appointment_status !== "string") {
                throw new Error("Invalid! booked appointment status must be a string");
            }

            const query = `
                SELECT COUNT(*) AS total_declined_booked_appointments
                FROM (
                    SELECT appointmentID FROM patientsappointment
                    WHERE clinic_id = ?
                    AND status = ?
                    UNION ALL
                    SELECT id FROM clinic_appointments
                    WHERE clinic_id = ?
                    AND status = ?
                ) AS combined_declined_appointments;
            `

            const values = [
                clinicID,
                booked_appointment_status,
                clinicID,
                booked_appointment_status
            ]

            const [rows] = await this.connection.query(query, values);
            return rows;
        } catch (error) {
            logger.error(`Error in calculating the total number of declined booked appointment in method model: ${error}`);
            throw error;
        } finally {
            this.connection.release();
        }
    }

    // methood for retrieving the clinic pending booked appointments of specific clinic 
    retrieveClinicPendingBookedAppointments = async (clinicID, booked_appointment_status) => {
        this.connection = await this.conn.getConnection();
        try {
            if (!clinicID || typeof clinicID !== "number") {
                throw new Error("Invalid! clinic id must be a number");
            }

            if (!booked_appointment_status || typeof booked_appointment_status !== "string") {
                throw new Error("Invalid! booked appointment status must be a string");
            }

            const fields = [
                "firstName",
                "lastName",
                "address",
                "email",
                "phoneNumber",
                "appointmentDate",
                "clinic_id",
                "gender",
                "id",
                "purposeOfAppointment",
                "appointmentTime",
                "clinic_name",
                "status"
            ]

            const query = `
                SELECT 
                    ${fields.join(", ")}
                FROM clinic_appointments
                WHERE clinic_id = ?
                AND status = ?;
            `

            const values = [
                clinicID,
                booked_appointment_status
            ]

            const [rows] = await this.connection.query(query, values);

            return rows;
        } catch (error) {
            logger.log("error", `Error in retrieving the clinic pending booked appointments in method model: ${error}`);
            throw error;
        } finally {
            this.connection.release();
        }
    }

    // method for creating admin account in admin side
    createAdminAccount = async (admin_data) => {
        this.connection = await this.conn.getConnection();
        try {
            this.connection.beginTransaction(); // starts a transaction in creating admin account

            if (!admin_data || typeof admin_data !== "object") {
                throw new Error("Invalid admin data");
            }

            const {
                email,
                password,
                confirmPassword,
                resetToken,
                resetTokenExpiry
            } = admin_data;

            const email_address = String(email);
            const admin_password = String(password);
            const admin_confirm_password = String(confirmPassword);

            if (!email_address || !admin_password || !admin_confirm_password) {
                throw new Error("Email, password and confirm password are required to create an admin account");
            }

            const fields = [
                "email",
                "password",
                "confirmPassword",
                "resetToken",
                "resetTokenExpiry"
            ]

            const admin_password_hash = await bcrypt.hash(admin_password, 10);
            const admin_confirm_password_hash = await bcrypt.hash(admin_confirm_password, 10);

            const values = [
                email_address,
                admin_password_hash,
                admin_confirm_password_hash,
                resetToken,
                resetTokenExpiry
            ]

            const placeholders = fields.map(() => "?").join(", ");

            const query = `
                INSERT INTO cmsadmin (
                    ${fields.join(", ")}
                ) VALUES (
                    ${placeholders}
                )
            `

            if (query.match(/\?/g).length !== values.length) {
                throw new Error("Number of placeholders and values do not match in creating admin account");
            }

            const [result] = await this.connection.query(query, values);

            const commitQuery = await this.connection.commit(); // commits the transaction in creating admin account
            if (!commitQuery) {
                throw new Error("Failed to commit transaction in creating admin account");
            }

            return result;
        } catch (error) {
            const rollbackQuery = await this.connection.rollback(); // rollback the transaction in creating admin account
            if (!rollbackQuery) {
                logger.log("error", `Error rolling back transaction in creating admin account: ${error}`);
            }

            logger.error(`Error in creating admin account in method model: ${error}`);
            throw error;
        } finally {
            this.connection.release();
        }
    }

    /**
     * @method for calculating the total number of registered clinics in admin side
     */

    calculateTotalNumberOfRegisteredClinics = async () => {
        this.connection = await this.conn.getConnection();
        try {
            const query = `
                SELECT COUNT(clinic_id) AS total_number_of_clinics
                FROM clinic;
            `

            const [rows] = await this.connection.query(query);

            return rows;
        } catch (error) {
            logger.error(`Error in calculating the total number of registered clinics in method model: ${error}`);
            throw error;
        } finally {
            this.connection.release();
        }
    }

    /**
     * @method for calculating the number of registered patients accounts in admin side
     */

    calculateRegisteredPatientsAccounts = async () => {
        this.connection = await this.conn.getConnection();
        try {
            const query = `
                SELECT COUNT(patientID) AS total_number_of_patients
                FROM patientsregisteraccount1;
            `

            const [rows] = await this.connection.query(query);

            return rows;
        } catch (error) {
            logger.error(`Error in calculating the number of registered patients accounts in method model: ${error}`);
            throw error;
        } finally {
            this.connection.release();
        }
    }

    /**
     * @method for calculating the number of admin accounts in admin side
     */

    calculateNumberOfAdminAccounts = async () => {
        this.connection = await this.conn.getConnection();
        try {
            const query = `
                SELECT COUNT(adminID) AS total_number_of_admin_accounts
                FROM cmsadmin;
            `

            const [rows] = await this.connection.query(query);

            return rows;
        } catch (error) {
            logger.error(`Error in calculating the number of admin accounts in method model: ${error}`);
            throw error;
        } finally {
            this.connection.release();
        }
    }

    /**
     * @method for calculating the number of consulted patients in specific clinic side
     */

    calculateConsultedPatients = async (clinicID, bookedAppointmentStatus) => {
        this.connection = await this.conn.getConnection();
        try {
            if (!clinicID || typeof clinicID !== "number") {
                throw new Error("Invalid! clinic id must be a number");
            }

            if (!bookedAppointmentStatus || typeof bookedAppointmentStatus !== "string") {
                throw new Error("Invalid! booked appointment status must be a string");
            }

            this.connection.beginTransaction();

            const query = `
                SELECT COUNT(*) AS total_consulted_patients 
                FROM (
                    SELECT appointmentID FROM patientsappointment 
                    WHERE clinic_id = ?
                    AND status = ?
                    UNION ALL
                    SELECT id FROM clinic_appointments
                    WHERE clinic_id = ?
                    AND
                    status = ?
                ) AS combined_consulted_patients;
            `

            const values = [
                clinicID,
                bookedAppointmentStatus,
                clinicID,
                bookedAppointmentStatus
            ]

            const [rows] = await this.connection.query(query, values);

            const commitQuery = await this.connection.commit(); // commit the transaction in calculating consulted patients
            if (!commitQuery) {
                throw new Error("Failed to commit transaction in calculating consulted patients");
            }

            return rows;
        } catch (error) {
            const rollbackQuery = this.connection.rollback();
            if (!rollbackQuery) {
                logger.log("error", `Error rolling back transaction in calculating consulted patients: ${error}`);
            }

            logger.error(`Error in calculating the number of consulted patients in method model: ${error}`);
            throw error;
        } finally {
            this.connection.release();
        }
    }

    /**
     * method for calculating the cancelled booked appointments in specific clinic side
     */

    calculateCancelledBookedAppointments = async (clinicID, bookedAppointmentStatus) => {
        this.connection = await this.conn.getConnection();
        try {
            if (!clinicID || typeof clinicID !== "number") {
                throw new Error("Invalid! Clinic ID must be a number");
            }

            if (!bookedAppointmentStatus || typeof bookedAppointmentStatus !== "string") {
                throw new Error("Invalid! Booked appointment status must be a string");
            }

            this.connection.beginTransaction();

            const query = `
                SELECT COUNT(*) AS total_cancelled_booked_appointments
                FROM (
                    SELECT appointmentID FROM patientsappointment 
                    WHERE clinic_id = ?
                    AND status = ?
                    UNION ALL
                    SELECT id FROM clinic_appointments
                    WHERE clinic_id = ?
                    AND
                    status = ?
                ) AS combined_cancelled_booked_appointments;
            `

            const values = [
                clinicID,
                bookedAppointmentStatus,
                clinicID,
                bookedAppointmentStatus
            ]

            const [rows] = await this.connection.query(query, values);

            const commitQuery = await this.connection.commit(); // commit the transaction in calculating cancelled booked appointments
            if (!commitQuery) {
                throw new Error("Failed to commit transaction in calculating cancelled booked appointments");
            }

            return rows;
        } catch (error) {
            const rollbackQuery = this.connection.rollback();
            if (!rollbackQuery) {
                logger.log("error", `Error rolling back transaction in calculating cancelled booked appointments: ${error}`);
            }

            logger.error(`Error in calculating the number of cancelled booked appointments in method model: ${error}`);
            throw error;
        } finally {
            this.connection.release();
        }
    }

    /**
     * @method for calculating the number of total booked appointments of specific patient account
     */
    calculateAllBookedAppointmentsOfPatient = async (patientEmail) => {
        this.connection = await this.conn.getConnection();
        try {
            if (!patientEmail || typeof patientEmail !== "string") {
                throw new Error("Invalid! Patient email must be a string");
            }

            this.connection.beginTransaction();

            const query = `
                SELECT COUNT(*) AS all_booked_appointments FROM (
                    SELECT appointmentID 
                    FROM patientsappointment
                    WHERE email = ? 
                ) AS combined_all_booked_appointments;
            `

            const value = [
                patientEmail
            ]

            const [rows] = await this.connection.query(query, value);

            const commitQuery = this.connection.commit();
            if (!commitQuery) {
                throw new Error("Failed to commit transaction in calculating all booked appointments of patient");
            }

            return rows;
        } catch (error) {
            logger.error(`Error in calculating the number of total booked appointments of specific patient account in method model: ${error}`);
            throw error;
        } finally {
            this.connection.release();
        }
    }

    /**
     * @method for calculating the pending booked appointment of specifc patient account
     */

    calculatePendingBookedAppointmentOfPatient = async (patientEmail, bookedAppointmentStatus) => {
        this.connection = await this.conn.getConnection();
        try {
            if (!patientEmail || typeof patientEmail !== "string") {
                throw new Error("Invalid! Patient email must be a string");
            }

            if (!bookedAppointmentStatus || typeof bookedAppointmentStatus !== "string") {
                throw new Error("Invalid! Booked appointment status must be a string")
            }

            this.connection.beginTransaction();

            const query = `
                SELECT COUNT(*) AS pending_booked_appointment
                FROM (
                    SELECT appointmentID FROM patientsappointment
                    WHERE email = ?
                    AND
                    status = ?
                ) AS combined_pending_booked_appointment;
            `

            const values = [
                patientEmail,
                bookedAppointmentStatus
            ]

            const [rows] = await this.connection.query(query, values);

            const commitQuery = this.connection.commit();
            if (!commitQuery) {
                throw new Error("Failed to commit transaction in calculating pending booked appointment of patient");
            }

            return rows;
        } catch (error) {
            const rollbackQuery = this.connection.rollback();
            if (!rollbackQuery) {
                logger.log("error", `Error rolling back transaction in calculating pending booked appointment of patient: ${error}`);
            }

            logger.error(`Error in calculating the number of pending booked appointments of specific patient account in method model: ${error}`);
            throw error;
        } finally {
            this.connection.release();
        }
    }

    /**
     * @method for calculating the approved booked appointment of specific patient account
     * @param of specific patient account email
     * @param of booked appointment status
     */

    calculateApprovedBookedAppointmentOfPatientAccount = async (patientEmail, bookedAppointmentStatus) => {
        this.connection = await this.conn.getConnection();
        try {
            if (!patientEmail || typeof patientEmail !== "string") {
                throw new Error("Invalid! Patient email must be a string");
            }

            if (!bookedAppointmentStatus || typeof bookedAppointmentStatus !== "string") {
                throw new Error("Invalid! Booked appointment status must be a string");
            }

            this.connection.beginTransaction();

            const query = `
                SELECT COUNT(*) AS approved_booked_appointment
                FROM (
                    SELECT appointmentID FROM patientsappointment
                    WHERE email = ?
                    AND
                    status = ?
                ) AS combined_approved_booked_appointment;
            `

            const values = [
                patientEmail,
                bookedAppointmentStatus
            ]

            const [rows] = await this.connection.query(query, values);

            const commitQuery = this.connection.commit();
            if (!commitQuery) {
                throw new Error("Failed to commit transaction in calculating approved booked appointment of patient");
            }

            return rows;
        } catch (error) {
            const rollbackQuery = this.connection.rollback();
            if (!rollbackQuery) {
                logger.log("error", `Error rollling back transaction in calculating the approved booked appointment of patient: ${error}`);
            }

            logger.log("error", `Error in calculating the number of approved booked appointments of specific patient account in method model: ${error}`);
            throw error;
        } finally {
            this.connection.release();
        }
    }

    /**
     * @method for calculating the consulted booked appointment of specific patient account
     * @param of specific patient account email
     * @param of booked appointment status
     */

    calculateConsultedBookedAppointmentOfPatientAccount = async (patientEmail, bookedAppointmentStatus) => {
        this.connection = await this.conn.getConnection();
        try {
            if (!patientEmail || typeof patientEmail !== "string") {
                throw new Error("Invalid! Patient email must be a string");
            }

            if (!bookedAppointmentStatus || typeof bookedAppointmentStatus !== "string") {
                throw new Error("Invalid! Booked appointment status must be a string");
            }

            this.connection.beginTransaction();

            const fieldsQuery = [
                "COUNT(*) AS consulted_booked_appointment"
            ]

            const query = `
                SELECT ${fieldsQuery}
                FROM (
                    SELECT appointmentID
                    FROM patientsappointment
                    WHERE email = ?
                    AND
                    status = ?
                ) AS combined_consulted_booked_appointment;
            `

            const values = [
                patientEmail,
                bookedAppointmentStatus
            ]

            const [rows] = await this.connection.query(query, values);

            const commitQuery = this.connection.commit();
            if (!commitQuery) {
                throw new Error("Failed to commit transaction in calculating the number of consulted booked appointments of specific patient account");
            }

            return rows;
        } catch (error) {
            const rollbackQuery = await this.connection.rollback();
            if (!rollbackQuery) {
                logger.log("error", `Error rolling back transaction in calculating the number of consulted booked appointments of specific patient account: ${error}`);
            }

            logger.log("error", `Error in calculating the number of consulted booked appointments of specific patient account in method model: ${error}`);
            throw error;
        } finally {
            this.connection.release();
        }
    }

    /**
     * @method for calculating the cancelled booked appointment chose by specific patient account 
     * @param of specific patient email account
     * @param of booked appointmnet status
     */

    calculateCancelledBookedAppointmentOfPatientAccount = async (patientEmail, bookedAppointmentStatus) => {
        this.connection = await this.conn.getConnection();
        try {
            if (!patientEmail || typeof patientEmail !== "string") {
                throw new Error("Invalid! Patient email must be a string");
            }

            if (!bookedAppointmentStatus || typeof bookedAppointmentStatus !== "string") {
                throw new Error("Invalid! Booked appointment status must be a string");
            }

            this.connection.beginTransaction();

            const fieldsQuery = [
                "COUNT(*) AS cancelled_booked_appointment"
            ]

            const wrapQuery = [
                `SELECT appointmentID
                FROM patientsappointment
                WHERE email = ?
                AND
                status = ?
                `
            ];

            const query = `
                SELECT ${fieldsQuery} 
                FROM (
                    ${wrapQuery}
                ) AS combined_cancelled_booked_appointment;
            `

            const values = [
                patientEmail,
                bookedAppointmentStatus
            ]

            const [rows] = await this.connection.query(query, values);

            const commitQuery = await this.connection.commit();
            if (!commitQuery) {
                throw new Error("Failed to commit transaction in calculating the number of cancelled booked appointments of specific patient account");
            }

            return rows;
        } catch (error) {
            const rollbackQuery = await this.connection.rollback();
            if (!rollbackQuery) {
                logger.log("error", `Error rolling back transaction in calculating the number of cancelled booked appointments of specific patient account: ${error}`);
            }

            logger.log("error", `Error in calculating the number of cancelled booked appointments of specific patient account in method model: ${error}`);
            throw error;
        } finally {
            this.connection.release();
        }
    }

    /**
     * @method for calculating the declined booked appointment of specific patient account
     * @param of specific patient email account
     * @param of booked appointment status
     */

    calculateDeclinedBookedAppointmentOfPatientAccount = async (patientEmail, bookedAppointmentStatus) => {
        this.connection = await this.conn.getConnection();
        try {
            if (!patientEmail || typeof patientEmail !== "string") {
                throw new Error("Invalid! Patient email must be a string");
            }

            if (!bookedAppointmentStatus || typeof bookedAppointmentStatus !== "string") {
                throw new Error("Invalid! Booked appointment status must be a string");
            }

            this.connection.beginTransaction();

            const selectFieldsQuery = [
                "COUNT(*) AS declined_booked_appointment"
            ]

            const wrapQuery = [
                `
                    SELECT appointmentID
                    FROM patientsappointment
                    WHERE email = ?
                    AND
                    status = ?
                `
            ];

            const query = `
                SELECT ${selectFieldsQuery}
                FROM (
                    ${wrapQuery}
                ) AS combined_declined_booked_appointment;
            `

            const values = [
                patientEmail,
                bookedAppointmentStatus
            ]

            const [rows] = await this.connection.query(query, values);

            const commitQuery = this.connection.commit();
            if (!commitQuery) {
                throw new Error("Failed to commit transaction in calculating the number of declined booked appointments of specific patient account");
            }

            return rows;
        } catch (error) {
            const rollbackQuery = this.connection.rollback();
            if (!rollbackQuery) {
                logger.log("error", `Error rolling back transaction in calculating the number of declined booked appointments of specific patient account: ${error}`);
            }

            logger.log("error", `Error in calculating the number of declined booked appointments of specific patient account in method model: ${error}`);
            throw error;
        } finally {
            this.connection.release();
        }
    }

    /**
     * @method model to retrieve the approved booked appointment to render in clinic side table
     */
    retrieveClinicByIdApprovedBookedAppointments = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                let { clinicID, bookedAppointmentStatus } = params;

                if (params && typeof params === "object" && !Array.isArray(params)) {
                    /**
                     * if params is an object extract the passed params
                     */
                    clinicID = params.clinicID;
                    bookedAppointmentStatus = params.bookedAppointmentStatus;
                } else {
                    /**
                     * if params is array or passed as direct values 
                     */
                    clinicID = params;
                    bookedAppointmentStatus = "Approved";
                }

                clinicID = Number(clinicID);

                if (!clinicID || isNaN(clinicID)) {
                    throw new Error("Invalid! Clinic ID must be a number")
                }

                if (!bookedAppointmentStatus || typeof bookedAppointmentStatus !== "string") {
                    throw new Error("Invalid! Booked Appointment Status must be a string");
                }

                await this.connection.beginTransaction();

                const fields = [
                    "firstName",
                    "lastName",
                    "address",
                    "id",
                    "email",
                    "phoneNumber",
                    "appointmentDate",
                    "appointmentTime",
                    "gender",
                    "purposeOfAppointment",
                    "clinic_name",
                    "status"
                ]

                const query = `
                    SELECT 
                        ${fields.join(", ")}
                    FROM clinic_appointments
                    WHERE clinic_id = ? 
                    AND 
                    status = ?;
                `

                const values = [
                    clinicID,
                    bookedAppointmentStatus
                ]

                const [rows] = await this.connection.query(query, values);

                const commitQuery = await this.connection.commit();
                if (!commitQuery) {
                    throw new Error("Failed to commit transaction in retrieving the approved booked appointment in clinic side")
                }

                return rows;
            } catch (error) {
                if (this.connection) {
                    const rollbackQuery = await this.connection.rollback();
                    if (!rollbackQuery) {
                        logger.log("error", `Failed to rollback the transaction in retrieving approved booked appointment in clinic side table`)
                    }
                }

                logger.log("error", `Failed to retrieved approved booked appointment in clinic side table in method: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Retrieve Approved Appointment in Clinic Side Table"
    )

    /**
     * @method model to retrieve the declined booked appointment to render in clinic side table
     */
    retrieveClinicByIdDeclinedBookedAppointments = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                let { clinicID, bookedAppointmentStatus } = params;

                if (params && typeof params === "object" && !Array.isArray(params)) {
                    /**
                     * if the passed argument is object its extract the values of params
                     */
                    clinicID = params.clinicID;
                    bookedAppointmentStatus = params.bookedAppointmentStatus;
                } else {
                    /**
                     * if the passed argument is array or passed as direct values 
                     */

                    clinicID = params;
                    bookedAppointmentStatus = "Declined";
                }

                if (!clinicID || isNaN(clinicID)) {
                    throw new Error("Invalid! Clinic ID must be a number")
                }

                if (!bookedAppointmentStatus || typeof bookedAppointmentStatus !== "string") {
                    throw new Error("Invalid! Booked Appointment Status must be a string")
                }

                await this.connection.beginTransaction();

                const fields = [
                    "firstName",
                    "lastName",
                    "address",
                    "id",
                    "email",
                    "phoneNumber",
                    "appointmentDate",
                    "appointmentTime",
                    "gender",
                    "purposeOfAppointment",
                    "clinic_name",
                    "status"
                ]

                const query = `
                    SELECT ${fields.join(",")}
                    FROM clinic_appointments
                    WHERE clinic_id = ?
                    AND
                    status = ?;
                `

                const values = [
                    clinicID,
                    bookedAppointmentStatus
                ]

                const [rows] = await this.connection.query(query, values);

                const commitQuery = await this.connection.commit();
                if (!commitQuery) {
                    throw new Error("Failed to commit transaction in retrieving the declined booked appointment in clinic side")
                }

                return rows;
            } catch (error) {
                const rollbackQuery = await this.connection.rollback();
                if (!rollbackQuery) {
                    logger.log("error", `Failed to rollback the transaction in retrieving declined booked appointment in clinic side table`)
                }

                logger.log("error", `Failed to retrieved declined booked appointment in clinic side table in method: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Retrieve Declined Appointment in Clinic Side Table"
    )

    /**
     * @method model to modify the clinic booked appointment details in all appointments clinic side table
     */
    findBookedAppointmentByIdToModifyBookedAppointmentsInAllAppointments = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                let { clinic_modify_booked_appointment_details } = params;

                if (params && typeof params === "object" && !Array.isArray(params)) {
                    /**
                     * if the passed argument is object its extract the values of params
                     */
                    clinic_modify_booked_appointment_details = params.clinic_modify_booked_appointment_details;
                } else {
                    /**
                     * if the passed argument is array or passed as direct values 
                     */
                    clinic_modify_booked_appointment_details = params;
                }

                if (!clinic_modify_booked_appointment_details || typeof clinic_modify_booked_appointment_details !== "object" || Array.isArray(clinic_modify_booked_appointment_details)) {
                    throw new Error("Invalid! Clinic Modify Booked Appointment Details must be an object")
                }

                await this.connection.beginTransaction();

                const {
                    bookedAppointmentID,
                    firstName,
                    lastName,
                    address,
                    email,
                    phoneNumber,
                    appointmentDate,
                    appointmentTime,
                    gender,
                    status,
                    purposeOfAppointment
                } = clinic_modify_booked_appointment_details;

                const formattedAppointmentDate = dayjs(appointmentDate).format("YYYY-MM-DD");
                const formattedAppointmentTime = appointmentTime ? appointmentTime.slice(0, 5) : null;

                const table_name = String("clinic_appointments");
                const update_fields = [
                    "firstName = ?",
                    "lastName = ?",
                    "address = ?",
                    "email = ?",
                    "phoneNumber = ?",
                    "appointmentDate = ?",
                    "appointmentTime = ?",
                    "gender = ?",
                    "status = ?",
                    "purposeOfAppointment = ?"
                ]

                const query = `
                    UPDATE ${table_name}
                    SET ${update_fields.join(", ")}
                    WHERE id = ?;
                `

                const values = [
                    firstName,
                    lastName,
                    address,
                    email,
                    phoneNumber,
                    formattedAppointmentDate,
                    formattedAppointmentTime,
                    gender,
                    status,
                    purposeOfAppointment,
                    bookedAppointmentID
                ]

                const [result] = await this.connection.query(query, values);

                const commitQuery = await this.connection.commit();
                if (!commitQuery) {
                    throw new Error("Failed to commit transaction in modifying the clinic booked appointment details in all appointments clinic side table")
                }

                return result;
            } catch (error) {
                const rollbackQuery = await this.connection.rollback();
                if (!rollbackQuery) {
                    logger.log("error", `Failed to rollback the transaction in modifying the clinic booked appointment details in all appointments clinic side table`)
                }

                logger.log("error", `Failed to modify the clinic booked appointment details in all appointments clinic side table in method: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    /**
                     * release the connection back to the pool connection
                     */
                    await this.connection.release();
                }
            }
        },
        "Modify Booked Appointment Details in All Appointments Clinic Side Table"
    )

    /**
     * @method model to delete all booked appointment details in a specific booked appointment details in clinic side table
     */
    deleteBookedAppointmentDetailsInClinicSideTable = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                let { bookedAppointmentID } = params;

                if (params && typeof params === "object" && !Array.isArray(params)) {
                    /**
                     * if the passed argument is object its extract the values of params
                     */
                    bookedAppointmentID = params.bookedAppointmentID;
                } else {
                    /**
                     * if the passed argument is array or passed as direct values 
                     */
                    bookedAppointmentID = params;
                }

                /**
                 * check if the booked appointment is a valid number
                 */
                if (!bookedAppointmentID || typeof bookedAppointmentID !== "number") {
                    throw new Error("Invalid! Booked appointment ID must be a number")
                }

                await this.connection.beginTransaction();

                const table_name = String("clinic_appointments");
                const delete_fields = [
                    "id = ?"
                ]

                const delete_values = [
                    bookedAppointmentID
                ]

                const delete_query = `
                    DELETE FROM ${table_name}
                    WHERE ${delete_fields};
                `

                const [rows] = await this.connection.query(delete_query, delete_values);

                const commitQuery = await this.connection.commit();
                if (!commitQuery) {
                    throw new Error("Failed to commit transaction in deleting the clinic booked appointment details in all appointments clinic side table")
                }

                return rows;
            } catch (error) {
                const rollbackQuery = await this.connection.rollback();
                if (!rollbackQuery) {
                    logger.log("error", `Failed to rollback the transaction in deleting the clinic booked appointment details in all appointments clinic side table`)
                }

                logger.log("error", `Failed to delete the clinic booked appointment details in all appointments clinic side table in method: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    /**
                     * release the connection back to the pool connection
                     */
                    await this.connection.release();
                }
            }
        },
        "Delete Booked Appointment Details in specific booked appointment in all appointments clinic side table"
    )

    /**
     * method model to send a reset email to the patient and clinic side
     */
    sendResetEmail = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                let { email, userType } = params;

                if (params && typeof params === "object" && !Array.isArray(params)) {
                    /**
                     * if the passed argument is object its extract the values of params
                     */
                    email = params.email;
                    userType = params.userType;
                } else {
                    /**
                     * if the passed argument is array or passed as direct values 
                     */
                    throw new Error("Invalid! Email Address and User type must be a string")
                }

                if (!email || typeof email !== "string") {
                    throw new Error("Invalid! Email must be a string")
                }

                if (!userType || typeof userType !== "string") {
                    throw new Error("Invalid! User type must be a string")
                }

                await this.connection.beginTransaction();

                let query, table, idField;

                if (userType === "clinic") {
                    query = `
                        SELECT clinic_id AS id, email, clinic_name AS name
                        FROM clinic 
                        WHERE email = ?;
                    `

                    table = "clinic";
                    idField = "clinic_id";
                } else if (userType === "patient") {
                    query = `
                        SELECT patientID AS id, email, CONCAT(firstName, ' ', lastName) AS name 
                        FROM patientsregisteraccount1
                        WHERE email = ?;
                    `
                    table = "patientsregisteraccount1";
                    idField = "patientID";
                } else if (userType === "admin") {
                    query = `
                        SELECT adminID AS id, email
                        FROM cmsadmin
                        WHERE email = ?;
                    `

                    table = "cmsadmin";
                    idField = "adminID"
                } else {
                    throw new Error("Invalid! User type must be 'clinic', 'admin' or 'patient'")
                }

                const value = [
                    email
                ]

                const [rows] = await this.connection.query(query, value);

                if (!rows || rows.length === 0) {
                    throw new Error("No existing email address found in our records")
                }

                const users = rows[0];
                if (!users || !users.id) {
                    throw new Error("No existing email address found in our records")
                }

                const resetToken = crypto.randomBytes(32).toString("hex");
                const resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10mins

                const resetTokenHashed = crypto
                    .createHash("sha256")
                    .update(resetToken)
                    .digest("hex")

                const updateQuery = `
                    UPDATE ${table}
                    SET resetToken = ?, resetTokenExpiry = ?
                    WHERE ${idField} = ?;
                `

                const updateValue = [
                    resetTokenHashed,
                    new Date(resetTokenExpiry),
                    users.id
                ]

                await this.connection.query(updateQuery, updateValue);

                const commitQuery = await this.connection.commit();

                if (!commitQuery) {
                    throw new Error("Failed to commit transaction in sending the reset email to the patient and clinic side")
                }

                return {
                    success: true,
                    data: {
                        id: users.id,
                        name: users.name,
                        resetToken: resetToken,
                        resetTokenExpiry: resetTokenExpiry
                    }
                }
            } catch (error) {
                const rollbackQuery = await this.connection.rollback();
                if (!rollbackQuery) {
                    logger.log("error", `Failed to rollback the transaction in sending the reset email to the patient and clinic side`)
                }

                logger.log("error", `Failed to send the reset email to the patient and clinic side in method: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    /**
                     * release the connection back to the pool connection
                     */
                    await this.connection.release();
                }
            }
        },
        "Send Reset Email to the patient, admin  and clinic side"
    )

    /**
     * @method model logic to reset password either clinic or patient side
     */
    resetPassword = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                await this.connection.beginTransaction();
                let { token, newPassword, confirmPassword, userType } = params;

                if (params && typeof params === "object" && !Array.isArray(params)) {
                    params = params;
                } else {
                    throw new Error("Invalid! Parameters must be an object")
                }

                if (!token || !newPassword || !confirmPassword || !userType) {
                    throw new Error("Invalid! Token, user type, new password and confirm password are required")
                }

                if (!["clinic", "patient", "admin"].includes(userType)) {
                    throw new Error("Invalid! User type either 'admin', 'patient' or 'clinic''")
                }

                const resetTokenHashed = crypto
                    .createHash("sha256")
                    .update(token)
                    .digest("hex")

                let query, table, idField;

                if (userType === "clinic") {
                    query = `
                        SELECT resetToken, resetTokenExpiry, clinic_id
                        FROM clinic
                        WHERE resetToken = ? AND resetTokenExpiry > NOW();
                    `

                    table = "clinic";
                    idField = "clinic_id";
                } else if (userType === "admin") {
                    query = `
                        SELECT resetToken, resetTokenExpiry, adminID
                        FROM cmsadmin
                        WHERE resetToken = ? AND resetTokenExpiry > NOW();
                    `

                    table = "cmsadmin";
                    idField = "adminID";
                } else {
                    query = `
                        SELECT p1.resetToken, p1.resetTokenExpiry, p1.patientID
                        FROM patientsregisteraccount1 AS p1
                        WHERE p1.resetToken = ? AND p1.resetTokenExpiry > NOW();
                    `

                    table = "patientsregisteraccount1";
                    idField = "patientID";
                }

                const value = [
                    resetTokenHashed
                ]

                const [rows] = await this.connection.query(query, value);
                if (!rows || rows.length === 0) {
                    let checkTokenQuery = userType === "clinic" ?
                        `SELECT resetToken FROM clinic WHERE resetToken = ?` :
                        userType === "admin" ?
                            `SELECT resetToken FROM cmsadmin WHERE resetToken = ?` :
                            `SELECT p1.resetToken FROM patientsregisteraccount1 AS p1 WHERE p1.resetToken = ?`;

                    const [checkTokenRows] = await this.connection.query(checkTokenQuery, value);
                    if (!checkTokenRows || checkTokenRows.length === 0) {
                        throw new Error("Invalid! Token not found")
                    } else {
                        throw new Error("Invalid! Token expired")
                    }
                }

                const user = rows[0];

                if (!user) {
                    throw new Error("Invalid! User not found")
                }

                const hashedResetPassword = await bcrypt.hash(newPassword, 10);
                const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);

                let updateQuery, updateValue;
                if (userType === "clinic") {
                    updateQuery = `
                        UPDATE clinic
                        SET 
                        password = ?,
                        confirm_password = ?,
                        resetToken = NULL,
                        resetTokenExpiry = NULL
                        WHERE clinic_id = ?;
                    `
                    updateValue = [
                        hashedResetPassword,
                        hashedConfirmPassword,
                        user.clinic_id
                    ]

                } else if (userType === "admin") {
                    updateQuery = `
                        UPDATE cmsadmin
                        SET 
                        password = ?,
                        confirmPassword = ?,
                        resetToken = NULL,
                        resetTokenExpiry = NULL
                        WHERE adminID = ?;
                    `

                    updateValue = [
                        hashedResetPassword,
                        hashedConfirmPassword,
                        user.adminID
                    ]
                } else {
                    updateQuery = `
                        UPDATE patientsregisteraccount1 AS p1
                        INNER JOIN patientsregisteraccount2 AS p2
                        ON p1.patientID = p2.patientID
                        SET 
                        p2.password = ?,
                        p2.confirmPassword = ?,
                        p1.resetToken = NULL,
                        p1.resetTokenExpiry = NULL
                        WHERE p1.patientID = ?;
                    `

                    updateValue = [
                        hashedResetPassword,
                        hashedConfirmPassword,
                        user.patientID
                    ]
                }

                await this.connection.query(updateQuery, updateValue);

                const commitQuery = await this.connection.commit();

                if (!commitQuery) {
                    throw new Error("Failed to commit transaction in resetting the password either clinic or patient side")
                }

                return {
                    message: "Password reset successfully"
                }
            } catch (error) {
                const rollbackQuery = await this.connection.rollback();
                if (!rollbackQuery) {
                    logger.log("error", `Failed to rollback the transaction in resetting the password either clinic or patient side`)
                }

                logger.log("error", `Failed to reset password either admin, clinic or patient side in method: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    /**
                     * release the connection back to the pool connection
                     */
                    await this.connection.release();
                }
            }
        },
        "Reset Password either admin, clinic or patient side"
    )

    /**
     * @method model logic to delete the pending booked appointment details in clinic side table
     */
    deletePendingBookedAppointmentDetailsByFindingId = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                await this.connection.beginTransaction();

                let { pendingBookedAppointmentId } = params;
                if (params && typeof params === "object" && !Array.isArray(params)) {
                    params = params.pendingBookedAppointmentId;
                } else {
                    throw new Error("Invalid! Parameters must be an object")
                }

                if (!pendingBookedAppointmentId || isNaN(pendingBookedAppointmentId)) {
                    throw new Error("Invalid! Pending booked appointment ID is required")
                }

                const table_name = String("clinic_appointments");

                const delete_id_field = [
                    "id = ?"
                ]

                const delete_id_value = [
                    pendingBookedAppointmentId
                ]

                const delete_query = `
                    DELETE FROM ${table_name}
                    WHERE ${delete_id_field}
                `

                const [rows] = await this.connection.query(delete_query, delete_id_value);

                if (!rows || rows.length === 0) {
                    throw new Error("Invalid! Pending booked appointment ID not found")
                }

                const commitQuery = await this.connection.commit();

                if (!commitQuery) {
                    throw new Error("Failed to commit transaction in deleting the pending booked appointment details in clinic side table")
                }

                return rows;
            } catch (error) {
                /**
                 * @description rollback the transaction in deleting the pending booked appointment details in clinic side table
                 */
                const rollbackQuery = await this.connection.rollback();

                if (!rollbackQuery) {
                    logger.log("error", `Failed to rollback the transaction in deleting the pending booked appointment details in clinic side table`)
                }

                logger.log("error", `Failed to delete the pending booked appointment details in clinic side table in method: ${error}`);
                throw error;
            } finally {
                /**
                 * check the connection in this conditon if true then release the connection back to the pool connection
                 */
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Delete Pending Booked Appointment Details By Finding Id"
    )

    /**
     * @method for checking the clinic operating hours in clinic book appointment 
     */
    checkClinicOperatingHours = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                await this.connection.beginTransaction();

                let { appointmentTime, appointmentDate, clinicID } = params;

                if (!appointmentTime || !appointmentDate || !clinicID) {
                    throw new Error("Invalid! Appointment time, appointment date are required")
                }

                if (params && typeof params === "object" && !Array.isArray(params)) {
                    params = params.appointmentTime;
                    params = params.appointmentDate;
                } else {
                    throw new Error("Invalid! Parameters must be an object")
                }

                const dayOfWeek = dayjs(appointmentDate).day();
                const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek];

                const clinic_field = [
                    "clinic_time",
                    "clinic_close_time"
                ]

                const query = `
                    SELECT ${clinic_field.join(", ")}
                    FROM clinic
                    WHERE clinic_id = ?;
                `

                const value = [
                    clinicID
                ]

                const [rows] = await this.connection.query(query, value);

                if (!rows || !rows.length) {
                    throw new Error("Invalid! Clinic ID not found")
                }

                const commitQuery = await this.connection.commit();
                if (!commitQuery) {
                    throw new Error("Failed to commit the transaction in checking the clinic operating hours")
                }

                const { clinic_time: openingTime, clinic_close_time: closingTime } = rows[0];

                /**
                 * @function to parse the time 
                 */
                const parseTime = (timeStr) => {
                    const [hours, minutes] = timeStr.split(":").map(Number);
                    return { hours, minutes };
                }

                const openingTimeObj = parseTime(openingTime);
                const closingTimeObj = parseTime(closingTime);

                const appointment = dayjs(appointmentTime, "HH:mm");
                const appointmentMinutes = appointment.hour() * 60 + appointment.minute();

                const openingMinutes = openingTimeObj.hours * 60 + openingTimeObj.minutes;
                const closingMinutes = closingTimeObj.hours * 60 + closingTimeObj.minutes;

                const isWithInOperatingHours = appointmentMinutes >= openingMinutes && appointmentMinutes <= closingMinutes;

                if (!isWithInOperatingHours) {
                    /**
                     * @function to format the time to 12-hour format
                     */
                    const formatTimeTo12Hour = (hours, minutes) => {
                        const period = hours >= 12 ? 'PM' : 'AM';
                        const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
                        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
                    };

                    /**
                     * @function to format the appointment time to 12-hour format
                     */
                    const formatAppointmentTime = (appointment) => {
                        return formatTimeTo12Hour(appointment.hour(), appointment.minute());
                    };

                    const formattedOpeningTime = formatTimeTo12Hour(openingTimeObj.hours, openingTimeObj.minutes);
                    const formattedClosingTime = formatTimeTo12Hour(closingTimeObj.hours, closingTimeObj.minutes);
                    const formattedAppointmentTime = formatAppointmentTime(appointmentTime);

                    throw new Error(`Appointment time ${formattedAppointmentTime} on  ${dayName} is outside the clinic's operating hours ` + `(${formattedOpeningTime} - ${formattedClosingTime})`);
                }

                return {
                    message: isWithInOperatingHours
                }

            } catch (error) {
                const rollbackQuery = await this.connection.rollback();
                if (!rollbackQuery) {
                    throw new Error(`Failed to rollback the transaction in checking the clinic operating hours`)
                }

                logger.log("error", `Failed to check the clinic operating hours in clinic book appointment in method: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Check Clinic Operating Hours"
    )

    /**
     * @method logic to consult a patient in clinic side appointment with consultation questionnaires
     */
    consultPatientInClinicSideAppointment = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                await this.connection.beginTransaction();

                if (params && typeof params === "object" && !Array.isArray(params)) {
                    params = params;
                } else {
                    throw new Error("Invalid! Parameters must be an object")
                }

                const {
                    firstName,
                    lastName,
                    emailAddress,
                    phoneNumber,
                    appointmentDate,
                    appointmentTime,
                    allergiesDetails,
                    takingPrescriptionMedicationDetails,
                    chronicConditionDetails,
                    surgeriesDetails,
                    jawPainDetails,
                    experiencedExcessiveBleedingDetails,
                    heartProblemsDetails,
                    advisedTakingAntibioticsDetails,
                    smokeDetails,
                    consumeSugaryFoodOrDrinksDetails,
                    dentalFlossDetails,
                    consumeAlcoholDetails,
                    participateInSportsDetails,
                    balancedDietDetails,
                    regularExerciseDetails,
                    eatingDisorderDetails,
                    experienceBleedingDetails,
                    toothSensitivityDetails,
                    dentalAppearanceDetails,
                    looseTeethDetails,
                    badBreathOrBadTasteDetails,
                    dentalXraysDetails,
                    dentalRestorationDetails,
                    orthodonticTreatmentDetails,
                    brushFrequencyDetails,
                    useMouthWashDetails,
                    replaceToothbrushDetails,
                    cleanTongueDetails,
                    regularCheckupDetails,
                    dentalAnxietyDetails,
                    dentalTraumaDetails,
                    consent,
                    adminId,
                    clinicName,
                    appointmentId
                } = params;

                const first_name = String(firstName);
                const last_name = String(lastName);
                const email_address = String(emailAddress);
                const phone_number = String(phoneNumber);
                const appointment_date = dayjs(appointmentDate).format("YYYY-MM-DD");
                let appointment_time;
                if (typeof appointmentTime === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(appointmentTime)) {
                    // If it's already in HH:mm or H:mm format, use it directly
                    appointment_time = appointmentTime.split(':').slice(0, 2).join(':'); // Ensure we only keep hours and minutes
                } else if (dayjs(appointmentTime).isValid()) {
                    // If it's a valid date object or ISO string, format it
                    appointment_time = dayjs(appointmentTime).format("HH:mm");
                } else {
                    // Default to current time if invalid
                    appointment_time = dayjs().format("HH:mm");
                }
                const allergies_details = String(allergiesDetails);
                const taking_prescription_medication_details = String(takingPrescriptionMedicationDetails);
                const chronic_condition_details = String(chronicConditionDetails);
                const surgeries_details = String(surgeriesDetails);
                const jaw_pain_details = String(jawPainDetails);
                const experienced_excessive_bleeding_details = String(experiencedExcessiveBleedingDetails);
                const heart_problems_details = String(heartProblemsDetails);
                const advised_taking_antibiotics_details = String(advisedTakingAntibioticsDetails);
                const smoke_details = String(smokeDetails);
                const consume_sugary_food_or_drinks_details = String(consumeSugaryFoodOrDrinksDetails);
                const dental_floss_details = String(dentalFlossDetails);
                const consume_alcohol_details = String(consumeAlcoholDetails);
                const participate_in_sports_details = String(participateInSportsDetails);
                const balanced_diet_details = String(balancedDietDetails);
                const regular_exercise_details = String(regularExerciseDetails);
                const eating_disorder_details = String(eatingDisorderDetails);
                const experience_bleeding_details = String(experienceBleedingDetails);
                const tooth_sensitivity_details = String(toothSensitivityDetails);
                const dental_appearance_details = String(dentalAppearanceDetails);
                const loose_teeth_details = String(looseTeethDetails);
                const bad_breath_or_bad_taste_details = String(badBreathOrBadTasteDetails);
                const dental_xrays_details = String(dentalXraysDetails);
                const dental_restoration_details = String(dentalRestorationDetails);
                const orthodontic_treatment_details = String(orthodonticTreatmentDetails);
                const brush_frequency_details = String(brushFrequencyDetails);
                const use_mouth_wash_details = String(useMouthWashDetails);
                const replace_toothbrush_details = String(replaceToothbrushDetails);
                const clean_tongue_details = String(cleanTongueDetails);
                const regular_checkup_details = String(regularCheckupDetails);
                const dental_anxiety_details = String(dentalAnxietyDetails);
                const dental_trauma_details = String(dentalTraumaDetails);
                const clinic_name_details = String(clinicName);
                const consent_details = String(consent);
                const admin_id_details = String(adminId);
                const appointment_id_details = String(appointmentId);

                const table_name = String("clinic_consulted_patients");

                const clinic_side_consulting_patients_fields = [
                    "clinic_appointment_id",
                    "first_name",
                    "last_name",
                    "email",
                    "phone_number",
                    "appointment_date",
                    "appointment_time",
                    "allergy_details",
                    "taking_prescription_medication_details",
                    "chronic_condition_details",
                    "past_surgeries_details",
                    "history_of_jaw_pain_details",
                    "experienced_excessive_bleeding_details",
                    "past_history_of_cardiovascular_issues_details",
                    "advised_taking_antibiotics_details",
                    "smoke_frequency_details",
                    "consume_sugary_foods_or_beverage_details",
                    "dental_floss_details",
                    "consume_alcohol_details",
                    "participate_in_sports_details",
                    "balanced_diet_details",
                    "regular_exercise_details",
                    "eating_disorder_details",
                    "experienced_bleeding_details",
                    "tooth_sensitivity_details",
                    "dental_appearance_details",
                    "loose_teeth_details",
                    "bad_breath_or_bad_taste_details",
                    "dental_xrays_details",
                    "dental_restoration_details",
                    "orthodontic_treatment_details",
                    "brush_frequency_details",
                    "use_mouthwash_details",
                    "replace_toothbrush_details",
                    "clean_tongue_details",
                    "regular_checkup_details",
                    "dental_anxiety_details",
                    "dental_trauma_details",
                    "clinic_name",
                    "consent",
                    "created_by"
                ]

                const clinic_consultation_placeholders = clinic_side_consulting_patients_fields.map(() => "?").join(", ");

                const consultation_values = [
                    appointment_id_details,
                    first_name,
                    last_name,
                    email_address,
                    phone_number,
                    appointment_date,
                    appointment_time,
                    allergies_details,
                    taking_prescription_medication_details,
                    chronic_condition_details,
                    surgeries_details,
                    jaw_pain_details,
                    experienced_excessive_bleeding_details,
                    heart_problems_details,
                    advised_taking_antibiotics_details,
                    smoke_details,
                    consume_sugary_food_or_drinks_details,
                    dental_floss_details,
                    consume_alcohol_details,
                    participate_in_sports_details,
                    balanced_diet_details,
                    regular_exercise_details,
                    eating_disorder_details,
                    experience_bleeding_details,
                    tooth_sensitivity_details,
                    dental_appearance_details,
                    loose_teeth_details,
                    bad_breath_or_bad_taste_details,
                    dental_xrays_details,
                    dental_restoration_details,
                    orthodontic_treatment_details,
                    brush_frequency_details,
                    use_mouth_wash_details,
                    replace_toothbrush_details,
                    clean_tongue_details,
                    regular_checkup_details,
                    dental_anxiety_details,
                    dental_trauma_details,
                    clinic_name_details,
                    consent_details,
                    admin_id_details
                ]

                const query = `
                    INSERT INTO ${table_name}
                    (${clinic_side_consulting_patients_fields.join(", ")})
                    VALUES (${clinic_consultation_placeholders})
                `
                if (query.match(/\?/g).length !== consultation_values.length) {
                    throw new Error("Invalid! Insert clinic consultation query placeholders and values do not match")
                }

                const [result] = await this.connection.query(query, consultation_values);

                if (result.affectedRows === 0) {
                    throw new Error("Failed to consult a patient in clinic side appointment with consultation questionnaires")
                }

                const clinic_appointment_table_name = String("clinic_appointments");
                const update_appointment_field = [
                    "status = ?"
                ]
                const clinic_appointment_status = String("Consulted");
                const update_clinic_appointment_values = [
                    clinic_appointment_status,
                    appointment_id_details
                ]

                const clinic_appointment_id_condition = [
                    "id = ?"
                ]

                const update_clinic_appointment_query = `
                    UPDATE ${clinic_appointment_table_name}
                    SET ${update_appointment_field}
                    WHERE ${clinic_appointment_id_condition}
                `

                if (update_clinic_appointment_query.match(/\?/g).length !== update_clinic_appointment_values.length) {
                    throw new Error("Invalid! Update clinic appointment query placeholders and values do not match")
                }

                const [update_clinic_appointment_result] = await this.connection.query(update_clinic_appointment_query, update_clinic_appointment_values);

                if (update_clinic_appointment_result.affectedRows === 0) {
                    throw new Error("Failed to update clinic appointment status")
                }

                const commitQuery = await this.connection.commit();
                if (!commitQuery) {
                    throw new Error(`Failed to commit the transaction in consulting a patient in clinic side appointment with consultation questionnaires`)
                }

                return {
                    message: "Patient consulted successfully"
                }
            } catch (error) {
                const rollbackQuery = await this.connection.rollback();
                if (!rollbackQuery) {
                    throw new Error(`Failed to rollback the transaction in consulting a patient in clinic side appointment with consultation questionnaires`)
                }
                logger.log("error", `Failed to consult a patient in clinic side appointment with consultation questionnaires in method: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Consult Patient In Clinic Side Appointment"
    )

    /**
     * @method logic to filter all patient booked appointments of a patient side to displa a specific patient booked appointment
     */
    filterAllBookedAppointments = modelErrorHandling(
        async (params) => {
            const connection = await this.conn.getConnection();
            try {
                await connection.beginTransaction();

                if (!params || typeof params !== "object" || Array.isArray(params)) {
                    throw new Error(`Invalid! Filtered all booked appointment should be an object`);
                }

                if (!params.email) {
                    throw new Error(`Invalid! Filtered all booked appointment should have an email`);
                }

                if (!params.page) {
                    throw new Error(`Invalid! Filtered all booked appointment should have a page`);
                }

                if (!params.limit) {
                    throw new Error(`Invalid! Filtered all booked appointment should have a limit`);
                }

                if (!params.search) {
                    throw new Error(`Invalid! Filtered all booked appointment should have a search`);
                }

                const offset = (params.page - 1) * params.limit;
                const queryParams = [
                    params.email
                ];
                const limit = parseInt(params.limit);
                const page = parseInt(params.page);

                let query = `
                    SELECT 
                        c.clinic_name,
                        pa.firstName,
                        pa.lastName,
                        pa.email,
                        pa.appointmentDate,
                        pa.preferredTime,
                        pa.status,
                        pa.purposeOfAppointment,
                        pa.phoneNumber
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ?
                `

                if (params.search) {
                    query += `
                        AND (
                            c.clinic_name LIKE ? OR
                            pa.firstName LIKE ? OR
                            pa.lastName LIKE ? OR
                            pa.email LIKE ? OR
                            pa.phoneNumber LIKE ? OR
                            pa.purposeOfAppointment LIKE ? OR
                            pa.status LIKE ? OR
                            pa.preferredTime LIKE ? OR
                            pa.appointmentDate LIKE ?
                        )
                    `
                    const searchTerm = `%${params.search}%`;
                    queryParams.push(
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        searchTerm
                    );
                }

                query += `ORDER BY pa.appointmentDate DESC LIMIT ? OFFSET ?`;
                queryParams.push(limit, offset);

                let countQuery = `
                    SELECT COUNT(*) AS total
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ?
                `

                const countParams = [params.email];

                if (params.search) {
                    countQuery += `
                    AND (
                            c.clinic_name LIKE ? OR
                            pa.firstName LIKE ? OR
                            pa.lastName LIKE ? OR
                            pa.email LIKE ? OR
                            pa.phoneNumber LIKE ? OR
                            pa.purposeOfAppointment LIKE ? OR
                            pa.status LIKE ? OR
                            pa.preferredTime LIKE ? OR
                            pa.appointmentDate LIKE ?
                        )
                    `
                    const searchTerm = `%${params.search}%`;
                    countParams.push(
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        searchTerm
                    );
                }

                const [rows] = await connection.query(query, queryParams);
                const [countResult] = await connection.query(countQuery, countParams);

                await connection.commit();

                const total = countResult[0]?.total || 0;
                const totalPages = Math.ceil(total / limit);

                return {
                    success: true,
                    pagination: {
                        total: total,
                        limit: limit,
                        totalPages: totalPages,
                        currentPage: page,
                        hasNextPage: page < totalPages,
                        hasPreviousPage: page > 1
                    },
                    data: rows
                }
            } catch (error) {
                const rollbackQuery = await connection.rollback();
                if (!rollbackQuery) {
                    throw new Error(`Failed to rollback the transaction in filtering all booked appointments`)
                }

                logger.log("error", `Failed to filter all booked appointments in method: ${error}`);
                throw error;
            } finally {
                if (connection) {
                    await connection.release();
                }
            }
        },
        "Filter All Booked Appointments"
    )

    /**
     * @method logic to search the pending booked appointment of a patient in patient side
     */
    searchPendingBookedAppointments = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                await this.connection.beginTransaction();

                const { search, page, limit, email } = params;

                if (!params || typeof params !== "object" || Array.isArray(params)) {
                    throw new Error(`Invalid! Search pending booked appointment should be an object`);
                }

                if (!email) {
                    throw new Error(`Invalid! Search pending booked appointment should have an email`);
                }

                if (!page) {
                    throw new Error(`Invalid! Search pending booked appointment should have a page`);
                }

                if (!limit) {
                    throw new Error(`Invalid! Search pending booked appointment should have a limit`);
                }

                if (!search) {
                    throw new Error(`Invalid! Search pending booked appointment should have a search`);
                }

                const email_address = String(email);
                const search_value = String(search);
                const page_value = parseInt(page);
                const limit_value = parseInt(limit);

                const offset = (page_value - 1) * limit_value;

                const countQuery = `
                    SELECT COUNT(*) as total
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ? AND pa.status = ?
                    AND (
                        pa.firstName LIKE ? OR
                        pa.lastName LIKE ? OR
                        pa.email LIKE ? OR
                        pa.phoneNumber LIKE ? OR
                        pa.preferredTime LIKE ? OR
                        pa.status LIKE ? OR
                        pa.appointmentDate LIKE ? OR
                        pa.purposeOfAppointment LIKE ? OR
                        c.clinic_name LIKE ?
                    )
                `

                const patient_status = String("Pending");
                const searchPattern = `%${search_value}%`;
                const countQueryValues = [
                    email_address,
                    patient_status,
                    searchPattern,
                    searchPattern,
                    searchPattern,
                    searchPattern,
                    searchPattern,
                    searchPattern,
                    searchPattern,
                    searchPattern,
                    searchPattern
                ]

                const [countResult] = await this.connection.query(countQuery, countQueryValues);
                const total = countResult[0]?.total;
                const totalPages = Math.ceil(total / limit_value);

                const searchQuery = `
                    SELECT 
                        c.clinic_name,
                        pa.firstName,
                        pa.lastName,
                        pa.email,
                        pa.appointmentDate,
                        pa.preferredTime,
                        pa.status,
                        pa.phoneNumber,
                        pa.purposeOfAppointment
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ? AND pa.status = ?
                    AND (
                        pa.firstName LIKE ? OR
                        pa.lastName LIKE ? OR
                        pa.email LIKE ? OR 
                        pa.appointmentDate LIKE ? OR
                        pa.preferredTime LIKE ? OR
                        pa.status LIKE ? OR
                        pa.phoneNumber LIKE ? OR
                        pa.purposeOfAppointment LIKE ? OR
                        c.clinic_name LIKE ?
                    )
                    ORDER BY pa.appointmentDate DESC
                    LIMIT ? OFFSET ?
                `

                const searchQueryValues = [
                    email_address,
                    patient_status,
                    searchPattern,
                    searchPattern,
                    searchPattern,
                    searchPattern,
                    searchPattern,
                    searchPattern,
                    searchPattern,
                    searchPattern,
                    searchPattern,
                    parseInt(limit_value),
                    parseInt(offset)
                ]

                const [rows] = await this.connection.query(searchQuery, searchQueryValues);

                await this.connection.commit();

                return {
                    appointments: rows,
                    pagination: {
                        total: total,
                        totalPages: totalPages,
                        currentPage: parseInt(page_value),
                        limit: parseInt(limit_value),
                        hasNextPage: page_value < totalPages,
                        hasPreviousPage: page_value > 1
                    }
                }
            } catch (error) {
                const rollbackQuery = this.connection.rollback();
                if (!rollbackQuery) {
                    throw new Error(`Failed to rollback the transaction in searching pending booked appointments`)
                }

                logger.log(`error`, `Failed in searching pending booked appointments in method: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Search Pending Booked Appointments"
    )

    /**
     * @method logic to automatically updates a status of patient to reminder/confirmation via sms and email
     */
    handleAutomatedUpdateStatus = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                if (!params || typeof params !== "object" || Array.isArray(params)) {
                    throw new Error(`Invalid! Handle automated update status should be an object`);
                }

                const { appointmentID, status } = params;

                await this.connection.beginTransaction();

                const appointment_id = parseInt(appointmentID);
                const patient_status = String(status);

                if (!appointment_id) {
                    throw new Error(`Invalid! Appointment ID should be a number`);
                }

                if (!patient_status) {
                    throw new Error(`Invalid! Patient status should be a string`);
                }

                /**
                 * @description columns of patients appointments and clinics
                 */
                const patients_appointments_and_clinics_columns = [
                    "pa.appointmentID",
                    "pa.firstName",
                    "pa.lastName",
                    "pa.email",
                    "pa.appointmentDate",
                    "pa.preferredTime",
                    "pa.phoneNumber",
                    "pa.status",
                    "pa.purposeOfAppointment",
                    "c.clinic_name",
                    "c.clinic_address"
                ]

                /**
                 * @description query to retrieve the appointment and clinic
                 */
                const retrieveAppointmentAndClinicQuery = `
                    SELECT
                    ${patients_appointments_and_clinics_columns.join(",")}
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.appointmentID = ?;
                `

                /**
                 * @description values of appointment ID
                 */
                const retrieveAppointmentAndClinicQueryValues = [
                    appointment_id
                ]

                const [rows] = await this.connection.query(
                    retrieveAppointmentAndClinicQuery,
                    retrieveAppointmentAndClinicQueryValues
                );

                if (!rows.length) {
                    throw new Error(`Failed to retrieve the appointment and clinic`);
                }

                const current_appointment = rows[0];

                const updateQuery = `
                    UPDATE patientsappointment
                    SET status = ?
                    WHERE appointmentID = ?;
                `

                const updateQueryValues = [
                    patient_status,
                    appointment_id
                ]

                const [updateRows] = await this.connection.query(updateQuery, updateQueryValues);

                if (!updateRows) {
                    throw new Error(`Failed to automate update the status of patient via email and sms`);
                }

                /**
                 * sends reminder to the patient in via email
                 */
                await this.sendStatusUpdateReminder({
                    appointmentID: appointment_id,
                    email: current_appointment.email,
                    phoneNumber: current_appointment.phoneNumber,
                    firstName: current_appointment.firstName,
                    lastName: current_appointment.lastName,
                    appointmentDate: `${current_appointment.appointmentDate}`,
                    preferredTime: `${current_appointment.preferredTime}`,
                    patientStatus: patient_status,
                    clinicName: current_appointment.clinic_name,
                })

                await this.connection.commit();

                return {
                    success: true,
                    message: `Automated update status of patient via email and sms`
                }

            } catch (error) {
                const rollbackQuery = this.connection.rollback();
                if (!rollbackQuery) {
                    throw new Error(`Failed to rollback the transaction in handling automated update status`);
                }

                logger.log(`error`, `Failed in handling automated update status via sms and email in method: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Handle Automated Update Status"
    )

    /**
     * @method logic send status update reminder to the patient via email and sms
     */
    sendStatusUpdateReminder = modelErrorHandling(
        async ({
            appointmentID,
            email,
            phoneNumber,
            firstName,
            lastName,
            appointmentDate,
            preferredTime,
            patientStatus,
            clinicName
        }) => {
            try {
                return await sendStatusUpdateReminder({
                    appointmentID,
                    email,
                    phoneNumber,
                    firstName,
                    lastName,
                    appointmentDate,
                    preferredTime,
                    patientStatus,
                    clinicName
                })
            } catch (error) {
                logger.log(`error`, `Failed to send status update reminder via email and sms: ${error}`);
                throw error;
            }
        },
        "Send Status Update Reminder"
    )
    /**
     * @method logic  to check the patient status between pending and approved for scheduled reminders
     */
    scheduleRemindersForUpcomingAppointments = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                await this.connection.beginTransaction();

                if (!params || typeof params !== "object" || Array.isArray(params)) {
                    throw new Error(`Invalid! Schedule reminders for upcoming appointments should be an object`);
                }

                const now = new Date();
                const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

                const formatDateTime = (date) => {
                    const pad = (num) => num.toString().padStart(2, '0');
                    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
                };

                const patients_appointments_col = [
                    "pa.appointmentID",
                    "pa.firstName",
                    "pa.lastName",
                    "pa.email",
                    "pa.appointmentDate",
                    "pa.reminder_sent",
                    "pa.preferredTime",
                    "pa.phoneNumber",
                    "pa.status",
                    "pa.purposeOfAppointment",
                    "c.clinic_name",
                    "c.clinic_address",
                    "c.phoneNumber"
                ]

                const status_values = [
                    "Pending",
                    "Approved"
                ]

                const status_placeholders = status_values.map(() => "?").join(",");

                const query = `
                    SELECT
                        ${patients_appointments_col.join(",")}
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE CONCAT(pa.appointmentDate, ' ', pa.preferredTime) BETWEEN ? AND ?
                    AND pa.status IN (${status_placeholders})
                    AND (pa.reminder_sent IS NULL OR pa.reminder_sent = ?)
                    ORDER BY pa.appointmentDate DESC;
                `;

                const queryValues = [
                    formatDateTime(now),
                    formatDateTime(oneHourLater),
                    ...status_values,
                    false
                ];

                const [rows] = await this.connection.query(query, queryValues);

                if (!rows || rows.length === 0) {
                    logger.log(`error`, `No upcoming appointments found in the next hour`);
                    return [];
                }

                const process_appointments = [];

                for (const appointment of rows) {
                    try {
                        const appointment_time = new Date(appointment.appointmentDate);
                        const timeUntilAppointment = appointment_time - now;

                        if (timeUntilAppointment > 0) {
                            /**
                             * schedules 1 hour reminder if not already sent
                             */
                            if (timeUntilAppointment <= 60 * 60 * 1000) {
                                await scheduleAppointmentsReminder({
                                    ...appointment,
                                    reminderTime: 60
                                });
                            }

                            /**
                             * schedules 24 hour reminder if more than 24 hours
                             */
                            if (timeUntilAppointment > 24 * 60 * 60 * 1000) {
                                await scheduleAppointmentsReminder({
                                    ...appointment,
                                    reminderTime: 24 * 60
                                })
                            }

                            const updateQuery = `
                                UPDATE patientsappointment 
                                SET reminder_sent = ?
                                WHERE appointmentID = ?;
                            `

                            const update_values = [
                                true,
                                appointment.appointmentID
                            ];

                            await this.connection.query(updateQuery, update_values);

                            process_appointments.push({
                                appointmentID: appointment.appointmentID,
                                patient: `${appointment.firstName} ${appointment.lastName}`,
                                appointmentDate: appointment.appointmentDate,
                                reminderSent: true
                            });
                        }
                    } catch (error) {
                        logger.log(`error`, `Failed in scheduling reminders for upcoming appointments in method: ${error}`);
                        continue;
                    }
                }

                await this.connection.commit();
                return process_appointments;
            } catch (error) {
                const rollback = await this.connection.rollback();
                if (!rollback) {
                    logger.log(`error`, `Failed to rollback the transaction in schedule reminders for upcoming appointments method: ${error}`);
                }
                logger.log(`error`, `Failed in scheduling reminders for upcoming appointments in method: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Schedule Reminders For Upcoming Appointments"
    )

    /**
     * @method logic to retrieve approved appointments that needs follow-up messsages
     */
    getCompletedAppointmentsForFollowUp = modelErrorHandling(
        async (options) => {
            this.connection = await this.conn.getConnection();
            try {
                await this.connection.beginTransaction();

                const { clinicID, daysAfter = 1, limit = 100 } = options;

                if (!clinicID) {
                    throw new Error(`Invalid! Clinic ID should be a number`);
                }

                const patients_appointments_col = [
                    "pa.appointmentID",
                    "pa.firstName",
                    "pa.lastName",
                    "pa.email",
                    "pa.appointmentDate",
                    "pa.preferredTime",
                    "pa.phoneNumber",
                    "pa.status",
                    "pa.purposeOfAppointment",
                    "c.clinic_name",
                    "c.email",
                    "c.phoneNumber"
                ]

                const status = String("Approved");
                const followUpSent = false;
                const query = `
                    SELECT 
                    ${patients_appointments_col.join(",")}
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.status = ? AND 
                    pa.followUpSent = ? AND
                    pa.appointmentDate <= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
                    ${clinicID ? `AND pa.clinic_id = ?` : ""}
                    ORDER BY pa.appointmentDate ASC
                    LIMIT ?
                `

                const queryValues = [
                    status,
                    followUpSent,
                    daysAfter,
                    clinicID,
                    limit
                ]

                const [rows] = await this.connection.query(query, queryValues);

                await this.connection.commit();

                if (!rows.length) {
                    throw new Error(`Failed to retrieve the completed appointments for follow-up`);
                }

                return rows;
            } catch (error) {
                const rollbackQuery = this.connection.rollback();
                if (!rollbackQuery) {
                    logger.log(`error`, `Failed to rollback the transaction in retrieving completed appointments for follow-up in method: ${error}`);
                }

                logger.log(`error`, `Failed in retrieving completed appointments for follow-up in method: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Get Approved Appointments For Follow Up"
    )

    /**
     * method logic to mark the follow-up message as sent
     */
    markFollowUpSent = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                await this.connection.beginTransaction();

                if (!params || typeof params !== "object" || Array.isArray(params)) {
                    throw new Error(`Invalid! Mark follow-up sent should be an object`);
                }

                const { appointmentID } = params;

                if (!appointmentID) {
                    throw new Error(`Invalid! Appointment ID should be a number`);
                }

                const appointment_id = parseInt(appointmentID);

                const query = `UPDATE patientsappointment SET followUpSent = ? WHERE appointmentID = ?`;

                const queryValues = [
                    true,
                    appointment_id
                ]

                const [rows] = await this.connection.query(query, queryValues);

                if (!rows.length) {
                    throw new Error(`Failed to mark the follow-up message as sent`);
                }

                await this.connection.commit();

                return rows > 0;
            } catch (error) {
                await this.connection.rollback();
                logger.log(`error`, `Failed in marking the follow-up message as sent in method: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Mark Follow Up Sent"
    )

    /**
     * @method search logic to  filter approved booked appointments specific patient information in patient side
     */
    searchApprovedBookedAppointments = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                await this.connection.beginTransaction();
                if (!params || typeof params !== "object" || Array.isArray(params)) {
                    throw new Error(`Invalid! Search approved booked appointments should be an object`);
                }

                const {
                    search,
                    limit,
                    page,
                    email
                } = params;

                const search_term = String(search);
                const limit_value = parseInt(limit);
                const page_value = parseInt(page);
                const email_address = String(email);

                if (!email_address) {
                    throw new Error(`Invalid! Email address should be a string`);
                }

                if (!search_term) {
                    throw new Error(`Invalid! Search term should be a string`);
                }

                if (!limit_value) {
                    throw new Error(`Invalid! Limit should be a number`);
                }

                if (!page_value) {
                    throw new Error(`Invalid! Page should be a number`);
                }

                const offset = (page_value - 1) * limit_value;

                /**
                 * counts all rows to for pagination
                 */
                const countQuery = `
                    SELECT COUNT(*) AS total
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ? AND pa.status = ?
                    AND (
                        pa.firstName LIKE ? OR
                        pa.lastName LIKE ? OR
                        pa.email LIKE ? OR
                        pa.phoneNumber LIKE ? OR
                        pa.appointmentDate LIKE ? OR
                        pa.preferredTime LIKE ? OR
                        pa.status LIKE ? OR
                        pa.purposeOfAppointment LIKE ? OR
                        c.clinic_name LIKE ?
                    )
                `

                const patient_status = String("Approved");
                const search_pattern = `%${search_term}%`;
                const count_query_values = [
                    email_address,
                    patient_status,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                ]

                const [countResult] = await this.connection.query(
                    countQuery,
                    count_query_values
                );

                if (!countResult.length) {
                    throw new Error(`Failed to count the approved booked appointments`);
                }
                const total = countResult[0]?.total;
                const totalPages = Math.ceil(total / limit_value);

                const searchQuery = `
                    SELECT
                        c.clinic_name,
                        pa.firstName,
                        pa.lastName,
                        pa.email,
                        pa.appointmentDate,
                        pa.preferredTime,
                        pa.status,
                        pa.phoneNumber,
                        pa.purposeOfAppointment
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ? AND pa.status = ?
                    AND (
                        c.clinic_name LIKE ? OR
                        pa.firstName LIKE ? OR
                        pa.lastName LIKE ? OR
                        pa.email LIKE ? OR
                        pa.phoneNumber LIKE ? OR
                        pa.appointmentDate LIKE ? OR
                        pa.preferredTime LIKE ? OR
                        pa.status LIKE ? OR
                        pa.purposeOfAppointment LIKE ?
                    )
                    ORDER BY pa.appointmentDate DESC, pa.preferredTime DESC
                    LIMIT ? OFFSET ?
                `;

                const search_query_values = [
                    email_address,
                    patient_status,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    parseInt(limit_value),
                    parseInt(offset)
                ]

                const [rows] = await this.connection.query(
                    searchQuery,
                    search_query_values
                );

                if (!rows || rows.length === 0) {
                    return {
                        appointments: [],
                        pagination: {
                            total: total,
                            currentPage: parseInt(page_value),
                            totalPages: totalPages,
                            limit: parseInt(limit_value),
                            hasNextPage: page_value < totalPages,
                            hasPreviousPage: page_value > 1
                        },
                        message: "No approved booked appointments found"
                    }
                }

                await this.connection.commit();

                return {
                    appointments: rows,
                    pagination: {
                        total: total,
                        totalPages: totalPages,
                        currentPage: parseInt(page_value),
                        limit: parseInt(limit_value),
                        hasNextPage: page_value < totalPages,
                        hasPreviousPage: page_value > 1
                    },
                    message: "Filtered approved booked appointments found"
                }
            } catch (error) {
                const rollbackQuery = this.connection.rollback();
                if (!rollbackQuery) {
                    throw new Error("Failed to rollback transaction in searching specific approved booked appointments")
                }

                logger.log(`error`, `Failed to filter specific particular approved booked appointment: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Search Approved Booked Appointments"
    )

    /**
     * @method logic to return all approved booked appointments if no search term provided
     */
    getAllApprovedBookedAppoinmentsByPatient = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                if (!params || typeof params !== "object" || Array.isArray(params)) {
                    throw new Error(`Invalid! Get all approved booked appointments should be an object`);
                }

                await this.connection.beginTransaction();

                const {
                    patientEmail,
                    limit = 10,
                    page = 1,
                    status
                } = params;

                const email_address = String(patientEmail);
                const page_value = parseInt(page);
                const limit_value = parseInt(limit);
                const patient_status = String(status);

                if (!email_address) {
                    throw new Error(`Invalid! Patient email should be a string`);
                } else if (!page_value) {
                    throw new Error(`Invalid! Page should have a value`);
                } else if (!limit_value) {
                    throw new Error(`Invalid! Limit should have a value`);
                } else if (!patient_status) {
                    throw new Error(`Invalid! Patient status should have a value`)
                }

                const offset = (page_value - 1) * limit_value;

                const patients_appintments_cols = [
                    "c.clinic_name",
                    "pa.firstName",
                    "pa.lastName",
                    "pa.email",
                    "pa.appointmentDate",
                    "pa.preferredTime",
                    "pa.status",
                    "pa.phoneNumber",
                    "pa.purposeOfAppointment"
                ]

                const countQuery = `
                    SELECT COUNT(*) AS total
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ?
                    AND
                    pa.status = ?
                `;

                const countValue = [
                    email_address,
                    patient_status
                ];

                const [countResults] = await this.connection.query(
                    countQuery,
                    countValue
                );

                if (!countResults) {
                    throw new Error(`Failed to retrieve total count of approved booked appointments of a patient`);
                }

                const total = countResults[0].total;
                const totalPages = Math.ceil(total / limit_value);

                const values = [
                    email_address,
                    patient_status,
                    limit_value,
                    offset
                ];

                const query = `
                    SELECT 
                        ${patients_appintments_cols.join(", ")}
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ?
                    AND
                    pa.status = ?
                    ORDER BY pa.appointmentDate DESC, pa.preferredTime DESC
                    LIMIT ? OFFSET ?
                `

                const [results] = await this.connection.query(query, values);

                if (!results.length) {
                    throw new Error(`Failed to return all approved booked appointments when no filter term provided`);
                }

                await this.connection.commit();

                return {
                    success: true,
                    appointments: results,
                    pagination: {
                        total: total,
                        totalPages: totalPages,
                        currentPage: page_value,
                        limit: limit_value,
                        hasNextPage: page_value < totalPages,
                        hasPreviousPage: page_value > 1
                    },
                    message: "Successfully returned all approved booked appointments when no filter term provided"
                };
            } catch (error) {
                const rollbackQuery = await this.connection.rollback();
                if (!rollbackQuery) {
                    logger.log(`error`, `Failed to rollback transaction in returning all approved booked appointments when no filter term provided`);
                }

                logger.log(`error`, `Failed to return all approved booked appointments when no filter term provided: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Get All Approved Booked Appointment By Patient"
    )

    /**
     * @method return all booked appointments when no search term is provided with pagination
     */
    returnAllBookedAppointments = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();

            try {
                await this.connection.beginTransaction();

                if (!params || typeof params !== "object") {
                    throw new Error(`Invalid! Return all booked appointments should be an object`);
                }

                const {
                    page = 1,
                    limit = 10,
                    email
                } = params;

                const page_value = parseInt(page);
                const limit_value = parseInt(limit);
                const email_address = String(email);

                if (isNaN(page_value) || page_value < 1) {
                    throw new Error(`Invalid page number`);
                }
                if (isNaN(limit_value) || limit_value < 1) {
                    throw new Error(`Invalid limit value`);
                }
                if (!email_address) {
                    throw new Error(`Email is required`);
                }

                const offset = (page_value - 1) * limit_value;

                const patients_appointment_cols = [
                    "c.clinic_name",
                    "pa.firstName",
                    "pa.lastName",
                    "pa.email",
                    "pa.appointmentDate",
                    "pa.preferredTime",
                    "pa.status",
                    "pa.purposeOfAppointment",
                    "pa.phoneNumber",
                ];

                const countQuery = `
                    SELECT COUNT(*) AS total
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ?;
                `
                const countValue = [
                    email_address
                ]

                // First get the total count
                const [countResults] = await this.connection.query(
                    countQuery,
                    countValue
                );

                if (!countResults.length) {
                    throw new Error(`Failed to retrieve total count of booked appointments of a patient`);
                }

                const query = `
                    SELECT
                        ${patients_appointment_cols.join(", ")}
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ?
                    ORDER BY pa.appointmentDate DESC, pa.preferredTime DESC
                    LIMIT ? OFFSET ?;
                `;

                const values = [
                    email_address,
                    limit_value,
                    offset
                ];

                const total = countResults[0]?.total || 0;
                const totalPages = Math.ceil(total / limit_value);

                // Then get the paginated results
                const [results] = await this.connection.query(
                    query,
                    values
                );

                if (results.length === 0) {
                    throw new Error(`Failed to retrieve all booked appointments of a patient`);
                }

                await this.connection.commit();

                return {
                    data: results,
                    pagination: {
                        total: total,
                        currentPage: page_value,
                        limit: limit_value,
                        totalPages: totalPages,
                        hasNextPage: page_value < totalPages,
                        hasPreviousPage: page_value > 1
                    },
                    message: "Successfully retrieved all booked appointments"
                };
            } catch (error) {
                await this.connection.rollback();
                logger.log('error', `Failed to return all booked appointments: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Return All Booked Appointments"
    )

    /**
     * @method logic to return all pending booked appointments when no search term provided in pending booked appointments table in patient side
     */
    returnPendingBookedAppointments = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                if (!params || typeof params !== "object") {
                    throw new Error(`Invalid! Return pending booked appointments should be an object`);
                }

                const {
                    page = 1,
                    limit = 10,
                    email,
                    status
                } = params;

                const page_value = parseInt(page);
                const limit_value = parseInt(limit);
                const email_address = String(email);
                const patient_status = String(status);

                if (!page_value) {
                    throw new Error(`Invalid! page should have a value`)
                } else if (!limit_value) {
                    throw new Error(`Invalid! limit should have a value`)
                } else if (!email_address) {
                    throw new Error(`Invalid! email should have a value`)
                } else if (!patient_status) {
                    throw new Error(`Invalid! status should have a value`)
                }

                const offset = (page_value - 1) * limit_value;

                const patient_appointments_columns = [
                    "c.clinic_name",
                    "pa.firstName",
                    "pa.lastName",
                    "pa.email",
                    "pa.appointmentDate",
                    "pa.phoneNumber",
                    "pa.preferredTime",
                    "pa.status",
                    "pa.purposeOfAppointment"
                ];

                const countQuery = `
                    SELECT COUNT(*) AS total
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ?
                    AND
                    pa.status = ?;
                `

                const countValue = [
                    email_address,
                    patient_status
                ]

                const [countResults] = await this.connection.query(
                    countQuery,
                    countValue
                );

                if (!countResults.length) {
                    throw new Error(`Failed to retrieve total count of pending booked appointments of a patient`);
                }

                const total = countResults[0]?.total;
                const totalPages = Math.ceil(total / limit_value);

                const returnedQuery = `
                    SELECT
                        ${patient_appointments_columns.join(", ")}
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ?
                    AND
                    pa.status = ?
                    ORDER BY pa.appointmentDate DESC, pa.preferredTime DESC
                    LIMIT ? OFFSET ?;
                `;

                const returnedValue = [
                    email_address,
                    patient_status,
                    limit_value,
                    offset
                ]

                const [results] = await this.connection.query(
                    returnedQuery,
                    returnedValue
                );

                if (results.length === 0) {
                    throw new Error(`Failed to retrieve all pending booked appointments of a patient`);
                }

                await this.connection.commit();

                return {
                    success: true,
                    appointments: results,
                    pagination: {
                        total: total,
                        currentPage: page_value,
                        limit: limit_value,
                        totalPages: totalPages,
                        hasNextPage: page_value < totalPages,
                        hasPreviousPage: page_value > 1
                    },
                    message: "Successfully returned all pending booked appointments"
                }
            } catch (error) {
                const rollbackQuery = await this.connection.rollback();
                if (!rollbackQuery) {
                    logger.log(`error`, `Failed to rollback transaction in returned pending booked appointments: ${error}`);
                }

                logger.log(`error`, `Failed to return all pending booked appointments: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Return Pending Booked Appointments"
    )

    /**
     * @method logic to return all declined booked appointments when no search term provided in declined booked appointments table in patient side
     */
    returnDeclinedBookedAppointments = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();
            try {
                await this.connection.beginTransaction();
                if (!params || typeof params !== "object") {
                    throw new Error(`Invalid! Return declined booked appointment should be an object`);
                }

                const {
                    page = 1,
                    limit = 10,
                    email,
                    status
                } = params;

                const page_value = parseInt(page);
                const limit_value = parseInt(limit);
                const email_address = String(email);
                const patient_status = String(status);

                if (!page_value) {
                    throw new Error("Invalid! Current page should  have a value")
                } else if (!limit_value) {
                    throw new Error("Invalid! Limit should have a value")
                } else if (!email_address) {
                    throw new Error("Invalid! Email should have a value")
                } else if (!patient_status) {
                    throw new Error("Invalid! Patient Status should have a value")
                }

                const offset = (page_value - 1) * limit_value;

                const patient_appointments_cols = [
                    "c.clinic_name",
                    "pa.firstName",
                    "pa.lastName",
                    "pa.email",
                    "pa.appointmentDate",
                    "pa.phoneNumber",
                    "pa.preferredTime",
                    "pa.status",
                    "pa.purposeOfAppointment"
                ]

                const countQuery = `
                    SELECT COUNT(*) AS total
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ?
                    AND
                    pa.status = ?;
                `;

                const countValue = [
                    email_address,
                    patient_status
                ]

                const [countResults] = await this.connection.query(
                    countQuery,
                    countValue
                );

                if (!countResults || countResults.length === 0) {
                    throw new Error(`Failed to retrieve count of all declined booked appointments of a patient`)
                }

                const total = countResults[0].total;
                const totalPages = Math.ceil(total / limit_value);

                const returnDeclinedQuery = `
                    SELECT 
                    ${patient_appointments_cols.join(", ")}
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ?
                    AND
                    pa.status = ?
                    ORDER BY pa.appointmentDate DESC, pa.preferredTime DESC
                    LIMIT ? OFFSET ?;
                `;

                const returnDeclinedValue = [
                    email_address,
                    patient_status,
                    limit_value,
                    offset
                ]

                const [results] = await this.connection.query(
                    returnDeclinedQuery,
                    returnDeclinedValue
                );

                if (!results || results.length === 0) {
                    throw new Error(`Failed to retrieve all declined booked appointments of a patient`)
                }

                await this.connection.commit();

                return {
                    appointments: results,
                    pagination: {
                        total: total,
                        totalPages: totalPages,
                        currentPage: page_value,
                        limit: limit_value,
                        hasNextPage: page_value < totalPages,
                        hasPreviousPage: page_value > 1
                    },
                    message: "Successfully returned all declined booked appointments of a patient",
                    success: true
                }
            } catch (error) {
                const rollbackQuery = await this.connection.rollback();
                if (!rollbackQuery) {
                    logger.log(`error`, `Failed to rollback transaction in returned declined booked appointments: ${error}`);
                }

                logger.log(`error`, `Failed to return all declined booked appointments: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Returned Declined Booked Appointments"
    );

    /**
     * @method filtering declined booked appointments of a patient based on search term in patient side table
     */
    searchDeclinedBookedAppointments = modelErrorHandling(
        async (params) => {
            this.connection = await this.conn.getConnection();

            try {
                if (!params || typeof params !== "object") {
                    throw new Error(`Invalid parameters! Search declined booked appointments should be an object`);
                }

                const {
                    search,
                    page,
                    limit,
                    email,
                    status
                } = params;

                const search_value = String(search);
                const page_value = parseInt(page);
                const limit_value = parseInt(limit);
                const email_address = String(email);
                const patient_status = String(status);

                const offset = (page_value - 1) * limit_value;

                const countQuery = `
                    SELECT COUNT(*) AS total
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ?
                    AND
                    pa.status = ?
                    AND (
                        c.clinic_name LIKE ? OR
                        pa.firstName LIKE ? OR
                        pa.lastName LIKE ? OR
                        pa.appointmentDate LIKE ? OR
                        pa.email LIKE ? OR
                        pa.preferredTime LIKE ? OR
                        pa.phoneNumber LIKE ? OR
                        pa.status LIKE ? OR
                        pa.purposeOfAppointment LIKE ?
                    )
                `;

                const search_pattern = `%${search_value}%`;
                const count_query_values = [
                    email_address,
                    patient_status,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern
                ];

                const [count_result] = await this.connection.query(
                    countQuery,
                    count_query_values
                );

                if (!count_result || count_result.length === 0) {
                    throw new Error(`Failed to count the declined booked appointments of a patient`);
                }

                const total = count_result[0].total;
                const totalPages = Math.ceil(total / limit_value);

                const patients_appointments_cols = [
                    "c.clinic_name",
                    "pa.firstName",
                    "pa.lastName",
                    "pa.email",
                    "pa.appointmentDate",
                    "pa.phoneNumber",
                    "pa.preferredTime",
                    "pa.status",
                    "pa.purposeOfAppointment"
                ];

                const searchQuery = `
                    SELECT 
                        ${patients_appointments_cols.join(", ")}
                    FROM patientsappointment AS pa
                    INNER JOIN clinic AS c
                    ON pa.clinic_id = c.clinic_id
                    WHERE pa.email = ?
                    AND
                    pa.status = ?
                    AND (
                        c.clinic_name LIKE ? OR
                        pa.firstName LIKE ? OR
                        pa.lastName LIKE ? OR
                        pa.email LIKE ? OR
                        pa.appointmentDate LIKE ? OR
                        pa.phoneNumber LIKE ? OR
                        pa.preferredTime LIKE ? OR
                        pa.status LIKE ? OR
                        pa.purposeOfAppointment LIKE ?
                    )
                    ORDER BY pa.appointmentDate DESC, pa.preferredTime DESC
                    LIMIT ? OFFSET ?
                `;

                const search_query_values = [
                    email_address,
                    patient_status,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    limit_value,
                    offset
                ];

                const [search_result] = await this.connection.query(
                    searchQuery,
                    search_query_values
                );

                if (!search_result || search_result.length === 0) {
                    return {
                        appointments: [],
                        pagination: {
                            total: total,
                            totalPages: totalPages,
                            currentPage: page_value,
                            limit: limit_value,
                            hasNextPage: page_value < totalPages,
                            hasPreviousPage: page_value > 1
                        },
                        message: "No searched declined booked appointments found"
                    }
                }

                await this.connection.rollback();

                return {
                    appointments: search_result,
                    pagination: {
                        total: total,
                        totalPages: totalPages,
                        currentPage: page_value,
                        limit: limit_value,
                        hasNextPage: page_value < totalPages,
                        hasPreviousPage: page_value > 1
                    },
                    message: "Search declined booked appointments found"
                };
            } catch (error) {
                const rollbackQuery = await this.connection.rollback();
                if (!rollbackQuery) {
                    logger.log(`error`, `Failed to rollback transaction in search declined booked appointments of a patient: ${error}`);
                }

                logger.log(`error`, `Failed to search declined booked appointments of a patient: ${error}`);
                throw error;
            } finally {
                if (this.connection) {
                    await this.connection.release();
                }
            }
        },
        "Search Declined Booked Appointments of a Patient"
    )
}

export default Clinic;