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
    MenuItem
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
import dayjs from "dayjs"
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useAuthorization } from "../../context/auth/useAuthorization.jsx"
import DeleteIcon from "@mui/icons-material/Delete"
import DeleteConfirmationDialog from "../../utils/DeleteConfirmation.jsx"

const PendingAppointmentClinicTable = () => {
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
        purposeOfAppointment: "",
    })
    const appointmentsTableColumn = [
        "Clinic Name",
        'Full Name',
        "Email",
        'Appointment Date',
        "Appointment Time",
        "Phone Number",
        "Gender",
        'Status',
        'Purpose of Appointment',
        "Action",
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
        purposeOfAppointment: "",
    });
    const [open, setOpen] = useState(false);
    const [successfullAppointmentModalOpen, setSuccessfullAppointmentModalOpen] = useState(false);
    const [selectedBookedAppointment, setSelectedBookedAppointment] = useState(null);
    const [openDeleteBookedAppointmentDialog, setOpenDeleteBookedAppointmentDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { user, token } = useAuthorization();

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

    const clinicID = useMemo(() => user?.sid || localStorage.getItem("sid"), [user]);
    if (!clinicID) {
        console.error("No clinic ID found in user session or localStorage");
    }

    const tokenContext = useMemo(() => token || localStorage.getItem("authToken"), [token]);
    if (!tokenContext) {
        console.error("No token found in context or localStorage");
    }

    const retrievedAppointmentPendingStatus = useCallback(async () => {
        try {
            const response = await CMS.get(`/doctors-dashboard/getPatientPendingStatus/${clinicID}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            });

            if (!response.data) {
                throw new Error("No retrieved data for appointments");
            }

            if (response.status === 200) {
                setAppointmentsData(response.data.patientsPendingStatus);
            }
        } catch (error) {
            console.error(`Code functionality error for fetching appointments data: ${error}`);
        }
    }, [clinicID, tokenContext]);

    useEffect(() => {
        const titleHeader = () => {
            document.title = "Clinic's Dashboard | Patient's Appointment | CMS"
        }
        titleHeader();

        retrievedAppointmentPendingStatus();
    }, [location.pathname, clinicID, tokenContext, retrievedAppointmentPendingStatus]);

    // function to format to MM/DD/YYYY to display in the table
    const dateFormat = (dateString) => {
        if (!dateString) return "N/A";
        return dayjs(dateString).format("MMMM D, YYYY");
    };

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

    // this function is used to update the appointment details
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (submitting) return; // Prevent multiple submissions
            setSubmitting(true);

            const updatedData = {
                ...memoizedFormDataValue,
                appointmentDate: memoizedFormDataValue.status === "Approved" ? dayjs(memoizedFormDataValue.appointmentDate) : memoizedFormDataValue.appointmentDate,
                preferredTime: memoizedFormDataValue.preferredTime ? memoizedFormDataValue.preferredTime : null
            };

            const response = await CMS.put(`/doctors-dashboard/updateAppointment/${formData.appointmentID}`, updatedData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            });

            if (response.status === 200) {
                setFieldsError({})
                setOpen(false);
                setSuccessfullAppointmentModalOpen(true);
            } else {
                throw new Error(`Unexpected error in status ${response.status}`)
            }

        } catch (error) {
            if (error.response && error.response.status === 400) {
                setFieldsError(error.response.data.errors);
            } else {
                console.error(`Code functionality error for updating the appointment: ${error}`);
            }
        } finally {
            setSubmitting(false);
        }
    }

    // // this function is used to open the modal for updating the appointment details
    // const handleClickOpen = (appointment) => {
    //     setFormData({
    //         appointmentID: appointment.appointmentID,
    //         firstName: appointment.firstName,
    //         lastName: appointment.lastName,
    //         email: appointment.email,
    //         appointmentDate: dayjs(appointment.appointmentDate),
    //         preferredTime: appointment.preferredTime ? appointment.preferredTime : null, // store as string
    //         phoneNumber: appointment.phoneNumber,
    //         gender: appointment.gender,
    //         status: appointment.status,
    //         purposeOfAppointment: appointment.purposeOfAppointment,
    //     });
    //     setOpen(true);
    // }

    /**
    * @function callback to navigate in modify booked appointment details
    */
    const navigateToModifyBookedAppointment = useCallback(appointment => {
        navigate("/doctor-portal/dashboard/ModifyBookedAppointment", {
            state: {
                bookedAppointment: {
                    bookedAppointmentID: appointment.appointmentID,
                    firstName: appointment.firstName,
                    lastName: appointment.lastName,
                    address: appointment.address,
                    email: appointment.email,
                    phoneNumber: appointment.phoneNumber,
                    appointmentDate: appointment.appointmentDate,
                    appointmentTime: appointment.appointmentTime,
                    gender: appointment.gender,
                    status: appointment.status,
                    purposeOfAppointment: appointment.purposeOfAppointment,
                    type: "Patient"
                }
            }
        })
    }, [navigate]);

    const handleCloseSuccessfullAppointmentModal = useCallback(() => {
        setFieldsError({});
        setSuccessfullAppointmentModalOpen(false);

        // Navigate after dialog is closed
        if (memoizedFormDataValue.status === "Pending") {
            navigate("/doctor-portal/dashboard/Appointments");
        } else if (memoizedFormDataValue.status === "Approved") {
            navigate("/doctor-portal/dashboard/ApprovedAppointments");
        } else if (memoizedFormDataValue.status === "Declined") {
            navigate("/doctor-portal/dashboard/DeclinedAppointments");
        }
    }, [memoizedFormDataValue.status, navigate]);

    // function for handling the change of the input fields
    const handleCallbackChangeInput = useCallback(async (e) => {
        const handleChangeInput = (e) => {
            const { name, value } = e.target;
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value,
            }));

            if (fieldsError[name]) {
                setFieldsError((prevFieldsError) => ({
                    ...prevFieldsError,
                    [name]: "",
                }));
            }
        }
        handleChangeInput(e)
    }, [fieldsError])

    // this function is used to handle the change of the appointment date
    const handleAppointmentDateChange = useCallback(async (newValue) => {
        const handleChangeInput = (newValue) => {
            if (newValue) {
                const selectedDate = dayjs(newValue).format("YYYY-MM-DD");
                setFormData((prev) => ({
                    ...prev,
                    appointmentDate: dayjs(selectedDate)
                }))
            } else {
                setFormData((prev) => ({
                    ...prev,
                    appointmentDate: null
                }))
            }

            if (fieldsError.appointmentDate) {
                setFieldsError({
                    ...fieldsError,
                    appointmentDate: null
                });
            }
        }
        handleChangeInput(newValue)
    }, [fieldsError])

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
                return "text-gray-600 bg-white";
        }
    }

    // function for handling the change of the appointment time
    const handleCallbackTimePickerChange = useCallback(async (newValue) => {
        const handleTimePickerChange = async (newValue) => {
            if (newValue && dayjs(newValue).isValid()) {
                setFormData((prev) => ({
                    ...prev,
                    preferredTime: dayjs(newValue).format("HH:mm")
                }))
            } else {
                setFormData((prev) => ({
                    ...prev,
                    preferredTime: null
                }))
            }

            if (fieldsError.preferredTime) {
                setFieldsError({
                    ...fieldsError,
                    preferredTime: null
                })
            }
        }
        handleTimePickerChange(newValue)
    }, [fieldsError])


    const status = ["Approved", "Declined", "Pending", "Cancelled"];
    const gender = ["Male", "Female"]

    // function to open the delete booked appointment dialog
    const deleteBookedAppointmentDialog = async (bookedAppointment) => {
        setSelectedBookedAppointment(bookedAppointment);
        setOpenDeleteBookedAppointmentDialog(true);
    }

    // function to close the delete booked appointment dialog
    const handleCloseDeleteBookedAppointmentDialog = async () => {
        setOpenDeleteBookedAppointmentDialog(false);
        setSelectedBookedAppointment(null);
        await retrievedAppointmentPendingStatus();
    }

    // function to handles transaction in deleting the booked appointment
    const handleConfirmedDeletedBookedAppointment = async () => {
        try {
            const response = await CMS.delete(`/clinicDashboard/deleteBookedAppointment/${selectedBookedAppointment.appointmentID}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            })

            if (response.status === 200) {
                setAppointmentsData((prev) => (
                    prev.filter((bookedAppointment) => bookedAppointment.appointmentID === selectedBookedAppointment.appointmentID ? selectedBookedAppointment : bookedAppointment)
                ))
                handleCloseDeleteBookedAppointmentDialog();
            } else {
                throw new Error(`Unexpected error in deleting booked appointment: ${response.statusText}`)
            }
        } catch (error) {
            console.error(`Codebase functionality error in deleting the confirmed booked appointment: ${error}`)
        }
    }

    return (
        <>
            <div className="mt-12 mb-1 flex justify-center items-center w-full">
                <Card className="shadow-lg rounded-2xl w-full">
                    <CardHeader
                        title="Pending Appointments"
                        className="bg-blue-500 mb-2 p-6"
                        slotProps={{
                            title: {
                                variant: 'h6',
                                className: 'text-white text-center',
                            },
                        }}
                    />
                    <CardContent className="overflow-x-scroll pt-0 pb-2 rounded-xl shadow-sm bg-white">
                        <Table className="w-full min-w-[100%] text-center text-gray-500">
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
                                                    {appointment.firstName} {appointment.lastName}
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
                                                    {appointment.status}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" className="border-b border-blue-gray-50 text-center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.purposeOfAppointment}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" className="border-b border-blue-gray-50 text-center" sx={{ display: "flex" }}>
                                                <IconButton aria-label="edit" onClick={() => navigateToModifyBookedAppointment(appointment)}>
                                                    <EditIcon color="primary" />
                                                </IconButton>
                                                <IconButton aria-label="delete" onClick={() => deleteBookedAppointmentDialog(appointment)}>
                                                    <DeleteIcon color="error" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={appointmentsTableColumn.length} align="center">
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                No pending appointments available.
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
                            autoFocus
                            margin="dense"
                            label="Enter Appointment ID"
                            type="text"
                            fullWidth
                            autoComplete="off"
                            hidden
                            value={memoizedFormDataValue.appointmentID}
                        />
                        <TextField
                            margin="dense"
                            label="First Name"
                            type="text"
                            autoComplete="off"
                            fullWidth
                            name="firstName"
                            value={memoizedFormDataValue.firstName}
                            onChange={handleCallbackChangeInput}
                            error={Boolean(fieldsError?.firstName)}
                            helperText={fieldsError?.firstName ? fieldsError.firstName : ""}
                        />
                        <TextField
                            margin="dense"
                            label="Last Name"
                            autoComplete="off"
                            name="lastName"
                            type="text"
                            fullWidth
                            value={memoizedFormDataValue.lastName}
                            onChange={handleCallbackChangeInput}
                            error={Boolean(fieldsError?.lastName)}
                            helperText={fieldsError?.lastName ? fieldsError.lastName : ""}
                        />
                        <TextField
                            margin="dense"
                            label="Enter Email"
                            autoComplete="off"
                            onChange={handleCallbackChangeInput}
                            name="email"
                            type="text"
                            fullWidth
                            value={memoizedFormDataValue.email}
                            error={Boolean(fieldsError?.email)}
                            helperText={fieldsError?.email ? fieldsError.email : ""}
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['DatePicker']}>
                                <DatePicker
                                    autoComplete="off"
                                    name="appointmentDate"
                                    label="Appointment Date"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            margin: "dense",
                                            variant: "outlined",
                                            error: Boolean(fieldsError?.appointmentDate),
                                            helperText: fieldsError?.appointmentDate ? fieldsError.appointmentDate : null,
                                        },
                                    }}
                                    value={memoizedFormDataValue.appointmentDate !== null ? dayjs(memoizedFormDataValue.appointmentDate) : null}
                                    onChange={handleAppointmentDateChange}
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['TimePicker']}>
                                <TimePicker
                                    label="Appointment Time"
                                    autoComplete="off"
                                    name="preferredTime"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            margin: "dense",
                                            variant: "outlined",
                                            error: Boolean(fieldsError?.preferredTime),
                                            helperText: fieldsError?.preferredTime ? fieldsError.preferredTime : null,
                                        },
                                    }}
                                    value={memoizedFormDataValue.preferredTime ? dayjs(memoizedFormDataValue.preferredTime, "HH:mm") : null}
                                    onChange={handleCallbackTimePickerChange}
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                        <TextField
                            margin="dense"
                            label="Enter Phone Number"
                            type="number"
                            autoComplete="off"
                            name="phoneNumber"
                            fullWidth
                            value={memoizedFormDataValue.phoneNumber}
                            onChange={handleCallbackChangeInput}
                            error={Boolean(fieldsError?.phoneNumber)}
                            helperText={fieldsError?.phoneNumber ? fieldsError.phoneNumber : ""}
                        />
                        <TextField
                            autoComplete="off"
                            name="gender"
                            value={memoizedFormDataValue.gender}
                            onChange={handleCallbackChangeInput}
                            label="Select Gender"
                            placeholder="Select Gender"
                            select
                            fullWidth
                            margin="dense"
                            error={Boolean(fieldsError?.gender)}
                            helperText={fieldsError?.gender ? fieldsError.gender : ""}
                        >
                            {gender.map((gender, i) => (
                                <MenuItem key={i} value={gender}>
                                    {gender}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            autoComplete="off"
                            name="status"
                            value={memoizedFormDataValue.status}
                            onChange={handleCallbackChangeInput}
                            label="Select Status"
                            placeholder="Select Status"
                            select
                            fullWidth
                            margin="dense"
                            error={Boolean(fieldsError?.status)}
                            helperText={fieldsError?.status ? fieldsError.status : ""}
                        >
                            {status.map((status, i) => (
                                <MenuItem key={i} value={status}>
                                    {status}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            margin="dense"
                            label="Purpose of Appointment"
                            type="text"
                            autoComplete="off"
                            name="purposeOfAppointment"
                            fullWidth
                            value={memoizedFormDataValue.purposeOfAppointment}
                            onChange={handleCallbackChangeInput}
                            error={Boolean(fieldsError?.purposeOfAppointment)}
                            helperText={fieldsError?.purposeOfAppointment ? fieldsError.purposeOfAppointment : ""}
                        />
                        <DialogActions>
                            <Button onClick={handleClose} color="primary" variant="outlined">
                                Cancel
                            </Button>
                            <Button type="submit" color="primary" variant="contained">
                                <span className="text-white">
                                    {submitting ? "Loading..." : "Update Patient Appointment"}
                                </span>
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
            {/* component for deleting booked appointment */}
            <DeleteConfirmationDialog
                open={openDeleteBookedAppointmentDialog}
                onClose={handleCloseDeleteBookedAppointmentDialog}
                users={selectedBookedAppointment}
                onConfirm={handleConfirmedDeletedBookedAppointment}
            />
        </>
    )
}

export default PendingAppointmentClinicTable;