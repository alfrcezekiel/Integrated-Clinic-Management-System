import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button 
} from "@mui/material";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import PropTypes from "prop-types";

const UpdatingDoctorDetailsModal = ({ isOpen, onClose, message }) => {
    return (
        <Dialog 
            open={isOpen} 
            onClose={onClose} 
            className="flex items-center justify-center"
            PaperProps={{
                className: "flex flex-col items-center justify-center p-4 text-center w-full rounded-lg shadow-lg"
            }}
        >
            <DialogTitle className="text-xl font-semibold text-center">Success</DialogTitle>
            <DialogContent className="flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                    className="text-green-500 flex justify-center"
                >
                    <CheckCircle size={60} />
                </motion.div>
                <p className="mt-4 text-lg text-gray-700">{message}</p>
            </DialogContent>
            <DialogActions className="flex justify-center pb-4">
                <Button onClick={onClose} color="primary" variant="contained" className="bg-blue-500 hover:bg-blue-600 text-white">
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// validate the data type of props
UpdatingDoctorDetailsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
}

export default UpdatingDoctorDetailsModal;