import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// Removed invalid import
import "../App.css";
import PropTypes from 'prop-types';
import dayjs from "dayjs";
function RegisterDateOfBirth({ value, onChange }) {
    const dateValue = value ? dayjs(value) : null;

    const handleDateChange = (newDateValue) => {
        onChange(newDateValue ? newDateValue.format("MM/DD/YYYY") : "");
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker label="Enter Date of Birth" id="date-of-birth" value={dateValue} onChange={handleDateChange} />
        </LocalizationProvider>
    )
}

RegisterDateOfBirth.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default RegisterDateOfBirth;