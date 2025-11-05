import {
    useLocation,
    useNavigate
} from "react-router-dom";
import {
    TextField,
    MenuItem
} from "@mui/material";
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import {
    useState,
    useEffect,
    useCallback
} from "react";
import CMS from "../../../API/CMS";
import { useAuthorization } from "../../../context/auth/useAuthorization";

/**
 * This component is used to modify the booked appointment of the clinic
 */
const ModifyClinicBookedAppointment = () => {
    const location = useLocation();
    const bookedAppointment = location.state?.bookedAppointment;
    const navigate = useNavigate();
    const { token } = useAuthorization();
    const [submitting, setSubmitting] = useState(false);
    const tokenContext = token;

    const selectedGender = [
        "Male",
        "Female"
    ]
    const purposeOfAppointment = [
        "Regular Checkup",
        "Consultation",
        "Follow-up",
        "Emergency",
        "Urgent Care",
        "Other"
    ];

    const selectedStatus = [
        "Pending",
        "Approved",
        "Declined",
        "Cancelled"
    ]

    const [modifyBookedAppointmentDetails, setModifyBookedAppointmentDetails] = useState({
        firstName: "",
        lastName: "",
        address: "",
        email: "",
        phoneNumber: "",
        appointmentDate: null,
        appointmentTime: null,
        gender: "",
        purposeOfAppointment: "",
        status: ""
    })
    const [fieldErrors, setFieldErrors] = useState({
        firstName: "",
        lastName: "",
        address: "",
        email: "",
        phoneNumber: "",
        appointmentDate: "",
        appointmentTime: "",
        gender: "",
        purposeOfAppointment: "",
        status: ""
    })

    useEffect(() => {
        if (!bookedAppointment || !bookedAppointment.id) {
            alert("Booked Appointment Details Not Found!")
            navigate("/doctor-portal/dashboard/ClinicViewBookedAppointment")
            return;
        }

        setModifyBookedAppointmentDetails((prev) => ({
            ...prev,
            firstName: bookedAppointment.firstName,
            lastName: bookedAppointment.lastName,
            address: bookedAppointment.address,
            email: bookedAppointment.email,
            phoneNumber: bookedAppointment.phoneNumber,
            appointmentDate: bookedAppointment.appointmentDate,
            appointmentTime: bookedAppointment.appointmentTime ? dayjs(bookedAppointment.appointmentTime, "HH:mm") : null,
            gender: bookedAppointment.gender,
            purposeOfAppointment: bookedAppointment.purposeOfAppointment,
            status: bookedAppointment.status
        }))
    }, [bookedAppointment, location.pathname, navigate]);

    /**
     * this function handles the changes of input in selecting appointment date
     */
    const handleAppointmentDateChange = async (newValue) => {
        if (newValue) {
            const selectedAppointmentDate = dayjs(newValue).format('YYYY-MM-DD');
            setModifyBookedAppointmentDetails((prev) => ({
                ...prev,
                appointmentDate: dayjs(selectedAppointmentDate)
            }))
        } else {
            setModifyBookedAppointmentDetails((prev) => ({
                ...prev,
                appointmentDate: null
            }))
        }

        if (fieldErrors.appointmentDate) {
            setFieldErrors((prev) => ({
                ...prev,
                appointmentDate: ""
            }))
        }
    }

    /**
     * @function to navigate in the respective appointmetns after modifiying the booked appointment
     */
    const navigateToRespectiveAppointmentsPage = useCallback(async () => {
        if (modifyBookedAppointmentDetails.status === "Pending") {
            navigate("/doctor-portal/dashboard/PendingBookedAppointment")
        } else if (modifyBookedAppointmentDetails.status === "Approved") {
            navigate("/doctor-portal/dashboard/ApprovedBookedAppointment")
        } else if (modifyBookedAppointmentDetails.status === "Declined") {
            navigate("/doctor-portal/dashboard/DeclinedBookedAppointment")
        }
    }, [modifyBookedAppointmentDetails.status, navigate]);

    /**
     * this function handles the changes of text fields inputs
     */
    const handlesTextFieldsChanges = async (e) => {
        const { name, value } = e.target;
        setModifyBookedAppointmentDetails((prev) => ({
            ...prev,
            [name]: value
        }))

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({
                ...prev,
                [name]: ""
            }))
        }
    }

    /**
     * this function handles the changes of input in selecting appointment time
     */
    const handleCallBackTimePickerChange = async (newValue) => {
        if (newValue) {
            setModifyBookedAppointmentDetails((prev) => ({
                ...prev,
                appointmentTime: newValue ? newValue : null
            }))
        } else {
            setModifyBookedAppointmentDetails((prev) => ({
                ...prev,
                appointmentTime: null
            }))
        }

        if (fieldErrors.appointmentTime) {
            setFieldErrors((prev) => ({
                ...prev,
                appointmentTime: ""
            }))
        }
    }

    /**
     * this function hanldes the submission of modified booked appointment details
     */
    const handleSubmitModifyBookedAppointmentDetails = async (e) => {
        try {
            e.preventDefault();

            if (submitting) return;
            setSubmitting(true);

            if (!tokenContext) {
                console.error(`Token is not set in context or local storage`)
                return;
            }

            const appointmentDateString = modifyBookedAppointmentDetails.appointmentDate
                ? dayjs(modifyBookedAppointmentDetails.appointmentDate).format('YYYY-MM-DD')
                : null;

            let appointmentTimeString = null;
            const apptTime = modifyBookedAppointmentDetails.appointmentTime;

            if (apptTime) {
                // if it's a Dayjs object, format directly to 24h "HH:mm"
                if (typeof apptTime?.format === "function") {
                    appointmentTimeString = apptTime.format("HH:mm");
                } else {
                    // otherwise try parsing common formats (e.g. "05:02 AM", "05:02", "17:02")
                    const parsed = dayjs(apptTime, ["h:mm A", "hh:mm A", "H:mm", "HH:mm", "HH:mm:ss"], true);
                    appointmentTimeString = parsed.isValid() ? parsed.format("HH:mm") : dayjs(apptTime).format("HH:mm");
                }
            }

            const payload = {
                ...modifyBookedAppointmentDetails,
                appointmentDate: appointmentDateString,
                appointmentTime: appointmentTimeString
            }

            const response = await CMS.put("/cms.api.com/clinic/dashboard/modifyBookedAppointmentDetails", payload, {
                params: {
                    bookedAppointmentID: bookedAppointment.id
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            })

            if (response.status === 200) {
                setFieldErrors({
                    firstName: "",
                    lastName: "",
                    address: "",
                    email: "",
                    phoneNumber: "",
                    appointmentDate: "",
                    appointmentTime: "",
                    gender: "",
                    purposeOfAppointment: "",
                    status: ""
                })
                alert("Booked Appointment Details Modified Successfully!")
                navigateToRespectiveAppointmentsPage()
            } else {
                throw new Error(`Failed to submit the modified booked appointment details: ${response.statusText}`)
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const errors = error.response.data.errors;
                setFieldErrors((prev) => ({
                    ...prev,
                    ...errors
                }))
            }
            console.error(`Failed to modify booked appointment details: ${error}`)
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-4xl mt-4 m-auto p-6 rounded-2xl shadow-lg">
            <div className="block p-4">
                <div className="text-2xl font-semibold text-center">Modify Booked Appointments</div>
            </div>
            <div className="space-y-2">
                <form className="flex flex-col justify-center space-y-2 gap-6" onSubmit={handleSubmitModifyBookedAppointmentDetails}>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold">First Name</label>
                        <TextField
                            value={modifyBookedAppointmentDetails?.firstName}
                            variant="outlined"
                            name="firstName"
                            autoComplete="off"
                            onChange={handlesTextFieldsChanges}
                            label="Enter First Name"
                            fullWidth
                            margin="dense"
                            error={!!fieldErrors.firstName}
                            helperText={fieldErrors.firstName || ""}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold">Last Name</label>
                        <TextField
                            value={modifyBookedAppointmentDetails?.lastName}
                            variant="outlined"
                            name="lastName"
                            autoComplete="off"
                            onChange={handlesTextFieldsChanges}
                            label="Enter Last Name"
                            fullWidth
                            margin="dense"
                            error={!!fieldErrors.lastName}
                            helperText={fieldErrors.lastName || ""}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold">Address</label>
                        <TextField
                            value={modifyBookedAppointmentDetails?.address}
                            variant="outlined"
                            name="address"
                            autoComplete="off"
                            onChange={handlesTextFieldsChanges}
                            label="Enter Address"
                            fullWidth
                            error={!!fieldErrors.address}
                            helperText={fieldErrors.address || ""}
                            margin="dense"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold">Email</label>
                        <TextField
                            value={modifyBookedAppointmentDetails?.email}
                            variant="outlined"
                            name="email"
                            autoComplete="off"
                            onChange={handlesTextFieldsChanges}
                            label="Enter Email"
                            fullWidth
                            error={!!fieldErrors.email}
                            helperText={fieldErrors.email || ""}
                            margin="dense"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold">Phone Number</label>
                        <TextField
                            value={modifyBookedAppointmentDetails?.phoneNumber}
                            variant="outlined"
                            name="phoneNumber"
                            autoComplete="off"
                            onChange={handlesTextFieldsChanges}
                            label="Enter Phone Number"
                            fullWidth
                            error={!!fieldErrors.phoneNumber}
                            helperText={fieldErrors.phoneNumber || ""}
                            margin="dense"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold">Appointment Date</label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['DatePicker']}>
                                <DatePicker
                                    value={modifyBookedAppointmentDetails?.appointmentDate ? dayjs(modifyBookedAppointmentDetails.appointmentDate) : null}
                                    label="Select Appointment Date"
                                    onChange={handleAppointmentDateChange}
                                    name="appointmentDate"
                                    slotProps={{
                                        textField: {
                                            autoComplete: "off",
                                            fullWidth: true,
                                            margin: "dense",
                                            error: !!fieldErrors.appointmentDate,
                                            helperText: fieldErrors.appointmentDate || "",
                                            variant: "outlined"
                                        }
                                    }}
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold">Appointment Time</label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['TimePicker']}>
                                <TimePicker
                                    value={modifyBookedAppointmentDetails?.appointmentTime ? dayjs(modifyBookedAppointmentDetails.appointmentTime) : null}
                                    label="Select Appointment Time"
                                    onChange={handleCallBackTimePickerChange}
                                    name="appointmentTime"
                                    slotProps={{
                                        textField: {
                                            autoComplete: "off",
                                            fullWidth: true,
                                            margin: "dense",
                                            error: !!fieldErrors.appointmentTime,
                                            helperText: fieldErrors.appointmentTime || "",
                                            variant: "outlined"
                                        }
                                    }}
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                    </div>
                    <div className="fle flex-col">
                        <label className="text-sm font-semibold">Gender</label>
                        <TextField
                            select
                            name="gender"
                            value={modifyBookedAppointmentDetails?.gender}
                            onChange={handlesTextFieldsChanges}
                            label="Select Gender"
                            fullWidth
                            error={!!fieldErrors.gender}
                            helperText={fieldErrors.gender || ""}
                            margin="dense"
                        >
                            {selectedGender.map((gender, i) => (
                                <MenuItem key={i} value={gender}>
                                    {gender}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold">Status</label>
                        <TextField
                            select
                            name="status"
                            value={modifyBookedAppointmentDetails?.status}
                            onChange={handlesTextFieldsChanges}
                            label="Select Status"
                            error={!!fieldErrors.status}
                            helperText={fieldErrors.status || ""}
                            fullWidth
                            margin="dense"
                        >
                            {selectedStatus.map((status, i) => (
                                <MenuItem key={i} value={status}>
                                    {status}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold">Purpose Of Appointment</label>
                        <TextField
                            select
                            name="purposeOfAppointment"
                            value={modifyBookedAppointmentDetails?.purposeOfAppointment}
                            onChange={handlesTextFieldsChanges}
                            label="Select Purpose Of Appointment"
                            fullWidth
                            error={!!fieldErrors.purposeOfAppointment}
                            helperText={fieldErrors.purposeOfAppointment || ""}
                            margin="dense"
                        >
                            {purposeOfAppointment.map((purpose, i) => (
                                <MenuItem key={i} value={purpose}>
                                    {purpose}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                    <div className="flex p-4 justify-center">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
                        >
                            <span className="text-white">
                                {submitting ? "Loading..." : "Modify Booked Appointment"}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ModifyClinicBookedAppointment;