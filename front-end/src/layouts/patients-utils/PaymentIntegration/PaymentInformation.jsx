import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    InputLabel,
    MenuItem,
    Select,
    FormControl
} from "@mui/material";
import { useState } from "react";
import PropTypes from "prop-types";

const PaymentInformation = ({ open, onBack }) => {
    const [paymentMode, setPaymentMode] = useState("");
    const [amount, setAmount] = useState("");

    return (
        <Dialog open={open} fullWidth maxWidth="sm">
            <DialogTitle>Payment Information</DialogTitle>
            <DialogContent>
                <div className="flex flex-col gap-4 mt-2">
                    {/* Payment Mode */}
                    <div>
                        <FormControl fullWidth>
                            <InputLabel>Choose Mode of Payment</InputLabel>
                            <Select
                                value={paymentMode}
                                label="Choose Mode of Payment"
                                onChange={(e) => setPaymentMode(e.target.value)}
                            >
                                <MenuItem value="">Select Payment</MenuItem>
                                <MenuItem value="cash">Cash</MenuItem>
                                <MenuItem value="card">Card</MenuItem>
                                <MenuItem value="upi">UPI</MenuItem>
                                <MenuItem value="netbanking">Net Banking</MenuItem>
                            </Select>
                        </FormControl>
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
                    {paymentMode === "card" && (
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
                    {paymentMode === "cash" && (
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-1/2">
                                <TextField fullWidth label="Full Name" placeholder="John Doe" />
                            </div>
                            <div className="w-full md:w-1/2">
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