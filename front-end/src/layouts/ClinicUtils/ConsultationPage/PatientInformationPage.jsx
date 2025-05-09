import {
    TextField
} from "@mui/material";
import PropTypes from "prop-types";
import dayjs from 'dayjs';
// Removed DemoContainer as it is not a public API
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

const PatientInformationStepper = ({ patientFormData, handleChange, fieldErrors, handleAppointmentDateChange, handleCallBackTimePickerChange }) => {
    return (
        <div className="space-y-2">
            <div className="block p-4 justify-start">
                <h3 className="font-semibold text-black text-2xl">Patient Information</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mt-4">
                <div>
                    <TextField
                        label="First Name"
                        placeholder="Enter First Name"
                        name="firstName"
                        value={patientFormData.firstName}
                        onChange={(e) => handleChange(e)}
                        autoComplete="off"
                        type="text"
                        error={!!fieldErrors.firstName}
                        helperText={fieldErrors.firstName ? fieldErrors.firstName : ""}
                        fullWidth
                    />
                </div>
                <div>
                    <TextField
                        label="Last Name"
                        placeholder="Enter Last Name"
                        name="lastName"
                        type="text"
                        value={patientFormData.lastName}
                        onChange={(e) => handleChange(e)}
                        autoComplete="off"
                        error={!!fieldErrors.lastName}
                        helperText={fieldErrors.lastName ? fieldErrors.lastName : ""}
                        fullWidth
                    />
                </div>
                <div>
                    <TextField
                        label="Email"
                        name="email"
                        type="text"
                        value={patientFormData.email}
                        onChange={(e) => handleChange(e)}
                        autoComplete="off"
                        error={!!fieldErrors.email}
                        helperText={fieldErrors.email ? fieldErrors.email : ""}
                        fullWidth
                    />
                </div>
                <div>
                    <TextField
                        label="Phone Number"
                        name="phoneNumber"
                        type="number"
                        value={patientFormData.phoneNumber}
                        onChange={(e) => handleChange(e)}
                        autoComplete="off"
                        error={!!fieldErrors.phoneNumber}
                        helperText={fieldErrors.phoneNumber ? fieldErrors.phoneNumber : ""}
                        fullWidth
                    />
                </div>
                <div>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div>
                            <DatePicker
                                label="Appointment Date"
                                name="appointmentDate"
                                value={patientFormData.appointmentDate ? dayjs(patientFormData.appointmentDate) : null}
                                onChange={(newValue) => handleAppointmentDateChange(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        margin: "dense",
                                        variant: "outlined",
                                        error: Boolean(fieldErrors.appointmentDate),
                                        helperText: fieldErrors.appointmentDate ? fieldErrors.appointmentDate : null,
                                    }
                                }}
                            />
                        </div>
                    </LocalizationProvider>
                </div>
                <div>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div>
                            <TimePicker
                                label="Appointment Time"
                                name="preferredTime"
                                value={patientFormData.preferredTime ? dayjs(patientFormData.preferredTime) : null}
                                onChange={(newValue) => handleCallBackTimePickerChange(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        margin: "dense",
                                        variant: "outlined",
                                        error: Boolean(fieldErrors.preferredTime),
                                        helperText: fieldErrors?.preferredTime ? fieldErrors.preferredTime : null,
                                    }
                                }}
                            />
                        </div>
                    </LocalizationProvider>
                </div>
            </div>
        </div>
    )
}

PatientInformationStepper.propTypes = {
    patientFormData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    fieldErrors: PropTypes.object.isRequired,
    handleAppointmentDateChange: PropTypes.func.isRequired,
    handleCallBackTimePickerChange: PropTypes.func.isRequired,
}

export default PatientInformationStepper;