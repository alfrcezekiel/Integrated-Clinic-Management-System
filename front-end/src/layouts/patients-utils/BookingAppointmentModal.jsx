import {
    useMemo,
    useCallback
} from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { PhilippinePeso } from 'lucide-react';
import Phone from "@mui/icons-material/Phone"
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Calendar, Clock, MapPin, Mail, Stethoscope } from 'lucide-react';
const BookingAppointmentModal = ({ selectedClinic, handleCloseModal, handleBooking, appointmentData, setAppointmentData, fieldErrors, setFieldErrors, appointmentID }) => {
    const memoizedFirstNameValue = useMemo(() => appointmentData.firstName, [appointmentData.firstName]);
    const memoizedLastNameValue = useMemo(() => appointmentData.lastName, [appointmentData.lastName]);
    const memoizedEmailValue = useMemo(() => appointmentData.email, [appointmentData.email]);
    const memoizedPhoneNumberValue = useMemo(() => appointmentData.phoneNumber, [appointmentData.phoneNumber]);
    const memoizedGenderValue = useMemo(() => appointmentData.gender, [appointmentData.gender]);
    const memoizedAppointmentDateValue = useMemo(() => appointmentData.appointmentDate, [appointmentData.appointmentDate]);
    const memoizedPreferredTimeValue = useMemo(() => appointmentData.preferredTime, [appointmentData.preferredTime]);
    const memoizedPurposeOfAppointmentValue = useMemo(() => appointmentData.purposeOfAppointment, [appointmentData.purposeOfAppointment]);

    // function to handle text field input changes
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

    // function to handle appointment date change
    const handleDateChange = useCallback(async (newDate) => {
        if (newDate) {
            const selectedAppointmentDate = dayjs(newDate).format("YYYY-MM-DD");
            setAppointmentData((prev) => ({
                ...prev,
                appointmentDate: dayjs(selectedAppointmentDate)
            }))
        } else {
            setAppointmentData((prev) => ({
                ...prev,
                appointmentDate: null
            }))
        }

        if (fieldErrors.appointmentDate) {
            setFieldErrors({
                ...fieldErrors,
                appointmentDate: ""
            });
        }
    }, [fieldErrors, setAppointmentData, setFieldErrors])

    // function to handle appointment time change
    const appointmentTimeChange = useCallback(async (appointmentTime) => {
        if (appointmentTime) {
            const selectedAppointmentTime = dayjs(appointmentTime).format("hh:mm A");
            setAppointmentData((prev) => ({
                ...prev,
                preferredTime: selectedAppointmentTime ? selectedAppointmentTime : null
            }));
        } else {
            setAppointmentData((prev) => ({
                ...prev,
                preferredTime: null
            }));
        }

        if (fieldErrors.preferredTime) {
            setFieldErrors({
                ...fieldErrors,
                preferredTime: ""
            });
        }
    }, [fieldErrors, setAppointmentData, setFieldErrors]);

    const gender = ["Male", "Female"];
    const purposeOfAppointment = ["Regular Checkup", "Consultation", "Follow-up", "Emergency", "Urgent Care", "Other"];

    // function to format time to AM/PM
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

    if (!selectedClinic) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div className="fixed inset-0 transition-opacity bg-gray-900 opacity-70" onClick={handleCloseModal}></div>
                {/* Modal Content */}
                <div className="inline-block w-full max-w-5xl my-40 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl max-sm:my-10 sm:my-10 xl:my-40">
                    <div className="relative p-6 overflow-y-auto max-h-[90vh]">
                        {/* Clinic Information */}
                        <div className="flex flex-col mb-8 md:flex-row">
                            {/* Clinic Image */}
                            <div className="w-full mb-6 md:w-1/3 md:mb-0 md:mr-8">
                                <img
                                    src={`http://localhost:7506/uploads/clinic_images/${selectedClinic.clinic_image}`}
                                    alt={selectedClinic.clinic_name}
                                    className="object-cover w-full rounded-lg h-60"
                                />
                            </div>
                            {/* Clinic Details */}
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900">{selectedClinic.clinic_name}</h3>

                                <div className="mt-4 space-y-3">
                                    <div className="flex items-start">
                                        <MapPin className="flex-shrink-0 w-5 h-5 mt-0.5 text-blue-600" />
                                        <p className="ml-2 text-gray-700">{selectedClinic.clinic_address}</p>
                                    </div>

                                    <div className="flex items-center">
                                        <Phone className="flex-shrink-0 w-5 h-5 text-blue-600" />
                                        <p className="ml-2 text-gray-700">{selectedClinic.phoneNumber}</p>
                                    </div>

                                    <div className="flex items-center">
                                        <Mail className="flex-shrink-0 w-5 h-5 text-blue-600" />
                                        <p className="ml-2 text-gray-700">{selectedClinic.email}</p>
                                    </div>

                                    <div className="flex items-center">
                                        <Clock className="flex-shrink-0 w-5 h-5 text-blue-600" />
                                        <p className="ml-2 text-gray-700">
                                            {selectedClinic.clinic_date_open && selectedClinic.clinic_close_date
                                                ? `Business Days: ${selectedClinic.clinic_date_open} - ${selectedClinic.clinic_close_date}`
                                                : 'Business Days: N/A'}
                                        </p>
                                    </div>

                                    <div className="flex items-center">
                                        <Clock className="flex-shrink-0 w-5 h-5 text-blue-600" />
                                        <p className="ml-2 text-gray-700">
                                            Business Hours: {formatTimeToAMPM(selectedClinic.clinic_time) || 'N/A'} - {formatTimeToAMPM(selectedClinic.clinic_close_time) || 'N/A'}
                                        </p>
                                    </div>

                                    <div className="flex items-center">
                                        <PhilippinePeso className="flex-shrink-0 w-5 h-5 text-blue-600" />
                                        <p className="ml-2 text-gray-700">Consultation Fee: {selectedClinic.consultation_fee || 'N/A'}</p>
                                    </div>

                                    <div className="flex items-center">
                                        <Stethoscope className="flex-shrink-0 w-5 h-5 text-blue-600" />
                                        <p className="ml-2 text-gray-700">Clinic Type: {selectedClinic.clinic_type || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Form */}
                        <form onSubmit={handleBooking} id="bookingForm" className="mt-8">
                            <input type="hidden" name="appointmentID" value={appointmentID} />

                            {/* First Row */}
                            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
                                {/* First Name */}
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="Enter First Name"
                                        variant="outlined"
                                        name="firstName"
                                        autoComplete="off"
                                        value={memoizedFirstNameValue}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.firstName}
                                        helperText={fieldErrors.firstName || ""}
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <TextField
                                        margin="dense"
                                        fullWidth
                                        label="Enter Last Name"
                                        variant="outlined"
                                        autoComplete="off"
                                        placeholder="Enter last name"
                                        value={memoizedLastNameValue}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.lastName}
                                        helperText={fieldErrors.lastName || ""}
                                        name="lastName"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <TextField
                                        fullWidth
                                        label="Enter Email"
                                        type="text"
                                        margin="dense"
                                        autoComplete="off"
                                        variant="outlined"
                                        error={!!fieldErrors.email}
                                        helperText={fieldErrors.email || ""}
                                        value={memoizedEmailValue}
                                        name="email"
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            {/* Second Row */}
                            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
                                {/* Phone Number */}
                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="Enter Phone Number"
                                        name="phoneNumber"
                                        autoComplete="off"
                                        type="tel"
                                        variant="outlined"
                                        value={memoizedPhoneNumberValue}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.phoneNumber}
                                        helperText={fieldErrors.phoneNumber || ""}
                                    />
                                </div>

                                {/* Gender */}
                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                                        Gender <span className="text-red-500">*</span>
                                    </label>
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
                                        error={!!fieldErrors.gender}
                                        helperText={fieldErrors.gender || ""}
                                    >
                                        {gender.map((gender, i) => (
                                            <MenuItem key={i} value={gender}>{gender}</MenuItem>
                                        ))}
                                    </TextField>
                                </div>

                                {/* Appointment Date */}
                                <div>
                                    <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700">
                                        Appointment Date <span className="text-red-500">*</span>
                                    </label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DatePicker']}>
                                            <DatePicker
                                                className="w-full"
                                                label="Select Date of Appointment"
                                                placeholder="Select date of appointment"
                                                name="appointmentDate"
                                                onChange={handleDateChange}
                                                value={memoizedAppointmentDateValue ? dayjs(memoizedAppointmentDateValue) : null}
                                                slotProps={{
                                                    textField: {
                                                        margin: "dense",
                                                        autoComplete: "off",
                                                        className: "w-full",
                                                        variant: "outlined",
                                                        fullWidth: true,
                                                        error: !!fieldErrors.appointmentDate,
                                                        helperText: fieldErrors.appointmentDate || "",
                                                    },
                                                }}
                                            />
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </div>
                            </div>

                            {/* Third Row */}
                            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
                                {/* Preferred Time */}
                                <div>
                                    <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700">
                                        Appointment Time <span className="text-red-500">*</span>
                                    </label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['TimePicker']}>
                                            <TimePicker
                                                label="Select Appointment Time"
                                                placeholder="Select appointment time"
                                                name="preferredTime"
                                                value={memoizedPreferredTimeValue ? dayjs(memoizedPreferredTimeValue, "hh:mm A") : null}
                                                onChange={appointmentTimeChange}
                                                slotProps={{
                                                    textField: {
                                                        margin: "dense",
                                                        autoComplete: "off",
                                                        className: "w-full",
                                                        variant: "outlined",
                                                        fullWidth: true,
                                                        error: !!fieldErrors.preferredTime,
                                                        helperText: fieldErrors.preferredTime || "",
                                                    }
                                                }}
                                            />
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </div>

                                {/* Purpose of Appointment */}
                                <div>
                                    <label htmlFor="purposeOfAppointment" className="block text-sm font-medium text-gray-700">
                                        Purpose of Appointment <span className="text-red-500">*</span>
                                    </label>
                                    <TextField
                                        fullWidth
                                        select
                                        margin="dense"
                                        label="Purpose of Appointment"
                                        variant="outlined"
                                        autoComplete="off"
                                        placeholder="Enter purpose of appointment"
                                        name="purposeOfAppointment"
                                        error={!!fieldErrors.purposeOfAppointment}
                                        helperText={fieldErrors.purposeOfAppointment || ""}
                                        value={memoizedPurposeOfAppointmentValue}
                                        onChange={handleInputChange}
                                    >
                                        {purposeOfAppointment.map((purpose) => (
                                            <MenuItem key={purpose} value={purpose}>{purpose}</MenuItem>
                                        ))}
                                    </TextField>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col-reverse pt-5 mt-8 border-t border-gray-200 sm:flex-row sm:justify-end sm:space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="inline-flex items-center justify-center w-full px-4 py-2 mt-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm cursor-pointer"
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Confirm Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
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