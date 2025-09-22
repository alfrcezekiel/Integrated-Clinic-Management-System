import logger from "../config/winston.js";

/**
 * @function generates an email template for scheduled appointment reminders
 */
export const scheduledReminderTemplate = async (appointment, minutesUntilAppointment) => {
    const {
        firstName,
        lastName,
        appointmentDate,
        preferredTime,
        clinicName,
        purposeOfAppointment,
    } = appointment;

    let formattedDate;
    let formattedTime;

    try {
        let year, month, day, hours, minutes;

        if (typeof appointmentDate === "string") {
            [year, month, day] = appointmentDate.split("-").map(Number);
            console.log(year, month, day)
        } else if (appointmentDate instanceof Date) {
            year = appointmentDate.getFullYear();
            month = appointmentDate.getMonth() + 1;
            day = appointmentDate.getDate();
        } else {
            throw new Error(`Invalid appointment date format`);
        }

        if (preferredTime) {
            [hours, minutes] = preferredTime.split(":").map(Number);
        } else {
            hours = 0;
            minutes = 0;
        }

        const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);

        if (!isNaN(appointmentDateTime.getTime())) {
            formattedDate = appointmentDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: "Asia/Manila"
            });
        }

        formattedTime = appointmentDateTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: "Asia/Manila"
        });
    } catch (error) {
        logger.log(`error`, `Failed to format appointment date and time: ${error}`)
    }

    // Calculate the time until the appointment in hours and minutes
    const hours = Math.floor(minutesUntilAppointment / 60);
    const minutes = minutesUntilAppointment % 60;
    const timeUntil = hours > 0
        ? `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` and ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`
        : `${minutes} minute${minutes > 1 ? 's' : ''}`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4a90e2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 5px 5px; }
            .button { 
                display: inline-block; 
                padding: 10px 20px; 
                background-color: #4a90e2; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 15px 0; 
            }
            .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Appointment Reminder</h2>
            </div>
            <div class="content">
                <p>Dear ${firstName} ${lastName},</p>
                
                <p>This is a friendly reminder about your upcoming appointment at ${clinicName || "Clinic Team"}.</p>
                
                <div style="background-color: #f5f9ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Appointment Details:</strong></p>
                    <p>Appointment Date: ${formattedDate}</p>
                    <p>Appointment Time: ${formattedTime}</p>
                    <p>Purpose of Appointment: ${purposeOfAppointment}</p>
                    <p>Time until Appointment: ${timeUntil}</p>
                </div>
                
                <p>If you need to reschedule or have any questions, please contact us at your earliest convenience.</p>
                
                <p>We look forward to seeing you soon!</p>
                
                <p>Best regards,<br>${clinicName || "Clinic Management System"} Team</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} ${clinicName || "Clinic Management System"}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};