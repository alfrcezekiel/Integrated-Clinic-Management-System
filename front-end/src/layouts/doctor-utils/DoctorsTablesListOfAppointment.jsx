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
    MenuItem
} from "@mui/material"
import { useState } from "react"
import CMS from "../../API/CMS"
import EditIcon from "@mui/icons-material/Edit"
import { useNavigate } from "react-router-dom"

const DoctorsTablesListOfAppointments = () => {
    const [appointmentsData, setAppointmentsData] = useState([])

    const appointmentsTableColumn = [
        "ID",
        'First Name',
        'Last Name',
        "Email",
        'Appointment Date',
        "Phone Number",
        "Gender",
        'Doctor',
        'Status',
        'Purpose of Appointment',
        "Action"
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
        doctor: "",
        status: "",
        purposeOfAppointment: "",
    });
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    }

    const handleClickOpen = (appointment) => {
        setFormData({
            appointmentID: appointment.appointmentID,
            firstName: appointment.firstName,
            lastName: appointment.lastName,
            email: appointment.email,
            appointmentDate: formatDate(appointment.appointmentDate),
            phoneNumber: appointment.phoneNumber,
            gender: appointment.gender,
            doctor: appointment.doctor,
            status: appointment.status,
            purposeOfAppointment: appointment.purposeOfAppointment,
        });
        setOpen(true);
    }
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        const titleHeader = () => {
            document.title = "Doctor's Dashboard | Patient's Appointment | CMS"
        }
        titleHeader();

        const retrievedAppointmentsData = async () => {
            try {
                const response = await CMS.get(`/CMS/doctors-dashboard/appointments`);

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // this function is used to update the appointment details
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if(formData.status === "Scheduled"){
                formData.appointmentDate = new Date(formData.appointmentDate).toISOString().split("T")[0];
            }

            const response = await CMS.put(`/CMS/doctors-dashboard/updateAppointment/${formData.appointmentID}`, formData);

            if (response.status === 200) {
                alert("Updated patients details")
                setOpen(false);
                navigate("/doctor-portal/dashboard/patients-appointments");
            } else {
                throw new Error(`Unexpected error in status ${response.status}`)
            }
        } catch (error) {
            console.error(`Code functionality error for updating the appointment: ${error}`);
        }
    }

    // this function determines the color of the status of the patients
    const getStatusColor = (status) => {
        switch(status){
            case "Scheduled":
                return "text-green-600 bg-green-100";
            case "Cancelled":
                return "text-red-600 bg-red-100";
            case "Pending": 
                return "text-yellow-600 bg-yellow-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    }

    return (
        <>
            <div className="mt-12 mb-1 flex justify-center items-center w-full">
                <Card className="shadow-lg rounded-2xl w-full">
                    <CardHeader
                        title="List of Patients Appointments"
                        className="bg-blue-500 mb-8 p-6"
                        titleTypographyProps={{
                            variant: 'h6',
                            className: 'text-white text-center',
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
                                                variant="caption"
                                                className="text-[11px] font-bold uppercase text-blue-gray-400"
                                            >
                                                {header}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {appointmentsData.map((appointment, id) => (
                                    <TableRow key={id}>
                                        <TableCell align="center">
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                {appointment.appointmentID}
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
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                {formatDate(appointment.appointmentDate)}
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
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                {appointment.doctor}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" className={`rounded-lg ${getStatusColor(appointment.status)}`}> 
                                                {appointment.status}
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
                                ))}
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
                            value={formData.appointmentID}
                            onChange={(e) => setFormData({ ...formData, appointmentID: e.target.value })}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            label="First Name"
                            type="text"
                            fullWidth
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Last Name"
                            type="text"
                            fullWidth
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Enter Email"
                            type="text"
                            fullWidth
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Gender</InputLabel>
                            <Select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                label="Gender"
                            >
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            margin="dense"
                            label="Doctor"
                            type="text"
                            fullWidth
                            value={formData.doctor}
                            onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                label="Status"
                            >
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Scheduled">Scheduled</MenuItem>
                                <MenuItem value="Cancelled">Cancelled</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            margin="dense"
                            label="Purpose of Appointment"
                            type="text"
                            fullWidth
                            value={formData.purposeOfAppointment}
                            onChange={(e) => setFormData({ ...formData, purposeOfAppointment: e.target.value })}
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
        </>
    )
}

export default DoctorsTablesListOfAppointments;