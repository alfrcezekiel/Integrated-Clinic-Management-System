/**
 * @function to parse the appointment date from date object to long date
 */
export const parseAppointmentDate = (dateStr) => {
    try {
        let date;

        if (dateStr instanceof Date) {
            date = dateStr;
        } else if (typeof dateStr === "string") {
            if (dateStr.includes("T")) {
                date = new Date(dateStr);
            } else {
                const [year, month, day] = dateStr.split("-").map(Number);
                date = new Date(year, month - 1, day);
            }
        } else {
            throw new Error(`Invalid appointment date format: ${error}`);
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        logger.error('Error formatting date:');
        return dateStr || 'Date not available';
    }
};