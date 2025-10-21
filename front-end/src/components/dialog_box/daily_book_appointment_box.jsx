import PropTypes from "prop-types";

/**
 * Daily Book Appointment Box Component to display maximum daily booked appointment
 */
const DailyBookAppointmentbox = ({ onClose, patientID, onOpen, dailyAppointmentCount, maxDailyAppointments }) => {
    if (!onOpen || !patientID) return null;

    const handleClose = () => {
        onClose();
        onOpen(false);
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
                <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                    <div className="flex items-center justify-between pb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Daily Appointment Exceeded
                        </h2>
                    </div>
                    <div className="space-y-3">
                        <p className="text-gray-600">
                            You have reached the maximum number of appointments ({maxDailyAppointments || 2}) allowed for this date. 
                            You currently have {dailyAppointmentCount} appointment(s) booked. 
                            Please select a different appointment date.
                        </p>
                    </div>
                    <div className="mt-6 flex justify-center space-x-3">
                        <button
                            onClick={handleClose}
                            className="rounded-md border border-gray-300 bg-black px-4 py-2 text-sm font-medium cursor-pointer text-white hover:bg-black/150 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                        >
                            Okay
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

DailyBookAppointmentbox.propTypes = {
    onClose: PropTypes.func.isRequired,
    patientID: PropTypes.string.isRequired,
    onOpen: PropTypes.func.isRequired,
    dailyAppointmentCount: PropTypes.number.isRequired,
    maxDailyAppointments: PropTypes.number
}

export default DailyBookAppointmentbox;