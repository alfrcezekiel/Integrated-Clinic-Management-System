/**
 * @function parse appointment time to AM/PM format
 */
export const parseAppointmentTime = (timeStr) => {
    try {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        logger.error('Error formatting time:');
        return timeStr || 'Time not available';
    }
};