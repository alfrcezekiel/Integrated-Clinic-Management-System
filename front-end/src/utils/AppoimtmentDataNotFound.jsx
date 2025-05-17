import PropTypes from "prop-types";
import "../App.css";

const AppointmentDataNotFoundDialog = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 relative"
                onClick={(e) => e.stopPropagation()} // Prevent closing on inside click
            >
                <div className="flex justify-center mb-4">
                    <span className="text-yellow-500 text-4xl">⚠️</span>
                </div>
                <div className="text-center py-4 px-4">
                    <h2 className="text-xl font-semibold text-black mb-2">
                        Appointment Data Not Found
                    </h2>
                    <p className="text-gray-600 mb-4">
                        We couldn&apos;t locate any appointment data for your request.
                    </p>
                </div>
                <div className="flex items-center justify-center px-4 py-2">
                    <button
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-200"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

AppointmentDataNotFoundDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
}

export default AppointmentDataNotFoundDialog;