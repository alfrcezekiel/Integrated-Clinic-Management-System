import cron from "node-cron";
import {
    processFollowUpMessage
} from "../controllers/cms.js";
import logger from "./winston.js";
import dotenv from "dotenv"
import Clinic from "../models/Clinic.Model.js";
dotenv.config();
import { scheduleAppointmentsReminder } from "../services/automate_notification_service.js";
import parseAppointmentDateTime from "../utils/appointmentDateTimeUtil.js";
import { parseAppointmentDate } from "../utils/parse_appointment_date.js";
import { parseAppointmentTime } from "../utils/parse_appointment_time.js";
import {
    measureExecutionTime,
    withTimeout
} from "../utils/timeoutProtection.js"
import { spawn} from "child_process";
import { fileURLToPath} from "url";
import path from "path";

const WORKER_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "appointment_worker.js");

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
     * run every hour
     */
    cron.schedule(APPOINTMENT_REMINDER_SCHEDULE, async () => {
        setImmediate(async () => {
            await measureExecutionTime(
                async () => {
                    try {
                        // logger.log(`info`, `Running appointment reminders scheduler`)

                        // const clinic_instance = new Clinic();
                        // const result = await withTimeout(
                        //     clinic_instance.scheduleRemindersForUpcomingAppointments({}),
                        //     300000, // 5 minutes timeout
                        //     "Appointment Reminder Method Query"
                        // );

                        // if (!result || !result.process_appointments || !Array.isArray(result.process_appointments)) {
                        //     logger.log(`warn`, `No upcoming appointments found for reminders`);
                        //     return;
                        // }

                        // const appointments = result.process_appointments;

                        // logger.log(`info`, `Found ${appointments.length} upcoming appointments for reminders`);
                        // let successCount = 0;
                        // let failedCount = 0;

                        // for (const appointment of appointments) {
                        //     try {
                        //         const appointmentTime = parseAppointmentDateTime(appointment.appointmentDate, appointment.preferredTime);
                        //         const currentTime = new Date();
                        //         const oneHourFromNow = new Date(currentTime.getTime() + 60 * 60 * 1000);
                        //         const minuteUntilAppointment = Math.round((appointmentTime - currentTime) / (1000 * 60));

                        //         if (appointmentTime > currentTime && appointmentTime <= oneHourFromNow) {
                        //             if (minuteUntilAppointment >= 1) {
                        //                 const result = await withTimeout(
                        //                     scheduleAppointmentsReminder({
                        //                         ...appointment,
                        //                         clinicName: appointment.clinic_name,
                        //                         reminderTime: minuteUntilAppointment
                        //                     }),
                        //                     60000, // 1 minute timeout milliseconds
                        //                     "Individual Appointment Reminder"
                        //                 );

                        //                 if (result && result.success !== false) {
                        //                     successCount++;
                        //                     logger.log(`info`, `✓ Scheduled ${minuteUntilAppointment} minutes reminder for: ${appointment.firstName} ${appointment.lastName} at ${appointment.clinic_name} - Appointment Date: (${parseAppointmentDate(appointment.appointmentDate)}) Appointment Time: (${parseAppointmentTime(appointment.preferredTime)}) - ${appointment.appointmentID}`);
                        //                 } else {
                        //                     failedCount++;
                        //                     logger.log(`warn`, `Failed to schedule reminder for ${appointment.firstName} ${appointment.lastName} - ${result?.message}`);
                        //                 }
                        //             } else {
                        //                 logger.log(`warn`, `Appointment too close (${minuteUntilAppointment} minutes) for: (${appointment.firstName} ${appointment.lastName})`);
                        //             }
                        //         } else {
                        //             logger.log(`debug`, `Appointment outside 1-hour window for ${appointment.firstName} ${appointment.lastName}`);
                        //         }
                        //     } catch (error) {
                        //         failedCount++;
                        //         logger.log(`error`, `Failed to schedule appointment reminder for ${appointment.firstName} ${appointment.lastName}: ${error}`);
                        //     }
                        // }

                        // logger.log(`info`, `Reminder scheduling complete: ${successCount} successful, ${failedCount} failed`)

                        /**
                         * offload heavy appointment reminder work to a child process to avoid blocking cron ticks.
                         */
                        const child = spawn(process.execPath, [WORKER_PATH], {
                            env: process.env,
                            stdio: ["ignore", "pipe", "pipe"]
                        });

                        child.stdout.on("data", (data) => logger.log(`info`, `Appointment reminder worker: ${data.toString().trim()}`));
                        child.stderr.on("data", (data) => logger.log(`info`, `Appointment reminder worker: ${data.toString().trim()}`));

                        const code = await new Promise((resolve) => child.on("close", resolve));

                        if (!code !== 0) {
                            logger.log(`warn`, `Appointment reminder worker exited with code: ${code}`);
                        }
                    } catch (error) {
                        logger.log(`error`, `Failed to schedule appointment reminders: ${error}`);
                    }
                },
                "Appointment Reminder Scheduler"
            )
        });
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
        setImmediate(async () => {
            await measureExecutionTime(
                async () => {
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
                        await withTimeout(
                            processFollowUpMessage(mockReq, mockRes),
                            300000, // 5 minutes timeout
                            "Follow-up Message Processing"
                        );
                    } catch (error) {
                        logger.log(`error`, `Failed to schedule follow up message: ${error}`);
                    }
                },
                "Follow-up Message Scheduler"
            )
        });
    }, {
        timezone: "Asia/Manila",
        scheduled: true,
        name: "Follow-up Message Scheduler"
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