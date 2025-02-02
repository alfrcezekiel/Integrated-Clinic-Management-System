import TextField from "@mui/material/TextField";

export default function RegisterTextFieldPhoneNumber(){
    return (
        <TextField
            variant="outlined"
            id="outlined-required"
            label="Enter Phone Number"
            required
            type="number"
        />
    )
}