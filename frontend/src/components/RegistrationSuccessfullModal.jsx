import PropTypes from 'prop-types';

function RegistrationSuccessfulModal({ isOpen, onClose, fieldsMessage, statusMessage }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
            <div className="w-xs p-6 bg-red-600 rounded-lg shadow-lg h-24">
                <h2 className="text-lg font-bold text-center text-white-200">{statusMessage}</h2>
                <p className="mt-2 text-center text-white">{fieldsMessage}</p>
                <button
                    onClick={onClose}
                    className="px-4 py-2 mt-4 text-black bg-red-100 rounded-md"
                >
                    Close
                </button>
            </div>
        </div>
    )
}

RegistrationSuccessfulModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    fieldsMessage: PropTypes.string.isRequired,
    statusMessage: PropTypes.string.isRequired,
}

export default RegistrationSuccessfulModal;