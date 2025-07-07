import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

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

    try {
        await transporter.sendMail(mailOptions);
        return { success: true }
    } catch (error) {
        console.error(`Failed to send reset password link: ${error}`);
        throw new Error(`Failed to send reset password link: ${error}`);
    }
}

export default sendResetPasswordEmail;