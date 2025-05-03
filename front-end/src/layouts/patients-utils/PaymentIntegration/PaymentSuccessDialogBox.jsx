import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PropTypes from "prop-types";

const PaymentSuccessDialogBox = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <div className="relative p-4">
          <div className="flex flex-col items-center text-center p-6">
            <CheckCircleOutlineIcon className="text-green-500 text-2xl" />
            <DialogTitle className="text-lg font-semibold text-black">
                Payment Successful!
            </DialogTitle>
            <DialogContent className="px-2">
              <Typography className="text-gray-600">
                Thank you! Your payment was processed successfully.
              </Typography>
            </DialogContent>
            <DialogActions className="mt-4">
                <Button
                onClick={onClose}
                variant="contained"
                color="success"
                className="w-full"
                >
                Okay
              </Button>
            </DialogActions>
          </div>
      </div>
    </Dialog>
  );
};

PaymentSuccessDialogBox.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.bool.isRequired
}
export default PaymentSuccessDialogBox;