import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from "@mui/material";
import PropTypes from "prop-types";

// function to render the delete confirmation modal
const DeleteConfirmationDialog = ({ open, onClose, onConfirm, users }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
                Are you sure you want to delete {users?.firstName} {users?.lastName}?
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

DeleteConfirmationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    users: PropTypes.object.isRequired
}

export default DeleteConfirmationDialog;