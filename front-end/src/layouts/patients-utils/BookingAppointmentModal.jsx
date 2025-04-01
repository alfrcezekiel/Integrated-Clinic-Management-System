import {
    Modal,
    Box,
    Typography,
    Button,
    TextField,
    MenuItem,
    CardMedia,
} from '@mui/material';
import {
    LocalHospital,
    LocationOn,
    Email,
    MedicalServices,
    CalendarMonth
} from '@mui/icons-material';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const BookingAppointmentModal = ({ selectedClinic, handleCloseModal, handleBooking, appointmentData, setAppointmentData, fieldErrors, setFieldErrors, appointmentID }) => {
    const memoizedFirstNameValue = useMemo(() => appointmentData.firstName, [appointmentData.firstName]);
    const memoizedLastNameValue = useMemo(() => appointmentData.lastName, [appointmentData.lastName]);
    const memoizedEmailValue = useMemo(() => appointmentData.email, [appointmentData.email]);
    const memoizedPhoneNumberValue = useMemo(() => appointmentData.phoneNumber, [appointmentData.phoneNumber]);
    const memoizedGenderValue = useMemo(() => appointmentData.gender, [appointmentData.gender])
    const memoizedAppointmentDateValue = useMemo(() => {
        const date = new Date(appointmentData.appointmentDate);
        // Check if the date is valid before formatting it
        if (isNaN(date.getTime())) {
            return null; // Return empty string if invalid date
        }
        return date;
    }, [appointmentData.appointmentDate]);
    const memoizedPreferredDaysValue = useMemo(() => appointmentData.preferredDays, [appointmentData.preferredDays]);
    const memoizedPreferredTimeValue = useMemo(() => appointmentData.preferredTime, [appointmentData.preferredTime]);
    const memoizedPurposeOfAppointmentValue = useMemo(() => appointmentData.purposeOfAppointment, [appointmentData.purposeOfAppointment]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAppointmentData({
            ...appointmentData,
            [name]: value
        })

        if (fieldErrors[name]) {
            setFieldErrors({
                ...fieldErrors,
                [name]: ""
            })
        }
    }
    // Date change handler for DatePicker
    const handleDateChange = (newDate) => {
        setAppointmentData({
            ...appointmentData,
            appointmentDate: newDate ? newDate.toISOString().split('T')[0] : ''
        });
    };

    return (
        <Modal open={!!selectedClinic} onClose={handleCloseModal}>
            <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl shadow-lg w-screen max-w-[50vw] max-h-[80vh] overflow-y-auto">
                {selectedClinic && (
                    <>
                        {/* Clinic Details */}
                        <div className="flex justify-between items-center">
                            <Typography variant="h6" className="font-bold text-blue-800 flex items-center">
                                <LocalHospital className="mr-2 text-red-600" /> {selectedClinic.clinic_name}
                            </Typography>
                            <Button onClick={handleCloseModal} color="primary" variant="contained">
                                Close
                            </Button>
                        </div>

                        <CardMedia
                            component="img"
                            height="160"
                            image={selectedClinic.image}
                            alt="Clinic"
                            className="rounded-md mt-2"
                        />

                        <div className="flex items-center text-gray-700 mt-2">
                            <LocationOn className="mr-2 text-blue-600" />
                            <Typography variant="body2">{selectedClinic.clinic_address}</Typography>
                        </div>

                        <div className="flex items-center text-blue-600 mt-2">
                            <Email className="mr-2" />
                            <Typography variant="body2">{selectedClinic.email}</Typography>
                        </div>

                        <div className="flex items-center text-green-600 mt-2">
                            <MedicalServices className="mr-2" />
                            <Typography variant="body2">{selectedClinic.clinic_type}</Typography>
                        </div>

                        <div className="flex items-center text-gray-700 mt-2">
                            <Typography variant="body2">Consultation Fee</Typography>
                        </div>

                        <div className="flex items-center text-gray-700 mt-2">
                            <Typography variant="body2">Medical Specialties</Typography>
                        </div>

                        <form onSubmit={handleBooking}>
                            <div className="mt-2">
                                <TextField
                                    hidden
                                    value={appointmentID}
                                    name="appointmentID"
                                    margin="dense"
                                />
                            </div>
                            <div className="mt-2">
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    variant="outlined"
                                    name="firstName"
                                    autoComplete="off"
                                    margin="dense"
                                    value={memoizedFirstNameValue}
                                    onChange={handleInputChange}
                                    error={Boolean(fieldErrors.firstName)}
                                    helperText={fieldErrors.firstName ? fieldErrors.firstName : ""}
                                />
                            </div>

                            {/* Last Name */}
                            <div className="mt-2">
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    variant="outlined"
                                    autoComplete="off"
                                    margin="dense"
                                    value={memoizedLastNameValue}
                                    onChange={handleInputChange}
                                    error={Boolean(fieldErrors.lastName)}
                                    helperText={fieldErrors.lastName ? fieldErrors.lastName : ""}
                                    name="lastName"
                                />
                            </div>

                            {/* Email Address */}
                            <div className="mt-2">
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="text"
                                    autoComplete="off"
                                    variant="outlined"
                                    margin="dense"
                                    error={Boolean(fieldErrors.email)}
                                    helperText={fieldErrors.email ? fieldErrors.email : ""}
                                    value={memoizedEmailValue}
                                    name="email"
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="mt-2">
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phoneNumber"
                                    autoComplete="off"
                                    type="number"
                                    variant="outlined"
                                    margin="dense"
                                    value={memoizedPhoneNumberValue}
                                    onChange={handleInputChange}
                                    error={Boolean(fieldErrors.phoneNumber)}
                                    helperText={fieldErrors.phoneNumber ? fieldErrors.phoneNumber : ""}
                                />
                            </div>

                            {/* Gender Selection */}
                            <div className="mt-2">
                                <TextField
                                    select
                                    autoComplete="off"
                                    fullWidth
                                    label="Gender"
                                    name="gender"
                                    variant="outlined"
                                    margin="dense"
                                    error={Boolean(fieldErrors.gender)}
                                    helperText={fieldErrors.gender ? fieldErrors.gender : ""}
                                    value={memoizedGenderValue}
                                    onChange={handleInputChange}
                                >
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                </TextField>
                            </div>

                            {/* Date of Appointment */}
                            <div className="mt-2">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DatePicker']}>
                                        <DatePicker
                                            fullWidth
                                            autoComplete="off"
                                            name="dateOfAppointment"
                                            label="Date of Appointment"
                                            margin="dense"
                                            variant="outlined"
                                            onChange={handleDateChange}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    margin="dense"
                                                    variant="outlined"
                                                    error={Boolean(fieldErrors.appointmentDate)}
                                                    helperText={fieldErrors.appointmentDate ? fieldErrors.appointmentDate : ""}
                                                />
                                            )}
                                            InputLabelProps={{ shrink: true }}
                                            value={memoizedAppointmentDateValue}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </div>

                            <div className="mt-2">
                                <TextField
                                    fullWidth
                                    label="Preffered Days"
                                    autoComplete="off"
                                    margin="dense"
                                    name="preferredDays"
                                    variant="outlined"
                                    value={memoizedPreferredDaysValue}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Monday to Friday"
                                    className="mt-2"
                                    error={Boolean(fieldErrors.preferredDays)}
                                    helperText={fieldErrors.preferredDays ? fieldErrors.preferredDays : ""}
                                />
                            </div>

                            <div className="mt-2">
                                <TextField
                                    fullWidth
                                    label="Preferred Time"
                                    variant="outlined"
                                    margin="dense"
                                    autoComplete="off"
                                    name="preferredTime"
                                    type="time"
                                    InputLabelProps={{ shrink: true }}
                                    value={memoizedPreferredTimeValue}
                                    onChange={handleInputChange}
                                    className="mt-2"
                                    error={Boolean(fieldErrors.preferredTime)}
                                    helperText={fieldErrors.preferredTime ? fieldErrors.preferredTime : ""}
                                />
                            </div>
                            {/* Purpose of Appointment */}
                            <div className="mt-2">
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    label="Purpose of Appointment"
                                    variant="outlined"
                                    autoComplete="off"
                                    multiline
                                    name="purposeOfAppointment"
                                    error={Boolean(fieldErrors.purposeOfAppointment)}
                                    helperText={fieldErrors.purposeOfAppointment ? fieldErrors.purposeOfAppointment : ""}
                                    rows={3}
                                    value={memoizedPurposeOfAppointmentValue}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Confirm Button - Inside Form */}
                            <div className="flex justify-center mt-6">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                                    startIcon={<CalendarMonth />}
                                >
                                    Confirm Appointment
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </Box>
        </Modal>
    )
}

BookingAppointmentModal.propTypes = {
    selectedClinic: PropTypes.object.isRequired,
    handleCloseModal: PropTypes.func.isRequired,
    handleBooking: PropTypes.func.isRequired,
    appointmentData: PropTypes.object.isRequired,
    setAppointmentData: PropTypes.func.isRequired,
    fieldErrors: PropTypes.object.isRequired,
    setFieldErrors: PropTypes.func.isRequired,
    appointmentID: PropTypes.string.isRequired,
}
export default BookingAppointmentModal;