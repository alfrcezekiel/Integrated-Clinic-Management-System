import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
    sendEmailWithTimeout
} from "./lock_wait_timeout.js";
import logger from "../config/winston.js";
import { Resend } from "resend";
dotenv.config();

/**
 * initialize resend email client
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * transporter for sending a reset password link
 */
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_EMAIL_USER,
        pass: process.env.SMTP_EMAIL_PASSWORD
    }
})

/**
 * @function to send a template to reset password
 */
const sendResetPasswordEmail = async (email, name, resetLink) => {
    try {

        if (process.env.NODE_ENV === "production") {
            try {
                const info = await sendEmailWithTimeout(() => resend.emails.send({
                    from: `Clinic Management System <onboarding@resend.dev>`,
                    to: email,
                    subject: "Reset Password Request",
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>Password Reset Request</h2>

                            <p>Hello ${name},</p>

                            <p>We received a request to reset your password. Click the button below to reset it:</p>
                            
                            <div style="margin: 25px 0;">
                                <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                                    Reset Password
                                </a>
                            </div>
                            <p>This link will expire in 10 minutes.</p>
                            <p>If you didn't request this, please ignore this email.</p>
                            <p>Best regards,<br>Clinic Management System Team</p>
                        </div>
                    `
                }), 120000); // 2 minutes timeout

                logger.log(`info`, `Successfully sent reset password link via ${process.env.NODE_ENV} email service: ${email} - ${info}`);

                return {
                    success: true
                }
            } catch (error) {
                logger.log(`error`, `Failed sending reset password email via Resend in ${process.env.NODE_ENV}: ${error}`);
            }
        }

        const mailOptions = {
            from: `Clinic Management System <${process.env.SMTP_EMAIL_USER}>`,
            to: email,
            subject: "Reset Password Request",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Request</h2>
                    <p>Hello ${name},</p>
                    <p>We received a request to reset your password. Click the button below to reset it:</p>
                    <div style="margin: 25px 0;">
                        <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    <p>This link will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>Best regards,<br>Clinic Management System Team</p>
                </div>
            `
        }

        const info = await sendEmailWithTimeout(() => transporter.sendMail(mailOptions), 120000); // 2 minutes timeout

        logger.info(`Successfully sent reset password link to via local SMTP: ${email}: ${info.response}`);

        return {
            success: true
        }
    } catch (error) {
        console.error(`Failed to send reset password link: ${error}`);
        throw new Error(`Failed to send reset password link: ${error}`);
    }
}

export default sendResetPasswordEmail;