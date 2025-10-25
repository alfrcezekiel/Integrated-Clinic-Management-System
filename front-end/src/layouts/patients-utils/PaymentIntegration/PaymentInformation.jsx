import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
} from "@mui/material";
import {
    useState,
    useEffect
} from "react";
import PropTypes from "prop-types";
import CMS from "../../../API/CMS";

const PaymentInformationDialog = ({ open, onBack, onNextStep }) => {
    const modeOfPayment = ["Cash", "Card", "GCash"]

    const [paymentFormData, setPaymentFormData] = useState({
        modeOfPayment: "",
        amount: "",
        appointmentID: "",
        firstName: "",
        lastName: "",
        email: "",
        cardNumber: "",
        cardHolderName: "",
        expiryDate: "",
        cvv: ""
    })
    const [errorPayment, setErrorPayment] = useState({
        modeOfPayment: "",
        amount: "",
        appointmentID: "",
        firstName: "",
        lastName: "",
        email: "",
        cardNumber: "",
        cardHolderName: "",
        expiryDate: "",
        cvv: ""
    })
    
    useEffect(() => {
        // this function is used to retrieve the patient details to render in the payment information dialog box input fields
        const retrievePatientDetailsToRenderInPaymentInformationDialogBox = async () => {
            try {
                const retrievePatientID = localStorage.getItem("sid")

                if (!retrievePatientID) return;

                const response = await CMS.get(`/patients-dashboard/retrievedPatientDetails/${retrievePatientID}`, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                })

                if (response.status === 200) {
                    const patientDetails = response.data.patientDetails;

                    setPaymentFormData((prevData) => ({
                        ...prevData,
                        firstName: patientDetails.at(-1)?.firstName,
                        lastName: patientDetails.at(-1)?.lastName,
                        email: patientDetails.at(-1)?.email,
                        amount: patientDetails.at(-1)?.consultation_fee
                    }))
                }
            } catch (error) {
                console.error(`Error retrieving patient details in retrieving patients details in payment informatin dialog component: ${error}`);
            }
        }
        
        if (open) {
            retrievePatientDetailsToRenderInPaymentInformationDialogBox();
            setErrorPayment({});
        }
    }, [open])

    const handlePaymentChange = async (e) => {
        const { name, value } = e.target;

        let formattedValue = value;

        if (name === "cardNumber") {
            // Remove all non-digit characters
            const digitsOnly = value.replace(/\D/g, "");

            // Limit to max 16 digits
            const trimmed = digitsOnly.substring(0, 16);

            // Add space every 4 digits (e.g., 1234 5678 9012 3456)
            formattedValue = trimmed.replace(/(.{4})/g, "$1 ").trim();
        }

        setPaymentFormData((prevData) => ({
            ...prevData,
            [name]: formattedValue,
        }))

        if(errorPayment[name]) {
            setErrorPayment((prevError) => ({
                ...prevError,
                [name]: "",
            }))
        }
    }

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            const appointmentID = localStorage.getItem("sid");
            if (!appointmentID) {
                throw new Error("Appointment ID is missing or invalid.");
            }

            const basePayload = {
                amount: paymentFormData.amount,
                appointmentID: appointmentID,
                modeOfPayment: paymentFormData.modeOfPayment,
                email: paymentFormData.email,
            }
        
            let payload = {
                ...basePayload,
            }

            if (paymentFormData.modeOfPayment === "Card") {
                Object.assign(payload, {
                    cardNumber: paymentFormData.cardNumber.replace(/\s/g, ""),
                    cardHolderName: paymentFormData.cardHolderName,
                    expiryDate: paymentFormData.expiryDate,
                    cvv: paymentFormData.cvv,
                });
            } else if (paymentFormData.modeOfPayment === "Cash") {
                Object.assign(payload, {
                    firstName: paymentFormData.firstName,
                    lastName: paymentFormData.lastName,
                });
            }

            const response = await CMS.post(`/patients-dashboard/payment`, payload, {
                headers: {
                    "Content-Type": "application/json",
                }
            })

            if (response.status === 200) {
                alert("Payment Successful")
                setPaymentFormData({
                    amount: "",
                    firstName: "",
                    lastName: "",
                    email: "",
                    modeOfPayment: "",
                    cardNumber: "",
                    cardHolderName: "",
                    expiryDate: "",
                    cvv: ""
                })
                onNextStep(paymentFormData);
            }

        } catch (error) {
            if(error.response && error.response.status === 400) {
                setErrorPayment(error.response.data.errors)
            } else {
                console.error(`Error submitting payment: ${error}`);
            }
        }
    }

    return (
        <Dialog open={open} fullWidth maxWidth="sm">
            <DialogTitle className="text-black text-center font-semibold">Payment Information</DialogTitle>
            <form onSubmit={handlePaymentSubmit} id="payment-form" className="flex flex-col gap-4">
                <DialogContent>
                    <div className="flex flex-col gap-4 mt-2">
                        {/* Payment Mode */}
                        <div className="w-full">
                            <TextField
                                fullWidth
                                select
                                label="Select Mode of Payment"
                                name="modeOfPayment"
                                placeholder="Select Mode of Payment"
                                value={paymentFormData.modeOfPayment}
                                onChange={handlePaymentChange}
                                variant="outlined"
                                className="text-black"
                                error={!!errorPayment.modeOfPayment}
                                helperText={errorPayment.modeOfPayment}
                            >
                                {modeOfPayment.map((mode) => (
                                    <MenuItem key={mode} value={mode}>
                                        {mode}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>

                        {/* Amount */}
                        <div className="w-full">
                            <TextField
                                fullWidth
                                label="Enter Amount"
                                placeholder="Enter Amount"
                                type="number"
                                name="amount"
                                value={paymentFormData.amount}
                                variant="outlined"
                                onChange={handlePaymentChange}
                                disabled
                                error={!!errorPayment.amount}
                                helperText={errorPayment.amount}
                                slotProps={{
                                    input: {
                                        style: { color: "gray" },
                                    },
                                    root: {
                                        sx: {
                                            "& .MuiInputLabel-root": {
                                                color: "gray",
                                            },
                                            "& .Mui-disabled": {
                                                WebkitTextFillColor: "black !important",
                                            },
                                        }
                                    }
                                }}
                            />
                        </div>

                        {/* Conditional Fields for Card */}
                        {paymentFormData.modeOfPayment === "Card" && (
                            <div className="flex flex-col gap-4">
                                <div className="w-full">
                                    <TextField
                                        fullWidth
                                        label="Enter Card Number"
                                        placeholder="1234 5678 9012 3456"
                                        type="text"
                                        name="cardNumber"
                                        value={paymentFormData.cardNumber}
                                        onChange={handlePaymentChange}
                                        error={!!errorPayment.cardNumber}
                                        helperText={errorPayment.cardNumber}
                                        slotProps={{
                                            input: {
                                                maxLength: 19
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="w-full md:w-1/2">
                                        <TextField
                                            fullWidth
                                            label="Enter Cardholder Name"
                                            placeholder="John Doe"
                                            type="text"
                                            name="cardHolderName"
                                            value={paymentFormData.cardHolderName}
                                            onChange={handlePaymentChange}
                                            error={!!errorPayment.cardHolderName}
                                            helperText={errorPayment.cardHolderName}
                                        />
                                    </div>
                                    <div className="w-full md:w-1/2">
                                        <TextField
                                            fullWidth
                                            label="Enter Email"
                                            placeholder="example@email.com"
                                            type="text"
                                            error={!!errorPayment.email}
                                            helperText={errorPayment.email}
                                            name="email"
                                            value={paymentFormData.email}
                                            onChange={handlePaymentChange}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="w-full md:w-1/2">
                                        <TextField
                                            fullWidth
                                            label="Enter Expiry Date"
                                            placeholder="MM/YY"
                                            type="text"
                                            error={!!errorPayment.expiryDate}
                                            helperText={errorPayment.expiryDate}
                                            name="expiryDate"
                                            value={paymentFormData.expiryDate}
                                            onChange={handlePaymentChange}
                                        />
                                    </div>
                                    <div className="w-full md:w-1/2">
                                        <TextField
                                            fullWidth
                                            label="Enter CVV"
                                            placeholder="123"
                                            error={!!errorPayment.cvv}
                                            helperText={errorPayment.cvv}
                                            type="number"
                                            name="cvv"
                                            value={paymentFormData.cvv}
                                            onChange={handlePaymentChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Conditional Fields for Cash */}
                        {paymentFormData.modeOfPayment === "Cash" && (
                            <div className="flex flex-col md:flex-col gap-4">
                                <div className="w-full md:w-1/1">
                                    <TextField
                                        fullWidth
                                        label="Enter First Name"
                                        placeholder="Enter First Name"
                                        name="firstName"
                                        error={!!errorPayment.firstName}
                                        helperText={errorPayment.firstName}
                                        type="text"
                                        value={paymentFormData.firstName}
                                        onChange={handlePaymentChange}
                                    />
                                </div>
                                <div className="w-full md:w-1/1">
                                    <TextField
                                        fullWidth
                                        label="Enter Last Name"
                                        error={!!errorPayment.lastName}
                                        helperText={errorPayment.lastName}
                                        type="text"
                                        placeholder="Enter Last Name"
                                        name="lastName"
                                        value={paymentFormData.lastName}
                                        onChange={handlePaymentChange}
                                    />
                                </div>
                                <div className="w-full md:w-1/1">
                                    <TextField
                                        fullWidth
                                        label="Enter Email"
                                        placeholder="Enter Email"
                                        error={!!errorPayment.email}
                                        helperText={errorPayment.email}
                                        type="text"
                                        name="email"
                                        value={paymentFormData.email}
                                        onChange={handlePaymentChange}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button 
                        variant="outlined"
                        onClick={onBack}
                        className="text-black"
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!paymentFormData.modeOfPayment || !paymentFormData.amount}
                        type="submit"
                    >
                        Submit Payment
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

PaymentInformationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onBack: PropTypes.func.isRequired,
    onNextStep: PropTypes.func.isRequired
}
export default PaymentInformationDialog;