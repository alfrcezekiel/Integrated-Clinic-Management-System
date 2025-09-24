import nodemailer from "nodemailer";
import dotenv from "dotenv";
import twilio from "twilio";
import cron from "node-cron";
import logger from "../config/winston.js";
import {
    automatedEmailNotificationTemplate,
} from "./automate_email_template";
import { scheduledReminderTemplate } from "./automate_scheduled_reminder_template.js";
import { sendWelcomeEmailNotification } from "./welcome_create_account.js";
dotenv.config();

/**
 * email configuration
 */
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_EMAIL_USER,
        pass: process.env.SMTP_EMAIL_PASSWORD
    },
    secure: true
})

/**
 * initialize twilio account
 */
let twilioClient;

const initialzeTwilioClient = () => {
    try {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
            throw new Error("Twilio credentials not found")
        }

        twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        )

        logger.log("info", "Twilio client initialized")
    } catch (error) {
        logger.log("error", `Failed to initialize twilio client: ${error}`)
    }
}
initialzeTwilioClient();


/**
 * @function send a email notification in patient side for appointment confirmation / reminders
 */
export const sendEmailNotification = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `Clinic Management System <${process.env.SMTP_EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html
        }

        await transporter.sendMail(mailOptions);
        logger.log("info", `Email notification sent to ${to}`)
        return {
            success: true
        }
    } catch (error) {
        logger.log("error", `Failed to send email notification: ${error}`)
        throw new Error(`Failed to send email notification: ${error}`)
    }
}

const formatPhoneNumber = (phoneNumber) => {
    let cleaned = (" " + phoneNumber).replace(/\D/g, "");

    if (cleaned.startsWith("0")) {
        cleaned = "+63" + cleaned.substring(1);
    } else if (!cleaned.startsWith("+")) {
        cleaned = "+63" + cleaned;
    } else if (cleaned.startsWith("+0")) {
        cleaned = "+63" + cleaned.substring(2);
    }

    return cleaned;
}

/**
 * @function send a sms notification
 */
export const sendSmsNotification = async (to, message) => {
    if (!twilioClient) {
        logger.error('Twilio client not initialized. Check your .env configuration');
        throw new Error('SMS service is not properly configured');
    }

    if (!to || !message) {
        throw new Error('Recipient number and message are required');
    }

    try {
        const formattedPhoneNumber = formatPhoneNumber(to);
        logger.log(`info`, `Sending SMS notification to ${formattedPhoneNumber}`);

        const response = await twilioClient.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhoneNumber,
            body: message
        })
        logger.log("info", `2MS notification] sent to ${to}. SID: ${response.sid}`)
        return {
            success: true,
            sid: response.sid
        }
    } catch (error) {
        logger.log("error", `Failed to send sms notification: ${error}`)
        throw new Error(`Failed to send sms notification: ${error}`)
    }
}

/**
 * @function to schedule a notification reminders/confirmation via sms, email
 */
export const scheduleAppointmentsReminder = async (appointment, reminderTime = 60) => {
    try {
        const {
            appointmentDate,
            preferredTime,
            email,
            appointmentID,
            firstName,
            lastName,
            clinicName,
        } = appointment;

        if (!appointmentID || !preferredTime) {
            throw new Error(`Missing required appointment details.`);
        }

        const [hours, minutes] = preferredTime.split(":").map(Number);
        const appointmentDateTime = new Date(appointmentDate);
        appointmentDateTime.setHours(hours, minutes, 0, 0)

        /**
         * calculate the reminder time
         */
        const reminderTimeMs = appointmentDateTime.getTime() - (reminderTime * 60 * 1000);
        const currentTime = new Date().getTime();
        const timeUntilReminder = reminderTimeMs - currentTime;

        if (timeUntilReminder <= 0) {
            logger.log(`warn`, `Appointment reminder time is in the past for appointment: ${firstName} ${lastName}`)
            return {
                success: false,
                message: `Appointment reminder time is in the past for appointment: ${firstName} ${lastName}`,
                scheduled: false
            }
        }

        /**
         * generate a automated schedule reminder template via email
         */
        const reminderEmailTemplate = await scheduledReminderTemplate(appointment, reminderTime);

        const hoursUntil = Math.floor(reminderTime / 60);
        const minutesUntil = reminderTime % 60;
        const timeUntilText = hoursUntil > 0 ?
            `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}${minutesUntil > 0 ? ` and ${minutesUntil} minute${minutesUntil > 1 ? 's' : ''}` : ''}`
            : `${minutesUntil} minute${minutesUntil > 1 ? 's' : ''}`;

        const reminder_id = `reminder_${appointmentID}_${reminderTime}`;

        if (reminderTimeouts.has(reminder_id)) {
            clearTimeout(reminderTimeouts.get(reminder_id));
            reminderTimeouts.delete(reminder_id);
        }

        const reminderTimeout = setTimeout(async () => {
            try {
                if (email) {
                    await sendEmailNotification(
                        email,
                        `Reminder: Appointment in ${timeUntilText}`,
                        reminderEmailTemplate
                    );

                    logger.log(`info`, `Email reminder sent to ${email}`);
                }

                if (appointment.connection) {
                    const query = `UPDATE patientsappointment SET reminder_sent = ? WHERE appointmentID = ?;`;
                    await appointment.connection.query(query, [1, appointmentID]);
                }
            } catch (error) {
                logger.log("error", `Failed to send appointment reminder: ${error}`)
                throw error;
            } finally {
                reminderTimeouts.delete(reminder_id);
            }
        }, timeUntilReminder);

        reminderTimeouts.set(reminder_id, reminderTimeout);
        logger.log(`info`, `Scheduled ${reminderTime} min reminder for upcoming appointment: ${firstName} ${lastName} in ${clinicName}`);

        return {
            succcess: true,
            message: `Reminder scheduled successfully for ${reminderTime}`,
            reminderTime,
            scheduledFor: new Date(reminderTimeMs).toISOString(),
            timeUntilAppointment: timeUntilReminder
        }
    } catch (error) {
        logger.log("error", `Failed to schedule appointment reminder: ${error}`)
        throw new Error(`Failed to schedule appointment reminder: ${error}`)
    }
}

const reminderTimeouts = new Map();

/**
 * @function cancels a schedules reminder
 */
export const cancelScheduledReminder = (appointmentId, reminderTime) => {
    const reminderId = `reminder_${appointmentId}_${reminderTime}`;
    const timeout = reminderTimeouts.get(reminderId);

    if (timeout) {
        clearTimeout(timeout);
        reminderTimeouts.delete(reminderId);
        logger.log('info', `Cancelled reminder ${reminderId}`);
        return true;
    }
    return false;
};

/**
 * @function cancels all scheduled reminders for an appointment
 */
export const cancelAllRemindersForAppointment = (appointmentId) => {
    let count = 0;
    for (const [id, timeout] of reminderTimeouts.entries()) {
        if (id.startsWith(`reminder_${appointmentId}_`)) {
            clearTimeout(timeout);
            reminderTimeouts.delete(id);
            count++;
        }
    }
    if (count > 0) {
        logger.log('info', `Cancelled ${count} reminders for appointment ${appointmentId}`);
    }
    return count;
};

/**
 * @function to schedule a notification confirmation via sms, email
 */
export const sendAppointmentsConfirmation = async (appointment) => {
    const {
        email,
        appointmentDate,
    } = appointment;

    const confirmationEmailTemplate = automatedEmailNotificationTemplate(appointment);

    try {
        await sendEmailNotification(
            email,
            "Appointment Confirmation",
            confirmationEmailTemplate
        );

        /**
         * schedule a reminder for 24 hours
         */
        await scheduleAppointmentsReminder({
            ...appointment,
            appointmentDate: appointmentDate,
        }, 1440);
        /**
         * schedule a reminder for 1 hour
         */
        await scheduleAppointmentsReminder({
            ...appointment,
            appointmentDate: appointmentDate
        }, 60);
    } catch (error) {
        logger.log(`error`, `Failed sending a confirmation via email, sms: ${error}`)
    }
}

/**
 * @function to send a follow up message via sms, email
 */
export const sendFollowUpMessage = async (appointment) => {
    try {
        const {
            email,
            firstName,
            clinicName
        } = appointment;

        const message = `Thank you for visiting ${clinicName}. We hope you had a great experience.`

        if (email) {
            const subject = `Follow Up: Your Recent Visit to ${clinicName}`;
            const html = `
                <h2>Thank you for your visit:</h2>
                <p>Hello ${firstName},</p>
                <p>${message}</p>
                <p>Best regards,</p>
                <p>${clinicName}</p>
            `
            await sendEmailNotification(
                email,
                subject,
                html
            )
        }

    } catch (error) {
        logger.log(`error`, `Failed sending a follow up message via email, sms: ${error}`)
        throw error;
    }
}

/**
 * @function formats the date of the patient's appointment to AM/PM format
 */
const formatAppointmentDateToAMPM = (timeString) => {
    if (!timeString) return "";

    const time_string = String(timeString);

    try {
        let [hours, minutes] = time_string.split(":")
        hours = parseInt(hours, 10);
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes.toString().padStart(2, "0");
        return `${hours}:${minutes} ${ampm}`;
    } catch (error) {
        logger.log(`error`, `Failed to format the date of the patient's appointment to AM/PM format: ${error}`)
        return timeString;
    }
}

