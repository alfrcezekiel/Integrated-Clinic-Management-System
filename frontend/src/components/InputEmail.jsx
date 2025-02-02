import TextField from '@mui/material/TextField';
import "../App.css";

export default function InputEmail() {
    return (
        <TextField
            required
            id="outlined-required"
            label="Enter Email"
            variant="outlined"
            className="input-email"
            type="text"
        />
    )
}