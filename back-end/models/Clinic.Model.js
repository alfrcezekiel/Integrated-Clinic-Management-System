import conn from "../db/mysql/conn.js";

// created a new instance of class Clinic Models
class Clinic {

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

            const commitQuery = await connection.commit(); // commit the transaction query if successful
            if (!commitQuery) {
                throw new Error("Failed to commit transaction in cancelling booked appointment");
            }

            return result;
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
        } catch (error){
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
            if(!clinicID || typeof clinicID !== "number") {
                throw new Error("Invalid! clinic id must be a number");
            }

            if(!bookAppointmentStatus || typeof bookAppointmentStatus !== "string") {
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
        } catch (error){
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
            if(!clinicID || typeof clinicID !== "number"){
                throw new Error("Invalid! clinic is must me a number")
            } 

            if(!booked_appointment_status || typeof booked_appointment_status !== "string"){
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
}

export default Clinic;