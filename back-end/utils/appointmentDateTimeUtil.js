import logger from "../config/winston.js";

const parseAppointmentDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) {
        logger.log(`error`, `Invalid! Appointment Date and Appointment Time`);
        throw new Error(`Invalid! Appointment Date and Appointment Time`)
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid Date Format. Expected format YYYY-MM-DD`);
    }

    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error('Invalid time format. Expected HH:MM or HH:MM:SS');
    }

    date.setHours(hours, minutes, 0, 0);
    return date;
}

export default parseAppointmentDateTime;