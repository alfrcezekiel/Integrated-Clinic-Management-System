import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button
} from '@mui/material';
import PropTypes from 'prop-types';
import {
    useEffect,
    useState
} from 'react';
import CMS from "../../../API/CMS";

const ConfirmPaymentDialogBox = ({ open, onClose }) => {
    const [paymentData, setPaymentData] = useState({
        amount: "",
        first_name: "",
        last_name: "",
        email: "",
        mode_of_payment: "",
        payment_date: "",
        payment_status: "",
        cardholder_name: ""
    });

    const retrievedConfirmedPaymentDetails = async () => {
        try {
            const patientID = localStorage.getItem("sid")

            if (!patientID) {
                console.error("Patient ID is missing. Unable to retrieve payment details.");
                return;
            }

            const response = await CMS.get(`/CMS/patients-dashboard/retrievedConfirmedPaymentDetails/${patientID}`, {
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (response.status === 200 && response.data) {
                const paymentDetails = response.data.paymentConfirmationDetails;
                const data = Array.isArray(paymentDetails) ? paymentDetails : paymentDetails;

                if(data){
                    setPaymentData((prevData) => ({
                        ...prevData,
                        amount: data.amount,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        email: data.email,
                        mode_of_payment: data.mode_of_payment,
                        payment_date: data.payment_date,
                        payment_status: data.payment_status,
                        cardholder_name: data.cardholder_name
                    }));
                }
            }
        } catch (error) {
            console.error("Error retrieving patients details in retrievedConfirmedPaymentDetails component:", error);
        }
    }

    useEffect(() => {
        const fetchPaymentData = async () => {
            await retrievedConfirmedPaymentDetails();
        };

        fetchPaymentData();
    }, []);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <div className="bg-white rounded-xl shadow-lg w-full">
                <DialogTitle className="text-2xl font-semibold text-center">
                    Confirmed Your Payment
                </DialogTitle>

                <DialogContent>
                    {paymentData?.mode_of_payment === 'Card' && paymentData?.payment_status === "Paid" ? (
                        <div className="border rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-bold mb-4">Details</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="font-medium">Date:</span>
                                    <span className="text-gray-700">{paymentData?.payment_date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Payment Status:</span>
                                    <span className="text-gray-700">{paymentData?.payment_status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Payment Method:</span>
                                    <span className="text-gray-700">{paymentData?.mode_of_payment}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Name:</span>
                                    <span className="text-gray-700">{paymentData?.cardholder_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Email:</span>
                                    <span className="text-gray-700">{paymentData?.email}</span>
                                </div>
                            </div>
                        </div>
                    ) : paymentData?.mode_of_payment === 'Cash' && paymentData?.payment_status === "Paid" ? (
                        <div className="border rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-bold mb-4">Details</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="font-medium">Date:</span>
                                    <span className="text-gray-700">{paymentData?.payment_date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Payment Status:</span>
                                    <span className="text-gray-700">{paymentData?.payment_status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Payment Method:</span>
                                    <span className="text-gray-700">{paymentData?.mode_of_payment}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Name:</span>
                                    <span className="text-gray-700">{`${paymentData?.first_name} ${paymentData?.last_name}`}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Email:</span>
                                    <span className="text-gray-700">{paymentData?.email}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 p-4">
                            <p>No payment details available for the selected mode of payment or status.</p>
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-semibold">Total Amount:</span>
                        <span className="text-xl font-bold text-green-600">${paymentData.amount}</span>
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
