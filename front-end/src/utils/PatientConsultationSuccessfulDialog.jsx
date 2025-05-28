import PropTypes from "prop-types";

const PatientConsultationSuccessfulDialog = ({ open, onClose }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center animate-fade-in">
                <div className="flex flex-col items-center">
                    <div className="bg-green-100 rounded-full p-4 mb-4">
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">
                        Consultation Successful!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        The patient&apos;s consultation has been completed successfully.
                    </p>
                    <button
                        onClick={onClose}
                        className="mt-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                        Okay
                    </button>
                </div>
            </div>
        </div>
    );
};

PatientConsultationSuccessfulDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default PatientConsultationSuccessfulDialog;
