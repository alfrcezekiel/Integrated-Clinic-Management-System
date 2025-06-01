import PropTypes from "prop-types";

const DeleteConfirmationDialog = ({ open, onClose, onConfirm, users }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            {/* Dialog */}
            <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between pb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Confirm Deletion
                    </h2>
                </div>
                {/* Content */}
                <div className="mt-4 space-y-3">
                    <p className="text-gray-600">
                        Are you sure you want to delete <span className="font-medium text-gray-900">{users?.firstName} {users?.lastName}</span>?
                    </p>
                    <p className="text-sm text-red-500">
                        This action cannot be undone.
                    </p>
                </div>
                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

DeleteConfirmationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    users: PropTypes.object.isRequired
}

export default DeleteConfirmationDialog;