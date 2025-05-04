import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    CircularProgress
} from '@mui/material';
import PropTypes from 'prop-types';
import {
    useEffect,
    useState
} from 'react';
import CMS from "../../../API/CMS";

const ConfirmPaymentDialogBox = ({ open, onClose, onNextStep }) => {
    const [paymentData, setPaymentData] = useState({
        id: "",
        mode_of_payment: "",
        payment_status: "",
        payment_date: "",
        cardholder_name: "",
        first_name: "",
        last_name: "",
        email: "",
        amount: 0,
        card_number: "",
        expiry_date: ""
    })
    const [loading, setLoading] = useState(false);

    const isPaidCash = paymentData?.mode_of_payment === 'Cash' && paymentData?.payment_status === "Paid";
    const isPaidCard = paymentData?.mode_of_payment === 'Card' && paymentData?.payment_status === "Paid";

    const dateFormat = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    };

    useEffect(() => {
        const retrievedConfirmedPaymentDetails = async () => {
            try {
                setLoading(true);
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
    
                if (response.status === 200) {
                    const paymentDetails = response.data.paymentConfirmationDetails;
    
                    setPaymentData((prev) => ({
                        ...prev,
                        id: paymentDetails.at(-1)?.id,
                        amount: paymentDetails.at(-1)?.amount,
                        first_name: paymentDetails.at(-1)?.first_name,
                        last_name: paymentDetails.at(-1)?.last_name,
                        email: paymentDetails.at(-1)?.email,
                        mode_of_payment: paymentDetails.at(-1)?.mode_of_payment,
                        payment_status: paymentDetails.at(-1)?.payment_status,
                        payment_date: paymentDetails.at(-1)?.payment_date,
                        cardholder_name: paymentDetails.at(-1)?.cardholder_name,
                        card_number: paymentDetails.at(-1)?.card_number,
                        expiry_date: paymentDetails.at(-1)?.expiry_date
                    })); // Assuming you want the first payment detail
                }
            } catch (error) {
                console.error("Error retrieving patients details in retrievedConfirmedPaymentDetails component:", error);
            } finally {
                setLoading(false);
            }
        }

        if (open) {
            retrievedConfirmedPaymentDetails();
        }
    }, [open, onNextStep]);

    return (
        <Dialog
            open={open}
            onClose={(e, reason) => {
                e.preventDefault();
                if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
                    onClose();
                }
            }}
            disableEscapeKeyDown
            maxWidth="sm"
            fullWidth
        >
            <div className="bg-white rounded-xl shadow-lg w-full">
                <DialogTitle className="text-2xl font-semibold text-center">
                    Confirmed Your Payment
                </DialogTitle>

                <DialogContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <CircularProgress size={24} className="text-purple-500" />
                            <p className="text-white">Loading payment details</p>
                        </div>
                    ) : isPaidCash ? (
                        <div className="border rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-bold mb-4">Details</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="font-medium"> Payment Date:</span>
                                    <span className="text-gray-700">{dateFormat(paymentData.payment_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Payment Status:</span>
                                    <span className="text-gray-700">{paymentData.payment_status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Payment Method:</span>
                                    <span className="text-gray-700">{paymentData.mode_of_payment}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Name:</span>
                                    <span className="text-gray-700">{`${paymentData?.first_name} ${paymentData?.last_name}`}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Email:</span>
                                    <span className="text-gray-700">{paymentData.email}</span>
                                </div>
                            </div>
                        </div>
                    ) : isPaidCard ? (
                        <div className="border rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-bold mb-4">Details</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="font-medium">Payment Date:</span>
                                    <span className="text-gray-700">{dateFormat(paymentData.payment_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Payment Status:</span>
                                    <span className="text-gray-700">{paymentData.payment_status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Payment Method:</span>
                                    <span className="text-gray-700">{paymentData.mode_of_payment}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Card Holder Name:</span>
                                    <span className="text-gray-700">{paymentData.cardholder_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Email:</span>
                                    <span className="text-gray-700">{paymentData.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Card Number:</span>
                                    <span className="text-gray-700">
                                        **** **** **** {paymentData.card_number?.slice(-4)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Expiry Date:</span>
                                    <span className="text-gray-700">{paymentData.expiry_date}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 p-4">
                            <p>No payment details available for the selected mode of payment or status.</p>
                        </div>
                    )}

                    {paymentData?.amount && (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg font-semibold">Total Amount:</span>
                                <span className="text-xl font-bold text-green-600">₱{paymentData.amount.toFixed(2)}</span>
                            </div>

                            <div className="text-center text-black mt-4 space-y-2">
                                <p className="font-medium">
                                    Your payment has been successfully processed. Please keep a copy of your payment confirmation for reference.
                                </p>
                                <p className="font-medium">
                                    We kindly ask that you arrive at the clinic 15 - 30 minutes early on the day of your appointment to allow for check-in and any necessary preparations.
                                </p>
                            </div>
                        </>
                    )}
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
                        variant="contained"
                        color="primary"
                        onClick={onNextStep}
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
    onNextStep: PropTypes.func.isRequired
};

export default ConfirmPaymentDialogBox;
