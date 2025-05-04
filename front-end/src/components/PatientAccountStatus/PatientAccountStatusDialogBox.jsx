import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

const PatientAccountStatusDialogBox = ({open, onClose, onConfirm}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <div className="p-4 w-full max-w-md">
                <DialogTitle>
                    <h3 className="text-xl font-semibold text-center text-yellow-600">Account Pending Approval</h3>
                </DialogTitle>
                <DialogContent>
                    <div className="flex flex-col items-center text-center">
                        <HourglassBottomIcon className="text-yellow-500" style={{ fontSize: "3rem" }} />
                        <p className="mt-4 text-base text-gray-800">
                            Your account has been registered successfully.
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            Please wait for the admin to approve your account before accessing the system.
                        </p>
                    </div>
                </DialogContent>
                <DialogActions className="flex justify-end gap-2 px-4 pb-4">
                    <div className="flex w-full justify-center items-center">
                        <Button
                            onClick={onConfirm}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded"
                            variant="contained"
                        >
                            Okay
                        </Button>
                    </div>
            </DialogActions>
            </div>
        </Dialog>
    );
}

PatientAccountStatusDialogBox.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    accountMessage: PropTypes.string.isRequired
}
export default PatientAccountStatusDialogBox;