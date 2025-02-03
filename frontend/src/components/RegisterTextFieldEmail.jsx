import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";

export default function RegisterTextFieldEmail({value, onChange}){
    return (
        <TextField
            variant="outlined"
            required
            label="Enter Email"
            type="text"
            id="email"
            value={value}
            onChange={onChange}
            sx={{width: "50vh"}}
        />
    );
}

RegisterTextFieldEmail.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}