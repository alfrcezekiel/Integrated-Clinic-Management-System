import {
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    DialogActions,
    Card,
    CardHeader,
    CardContent,
    Table,
    TableHead,
    TableRow,
    TableCell,
} from "@mui/material";
import AppointmentsTable from "../../hooks/useMemoTableRows";
import { useState, useEffect } from "react";
import CMS from "../../API/CMS";
import { useNavigate } from "react-router-dom";

const appointmentsTableColumn = [
    'First Name',
    'Last Name',
    'Appointment Date',
    'Doctor',
    'Status',
    'Purpose of Appointment',
    "Action"
]

const PatientsTable = () => {
    const [open, setOpen] = useState(false);
    const [appointmentID, setAppointmentID] = useState("");
    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    }
    const [appointmentData, setAppointmentData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        appointmentDate: "",
        phoneNumber: "",
        gender: "",
        status: "",
        doctor: "",
        purposeOfAppointment: ""
    });
    const [retrievedAppointmentsData, setRetrievedAppointmentsData] = useState([]);
    const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
    const navigate = useNavigate();
    const doctors = ["Dr. Smith", "Dr. Baek Kang Hyuk", "Dr. Kim"];
    const statuses = ["Pending"];
    const gender = ["Male", "Female"];

    const retrievePatientData = async () => {
        try {
            if (!appointmentID) {
                alert("Please enter a valid patients id")
                return;
            }
            const response = await CMS.get(`/CMS/patientsDashboard/getBookedAppointments/${appointmentID}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status === 200) {
                setAppointmentData(prevData => ({
                    ...prevData,
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email,
                    phoneNumber: response.data.phoneNumber
                }));
            } else {
                setAppointmentID("");
                setAppointmentData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: "",
                })
                alert("No patient data found");
            }
        } catch (error) {
            console.error(`Failed to retrieve patient data: ${error}`);
        }
    }
    useEffect(() => {
        if (appointmentID) {
            retrievePatientData();
        }

        const retrieveAppointments = async () => {
            try {
                const response = await CMS.get("/CMS/patientsDashboard/bookedAppointments", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.status === 200) {
                    setRetrievedAppointmentsData(response.data.patientsAppointments);
                }

            } catch (error) {
                console.log(`Failed to retrieve appointments: ${error}`);
            }
        }
        retrieveAppointments();

    }, [appointmentID]);

    // this function is used to book an appointment 
    const handleBookAppointment = async (e) => {
        e.preventDefault();
        try {
            if (!appointmentID) {
                alert("Appointment ID is required");
                handleOpen(true);
                return;
            }

            if (!appointmentData || Object.keys(appointmentData).length === 0) {
                alert("Please fill in the appointment details before booking");
                return;
            }

            const payload = {
                appointmentID: appointmentID,
                ...appointmentData,
            }
            const response = await CMS.post("/CMS/patientsDashboard/patientsBookedAppointments", payload, {
                headers: {
                    "Content-Type": "application/json"
                },
            });

            if (response.status === 200 || response.status === 201) {
                alert("Appointment booked successfully");
                setIsAppointmentOpen(true);
                navigate("/patients-dashboard/book-appointment");
            }
        } catch (error) {
            console.log(`Failed to book appointment: ${error}`);
        }
    }
    
    return (
        <>
            <div className="flex justify-center items-center gap-4 flex-col mt-4">
                <Typography variant="h5" className="text-blue-gray-600 text-center">
                    Patients Appointments
                </Typography>
                <div className="bg-black p-1 rounded-lg">
                    <Button variant="outlined" className="text-white" onClick={handleOpen}>
                        Open Appointment Form
                    </Button>
                </div>
                {/* clickable button to open a appointment form */}
                <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                    <DialogTitle className="bg-blue-500 text-white">Book Appoinment</DialogTitle>
                    <DialogContent className="space-y-4 p-4 mt-4">
                        <form onSubmit={handleBookAppointment}>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <TextField
                                    label="Enter Patient ID"
                                    fullWidth
                                    value={appointmentID}
                                    onChange={(e) => setAppointmentID(e.target.value)}
                                    type="number"
                                />
                                <TextField
                                    label="Enter First Name"
                                    fullWidth
                                    value={appointmentData.firstName}
                                    onChange={(e) => setAppointmentData({ ...appointmentData, firstName: e.target.value })}
                                    type="text"
                                />
                                <TextField
                                    label="Enter Last Name"
                                    fullWidth
                                    value={appointmentData.lastName}
                                    onChange={(e) => setAppointmentData({ ...appointmentData, lastName: e.target.value })}
                                    type="text"
                                />
                                <TextField
                                    label="Enter Email Address"
                                    fullWidth
                                    value={appointmentData.email}
                                    onChange={(e) => setAppointmentData({ ...appointmentData, email: e.target.value })}
                                    type="text"
                                />
                                <TextField
                                    label="Enter Appointment Date"
                                    fullWidth
                                    type="date"
                                    value={appointmentData.appointmentDate}
                                    onChange={(e) => setAppointmentData({ ...appointmentData, appointmentDate: e.target.value })}
                                    InputLabelProps={{
                                        shrink: true
                                    }}
                                />
                                <TextField
                                    label="Enter Phone Number"
                                    fullWidth
                                    value={appointmentData.phoneNumber}
                                    onChange={(e) => setAppointmentData({ ...appointmentData, phoneNumber: e.target.value })}
                                    type="number"
                                />
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Select a Gender</InputLabel>
                                    <Select
                                        value={appointmentData.gender}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, gender: e.target.value })}
                                    >
                                        {gender.map((gender) => (
                                            <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Select a Doctor</InputLabel>
                                    <Select
                                        value={appointmentData.doctor}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, doctor: e.target.value })}
                                    >
                                        {doctors.map((doctor) => (
                                            <MenuItem key={doctor} value={doctor}>{doctor}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Select Status</InputLabel>
                                    <Select
                                        value={appointmentData.status}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, status: e.target.value })}
                                    >
                                        {statuses.map((status) => (
                                            <MenuItem key={status} value={status}>{status}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Enter Purpose of Appointment"
                                    fullWidth
                                    type="text"
                                    value={appointmentData.purposeOfAppointment}
                                    onChange={(e) => setAppointmentData({ ...appointmentData, purposeOfAppointment: e.target.value })}
                                    multiline
                                />
                            </div>
                            <DialogActions className="p-4">
                                <Button onClick={handleClose} className="text-red-500" variant="outlined">Cancel</Button>
                                <Button onClick={handleClose} className="text-blue-500" type="submit" variant="contained">Book Appointment</Button>
                            </DialogActions>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="mt-12 mb-1 flex justify-center items-center w-full">
                <Card className="shadow-lg">
                    <CardHeader
                        title="Appointments"
                        className="bg-blue-500 mb-8 p-6"
                        titleTypographyProps={{
                            variant: 'h6',
                            className: 'text-white text-center',
                        }}
                    />
                    <CardContent className="overflow-x-scroll px-0 pt-0 pb-2">
                        <Table className="w-full min-w-[640px]">
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
                            <AppointmentsTable 
                                isAppointmentOpen={isAppointmentOpen} 
                                retrievedAppointmentsData={retrievedAppointmentsData}
                            />
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default PatientsTable;