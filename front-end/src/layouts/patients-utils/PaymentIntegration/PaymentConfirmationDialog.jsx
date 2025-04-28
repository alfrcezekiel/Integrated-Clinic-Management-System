import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button
} from '@mui/material';
import PropTypes from 'prop-types';

const ConfirmPaymentDialogBox = ({ open, onClose }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <div className="bg-white rounded-xl shadow-lg w-full">
                <DialogTitle className="text-2xl font-semibold text-center">
                    Confirm Your Payment
                </DialogTitle>

                <DialogContent>
                    <div className="border rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-bold mb-4">Details</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="font-medium">Date:</span>
                                <span className="text-gray-700">--/--/----</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Payment Method:</span>
                                <span className="text-gray-700">----</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Name:</span>
                                <span className="text-gray-700">----</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Email:</span>
                                <span className="text-gray-700">----</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-semibold">Total Amount:</span>
                        <span className="text-xl font-bold text-green-600">$---</span>
                    </div>
                </DialogContent>

                <DialogActions className="flex justify-end space-x-4 mb-4">
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        color="error"
                        className="px-6 py-2 text-gray-800 font-semibold"
                    >
                        Cancel Payment
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="contained"
                        color="primary"
                        className="px-6 py-2 text-white font-semibold"
                    >
                        Confirm Payment
                    </Button>
                </DialogActions>
            </div>
        </Dialog>
    );
};

ConfirmPaymentDialogBox.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ConfirmPaymentDialogBox;
