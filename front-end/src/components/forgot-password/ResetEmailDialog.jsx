import PropTypes from "prop-types";
/**
 * 
 * @function component to display the reset email dialog
 */
const ResetEmailDialog = ({ closeSuccessDialog }) => {
    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 mx-4 shadow-xl transition-all duration-300">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg
                        className="h-10 w-10 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                    Reset Email Sent!
                </h3>
                <div className="text-center">
                    <p className="text-gray-600 mb-4">
                        We&apos;ve sent you an email with instructions to reset your password.
                        Please check you inbox and follow the link provided.
                    </p>
                </div>
                <button
                    type="button"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-200"
                    onClick={closeSuccessDialog}
                >
                    Got it, thanks
                </button>
            </div>
        </div>
    )
}

ResetEmailDialog.propTypes = {
    closeSuccessDialog: PropTypes.func.isRequired
}

export default ResetEmailDialog;