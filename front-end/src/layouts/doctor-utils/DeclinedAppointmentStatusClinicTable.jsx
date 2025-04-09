import { useEffect } from "react"
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
import { useState } from "react"
import CMS from "../../API/CMS"
import EditIcon from "@mui/icons-material/Edit"
import { useNavigate } from "react-router-dom"
import Lottie from "lottie-react"
import successAnimation from "../../assets/animation/Main Scene.json"

const DeclinedAppointmentStatusClinicTable = () => {
    const [appointmentsData, setAppointmentsData] = useState([])
    // state for the fields error
    const [fieldsError, setFieldsError] = useState({
        firstName: "",
        lastName: "",
        email: "",
        appointmentDate: "",
        phoneNumber: "",
        gender: "",
        status: "",
        purposeOfAppointment: "",
    })
    const appointmentsTableColumn = [
        "Clinic Name",
        'First Name',
        'Last Name',
        "Email",
        'Appointment Date',
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
        appointmentDate: "",
        phoneNumber: "",
        gender: "",
        status: "",
        purposeOfAppointment: "",
    });
    const [open, setOpen] = useState(false);
    const [successfullAppointmentModalOpen, setSuccessfullAppointmentModalOpen] = useState(false);
    const handleClose = () => {
        setFieldsError({})
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            appointmentDate: "",
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

    useEffect(() => {
        const titleHeader = () => {
            document.title = "Clinic's Dashboard | Patient's Appointment | CMS"
        }
        titleHeader();

        const clinicID = localStorage.getItem("sid")

        const retrieveAppoinmentDeclinedStatus = async () => {
            try {
                const response = await CMS.get(`/CMS/doctors-dashboard/getPatientDeclinedStatus/${clinicID}`);

                if (!response.data) {
                    throw new Error("No retrieved declined status for appointments");
                }

                if (response.status === 200) {
                    setAppointmentsData(response.data.patientsDeclinedStatus);
                }
            } catch (error) {
                console.error(`Code functionality error for fetching declined status data: ${error}`);
            }
        }
        retrieveAppoinmentDeclinedStatus();
    }, [location.pathname])


    // this function is to formate the date to YYYY-MM-DD
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // function to format to MM/DD/YYYY to display in the table
    const dateFormat = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    };

    // this function is used to update the appointment details
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.status === "Approved") {
                formData.appointmentDate = new Date(formData.appointmentDate).toISOString().split("T")[0];
            }

            const response = await CMS.put(`/CMS/doctors-dashboard/updateAppointment/${formData.appointmentID}`, formData);

            if (response.status === 200) {
                setFieldsError({})
                setOpen(false);
                setSuccessfullAppointmentModalOpen(true);
                navigate("/doctor-portal/dashboard/patients-appointments");
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
            appointmentDate: formatDate(appointment.appointmentDate),
            phoneNumber: appointment.phoneNumber,
            gender: appointment.gender,
            status: appointment.status,
            purposeOfAppointment: appointment.purposeOfAppointment,
        });
        setOpen(true);
    }
    // this should match the status of the patients to render in appointment date
    const statusMatch = ["Approved", "Declined", "Pending", "Consulted"];

    const handleCloseSuccessfullAppointmentModal = () => {
        setSuccessfullAppointmentModalOpen(false);
        handleClose();
    }

    // this function determines the color of the status of the patients
    const getStatusColor = (status) => {
        switch (status) {
            case "Approved":
                return "text-black bg-green-300";
            case "Declined":
                return "text-black bg-red-300";
            case "Pending":
                return "text-black bg-yellow-300";
            case "Consulted":
                return "text-black bg-blue-300";
            default:
                return "text-gray-600 bg-gray-100";
        }
    }

    const getAppointmentDateColor = (status) => {
        switch (status) {
            case "Approved":
                return "text-black bg-green-300"
            case "Declined":
                return "bg-red-300 text-black"
            case "Pending":
                return "bg-yellow-300 text-black"
            case "Consulted":
                return "bg-blue-300 text-black"
            default:
                return "bg-gray-300 text-black"
        }
    }

    const status = ["Approved", "Declined", "Pending", "Consulted"];

    return (
        <>
            <div className="mt-12 mb-1 flex justify-center items-center w-full">
                <Card className="shadow-lg rounded-2xl w-full">
                    <CardHeader
                        title="Declined Appointments"
                        className="bg-blue-500 mb-8 p-6"
                        slotProps={{
                            title: {
                                variant: 'h6',
                                className: 'text-white text-center',
                            },
                        }}
                    />
                    <CardContent className="overflow-x-scroll px-0 pt-0 pb-2">
                        <Table className="w-full min-w-[640px] table-auto">
                            <TableHead>
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
                                        <TableRow key={id}>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.clinic_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.firstName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.lastName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className={`rounded-lg p-2 ${getAppointmentDateColor(appointment.status)}`}>
                                                    {statusMatch.includes(appointment.status) ? dateFormat(appointment.appointmentDate) : "N/A"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.phoneNumber}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.gender}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className={`rounded-lg p-2 ${getStatusColor(appointment.status)}`}>
                                                    {appointment.status ? appointment.status : "N/A"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.purposeOfAppointment}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
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
                            autoFocus
                            margin="dense"
                            label="Enter Appointment ID"
                            type="text"
                            fullWidth
                            hidden
                            value={formData.appointmentID}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            label="First Name"
                            type="text"
                            fullWidth
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            error={Boolean(fieldsError.firstName)}
                            helperText={fieldsError.firstName ? fieldsError.firstName : ""}
                        />
                        <TextField
                            margin="dense"
                            label="Last Name"
                            type="text"
                            fullWidth
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            error={Boolean(fieldsError.lastName)}
                            helperText={fieldsError.lastName ? fieldsError.lastName : ""}
                        />
                        <TextField
                            margin="dense"
                            label="Enter Email"
                            type="text"
                            fullWidth
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            error={Boolean(fieldsError.email)}
                            helperText={fieldsError.email ? fieldsError.email : ""}
                        />
                        <TextField
                            margin="dense"
                            label="Appointment Date"
                            type="date"
                            fullWidth
                            value={formData.appointmentDate}
                            onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            error={Boolean(fieldsError.appointmentDate)}
                            helperText={fieldsError.appointmentDate ? fieldsError.appointmentDate : ""}
                        />
                        <TextField
                            margin="dense"
                            label="Enter Phone Number"
                            type="number"
                            fullWidth
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            error={Boolean(fieldsError.phoneNumber)}
                            helperText={fieldsError.phoneNumber ? fieldsError.phoneNumber : ""}
                        />
                        <FormControl fullWidth margin="dense" error={Boolean(fieldsError.gender)}>
                            <InputLabel>Gender</InputLabel>
                            <Select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                label="Gender"
                            >
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                            </Select>
                            {fieldsError.gender && <FormHelperText error>{fieldsError.gender}</FormHelperText>}
                        </FormControl>
                        <FormControl fullWidth margin="dense" error={Boolean(fieldsError.status)}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                            fullWidth
                            value={formData.purposeOfAppointment}
                            onChange={(e) => setFormData({ ...formData, purposeOfAppointment: e.target.value })}
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

export default DeclinedAppointmentStatusClinicTable;