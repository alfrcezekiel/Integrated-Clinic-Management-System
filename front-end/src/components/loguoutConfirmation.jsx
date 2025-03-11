import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import PropTypes from 'prop-types';
const LogoutDialog = ({ open, onClose, onConfirm }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            disableescapekeydown="true"
            disablebackdropclick="true"
        >
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to log out?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="primary">
                    Logout
                </Button>
            </DialogActions>
        </Dialog>
    );
};

LogoutDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired
}

export default LogoutDialog;