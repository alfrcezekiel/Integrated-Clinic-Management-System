import TextField from "@mui/material/TextField";

export default function RegisterTextFieldLastName(){
    return (
        <TextField
            variant="outlined"
            label="Enter Last Name"
            required
            type="text"
        />
    )
}