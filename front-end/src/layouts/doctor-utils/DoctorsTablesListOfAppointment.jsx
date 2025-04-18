import { useLocation } from "react-router-dom"
import {
    Card,
    CardContent,
    CardHeader,
    Table,
    TableHead,
    TableRow,
    TableCell,
    Typography,
    TableBody,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText
} from "@mui/material"
import {
    useState,
    useEffect,
    useMemo,
    useCallback
} from "react"
import CMS from "../../API/CMS"
import EditIcon from "@mui/icons-material/Edit"
import { useNavigate } from "react-router-dom"
import Lottie from "lottie-react"
import successAnimation from "../../assets/animation/Main Scene.json"
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from "dayjs"

const DoctorsTablesListOfAppointments = () => {
    const [appointmentsData, setAppointmentsData] = useState([])
    // state for the fields error
    const [fieldsError, setFieldsError] = useState({
        firstName: "",
        lastName: "",
        email: "",
        appointmentDate: null,
        preferredTime: null,
        phoneNumber: "",
        gender: "",
        status: "",
        purposeOfAppointment: ""
    })
    const appointmentsTableColumn = [
        "Clinic Name",
        'First Name',
        'Last Name',
        "Email",
        'Appointment Date',
        "Appointment Time",
        "Phone Number",
        "Gender",
        'Status',
        'Purpose of Appointment',
        "Edit"
    ]
    // form data for updating the appointment details
    const [formData, setFormData] = useState({
        appointmentID: "",
        firstName: "",
        lastName: "",
        email: "",
        appointmentDate: null,
        preferredTime: null,
        phoneNumber: "",
        gender: "",
        status: "",
        purposeOfAppointment: ""
    });
    const [open, setOpen] = useState(false);
    const [successfullAppointmentModalOpen, setSuccessfullAppointmentModalOpen] = useState(false);
    const handleClose = () => {
        setFieldsError({})
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            appointmentDate: null,
            preferredTime: null,
            phoneNumber: "",
            gender: "",
            doctor: "",
            status: "",
            purposeOfAppointment: "",
        })
        setOpen(false);
    }

    const navigate = useNavigate();
    const location = useLocation();

    const memoizedFormDataValue = useMemo(() => formData, [formData]);

    useEffect(() => {
        const titleHeader = () => {
            document.title = "Clinic's Dashboard | Patient's Appointment | CMS"
        }
        titleHeader();

        const clinicID = localStorage.getItem("sid")

        const retrievedAppointmentsData = async () => {
            try {
                const response = await CMS.get(`/CMS/doctors-dashboard/appointments/${clinicID}`);

                if (!response.data) {
                    throw new Error("No retrieved data for appointments");
                }

                if (response.status === 200) {
                    setAppointmentsData(response.data.patientsAppointments);
                }
            } catch (error) {
                console.error(`Code functionality error for fetching appointments data: ${error}`);
            }
        }
        retrievedAppointmentsData();
    }, [location.pathname])

    const formatTimeToAMPM = (time) => {
        if (!time) return "N/A";
        if (time.includes("AM") || time.includes("PM")) return time;

        try {
            const [hours, minutes] = time.split(":");
            let hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? "PM" : "AM";
            hour = hour % 12 || 12;
            return `${hour}:${minutes || "00"} ${ampm}`;
        } catch {
            return time;
        }
    };

    const handleAppointmentDateChange = async (newValue) => {
        setFormData((prev) => ({
            ...prev,
            appointmentDate: newValue && dayjs(newValue) ? newValue : ""
        }));

        if (fieldsError.appointmentDate) {
            setFieldsError({
                ...fieldsError,
                appointmentDate: ""
            });
        }
    }

    const handleChangeInput = useCallback((e) => {
        if (typeof e === "object" && e !== null && e.target) {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }))

            if (fieldsError[name]) {
                setFieldsError({
                    ...fieldsError,
                    [name]: ""
                })
            }
        }
    }, [fieldsError])

    const dateFormat = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    };

    const handleTimePickerChange = async (newValue) => {
        setFormData((prev) => ({
            ...prev,
            preferredTime: newValue
        }))

        if (fieldsError.preferredTime) {
            setFieldsError({
                ...fieldsError,
                preferredTime: ""
            })
        }
    }

    // this function is used to update the appointment details
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedData = {
                ...memoizedFormDataValue,
                appointmentDate: memoizedFormDataValue.status === "Approved"
                    ? dayjs(memoizedFormDataValue.appointmentDate)
                    : memoizedFormDataValue.appointmentDate,
                preferredTime: memoizedFormDataValue.preferredTime ? memoizedFormDataValue.preferredTime.format("HH:mm") : null
            };

            const response = await CMS.put(`/CMS/doctors-dashboard/updateAppointment/${memoizedFormDataValue.appointmentID}`, updatedData);

            if (response.status === 200 && memoizedFormDataValue.status === "Pending") {
                setFieldsError({})
                setOpen(false);
                setSuccessfullAppointmentModalOpen(true);
                navigate("/doctor-portal/dashboard/pending-appointments");
            } else if (response.status === 200 && memoizedFormDataValue.status === "Approved") {
                setFieldsError({})
                setOpen(false);
                setSuccessfullAppointmentModalOpen(true);
                navigate("/doctor-portal/dashboard/approved-appointments");
            } else {
                throw new Error(`Unexpected error in status ${response.status}`)
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setFieldsError(error.response.data.errors);
            } else {
                console.error(`Code functionality error for updating the appointment: ${error}`);
            }
        }
    }

    // this function is used to open the modal for updating the appointment details
    const handleClickOpen = (appointment) => {
        setFormData({
            appointmentID: appointment.appointmentID,
            firstName: appointment.firstName,
            lastName: appointment.lastName,
            email: appointment.email,
            appointmentDate: dayjs(appointment.appointmentDate),
            preferredTime: appointment.preferredTime ? dayjs(appointment.preferredTime, "HH:mm") : null,
            phoneNumber: appointment.phoneNumber,
            gender: appointment.gender,
            status: appointment.status,
            purposeOfAppointment: appointment.purposeOfAppointment,
        });
        setOpen(true);
    }

    const handleCloseSuccessfullAppointmentModal = () => {
        setSuccessfullAppointmentModalOpen(false);
        handleClose();
    }

    // this function determines the color of the status of the patients
    const getStatusColor = (status) => {
        switch (status) {
            case "Approved":
                return "text-black bg-green-200";
            case "Declined":
                return "text-black bg-red-200";
            case "Pending":
                return "text-black bg-white";
            case "Consulted":
                return "text-black bg-blue-200";
            default:
                return "text-black bg-white";
        }
    }

    const gender = ["Male", "Female"]
    const status = ["Approved", "Declined", "Pending", "Consulted"];

    return (
        <>
            <div className="mt-12 mb-1 flex justify-center items-center w-full">
                <Card className="shadow-lg rounded-2xl w-full">
                    <CardHeader
                        title="View All Appointments"
                        className="bg-blue-500 mb-2 p-6"
                        slotProps={{
                            title: {
                                variant: 'h6',
                                className: 'text-white text-center',
                            },
                        }}
                    />
                    <CardContent className="overflow-x-scroll pt-0 pb-2 rounded-xl shadow-sm bg-white">
                        <Table className="w-full min-w-[100%] text-left text-gray-500">
                            <TableHead className="bg-gray-100 text-sm sm:text-base text-gray-600 uppercase">
                                <TableRow>
                                    {appointmentsTableColumn.map((header, i) => (
                                        <TableCell
                                            key={i}
                                            className="border-b border-blue-gray-50 text-center py-3 px-5"
                                            align="center"
                                        >
                                            <Typography
                                                variant="body2"
                                                className="text-[11px] font-bold uppercase text-blue-gray-400"
                                            >
                                                {header}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {appointmentsData && appointmentsData.length > 0 ? (
                                    appointmentsData.map((appointment, id) => (
                                        <TableRow key={id} className={`hover:bg-gray-200 transition duration-200 ease-in-out ${getStatusColor(appointment.status)}`}>
                                            <TableCell align="center" className="border-b border-blue-gray-50 text-center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.clinic_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" className="border-b border-blue-gray-50 text-center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.firstName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" className="border-b border-blue-gray-50 text-center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.lastName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" className="border-b border-blue-gray-50 text-center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" className="border-b border-blue-gray-50 text-center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {dateFormat(appointment.appointmentDate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" className="border-b border-blue-gray-50 text-center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {formatTimeToAMPM(appointment.preferredTime)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" className="border-b border-blue-gray-50 text-center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.phoneNumber}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" className="border-b border-blue-gray-50 text-center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.gender}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" className="border-b border-blue-gray-50 text-center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.status ? appointment.status : "N/A"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" className="border-b border-blue-gray-50 text-center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.purposeOfAppointment}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" className="border-b border-blue-gray-50 text-center">
                                                <IconButton aria-label="edit" onClick={() => handleClickOpen(appointment)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={appointmentsTableColumn.length} align="center">
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                No appointments available.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Modify Booked Appointment</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            margin="dense"
                            label="Enter Appointment ID"
                            type="text"
                            fullWidth
                            hidden
                            name="appointmentID"
                            value={memoizedFormDataValue.appointmentID}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            label="First Name"
                            type="text"
                            fullWidth
                            name="firstName"
                            value={memoizedFormDataValue.firstName}
                            onChange={handleChangeInput}
                            error={Boolean(fieldsError.firstName)}
                            helperText={fieldsError.firstName ? fieldsError.firstName : ""}
                        />
                        <TextField
                            margin="dense"
                            label="Last Name"
                            type="text"
                            name="lastName"
                            fullWidth
                            value={memoizedFormDataValue.lastName}
                            onChange={handleChangeInput}
                            error={Boolean(fieldsError.lastName)}
                            helperText={fieldsError.lastName ? fieldsError.lastName : ""}
                        />
                        <TextField
                            margin="dense"
                            label="Enter Email"
                            type="text"
                            fullWidth
                            name="email"
                            onChange={handleChangeInput}
                            value={memoizedFormDataValue.email}
                            error={Boolean(fieldsError.email)}
                            helperText={fieldsError.email ? fieldsError.email : ""}
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['DatePicker']}>
                                <DatePicker
                                    label="Appointment Date"
                                    onChange={handleAppointmentDateChange}
                                    name="appointmentDate"
                                    slotProps={{
                                        textField: {
                                            variant: "outlined",
                                            margin: "dense",
                                            fullWidth: true,
                                            error: Boolean(fieldsError.appointmentDate),
                                            helperText: fieldsError.appointmentDate ? fieldsError.appointmentDate : null,
                                        },
                                    }}
                                    value={memoizedFormDataValue.appointmentDate ? dayjs(memoizedFormDataValue.appointmentDate) : null}
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['TimePicker']}>
                                <TimePicker
                                    margin="dense"
                                    label="Appointment Time"
                                    fullWidth
                                    name="appointmentTime"
                                    onChange={(newValue) => handleTimePickerChange(newValue)}
                                    className="w-full"
                                    slotProps={{
                                        textField: {
                                            className: "w-full",
                                            variant: "outlined",
                                            fullWidth: true,
                                            error: Boolean(fieldsError.preferredTime),
                                            helperText: fieldsError.preferredTime ? fieldsError.preferredTime : null,
                                        },
                                    }}
                                    value={memoizedFormDataValue ? dayjs(memoizedFormDataValue.preferredTime) : null}
                                    format="hh:mm A"
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                        <TextField
                            margin="dense"
                            label="Enter Phone Number"
                            type="number"
                            fullWidth
                            value={memoizedFormDataValue.phoneNumber}
                            name="phoneNumber"
                            onChange={handleChangeInput}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            error={Boolean(fieldsError.phoneNumber)}
                            helperText={fieldsError.phoneNumber ? fieldsError.phoneNumber : ""}
                        />
                        <FormControl fullWidth margin="dense" error={Boolean(fieldsError.gender)}>
                            <InputLabel>Gender</InputLabel>
                            <Select
                                value={memoizedFormDataValue.gender}
                                onChange={handleChangeInput}
                                label="Gender"
                                name="gender"
                            >
                                {gender.map((gender, i) => (
                                    <MenuItem key={i} value={gender}>{gender}</MenuItem>
                                ))}
                            </Select>
                            {fieldsError.gender && <FormHelperText error>{fieldsError.gender}</FormHelperText>}
                        </FormControl>
                        <FormControl fullWidth margin="dense" error={Boolean(fieldsError.status)}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={memoizedFormDataValue.status}
                                onChange={handleChangeInput}
                                name="status"
                                label="Status"
                            >
                                {status.map((status, i) => (
                                    <MenuItem key={i} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </Select>
                            {fieldsError.status && <FormHelperText error>{fieldsError.status}</FormHelperText>}
                        </FormControl>
                        <TextField
                            margin="dense"
                            label="Purpose of Appointment"
                            type="text"
                            name="purposeOfAppointment"
                            fullWidth
                            onChange={handleChangeInput}
                            value={memoizedFormDataValue.purposeOfAppointment}
                            error={Boolean(fieldsError.purposeOfAppointment)}
                            helperText={fieldsError.purposeOfAppointment ? fieldsError.purposeOfAppointment : ""}
                        />
                        <DialogActions>
                            <Button onClick={handleClose} color="primary" variant="outlined">
                                Cancel
                            </Button>
                            <Button type="submit" color="primary" variant="contained">
                                Update Patient Appointment
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog
                open={successfullAppointmentModalOpen}
                onClose={handleCloseSuccessfullAppointmentModal}
                className="flex items-center justify-center fixed inset-0"
            >
                <div className="bg-white rounded-2xl p-6 w-[400px] text-center shadow-lg">
                    <DialogTitle className="text-xl font-semibold">Success</DialogTitle>
                    <DialogContent className="flex flex-col items-center">
                        <Lottie animationData={successAnimation} className="w-24 h-24" loop={false} />
                        <Typography variant="body1" className="mt-2">
                            Patients Appointment has been successfully updated.
                        </Typography>
                    </DialogContent>
                    <DialogActions className="flex justify-center mt-4 items-center flex-col">
                        <Button
                            onClick={handleCloseSuccessfullAppointmentModal}
                            color="primary"
                            variant="contained"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                        >
                            OK
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        </>
    )
}

export default DoctorsTablesListOfAppointments;