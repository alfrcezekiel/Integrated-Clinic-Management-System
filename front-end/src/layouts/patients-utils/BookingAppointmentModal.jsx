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
    LocationOn,
    Email,
    MedicalServices,
    CalendarMonth,
    AccessTime,
} from '@mui/icons-material';
import {
    useMemo,
    useCallback
} from 'react';
import PropTypes from 'prop-types';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { PhilippinePeso } from 'lucide-react';
import Phone from "@mui/icons-material/Phone"

const BookingAppointmentModal = ({ selectedClinic, handleCloseModal, handleBooking, appointmentData, setAppointmentData, fieldErrors, setFieldErrors, appointmentID }) => {
    const memoizedFirstNameValue = useMemo(() => appointmentData.firstName, [appointmentData.firstName]);
    const memoizedLastNameValue = useMemo(() => appointmentData.lastName, [appointmentData.lastName]);
    const memoizedEmailValue = useMemo(() => appointmentData.email, [appointmentData.email]);
    const memoizedPhoneNumberValue = useMemo(() => appointmentData.phoneNumber, [appointmentData.phoneNumber]);
    const memoizedGenderValue = useMemo(() => appointmentData.gender, [appointmentData.gender]);
    const memoizedAppointmentDateValue = useMemo(() => {
        const date = new Date(appointmentData.appointmentDate);
        if (isNaN(date.getTime())) {
            return null;
        }
        return dayjs(date);
    }, [appointmentData.appointmentDate]);
    const memoizedPreferredTimeValue = useMemo(() => appointmentData.preferredTime, [appointmentData.preferredTime]);
    const memoizedPurposeOfAppointmentValue = useMemo(() => appointmentData.purposeOfAppointment, [appointmentData.purposeOfAppointment]);

    const handleInputChange = useCallback(async (e) => {
        const { name, value } = e.target;
        setAppointmentData({
            ...appointmentData,
            [name]: value
        });

        if (fieldErrors[name]) {
            setFieldErrors({
                ...fieldErrors,
                [name]: ""
            });
        }
    }, [appointmentData, fieldErrors, setAppointmentData, setFieldErrors]);

    const handleDateChange = useCallback(async (newDate) => {
        setAppointmentData({
            ...appointmentData,
            appointmentDate: newDate && dayjs(newDate) ? newDate : ""
        });

        if (fieldErrors.appointmentDate) {
            setFieldErrors({
                ...fieldErrors,
                appointmentDate: ""
            });
        }
    }, [appointmentData, fieldErrors, setAppointmentData, setFieldErrors]);

    const gender = ["Male", "Female"];
    const purposeOfAppointment = ["Regular Checkup", "Consultation", "Follow-up", "Emergency", "Urgent Care", "Other"];

    const formatTimeToAMPM = (time) => {
        if (!time) return "N/A";

        // Check if time is already in AM/PM format
        if (time.includes("AM") || time.includes("PM")) {
            return time;
        }

        try {
            // Handle 24-hour format (e.g., "14:30")
            const [hours, minutes] = time.split(":");
            let hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? "PM" : "AM";

            // Convert to 12-hour format
            hour = hour % 12;
            hour = hour ? hour : 12; // Convert 0 to 12

            return `${hour}:${minutes || "00"} ${ampm}`;
        } catch (error) {
            console.error("Error formatting time:", error);
            return time; // Return original if parsing fails
        }
    };
    
    return (
        <Modal open={!!selectedClinic} onClose={handleCloseModal}>
            <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-2xl shadow-lg w-full max-w-[50vw] max-h-[80vh] overflow-y-auto">
                {selectedClinic && (
                    <>
                        {/* Clinic Details Section */}
                        <div className="flex mb-6">
                            {/* Left side - Clinic Image */}
                            <div className="w-1/3 mr-10">
                                <CardMedia
                                    component="img"
                                    height="200"
                                    src={`http://localhost:7506/uploads/clinic_images/${selectedClinic.clinic_image}`}
                                    alt="Clinic"
                                    className="rounded-md h-48 object-cover"
                                />
                            </div>

                            {/* Right side - Clinic Information */}
                            <div className="w-2/5">
                                <Typography variant="h5" className="font-semibold text-blue-800 mb-2">
                                    {selectedClinic.clinic_name}
                                </Typography>
                                <div className="flex items-center text-gray-700 mb-1">
                                    <LocationOn className="mr-2 text-blue-600" />
                                    <Typography variant="body1">{selectedClinic.clinic_address}</Typography>
                                </div>
                                <div className="flex items-center text-gray-700 mb-1">
                                    <Phone className="mr-2 text-blue-600" />
                                    <Typography variant="body1">{selectedClinic.phoneNumber}</Typography>
                                </div>
                                <div className="flex items-center text-gray-700 mb-1">
                                    <Email className="mr-2 text-blue-600" />
                                    <Typography variant="body1">{selectedClinic.email}</Typography>
                                </div>
                                <div className="flex items-center text-gray-700 mb-1">
                                    <AccessTime className="mr-2  text-blue-600" />
                                    <Typography variant="body1">
                                        Opening Days: {selectedClinic.clinic_date_open ? selectedClinic.clinic_date_open : ""} - {selectedClinic.clinic_close_date ? selectedClinic.clinic_close_date : ""}
                                    </Typography>
                                </div>
                                <div className="flex items-center text-gray-700 mb-1">
                                    <AccessTime className="mr-2 text-blue-600" />
                                    <Typography variant="body1">
                                        Operating Hours: {formatTimeToAMPM(selectedClinic.clinic_time) ? formatTimeToAMPM(selectedClinic.clinic_time) : ""} - {formatTimeToAMPM(selectedClinic.clinic_close_time) ? formatTimeToAMPM(selectedClinic.clinic_close_time) : ""}
                                    </Typography>
                                </div>
                                <div className="flex items-center text-gray-700 mb-1">
                                    <PhilippinePeso className="mr-2 text-blue-600"/>
                                    <Typography variant="body1">Consultation Fee: {selectedClinic.consultation_fee}</Typography>
                                </div>
                                <div className="flex items-center text-gray-700 mb-1">
                                    <MedicalServices className="mr-2 text-blue-600" />
                                    <Typography variant="body1">Clinic Type: {selectedClinic.clinic_type}</Typography>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <form onSubmit={handleBooking} id='bookingForm'>
                                <div className="hidden">
                                    <TextField
                                        value={appointmentID}
                                        name="appointmentID"
                                    />
                                </div>

                                {/* Form Layout - Top Row */}
                                <div className="grid grid-cols-3 gap-6 cursor-pointer">
                                    {/* First Name */}
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="First Name"
                                        variant="outlined"
                                        name="firstName"
                                        placeholder="Enter first name"
                                        autoComplete="off"
                                        value={memoizedFirstNameValue}
                                        onChange={handleInputChange}
                                        error={Boolean(fieldErrors.firstName)}
                                        helperText={fieldErrors.firstName ? fieldErrors.firstName : ""}
                                    />

                                    {/* Last Name */}
                                    <TextField
                                        margin="dense"
                                        fullWidth
                                        label="Last Name"
                                        variant="outlined"
                                        autoComplete="off"
                                        placeholder="Enter last name"
                                        value={memoizedLastNameValue}
                                        onChange={handleInputChange}
                                        error={Boolean(fieldErrors.lastName)}
                                        helperText={fieldErrors.lastName ? fieldErrors.lastName : ""}
                                        name="lastName"
                                    />

                                    {/* Email Address */}
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        type="email"
                                        margin="dense"
                                        autoComplete="off"
                                        variant="outlined"
                                        placeholder="Enter email address"
                                        error={Boolean(fieldErrors.email)}
                                        helperText={fieldErrors.email ? fieldErrors.email : ""}
                                        value={memoizedEmailValue}
                                        name="email"
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Form Layout - Middle Row */}
                                <div className="grid grid-cols-3 gap-6 mt-6">
                                    {/* Phone Number */}
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="Phone Number"
                                        name="phoneNumber"
                                        placeholder="Enter phone number"
                                        autoComplete="off"
                                        type="number"
                                        variant="outlined"
                                        value={memoizedPhoneNumberValue}
                                        onChange={handleInputChange}
                                        error={Boolean(fieldErrors.phoneNumber)}
                                        helperText={fieldErrors.phoneNumber ? fieldErrors.phoneNumber : ""}
                                    />

                                    {/* Gender Selection */}
                                    <TextField
                                        select
                                        placeholder="Select a Gender"
                                        fullWidth
                                        margin="dense"
                                        label="Select a Gender"
                                        autoComplete="off"
                                        name="gender"
                                        variant="outlined"
                                        onChange={handleInputChange}
                                        value={memoizedGenderValue}
                                        error={Boolean(fieldErrors.gender)}
                                        helperText={fieldErrors.gender ? fieldErrors.gender : ""}
                                    >
                                        {gender.map((gender, i) => (
                                            <MenuItem key={i} value={gender}>{gender}</MenuItem>
                                        ))}
                                    </TextField>

                                    {/* Date of Appointment */}
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DatePicker']}>
                                            <DatePicker
                                                className="w-full"
                                                margin="dense"
                                                label="Select Date of Appointment"
                                                placeholder="Select date of appointment"
                                                name="appointmentDate"
                                                onChange={handleDateChange}
                                                value={memoizedAppointmentDateValue}
                                                slotProps={{
                                                    textField: {
                                                        className: "w-full",
                                                        variant: "outlined",
                                                        fullWidth: true,
                                                        error: Boolean(fieldErrors.appointmentDate),
                                                        helperText: fieldErrors.appointmentDate ? fieldErrors.appointmentDate : "",
                                                    },
                                                }}
                                            />
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </div>

                                {/* Form Layout - Bottom Row */}
                                <div className="grid grid-cols-3 gap-6 mt-6">
                                    {/* Preferred Time */}
                                    <TextField
                                        fullWidth
                                        label="Select Appointment Time"
                                        variant="outlined"
                                        margin="dense"
                                        className="w-full"
                                        autoComplete="off"
                                        placeholder="Select appointment time"
                                        name="preferredTime"
                                        type="time"
                                        InputLabelProps={{ shrink: true }}
                                        value={memoizedPreferredTimeValue}
                                        onChange={handleInputChange}
                                        error={Boolean(fieldErrors.preferredTime)}
                                        helperText={fieldErrors.preferredTime ? fieldErrors.preferredTime : ""}
                                    />

                                    {/* Purpose of Appointment */}
                                    <TextField
                                        fullWidth
                                        select
                                        margin="dense"
                                        label="Purpose of Appointment"
                                        variant="outlined"
                                        autoComplete="off"
                                        placeholder="Enter purpose of appointment"
                                        name="purposeOfAppointment"
                                        error={Boolean(fieldErrors.purposeOfAppointment)}
                                        helperText={fieldErrors.purposeOfAppointment ? fieldErrors.purposeOfAppointment : ""}
                                        value={memoizedPurposeOfAppointmentValue}
                                        onChange={handleInputChange}
                                    >
                                        {purposeOfAppointment.map((purpose) => (
                                            <MenuItem key={purpose} value={purpose}>{purpose}</MenuItem>
                                        ))}
                                    </TextField>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between mt-8">
                                    <Button
                                        onClick={handleCloseModal}
                                        variant="outlined"
                                        className="border-gray-400 text-gray-700"
                                    >
                                        Close
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        startIcon={<CalendarMonth />}
                                    >
                                        Confirm Book Appointment
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </Box>
        </Modal>
    );
};

BookingAppointmentModal.propTypes = {
    selectedClinic: PropTypes.object.isRequired,
    handleCloseModal: PropTypes.func.isRequired,
    handleBooking: PropTypes.func.isRequired,
    appointmentData: PropTypes.object.isRequired,
    setAppointmentData: PropTypes.func.isRequired,
    fieldErrors: PropTypes.object.isRequired,
    setFieldErrors: PropTypes.func.isRequired,
    appointmentID: PropTypes.string.isRequired,
};

export default BookingAppointmentModal;