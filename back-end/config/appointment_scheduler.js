import cron from "node-cron";
import {
    scheduleReminderForUpcomingAppointments,
    processFollowUpMessage
} from "../controllers/cms.js";
import logger from "./winston.js";
import dotenv from "dotenv"
dotenv.config();

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
const scheduleAppointmentReminders = () => {
    /**
     * run every hour at minute 0
     */
    cron.schedule(APPOINTMENT_REMINDER_SCHEDULE, async () => {
        try {
            logger.log(`info`, `Running appointment reminders scheduler`)
            const result = scheduleReminderForUpcomingAppointments();
            logger.log(`info`, `Appointment reminders scheduled successfully: ${result} reminder sent`);
        } catch (error) {
            logger.log(`error`, `Failed to schedule appointment reminders: ${error}`);
        }

        logger.log(`info`, `Appoinntment reminder scheduler started`)
    }, {
        timezone: "Asia/Manila",
        scheduled: true
    })

    logger.info(`Appointment reminder scheduler initialized: ${APPOINTMENT_REMINDER_SCHEDULE}`)
}


/**
 * @function schedule job to run every 10 am daily to check for approved appointments for follow up
 */

const scheduleFollowUpMessage = () => {
    /**
     * run every 10 am daily
     */
    cron.schedule(FOLLOW_UP_MESSAGE_SCHEDULE, async () => {
        try {
            logger.log(`info`, `Running follow up message scheduler`)
            const result = processFollowUpMessage();
            logger.log(`info`, `Follow up message scheduled successfully: ${result} follow up message sent`);
        } catch (error) {
            logger.log(`error`, `Failed to schedule follow up message: ${error}`);
        }

        logger.log(`info`, `Follow up message scheduler started`)
    }, {
        timezone: "Asia/Manila",
        scheduled: true
    })

    logger.info(`Follow up message scheduler initialized: ${FOLLOW_UP_MESSAGE_SCHEDULE}`)
}

const initializeScheduler = () => {
    try {
        scheduleAppointmentReminders();
        scheduleFollowUpMessage();

        logger.log(`info`, `Appointment scheduler initialized`)
    } catch (error) {
        logger.log(`error`, `Failed to initialize appointment scheduler: ${error}`)
    }
}

export default initializeScheduler; 