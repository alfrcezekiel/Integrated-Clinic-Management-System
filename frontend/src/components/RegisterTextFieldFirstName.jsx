import TextField from "@mui/material/TextField";
import "../App.css";    
import PropTypes from 'prop-types';

function RegisterTextFieldFirstName({value, onChange}){
    return (
        <TextField
            variant="outlined"
            label="Enter First Name"
            type="text"
            id="first-name"
            value={value}
            sx={{width: "50vh"}}
            onChange={onChange}
        />
    )
}
RegisterTextFieldFirstName.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default RegisterTextFieldFirstName;