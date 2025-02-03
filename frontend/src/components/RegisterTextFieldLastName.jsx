import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";

export default function RegisterTextFieldLastName({value, onChange}){
    return (
        <TextField
            variant="outlined"
            label="Enter Last Name"
            required
            type="text"
            id="last-name"
            value={value}
            sx={{width: "50vh"}}
            onChange={onChange}
        />
    )
}

RegisterTextFieldLastName.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}