import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Button,
    CardMedia,
    ImageList,
    ImageListItem
} from "@mui/material";
import CMS from "../../API/CMS";
import LocationOn from "@mui/icons-material/LocationOn";
import {
    Clock,
    Mail,
    Stethoscope,
    DollarSign,
    Building
} from 'lucide-react';
import BookingAppointmentModal from "./BookingAppointmentModal";

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
        preferredDays: "",
        preferredTime: "",
        purposeOfAppointment: ""
    });
    const [appointmentID, setAppointmentID] = useState("");
    const [fieldErrors, setFieldErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        gender: "",
        appointmentDate: "",
        preferredDays: "",
        preferredTime: "",
        purposeOfAppointment: ""
    });

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
        setFieldErrors({})
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
                setFieldErrors({})
                setAppointmentData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: "",
                    gender: "",
                    appointmentDate: "",
                    preferredDays: "",
                    preferredTime: "",
                    purposeOfAppointment: ""
                });
                handleCloseModal();
            } else {
                console.error(`Error in rendering the status code: ${response.status}`);
            }
        } catch (error) {
            if (error.response || error.response.data.status === 400) {
                setFieldErrors(error.response.data.errors);
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
                    <Card key={clinic} className="w-md mx-auto bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
                        <CardMedia
                            className="h-48 w-full bg-blue-200 flex items-center justify-center"
                            component="div"
                        >
                            <div className="text-center p-4">
                                <ImageList sx={{ width: '100%', height: 450 }} cols={3} rowHeight={164}>
                                    <ImageListItem>
                                        <img
                                            src={clinics.clinic_image}
                                            alt="Clinic Image"
                                            loading="lazy"
                                        />
                                    </ImageListItem>
                                </ImageList>
                            </div>
                        </CardMedia>

                        <CardContent className="p-6">
                            <Typography variant="h5" className="text-3xl font-extrabold text-blue-800 mb-4">
                                {clinic.clinic_name}
                            </Typography>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Mail className="h-6 w-6 text-blue-600 mr-3" />
                                    <a href={`mailto:${clinic.email}`} className="text-gray-800 hover:text-blue-600 transition-colors">
                                        {clinic.email}
                                    </a>
                                </div>
                                <div className="flex items-center">
                                    <LocationOn className="h-6 w-6 text-blue-600 mr-3" />
                                    <span className="text-gray-800">
                                        {clinic ? clinic.clinic_address : "N/A"}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Building className="h-6 w-6 text-blue-600 mr-3" />
                                    <span className="text-gray-800">
                                        {clinic ? clinic.clinic_date_open : "N/A"} - {clinic ? clinic.clinic_close_date : "N/A"}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-6 w-6 text-blue-600 mr-3" />
                                    <span className="text-gray-800">{clinic ? clinic.clinic_time : "N/A"} - {clinic ? clinic.clinic_close_time : "N/A"}</span>
                                </div>
                                <div className="flex items-center">
                                    <DollarSign className="h-6 w-6 text-blue-600 mr-3" />
                                    <span className="text-gray-800">{clinic.consultation_fee}</span>
                                </div>
                                <div className="flex items-center">
                                    <Stethoscope className="h-6 w-6 text-blue-600 mr-3" />
                                    <span className="text-gray-800">{clinic.clinic_type}</span>
                                </div>
                            </div>
                            <div className="flex justify-center mt-6">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    className="mt-6 w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-xl transition-all"
                                    onClick={() => handleOpenModal(clinic)}
                                >
                                    Book Appointment
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}

            {selectedClinic && (
                <BookingAppointmentModal
                    selectedClinic={selectedClinic}
                    handleCloseModal={handleCloseModal}
                    handleBooking={handleBooking}
                    appointmentData={appointmentData}
                    setAppointmentData={setAppointmentData}
                    fieldErrors={fieldErrors}
                    setFieldErrors={setFieldErrors}
                    appointmentID={appointmentID}
                />
            )}
        </div>
    );
};

export default ClinicCards;
