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
    useEffect
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
        }
    }

    /**
     * this function handles the changes of text fields inputs
     */
    const handlesTextFieldsChanges = async (e) => {
        const { name, value } = e.target;
        setModifyBookedAppointmentDetails((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    /**
     * this function handles the changes of input in selecting appointment time
     */
    const handleCallBackTimePickerChange = async (newValue) => {
        if (newValue) {
            const selectedAppointmentTime = dayjs(newValue).format('hh:mm A');
            setModifyBookedAppointmentDetails((prev) => ({
                ...prev,
                appointmentTime: selectedAppointmentTime ? dayjs(selectedAppointmentTime, "hh:mm A") : null
            }))
        }
    }

    /**
     * this function hanldes the submission of modified booked appointment details
     */
    const handleSubmitModifyBookedAppointmentDetails = async (e) => {
        try {
            e.preventDefault();
            
            if(!tokenContext) {
                console.error(`Token is not set in context or local storage`)
                return;
            }

            const payload = {
                ...modifyBookedAppointmentDetails,
                appointmentDate: modifyBookedAppointmentDetails.appointmentDate ? dayjs(modifyBookedAppointmentDetails.appointmentDate).format('YYYY-MM-DD') : null,
            }
            
            const response = await CMS.put("/CMS/cms.api.com/clinic/dashboard/modifyBookedAppointmentDetails", payload, {
                params: {
                    bookedAppointmentID: bookedAppointment.id
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            })

            if(response.status === 200) {
                alert("Booked Appointment Details Modified Successfully!")
                navigate("/doctor-portal/dashboard/ClinicViewBookedAppointment")
            } else {
                throw new Error(`Failed to submit the modified booked appointment details: ${response.statusText}`)
            }
        } catch (error) {
            console.error(`Failed to modify booked appointment details: ${error}`)
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
                            label="First Name"
                            fullWidth
                            margin="normal"
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
                            label="Last Name"
                            fullWidth
                            margin="normal"
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
                            label="Address"
                            fullWidth
                            margin="normal"
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
                            label="Email"
                            fullWidth
                            margin="normal"
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
                            label="Phone Number"
                            fullWidth
                            margin="normal"
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
                                    slotProps={{
                                        textField: {
                                            name: "appointmentDate",
                                            autoComplete: "off",
                                            fullWidth: true,
                                            margin: "normal",
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
                                    value={modifyBookedAppointmentDetails?.appointmentTime ? dayjs(modifyBookedAppointmentDetails.appointmentTime, "hh:mm A") : null}
                                    label="Select Appointment Time"
                                    onChange={handleCallBackTimePickerChange}
                                    slotProps={{
                                        textField: {
                                            name: "appointmentTime",
                                            autoComplete: "off",
                                            fullWidth: true,
                                            margin: "normal",
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
                            margin="normal"
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
                            fullWidth
                            margin="normal"
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
                            margin="normal"
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
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Modify Booked Appointment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ModifyClinicBookedAppointment;