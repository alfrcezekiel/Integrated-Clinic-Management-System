import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
} from "@mui/material";
import { useState } from "react";
import PropTypes from "prop-types";
import CMS from "../../../API/CMS";
import { useNavigate } from "react-router-dom";

const PaymentInformation = ({ open, onBack }) => {
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

    const clearFieldsByModeOfPayment = {
        Card: ["firstName", "lastName", "email", "amount"],
        Cash: ["amount", "email", "cardNumber", "cardHolderName", "expiryDate", "cvv"]
    }

    const handlePaymentChange = async (e) => {
        const { name, value } = e.target;

        if (name === "modeOfPayment") {
            setPaymentFormData((prevData) => {
                const fieldsToClear = clearFieldsByModeOfPayment[value] || [];
                const clearedData = {...prevData };

                fieldsToClear.forEach((field) => {
                    clearedData[field] = ""; // Clear the specified fields
                })

                return {
                    ...clearedData,
                    modeOfPayment: value
                }
            })
        } else {
            setPaymentFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }))
        }
    }

    const navigate = useNavigate();

    const navigateToViewClinic = () => navigate("/patients-dashboard/View-Clinics")

    const handlePaymentSubmit = async (e) => {
        try {
            e.preventDefault();
            const appointmentID = localStorage.getItem("sid");
            if (!appointmentID) {
                throw new Error("Appointment ID is missing or invalid.");
            }

            const payload = {
                amount: paymentFormData.amount,
                appointmentID: appointmentID,
                firstName: paymentFormData.firstName,
                lastName: paymentFormData.lastName,
                email: paymentFormData.email,
                modeOfPayment: paymentFormData.modeOfPayment,
            };

            if (paymentFormData.modeOfPayment === "Card") {
                Object.assign(payload, {
                    cardNumber: paymentFormData.cardNumber,
                    cardHolderName: paymentFormData.cardHolderName,
                    expiryDate: paymentFormData.expiryDate,
                    cvv: paymentFormData.cvv,
                });
            }

            const response = await CMS.post(`CMS/patients-dashboard/payment`, payload, {
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
                navigateToViewClinic()
            }

        } catch (error) {
            console.error(`Error submitting payment: ${error}`);
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
                                label="Choose Mode of Payment"
                                name="modeOfPayment"
                                value={paymentFormData.modeOfPayment}
                                onChange={handlePaymentChange}
                                variant="outlined"
                                className="text-black"
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
                                        type="number"
                                        name="cardNumber"
                                        value={paymentFormData.cardNumber}
                                        onChange={handlePaymentChange}
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
                                        />
                                    </div>
                                    <div className="w-full md:w-1/2">
                                        <TextField
                                            fullWidth
                                            label="Enter Email"
                                            placeholder="example@email.com"
                                            type="text"
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
                                            label="Expiry Date"
                                            placeholder="MM/YY"
                                            type="text"
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
                                        type="text"
                                        value={paymentFormData.firstName}
                                        onChange={handlePaymentChange}
                                    />
                                </div>
                                <div className="w-full md:w-1/1">
                                    <TextField
                                        fullWidth
                                        label="Enetr Last Name"
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
                    <Button variant="outlined" color="secondary" onClick={onBack}>
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

PaymentInformation.propTypes = {
    open: PropTypes.bool.isRequired,
    onBack: PropTypes.func.isRequired,
}
export default PaymentInformation;