/**
 * @function to send a reminder in updating the status of the appointment in clinic side via email and sms
 */
export const sendStatusUpdateReminder = async ({ email, phoneNumber, firstName, lastName, appointmentDate, preferredTime, patientStatus, clinicName }) => {
    try {
        let dateObj;

        if (typeof appointmentDate === "string") {
            dateObj = new Date(appointmentDate);

            if (isNaN(dateObj.getTime())) {
                const [datePart, timePart] = appointmentDate.split(" ");
                const [year, month, day] = datePart.split("-").map(Number);

                if (timePart) {
                    const [hours, minutes] = timePart.split(":").map(Number);

                    dateObj = new Date(year, month - 1, day, hours, minutes);
                } else {
                    dateObj = new Date(year, month - 1, day);
                }
            }
        } else if (appointmentDate instanceof Date) {
            dateObj = appointmentDate;
        } else {
            dateObj = new Date();
            logger.warn(`Invalid appointment date: ${appointmentDate}`)
        }

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }

        const formattedDate = dateObj.toLocaleDateString("en-US", options);
        const formattedAppointmentTime = formatAppointmentDateToAMPM(preferredTime);

        /**
         * email content
         */
        const emailSubject = `Appointment Status Update - ${clinicName}`;
        const emailBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Appointment Status Update</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-50 p-4">
                <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                    <!-- Header -->
                    <div class="bg-blue-600 p-6 text-white">
                        <h2 class="text-2xl font-bold">Appointment Status Update</h2>
                    </div>

                    <!-- Main Content -->
                    <div class="p-6">
                        <p class="mb-4 text-gray-700">
                            Dear <span class="font-semibold">${firstName} ${lastName}</span>,
                        </p>

                        <div class="bg-blue-50 border-1-4 border-blue-500 p-4 mb-6">
                            <h2 class="font-bold text-lg mb-2">Appointment Details</h2>
                            <div class="space-y-1 text-gray-700">
                                <p>
                                    <span class="font-medium">Appointment Date: </span>
                                    ${formattedDate}
                                </p>
                                <p>
                                    <span class="font-medium">Appointment Time: </span>
                                    ${formattedAppointmentTime}
                                </p>
                                <p class="mt-2">
                                    <span class="font-medium">
                                        Status:
                                    </span>
                                    <span class="px-2 py-1 rounded text-sm font-medium ${patientStatus.toLowerCase() === "approved" ? "bg-green-200 text-green-800" :
                patientStatus.toLowerCase() === "pending" ? "bg-yellow-200 text-yellow-800" :
                    patientStatus.toLowerCase() === "declined" ? "bg-red-200 text-red-800" :
                        patientStatus.toLowerCase() === "cancelled" ? "bg-red-200 text-red-800" :
                            "bg-gray-200 text-gray-800"
            }">
                                        ${patientStatus}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <p class="mb-4 text-gray-700">
                            If you have any questions or need to reschedule your appointment, please dont't hesitate to contact our clinic.
                        </p>

                        <p class="text-gray-700">
                            Thank you for choosing ${clinicName} for your healthcare needs.
                        </p>
                    </div>

                    <!-- Footer -->
                    <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <p class="text-gray-500 text-sm">
                            Best regards,
                            <br>
                            <span class="font-medium">${clinicName} Team</span>
                        </p>
                        <p class="mt-2 text-xs text-gray-400">
                            This is an automated message. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const emailInfo = await transporter.sendMail({
            from: `${clinicName} <${process.env.SMTP_EMAIL_USER}>`,
            to: email,
            subject: emailSubject,
            html: emailBody
        })

        return {
            success: true,
            emailInfo,
        }
    } catch (error) {
        logger.log(`error`, `Failed sending a status update reminder via email, sms: ${error}`)
        throw error;
    }
}

/**
 * @function handles the automated update of patient status and send a reminder to the patient via sms and email.
 */
export const handleAutomatedUpdateStatus = async ({ appointmentID, patientStatus }) => {
    try {
        return {
            success: true,
            message: "Automated update status has been sent successfully",
            appointmentID,
            patientStatus
        }
    } catch (error) {
        logger.log(`error`, `Failed handling automated update status: ${error}`)
        throw error;
    }
}

/**
 * @function sends a welcome email in newly registered patient account
 */
export const sendWelcomeEmail = async (patient) => {
    try {
        const {
            email
        } = patient;

        const emailSubject = "Welcome to Clinic Management";
        const welcomeEmailTemplate = await sendWelcomeEmailNotification(patient);

        await sendEmailNotification(
            email,
            emailSubject,
            welcomeEmailTemplate
        )

        logger.log(`info`, `Welcome email has been sent successfully to ${email}`);

        return {
            success: true,
            message: "Welcome email has been sent successfully",
            email,
        }
    } catch (error) {
        logger.log(`error`, `Failed sending a welcome email: ${error}`)
        throw error;
    }
}