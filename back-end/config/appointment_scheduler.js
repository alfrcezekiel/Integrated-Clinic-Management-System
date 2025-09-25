import cron from "node-cron";
import {
    processFollowUpMessage
} from "../controllers/cms.js";
import logger from "./winston.js";
import dotenv from "dotenv"
import Clinic from "../models/Clinic.Model.js";
dotenv.config();
import { scheduleAppointmentsReminder } from "../services/automate_notification_service.js";

const validateCronExpression = (expression, defaultValue) => {
    try {
        if (typeof expression !== "string") {
            throw new Error(`Cron expression must be a string`);
        }

        const parts = expression.trim().split(/\s+/);
        if (parts.length !== 5) {
            throw new Error(`Invalid cron expression format`);
        }

        return expression;
    } catch (error) {
        logger.log(`info`, `Invalid cron expression: ${expression}. Using default value: ${defaultValue}`);
        return defaultValue;
    }
}

const APPOINTMENT_REMINDER_SCHEDULE = validateCronExpression(process.env.APPOINTMENT_REMINDER_SCHEDULE, "0 * * * *")
const FOLLOW_UP_MESSAGE_SCHEDULE = validateCronExpression(process.env.FOLLOW_UP_MESSAGE_SCHEDULE, "0 10 * * *")

/**
 * @function schedule job to run every hour to check for upcoming appointments
 */
const scheduleAppointmentReminders = async () => {
    /**
     * run every hour at minute 0
     */
    cron.schedule(APPOINTMENT_REMINDER_SCHEDULE, async () => {
        (async () => {
            try {
                logger.log(`info`, `Running appointment reminders scheduler`)

                const clinic_instance = new Clinic();
                const upcoming_appointments = await clinic_instance.scheduleRemindersForUpcomingAppointments({});

                if (upcoming_appointments.length === 0) {
                    logger.log(`warn`, `No upcoming appointments found for reminders`);
                }

                for (const appointment of upcoming_appointments) {
                    const appointmentTime = new Date(`${appointment.appointmentDate} ${appointment.preferredTime}`);
                    const currentTime = new Date();
                    const minuteUntilAppointment = Math.round((appointmentTime - currentTime) / (1000 * 60));

                    if (minuteUntilAppointment > 0 && minuteUntilAppointment <= 1440) {
                        try {
                            await scheduleAppointmentsReminder({
                                ...appointment,
                                reminderTime: minuteUntilAppointment
                            });
                        } catch (error) {
                            logger.log(`error`, `Failed to schedule appointment reminders: ${error}`);
                        }
                    }
                }
            } catch (error) {
                logger.log(`error`, `Failed to schedule appointment reminders: ${error}`);
            }

            logger.log(`info`, `Appoinntment reminder scheduler started.`)
        })()
    }, {
        timezone: "Asia/Manila",
        scheduled: true,
        name: "Appoimtment Reminder Scheduler"
    })

    logger.info(`Appointment reminder scheduler initialized: ${APPOINTMENT_REMINDER_SCHEDULE}`)
}


/**
 * @function schedule job to run every 10 am daily to check for approved appointments for follow up
 */

const scheduleFollowUpMessage = async () => {
    /**
     * run every 10 am daily
     */
    cron.schedule(FOLLOW_UP_MESSAGE_SCHEDULE, async () => {
        (async () => {
            try {
                logger.log(`info`, `Running follow up message scheduler`);

                const mockReq = {
                    method: "GET",
                    url: "/CMS/process-follow-up-message"
                }

                const mockRes = {
                    status: function (code) {
                        this.statusCode = code;
                        return this;
                    },
                    json: function (data) {
                        if (data && data.success) {
                            logger.log(`info`, `Follow up message scheduled successfully: ${data.message}`);
                        } else {
                            logger.log(`warn`, `No appointments found for follow up message: ${data?.message}`);
                        }
                        return this;
                    }
                }
                processFollowUpMessage(mockReq, mockRes);
            } catch (error) {
                logger.log(`error`, `Failed to schedule follow up message: ${error}`);
            }
            logger.log(`info`, `Follow up message scheduler started`)
        })()
    }, {
        timezone: "Asia/Manila",
        scheduled: true
    })

    logger.info(`Follow up message scheduler initialized: ${FOLLOW_UP_MESSAGE_SCHEDULE}`)
}

const initializeScheduler = async () => {
    try {
        await scheduleAppointmentReminders();
        await scheduleFollowUpMessage();

        logger.log(`info`, `Automated Appointment Scheduler initialized`)
    } catch (error) {
        logger.log(`error`, `Failed to initialize automated appointment scheduler: ${error}`)
    }
}

export default initializeScheduler; 