import PropTypes from "prop-types";
import "../App.css";
import { useEffect } from "react";

const AppointmentDataNotFoundDialog = ({ isOpen, onClose }) => {
    useEffect(() => {
        // Prevent background scrolling when dialog is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-4xl p-6 w-full max-w-md mx-4 xl:translate-x-50 md:translate-x-30 relative transition-all"
                onClick={(e) => e.stopPropagation()} // Prevent closing on inside click
            >
                <div className="flex justify-center">
                    <span className="text-yellow-500 text-4xl">⚠️</span>
                </div>
                <div className="text-center py-4 px-4">
                    <h2 className="text-xl font-semibold text-black mb-2">
                        Appointment Data Not Found
                    </h2>
                    <p className="text-gray-600">
                        We couldn&apos;t locate any appointment data for your request.
                    </p>
                </div>
                <div className="flex items-center justify-center px-4">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition duration-200 cursor-pointer"
                        onClick={onClose}
                    >
                        Okay
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