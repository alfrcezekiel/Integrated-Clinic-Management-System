import {
    useState,
    useCallback
} from "react";
import {
    TextField,
    Button,
    MenuItem,
    Box,
} from '@mui/material';
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useAuthorization } from "../../context/auth/useAuthorization";
import { useNavigate } from "react-router-dom";
import CMS from "../../API/CMS";

const AddBookAppointment = () => {
    const genders = ["Male", "Female"];
    const purposeOfAppointment = ["Regular Checkup", "Consultation", "Follow-up", "Emergency", "Urgent Care", "Other"];

    const { user, token } = useAuthorization();
    const navigate = useNavigate();

    const clinic_id = user?.sid;
    const clinic_name = user?.scn;
    const [submitting, setSubmitting] = useState(false);
    const tokenContext = token;

    if (!tokenContext) {
        console.error("No token found in context or localStorage");
    }

    if (!clinic_id || !clinic_name) {
        console.error("Clinic ID or Clinic Name is not available in user session data");
    }

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        address: "",
        email: "",
        phoneNumber: "",
        appointmentDate: null,
        appointmentTime: null,
        gender: "",
        purposeOfAppointment: ""
    });
    const [fieldErrors, setFieldErrors] = useState({
        firstName: "",
        lastName: "",
        address: "",
        email: "",
        phoneNumber: "",
        appointmentDate: null,
        appointmentTime: null,
        gender: "",
        purposeOfAppointment: ""
    });

    // function to handle changes in text fields
    const handleTextFieldChange = useCallback(async (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({
                ...prev,
                [name]: ""
            }));
        }
    }, [fieldErrors]);

    // function to submit the book appointment of patient
    const submitBookedAppointment = async (e) => {
        try {
            e.preventDefault();

            if (submitting) return;
            setSubmitting(true);

            console.log('Appointment Data:', formData);
            // Add your API call here

            const response = await CMS.post(`/clinicDashboard/addBookedAppointment`, {
                ...formData,
                appointmentDate: formData.appointmentDate ? dayjs(formData.appointmentDate).format("YYYY-MM-DD") : null,
                clinicID: clinic_id,
                clinicName: clinic_name
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`,
                }
            })

            if (response.status === 200) {
                setFieldErrors({})
                setFormData({
                    firstName: "",
                    lastName: "",
                    address: "",
                    email: "",
                    phoneNumber: "",
                    appointmentDate: null,
                    appointmentTime: null,
                    gender: "",
                    purposeOfAppointment: ""
                })
                alert("Appointment booked successfully!");
                navigate("/doctor-portal/dashboard/AddBookAppointment");
            } else {
                throw new Error(`Failed to book appointment: ${response.statusText}`);
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const errors = error.response.data.errors;
                setFieldErrors((prev) => ({
                    ...prev,
                    ...errors
                }));
            }
            console.error(`Error in submitting booked appointment: ${error}`);
        } finally {
            setSubmitting(false);
        }
    };

    // function to handle changes in appointment date
    const appointmentDateChange = useCallback(async (newValue) => {
        if (newValue) {
            const selectedAppointmentDate = dayjs(newValue).format('YYYY-MM-DD');
            setFormData((prev) => ({
                ...prev,
                appointmentDate: dayjs(selectedAppointmentDate)
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                appointmentDate: null
            }));
        }

        if (fieldErrors.appointmentDate) {
            setFieldErrors((prev) => ({
                ...prev,
                appointmentDate: ""
            }));
        }
    }, [fieldErrors.appointmentDate]);

    // function to handle changes in appointment time
    const appointmentTimeChange = useCallback(async (newValue) => {
        if (newValue) {
            const selectedAppointmentTime = dayjs(newValue).format("HH:mm")
            setFormData((prev) => ({
                ...prev,
                appointmentTime: selectedAppointmentTime ? dayjs(selectedAppointmentTime, "HH:mm") : null
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                appointmentTime: null
            }))
        }

        if (fieldErrors.appointmentTime) {
            setFieldErrors((prev) => ({
                ...prev,
                appointmentTime: ""
            }));
        }
    }, [fieldErrors.appointmentTime]);

    return (
        <div className="flex flex-col justify-center items-center w-full min-h-[90dvh]">
            <div className="p-10 rounded-2xl shadow-2xl sm:max-w-2/4 md:min-w-1/3 xl:min-w-3/4 m-6">
                <h5 className="font-semibold text-black mb-6 text-lg text-center">
                    Add Book Appointment
                </h5>
                <div className="inline-block w-full">
                    <form onSubmit={submitBookedAppointment} className="flex flex-col gap-6">
                        <div className="flex-col">
                            <label className="text-black text-md font-semibold">First Name</label>
                            <TextField
                                label="Enter First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleTextFieldChange}
                                fullWidth
                                className="md:col-span-2"
                                margin="dense"
                                autoComplete="off"
                                error={!!fieldErrors.firstName}
                                helperText={fieldErrors.firstName || ""}
                            />
                        </div>
                        <div className="flex-col">
                            <label className="text-black text-md font-semibold">Last Name</label>
                            <TextField
                                label="Enter Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleTextFieldChange}
                                fullWidth
                                margin="dense"
                                className="md:col-span-2"
                                autoComplete="off"
                                error={!!fieldErrors.lastName}
                                helperText={fieldErrors.lastName || ""}
                            />
                        </div>
                        <div className="flex-col">
                            <label className="text-black text-md font-semibold">Address</label>
                            <TextField
                                label="Enter Address"
                                name="address"
                                value={formData.address}
                                onChange={handleTextFieldChange}
                                fullWidth
                                margin="dense"
                                className="md:col-span-2"
                                autoComplete="off"
                                error={!!fieldErrors.address}
                                helperText={fieldErrors.address || ""}
                            />
                        </div>
                        <div className="flex-col">
                            <label className="text-black text-md font-semibold">Email</label>
                            <TextField
                                label="Enter Email"
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleTextFieldChange}
                                fullWidth
                                className="md:col-span-2"
                                margin="dense"
                                autoComplete="off"
                                error={!!fieldErrors.email}
                                helperText={fieldErrors.email || ""}
                            />
                        </div>
                        <div className="flex-col">
                            <label className="text-black text-md font-semibold">Phone Number</label>
                            <TextField
                                label="Phone Number"
                                name="phoneNumber"
                                type="text"
                                value={formData.phoneNumber}
                                onChange={handleTextFieldChange}
                                fullWidth
                                margin="dense"
                                autoComplete="off"
                                error={!!fieldErrors.phoneNumber}
                                helperText={fieldErrors.phoneNumber || ""}
                                className="md:col-span-2"
                            />
                        </div>
                        <div className="flex-col">
                            <label className="text-black text-md font-semibold">Appointment Date</label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DatePicker']}>
                                    <DatePicker
                                        label="Appointment Date"
                                        name="appointmentDate"
                                        value={formData.appointmentDate ? dayjs(formData.appointmentDate) : null}
                                        onChange={appointmentDateChange}
                                        className="w-full"
                                        slotProps={{
                                            textField: {
                                                autoComplete: "off",
                                                margin: "dense",
                                                error: !!fieldErrors.appointmentDate,
                                                helperText: fieldErrors.appointmentDate || "",
                                            }
                                        }}
                                    />
                                </DemoContainer>
                            </LocalizationProvider>
                        </div>
                        <div className="flex-col">
                            <label className="text-black font-semibold">Appointment Time</label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                    label="Select Appointment Time"
                                    className="w-full"
                                    name="appointmentTime"
                                    value={formData.appointmentTime ? dayjs(formData.appointmentTime, "HH:mm") : null}
                                    onChange={appointmentTimeChange}
                                    slotProps={{
                                        textField: {
                                            margin: "dense",
                                            autoComplete: "off",
                                            fullWidth: true,
                                            error: !!fieldErrors.appointmentTime,
                                            helperText: fieldErrors.appointmentTime || "",
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </div>
                        <div className="flex-col">
                            <label className="text-md font-semibold text-black">Gender</label>
                            <TextField
                                label="Gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleTextFieldChange}
                                select
                                autoComplete="off"
                                fullWidth
                                className="md:col-span-2"
                                margin="dense"
                                error={!!fieldErrors.gender}
                                helperText={fieldErrors.gender || ""}
                            >
                                {genders.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>
                        <div className="flex-col">
                            <label className="text-black font-semibold text-md">Purpose of Appointment</label>
                            <TextField
                                select
                                margin="dense"
                                autoComplete="off"
                                label="Purpose of Appointment"
                                name="purposeOfAppointment"
                                value={formData.purposeOfAppointment}
                                onChange={handleTextFieldChange}
                                fullWidth
                                className="md:col-span-2"
                                error={!!fieldErrors.purposeOfAppointment}
                                helperText={fieldErrors.purposeOfAppointment || ""}
                            >
                                {purposeOfAppointment.map((purpose) => (
                                    <MenuItem key={purpose} value={purpose}>
                                        {purpose}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>

                        <div className="block">
                            <Box className="md:col-span-2 text-right mt-4 flex justify-center">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
                                >   
                                    <span className="text-white">
                                        {submitting ? "Loading..." : "Book Appointment"}
                                    </span>
                                </Button>
                            </Box>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddBookAppointment;