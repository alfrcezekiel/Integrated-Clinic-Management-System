import TextField from '@mui/material/TextField';
import Box from "@mui/material/Box";
import "../App.css";

export default function InputEmail() {
    return (
        <TextField
            required
            id="outlined"
            label="Enter Email"
            variant="outlined"
            className="input-email"
            type="text"
        />
    )
}