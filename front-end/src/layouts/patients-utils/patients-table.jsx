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
    FormHelperText,
} from "@mui/material";
import AppointmentsTable from "../../hooks/useMemoTableRows";
import { useState, useEffect } from "react";
import CMS from "../../API/CMS";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"
import { CheckCircle } from "@mui/icons-material";

const PatientsTable = () => {
    const appointmentsTableColumn = [
        'First Name',
        'Last Name',
        "Email",
        'Appointment Date',
        "Phone Number",
        "Gender",
        'Doctor',
        'Status',
        'Purpose of Appointment',
    ]
    const [open, setOpen] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [appointmentID, setAppointmentID] = useState("");
    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setFieldErrors({});
        setOpen(false);
    }
    const handleSuccessModalClose = () => {
        setSuccessModalOpen(false);
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
    const [fieldErrors, setFieldErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        appointmentDate: "",
        gender: "",
        doctor: "",
        status: "",
        purposeOfAppointment: ""
    })
    const retrievePatientData = async (patientID) => {
        try {
            const response = await CMS.get(`/CMS/patientsDashboard/getBookedAppointments/${patientID}`, {
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
        const retrievedPatientId = localStorage.getItem("sid");
        if (retrievedPatientId) {
            setAppointmentID(retrievedPatientId);
            retrievePatientData(retrievedPatientId);
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
        try {
            e.preventDefault();
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
                setFieldErrors({});
                setIsAppointmentOpen(true);
                setOpen(false);
                setRetrievedAppointmentsData([...retrievedAppointmentsData, payload]);
                setSuccessModalOpen(true);
                navigate("/patients-dashboard/book-appointment");
            } else {
                console.error("Failed status code: ", response.status);
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setFieldErrors(error.response.data.errors)
            } else {
                console.error(`Failed to book appointment: ${error}`);
            }
        }
    }

    return (
        <>
            <div className="mt-4 flex flex-row justify-end items-center">
                <div className="p-1 rounded-lg">
                    <Button variant="contained" className="text-white" onClick={handleOpen}>
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
                                    type="number"
                                />
                                <TextField
                                    label="Enter First Name"
                                    fullWidth
                                    value={appointmentData.firstName}
                                    onChange={(e) => setAppointmentData({ ...appointmentData, firstName: e.target.value })}
                                    type="text"
                                    error={Boolean(fieldErrors.firstName)}
                                    helperText={fieldErrors.firstName}
                                />
                                <TextField
                                    label="Enter Last Name"
                                    fullWidth
                                    value={appointmentData.lastName}
                                    onChange={(e) => setAppointmentData({ ...appointmentData, lastName: e.target.value })}
                                    type="text"
                                    error={Boolean(fieldErrors.lastName)}
                                    helperText={fieldErrors.lastName}
                                />
                                <TextField
                                    label="Enter Email Address"
                                    fullWidth
                                    value={appointmentData.email}
                                    onChange={(e) => setAppointmentData({ ...appointmentData, email: e.target.value })}
                                    type="text"
                                    error={Boolean(fieldErrors.email)}
                                    helperText={fieldErrors.email}
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
                                    error={Boolean(fieldErrors.appointmentDate)}
                                    helperText={fieldErrors.appointmentDate}
                                />
                                <TextField
                                    label="Enter Phone Number"
                                    fullWidth
                                    value={appointmentData.phoneNumber}
                                    onChange={(e) => setAppointmentData({ ...appointmentData, phoneNumber: e.target.value })}
                                    type="number"
                                    error={Boolean(fieldErrors.phoneNumber)}
                                    helperText={fieldErrors.phoneNumber}
                                />
                                <FormControl fullWidth variant="outlined" error={Boolean(fieldErrors.gender)}>
                                    <InputLabel>Select a Gender</InputLabel>
                                    <Select
                                        value={appointmentData.gender}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, gender: e.target.value })}
                                    >
                                        {gender.map((gender) => (
                                            <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                                        ))}
                                    </Select>
                                    {fieldErrors.gender && <FormHelperText error>{fieldErrors.gender}</FormHelperText>}
                                </FormControl>
                                <FormControl fullWidth variant="outlined" error={Boolean(fieldErrors.doctor)}>
                                    <InputLabel>Select a Doctor</InputLabel>
                                    <Select
                                        value={appointmentData.doctor}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, doctor: e.target.value })}
                                    >
                                        {doctors.map((doctor) => (
                                            <MenuItem key={doctor} value={doctor}>{doctor}</MenuItem>
                                        ))}
                                    </Select>
                                    {fieldErrors.doctor && <FormHelperText error>{fieldErrors.doctor}</FormHelperText>}
                                </FormControl>
                                <FormControl fullWidth variant="outlined" error={Boolean(fieldErrors.status)}>
                                    <InputLabel>Select Status</InputLabel>
                                    <Select
                                        value={appointmentData.status}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, status: e.target.value })}
                                    >
                                        {statuses.map((status) => (
                                            <MenuItem key={status} value={status}>{status}</MenuItem>
                                        ))}
                                    </Select>
                                    {fieldErrors.status && <FormHelperText error>{fieldErrors.status}</FormHelperText>}
                                </FormControl>
                                <TextField
                                    label="Enter Purpose of Appointment"
                                    fullWidth
                                    type="text"
                                    value={appointmentData.purposeOfAppointment}
                                    onChange={(e) => setAppointmentData({ ...appointmentData, purposeOfAppointment: e.target.value })}
                                    error={Boolean(fieldErrors.purposeOfAppointment)}
                                    helperText={fieldErrors.purposeOfAppointment}
                                    multiline
                                />
                            </div>
                            <DialogActions className="p-4">
                                <Button onClick={handleClose} className="text-red-500" variant="outlined">Cancel</Button>
                                <Button className="text-blue-500" type="submit" variant="contained">Book Appointment</Button>
                            </DialogActions>
                        </form>
                    </DialogContent>
                </Dialog>
                <Dialog open={successModalOpen} onClose={handleSuccessModalClose} maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex flex-col items-center justify-center"
                    >
                        <DialogTitle className="bg-green-500 text-white text-center w-full">
                            Patient Appointment Booked Successfully!
                        </DialogTitle>
                        <DialogContent className="p-4 text-center mt-4 flex flex-col items-center">
                            <CheckCircle className="text-green-500" />
                            <Typography variant="body1" className="mt-2">
                                Your appointment has been scheduled. We will notify you with further details.
                            </Typography>
                        </DialogContent>
                        <DialogActions className="flex justify-center">
                            <Button
                                onClick={handleSuccessModalClose}
                                variant="contained"
                                color="primary"
                            >
                                OK
                            </Button>
                        </DialogActions>
                    </motion.div>
                </Dialog>
            </div>
            <div className="mt-5 mb-1 flex justify-center items-center w-full">
                <Card className="shadow-lg w-full">
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