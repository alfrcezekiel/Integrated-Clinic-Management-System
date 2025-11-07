import Clinic from "../models/Clinic.Model.js";
import { scheduleAppointmentsReminder } from "../services/automate_notification_service.js";
import {
    withTimeout
} from "../utils/timeoutProtection.js"
import parseAppointmentDateTime from "../utils/appointmentDateTimeUtil.js";
import logger from "./winston.js";
import { parseAppointmentDate } from "../utils/parse_appointment_date.js";
import { parseAppointmentTime } from "../utils/parse_appointment_time.js";

/**
 * @worker to schedule appointment reminders for upcoming appointments within the next hour
 */
(async () => {
    try {
        logger.log(`info`, `Worker: Running appointment reminders scheduler`)

        const clinic_instance = new Clinic();
        const result = await withTimeout(
            clinic_instance.scheduleRemindersForUpcomingAppointments({}),
            300000, // 5 minutes timeout
            "Appointment Reminder Method Query"
        );

        if (!result || !result.process_appointments || !Array.isArray(result.process_appointments)) {
            logger.log(`warn`, `No upcoming appointments found for reminders`);
            process.exit(0)
        }

        const appointments = result.process_appointments;

        logger.log(`info`, `Found ${appointments.length} upcoming appointments for reminders`);
        let successCount = 0;
        let failedCount = 0;

        for (const appointment of appointments) {
            try {
                const appointmentTime = parseAppointmentDateTime(appointment.appointmentDate, appointment.preferredTime);
                const currentTime = new Date();
                const oneHourFromNow = new Date(currentTime.getTime() + 60 * 60 * 1000);
                const minuteUntilAppointment = Math.round((appointmentTime - currentTime) / (1000 * 60));

                if (appointmentTime > currentTime && appointmentTime <= oneHourFromNow) {
                    if (minuteUntilAppointment >= 1) {
                        const result = await withTimeout(
                            scheduleAppointmentsReminder({
                                ...appointment,
                                clinicName: appointment.clinic_name,
                                reminderTime: minuteUntilAppointment
                            }),
                            60000, // 1 minute timeout milliseconds
                            "Individual Appointment Reminder"
                        );

                        if (result && result.success !== false) {
                            successCount++;
                            logger.log(`info`, `Worker: ✓ Scheduled ${minuteUntilAppointment} minutes reminder for: ${appointment.firstName} ${appointment.lastName} at ${appointment.clinic_name} - Appointment Date: (${parseAppointmentDate(appointment.appointmentDate)}) Appointment Time: (${parseAppointmentTime(appointment.preferredTime)}) - ${appointment.appointmentID}`);
                        } else {
                            failedCount++;
                            logger.log(`warn`, `Worker: Failed to schedule reminder for ${appointment.firstName} ${appointment.lastName} - ${result?.message}`);
                        }
                    } else {
                        logger.log(`warn`, `Worker: Appointment too close (${minuteUntilAppointment} minutes) for: (${appointment.firstName} ${appointment.lastName})`);
                    }
                } else {
                    logger.log(`debug`, `Worker: Appointment outside 1-hour window for ${appointment.firstName} ${appointment.lastName}`);
                }
            } catch (error) {
                failedCount++;
                logger.log(`error`, `Worker: Failed to schedule appointment reminder for: ${appointment.firstName} ${appointment.lastName} - ${error}`);
            }
        }

        logger.log(`info`, `Worker: Appointment reminders scheduling completed. ${successCount} successful, ${failedCount} failed`);
        process.exit(0);
    } catch (error) {
        logger.log(`error`, `Worker: Appointment reminder scheduler worker failed: ${error}`);
        process.exit(2);
    }
})();