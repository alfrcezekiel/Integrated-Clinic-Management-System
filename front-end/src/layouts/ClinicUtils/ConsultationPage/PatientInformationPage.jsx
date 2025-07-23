import { TextField } from "@mui/material";
import PropTypes from "prop-types";
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

const PatientInformationStepper = ({patientFormData, handleChange, fieldErrors, handleAppointmentDateChange, handleCallBackTimePickerChange}) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                    label="First Name"
                    placeholder="Enter First Name"
                    name="firstName"
                    value={patientFormData.firstName}
                    onChange={handleChange}
                    autoComplete="off"
                    type="text"
                    error={!!fieldErrors.firstName}
                    helperText={fieldErrors.firstName || ""}
                    fullWidth
                />
                <TextField
                    label="Last Name"
                    placeholder="Enter Last Name"
                    name="lastName"
                    value={patientFormData.lastName}
                    onChange={handleChange}
                    autoComplete="off"
                    type="text"
                    error={!!fieldErrors.lastName}
                    helperText={fieldErrors.lastName || ""}
                    fullWidth
                />
                <TextField
                    label="Email"
                    placeholder="Enter Email"
                    name="email"
                    value={patientFormData.email}
                    onChange={handleChange}
                    autoComplete="off"
                    type="text"
                    error={!!fieldErrors.email}
                    helperText={fieldErrors.email || ""}
                    fullWidth
                />
                <TextField
                    label="Phone Number"
                    placeholder="Enter Phone Number"
                    name="phoneNumber"
                    value={patientFormData.phoneNumber}
                    onChange={handleChange}
                    autoComplete="off"
                    type="number"
                    error={!!fieldErrors.phoneNumber}
                    helperText={fieldErrors.phoneNumber || ""}
                    fullWidth
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Appointment Date"
                        name="appointmentDate"
                        value={patientFormData.appointmentDate ? dayjs(patientFormData.appointmentDate) : null}
                        onChange={handleAppointmentDateChange}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                margin: "dense",
                                variant: "outlined",
                                error: Boolean(fieldErrors.appointmentDate),
                                helperText: fieldErrors.appointmentDate || null,
                            }
                        }}
                    />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                        label="Appointment Time"
                        name="preferredTime"
                        value={patientFormData.preferredTime ? dayjs(patientFormData.preferredTime) : null}
                        onChange={handleCallBackTimePickerChange}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                margin: "dense",
                                variant: "outlined",
                                error: Boolean(fieldErrors.preferredTime),
                                helperText: fieldErrors.preferredTime || null,
                            }
                        }}
                    />
                </LocalizationProvider>
            </div>
        </div>
    );
};

PatientInformationStepper.propTypes = {
    patientFormData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    fieldErrors: PropTypes.object.isRequired,
    handleAppointmentDateChange: PropTypes.func.isRequired,
    handleCallBackTimePickerChange: PropTypes.func.isRequired,
};

export default PatientInformationStepper;
