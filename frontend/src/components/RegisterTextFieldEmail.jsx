import TextField from "@mui/material/TextField";

export default function RegisterTextFieldEmail(){
    return (
        <TextField
            variant="outlined"
            required
            label="Enter Email"
            type="text"
        />
    );
}