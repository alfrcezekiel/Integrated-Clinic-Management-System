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
    DialogContentText,
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

const DoctorsTablesListOfAppointments = () => {
    const [appointmentsData, setAppointmentsData] = useState([])

    const appointmentsTableColumn = [
        'First Name',
        'Last Name',
        'Appointment Date',
        'Doctor',
        'Status',
        'Purpose of Appointment',
        "Action"
    ]
    const [formData, setFormData] = useState({
        appointmentID: "",
        firstName: "",
        lastName: "",
        appointmentDate: "",
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
            firstName: appointment.firstName,
            lastName: appointment.lastName,
            appointmentDate: formatDate(appointment.appointmentDate),
            doctor: appointment.doctor,
            status: appointment.status,
            purposeOfAppointment: appointment.purposeOfAppointment,
        });
        setOpen(true);
    }

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
        return `${month}/${day}/${year}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await CMS.put(`/CMS/doctors-dashboard/updateAppointments/${formData.appointmentID}`, formData);

            if (!response.data) {
                throw new Error("No response data for updating the appointment");
            }

            if (response.status === 200) {
                alert("Update patients details")
                setOpen(false);
            }
        } catch (error) {
            console.error(`Code functionality error for updating the appointment: ${error}`);
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
                                                {formatDate(appointment.appointmentDate)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                {appointment.doctor}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" className="text-blue-gray-900">
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
                    <DialogContentText>

                    </DialogContentText>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="First Name"
                            type="text"
                            fullWidth
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                        <TextField
                            margin="dense"
                            label="Last Name"
                            type="text"
                            fullWidth
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                        <TextField
                            margin="dense"
                            label="Appointment Date"
                            type="date"
                            fullWidth
                            value={formData.appointmentDate}
                            onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            margin="dense"
                            label="Doctor"
                            type="text"
                            fullWidth
                            value={formData.doctor}
                            onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
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
                            onChange={(e) => setFormData({...formData, purposeOfAppointment: e.target.value})}
                        />
                        <DialogActions>
                            <Button onClick={handleClose} color="primary" variant="outlined">
                                Cancel
                            </Button>
                            <Button type="submit" color="primary" variant="contained">
                                Save
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default DoctorsTablesListOfAppointments;