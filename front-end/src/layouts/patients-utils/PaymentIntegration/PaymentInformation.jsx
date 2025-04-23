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
    const [paymentMode, setPaymentMode] = useState("");
    const [amount, setAmount] = useState("");
    const modeOfPayment = ["Cash", "Card", "GCash"]

    return (
        <Dialog open={open} fullWidth maxWidth="sm">
            <DialogTitle className="text-black text-center font-semibold">Payment Information</DialogTitle>
            <DialogContent>
                <div className="flex flex-col gap-4 mt-2">
                    {/* Payment Mode */}
                    <div className="w-full">
                        <TextField
                            fullWidth
                            select
                            label="Choose Mode of Payment"
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}
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
                            label="Amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    {/* Conditional Fields for Card */}
                    {paymentMode === "Card" && (
                        <div className="flex flex-col gap-4">
                            <div className="w-full">
                                <TextField fullWidth label="Card Number" placeholder="1234 5678 9012 3456" />
                            </div>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="w-full md:w-1/2">
                                    <TextField fullWidth label="Cardholder Name" placeholder="John Doe" />
                                </div>
                                <div className="w-full md:w-1/2">
                                    <TextField fullWidth label="Email" placeholder="example@email.com" type="email" />
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="w-full md:w-1/2">
                                    <TextField fullWidth label="Expiry Date" placeholder="MM/YY" />
                                </div>
                                <div className="w-full md:w-1/2">
                                    <TextField fullWidth label="CVV" placeholder="123" type="password" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Conditional Fields for Cash */}
                    {paymentMode === "Cash" && (
                        <div className="flex flex-col md:flex-col gap-4">
                            <div className="w-full md:w-1/1">
                                <TextField fullWidth label="First Name" placeholder="John" />
                            </div>
                            <div className="w-full md:w-1/1">
                                <TextField fullWidth label="Last Name" placeholder="Doe" />
                            </div>
                            <div className="w-full md:w-1/1">
                                <TextField fullWidth label="Email" placeholder="example@email.com" type="email" />
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="secondary" onClick={onBack}>
                    Back
                </Button>
                <Button variant="contained" color="primary" disabled={!paymentMode || !amount}>
                    Submit Payment
                </Button>
            </DialogActions>
        </Dialog>
    );
};

PaymentInformation.propTypes = {
    open: PropTypes.bool.isRequired,
    onBack: PropTypes.func.isRequired,
}
export default PaymentInformation;