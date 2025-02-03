import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";

export default function RegisterTextFieldPhoneNumber({value, onChange}){
    return (
        <TextField
            variant="outlined"
            id="contact-number"
            label="Enter Phone Number"
            required
            type="number"
            value={value}
            onChange={onChange}
            sx={{width: "50vh"}}
        />
    )
}

RegisterTextFieldPhoneNumber.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}