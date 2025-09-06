import nodemailer from "nodemailer";
import dotenv from "dotenv";
import twilio from "twilio";
import cron from "node-cron";
import logger from "../config/winston.js";
import { automatedEmailNotificationTemplate } from "./automate_email_template";
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
        logger.log("info", `[SMS notification] sent to ${to}. SID: ${response.sid}`)
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
        const { appointmentDate, preferredTime, email, phoneNumber } = appointment;

        const [hours, minutes] = preferredTime.split(":");
        const reminderDate = new Date(appointmentDate);
        reminderDate.setHours(hours, minutes, 0, 0)

        /**
         * calculate the reminder time
         */
        const reminderTimeMs = reminderDate.getTime() - (reminderTime * 60 * 1000);
        const currentTime = new Date().getTime();

        if (reminderTimeMs > currentTime) {
            const delay = reminderTimeMs - currentTime;

            setTimeout(async () => {
                const reminderMessage = automatedEmailNotificationTemplate(appointment);
                const reminderSMSMessage = `Reminder: You have an appointment today at ${preferredTime}. Please be on time.`;
                try {
                    await sendEmailNotification(
                        email,
                        "Appointment Reminder",
                        reminderMessage
                    )

                    if (phoneNumber) {
                        await sendSmsNotification(
                            phoneNumber,
                            reminderSMSMessage
                        )
                    }
                } catch (error) {
                    logger.log(`error`, `Failed sending a reminder: ${error}`)
                }
            }, delay);
        }
    } catch (error) {
        logger.log("error", `Failed to schedule appointment reminder: ${error}`)
        throw new Error(`Failed to schedule appointment reminder: ${error}`)
    }
}

/**
 * @function to schedule a notification confirmation via sms, email
 */
export const sendAppointmentsConfirmation = async (appointment) => {
    const {
        email,
        phoneNumber,
        appointmentDate,
        preferredTime
    } = appointment;

    const confirmationEmailTemplate = automatedEmailNotificationTemplate(appointment);
    const confirmationSMSMessage = `Confirmation: Your apppointment has been scheduled for ${appointmentDate} at ${preferredTime}.
        You will receive a reminder before your appointment.
    `;

    try {
        await sendEmailNotification(
            email,
            "Appointment Confirmation",
            confirmationEmailTemplate
        );

        if (phoneNumber) {
            await sendSmsNotification(
                phoneNumber,
                confirmationSMSMessage
            );
        }

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
            phoneNumber,
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

        if (phoneNumber) {
            await sendSmsNotification(
                phoneNumber,
                `Hi ${firstName}, ${message}. Best regards, ${clinicName}`
            )
        }
    } catch (error) {
        logger.log(`error`, `Failed sending a follow up message via email, sms: ${error}`)
        throw error;
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

        /**
         * email content
         */
        const emailSubject = `Appointment Status Update - ${clinicName}`;
        const emailBody = `
            Dear ${firstName} ${lastName},

            Your appointment scheduled for ${formattedDate} at ${preferredTime} has been updated to ${patientStatus}.

            Clinic: ${clinicName}

            Please contact the clinic if you have any questions or concerns.

            Best regards,
            ${clinicName} Team.
        `;

        const emailInfo = await transporter.sendMail({
            from: `${clinicName} <${process.env.SMTP_EMAIL_USER}>`,
            to: email,
            subject: emailSubject,
            text: emailBody
        })

        const smsBody = `
            Hi ${firstName} ${lastName}, your appointment scheduled on ${formattedDate} at ${preferredTime} has been updated to ${patientStatus} - ${clinicName}

            Please contact the clinic if you have any questions or concerns.

            Best regards,
            ${clinicName} Team.
        `

        let smsInfo;

        if (phoneNumber && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            smsInfo = await sendSmsNotification(
                phoneNumber,
                smsBody
            )
        }

        return {
            success: true,
            emailInfo,
            smsInfo: smsInfo
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