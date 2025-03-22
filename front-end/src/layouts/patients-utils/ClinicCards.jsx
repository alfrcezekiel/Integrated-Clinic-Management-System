import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    TextField,
    Modal,
    Box,
    Button,
    CardMedia,
    MenuItem
} from "@mui/material";
import {
    Email,
    LocalHospital,
    CalendarMonth,
    LocationOn,
    MedicalServices,
} from "@mui/icons-material";
import CMS from "../../API/CMS";

const ClinicCards = () => {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [appointmentData, setAppointmentData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        gender: "",
        appointmentDate: "",
        purposeOfAppointment: "",
    });
    const [appointmentID, setAppointmentID] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

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
            }
        } catch (error) {
            console.error(`Failed to retrieve patient data: ${error}`);
        }
    }

    useEffect(() => {
        const fetchClinics = async () => {
            try {
                const response = await CMS.get("/CMS/admin-dashboard/clinics");
                setClinics(response.data.clinics);
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        }
        fetchClinics();

        const retrievePatientId = localStorage.getItem("sid")

        if (retrievePatientId) {
            setAppointmentID(retrievePatientId);
            retrievePatientData(retrievePatientId);
        }

    }, [appointmentID]);

    const handleOpenModal = (clinic) => {
        setSelectedClinic(clinic);
        setAppointmentID(appointmentID)
    };

    const handleCloseModal = () => {
        setSelectedClinic(null);
    };

    const handleBooking = async (e) => {
        try {
            e.preventDefault();
            const payload = {
                ...appointmentData,
                patientID: appointmentID,
            }

            const response = await CMS.post("/CMS/patientsDashboard/patientsBookedAppointments", payload);

            if (!response.data) {
                alert("Appointment booking failed. Please try again later");
            }

            if (response.status === 200) {
                alert("Appointment booked successfully");
                setAppointmentData({})
                setFieldErrors({})
                handleCloseModal();
            }
        } catch (error) {
            if(error.response === error.response.data.status === 400){
                setFieldErrors(error.response.data.error);
            } else {
                console.error(`Failed to book appointment: ${error}`);
            }
        }
    };

    return (
        <div className="flex flex-row flex-wrap justify-center gap-6 p-6 from-blue-50 to-blue-100">
            {loading ? (
                <CircularProgress />
            ) : clinics.length === 0 ? (
                <Typography variant="h6" className="text-gray-600">
                    No clinics found.
                </Typography>
            ) : (
                clinics.map((clinic) => (
                    <Card
                        key={clinic.clinic_id}
                        className="w-80 p-4 rounded-2xl bg-white/80 shadow-xl backdrop-blur-lg transform transition duration-300 hover:scale-105"
                    >
                        {clinic.image && (
                            <CardMedia
                                component="img"
                                height="160"
                                image="https://source.unsplash.com/300x200/?hospital,clinic"
                                alt={`Image of ${clinic.clinic_name}`}
                                className="rounded-t-2xl"
                            />
                        )}
                        <CardContent>
                            {/* Clinic Name */}
                            <Typography
                                variant="h6"
                                className="font-bold text-blue-800 text-center"
                            >
                                {clinic.clinic_name}
                            </Typography>

                            {/* Address */}
                            <Typography
                                variant="body2"
                                className="text-gray-700 text-center mt-2"
                            >
                                {clinic.clinic_address}
                            </Typography>

                            {/* Email */}
                            <div className="flex items-center justify-center mt-3 text-blue-600">
                                <Email className="mr-2" />
                                <Typography variant="body2">{clinic.email}</Typography>
                            </div>

                            {/* Clinic Type */}
                            <div className="flex items-center justify-center mt-3 text-green-600">
                                <LocalHospital className="mr-2" />
                                <Typography variant="body2" className="font-medium">
                                    {clinic.clinic_type}
                                </Typography>
                            </div>
                            <div className="mt-4">
                                <Button variant="contained" className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleOpenModal(clinic)}>Book an Appointment</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}

            <Modal open={!!selectedClinic} onClose={handleCloseModal}>
                <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
                    {selectedClinic && (
                        <>
                            {/* Clinic Details */}
                            <div className="flex justify-between items-center">
                                <Typography variant="h6" className="font-bold text-blue-800 flex items-center">
                                    <LocalHospital className="mr-2 text-red-600" /> {selectedClinic.clinic_name}
                                </Typography>
                                <Button onClick={handleCloseModal} color="primary" variant="contained">
                                    Close
                                </Button>
                            </div>

                            <div className="flex items-center text-gray-700 mt-2">
                                <LocationOn className="mr-2 text-blue-600" />
                                <Typography variant="body2">{selectedClinic.clinic_address}</Typography>
                            </div>

                            <div className="flex items-center text-blue-600 mt-2">
                                <Email className="mr-2" />
                                <Typography variant="body2">{selectedClinic.email}</Typography>
                            </div>

                            <div className="flex items-center text-green-600 mt-2">
                                <MedicalServices className="mr-2" />
                                <Typography variant="body2">{selectedClinic.clinic_type}</Typography>
                            </div>

                            <form onSubmit={handleBooking}>
                                <div className="mt-2">
                                    <TextField
                                        variant="outlined"
                                        value={appointmentID}
                                        hidden
                                    />
                                </div>
                                <div className="mt-2">
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        variant="outlined"
                                        value={appointmentData.firstName}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, firstName: e.target.value })}
                                        error={!!fieldErrors.firstName}
                                        helperText={fieldErrors.firstName}
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="mt-2">
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        variant="outlined"
                                        value={appointmentData.lastName}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, lastName: e.target.value })}
                                        error={!!fieldErrors.lastName}
                                        helperText={fieldErrors.lastName}
                                    />
                                </div>

                                {/* Email Address */}
                                <div className="mt-2">
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        type="email"
                                        variant="outlined"
                                        error={Boolean(fieldErrors.email)}
                                        helperText={fieldErrors.email}
                                        value={appointmentData.email}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, email: e.target.value })}
                                    />
                                </div>

                                {/* Phone Number */}
                                <div className="mt-2">
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        type="tel"
                                        variant="outlined"
                                        value={appointmentData.phoneNumber}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, phoneNumber: e.target.value })}
                                    />
                                </div>

                                {/* Gender Selection */}
                                <div className="mt-2">
                                    <TextField
                                        select
                                        fullWidth
                                        label="Gender"
                                        variant="outlined"
                                        value={appointmentData.gender}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, gender: e.target.value })}
                                    >
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                    </TextField>
                                </div>

                                {/* Date of Appointment */}
                                <div className="mt-2">
                                    <TextField
                                        fullWidth
                                        type="date"
                                        label="Date of Appointment"
                                        InputLabelProps={{ shrink: true }}
                                        variant="outlined"
                                        value={appointmentData.appointmentDate}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, appointmentDate: e.target.value })}
                                    />
                                </div>

                                {/* Purpose of Appointment */}
                                <div className="mt-2">
                                    <TextField
                                        fullWidth
                                        label="Purpose of Appointment"
                                        variant="outlined"
                                        multiline
                                        rows={3}
                                        value={appointmentData.purposeOfAppointment}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, purposeOfAppointment: e.target.value })}
                                    />
                                </div>

                                {/* Confirm Button - Inside Form */}
                                <div className="flex justify-center mt-6">
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                                        startIcon={<CalendarMonth />}
                                    >
                                        Confirm Appointment
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
                </Box>
            </Modal>
        </div >
    );
};

export default ClinicCards;
