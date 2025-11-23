import logger from "../config/winston.js";

const parseAppointmentDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) {
        logger.log(`error`, `Invalid! Appointment Date and Appointment Time`);
        throw new Error(`Invalid! Appointment Date and Appointment Time`)
    }

    let year, month, day;
    let hours, minutes;

    // Handle both string and Date object inputs
    if (dateStr instanceof Date) {
        year = dateStr.getFullYear();
        month = dateStr.getMonth() + 1; // getMonth() is 0-indexed
        day = dateStr.getDate();
    } else {
        [year, month, day] = dateStr.split("-").map(Number);
    }

    [hours, minutes] = timeStr.split(":").map(Number);

    const manilaDate = new Date(Date.UTC(year, month - 1, day, hours - 8, minutes, 0));

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error('Invalid time format. Expected HH:MM or HH:MM:SS');
    }

    return manilaDate;
}

export default parseAppointmentDateTime;