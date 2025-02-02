import TextField from "@mui/material/TextField";

function RegisterTextFieldFirstName(){
    return (
        <TextField
            variant="outlined"
            label="Enter First Name"
            required
            type="text"
        />
    )
}

export default RegisterTextFieldFirstName;