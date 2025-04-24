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

const PaymentInformation = ({ open, onBack }) => {
    const modeOfPayment = ["Cash", "Card", "GCash"]

    const [paymentFormData, setPaymentFormData] = useState({
        paymentMode: "",
        amount: "",
        firstName: "",
        lastName: "",
        email: "",
        cardNumber: "",
        cardHolderName: "",
        expiryDate: "",
        cvv: ""
    })

    const handlePaymentChange = async (e) => {
        const { name, value } = e.target;

        setPaymentFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    }

    return (
        <Dialog open={open} fullWidth maxWidth="sm">
            <DialogTitle className="text-black text-center font-semibold">Payment Information</DialogTitle>
            <form>
                <DialogContent>
                    <div className="flex flex-col gap-4 mt-2">
                        {/* Payment Mode */}
                        <div className="w-full">
                            <TextField
                                fullWidth
                                select
                                label="Choose Mode of Payment"
                                name="paymentMode"
                                value={paymentFormData.paymentMode}
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
                        {paymentFormData.paymentMode === "Card" && (
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
                        {paymentFormData.paymentMode === "Cash" && (
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
                    <Button variant="contained" color="primary" disabled={!paymentFormData.paymentMode || !paymentFormData.amount}>
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