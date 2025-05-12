import {
    useCallback,
    useEffect,
    useState
} from "react";
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Button,
    CardMedia,
    ImageList,
    ImageListItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,

} from "@mui/material";
import CMS from "../../API/CMS";
import LocationOn from "@mui/icons-material/LocationOn";
import { Phone } from "@mui/icons-material";
import {
    Clock,
    Mail,
    Stethoscope,
    Building,
    DollarSign
} from 'lucide-react';
import BookingAppointmentModal from "./BookingAppointmentModal";
import {
    useLocation,
    useNavigate
} from "react-router-dom";
import ConfirmAppointmentModal from "./ConfirmBookedAppointment";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const ClinicCards = () => {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirmedBookAppointmentModal, setShowConfirmedBookAppointmentModal] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [appointmentData, setAppointmentData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        gender: "",
        appointmentDate: "",
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
        preferredTime: "",
        purposeOfAppointment: ""
    });
    const [confirmedAppointmentData, setConfirmedAppointmentData] = useState(null)
    const [showSuccessConfirmedBookedAppointmentDialogBox, setShowSuccessConfirmedBookedAppointmentDialogBox] = useState(false);

    const navigate = useNavigate();

    const retrievePatientData = async (patientID) => {
        try {
            const response = await CMS.get(`/CMS/patientsDashboard/getBookedAppointments/${patientID}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
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

    const location = useLocation();

    const formatTimeToAMPM = (time) => {
        if (!time) return "N/A";

        // Check if time is already in AM/PM format
        if (time.includes("AM") || time.includes("PM")) {
            return time;
        }

        try {
            // Handle 24-hour format (e.g., "14:30")
            const [hours, minutes] = time.split(":");
            let hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? "PM" : "AM";

            // Convert to 12-hour format
            hour = hour % 12;
            hour = hour ? hour : 12; // Convert 0 to 12

            return `${hour}:${minutes || "00"} ${ampm}`;
        } catch (error) {
            console.error("Error formatting time:", error);
            return time; // Return original if parsing fails
        }
    };

    useEffect(() => {
        const fetchClinics = async () => {
            try {
                const response = await CMS.get("/CMS/admin-dashboard/clinics", {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                    }
                });

                if (response.status === 200) {
                    setClinics(response.data.clinics);
                    setLoading(false);
                }
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

        const confirmedBookedAppointment = () => {
            if (showConfirmedBookAppointmentModal) {
                const timer = setTimeout(() => {
                    navigate("/patients-dashboard/View-Clinics");
                }, 3000)

                return () => clearTimeout(timer);
            }
        }
        confirmedBookedAppointment()
    }, [appointmentID, location.pathname, navigate, showConfirmedBookAppointmentModal]);

    // function to open a booking appointment dialog
    const handleOpenModal = (clinic) => {
        setSelectedClinic(clinic);
        setAppointmentID(appointmentID)
    };

    // function to close a booking appointment dialog
    const handleCloseModal = () => {
        setSelectedClinic(null);
        setFieldErrors({})
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    };

    // function to get the confirmed booked appointment data
    const getConfirmedBookedAppointment = () => {
        if (!selectedClinic) return null;

        return {
            patient: {
                firstName: appointmentData.firstName,
                lastName: appointmentData.lastName,
                email: appointmentData.email,
                phoneNumber: appointmentData.phoneNumber,
                appointmentDate: appointmentData.appointmentDate ? formatDate(appointmentData.appointmentDate) : null,
                preferredTime: appointmentData.preferredTime ? formatTimeToAMPM(appointmentData.preferredTime) : null,
            },
            clinic: {
                clinic_name: selectedClinic.clinic_name,
                clinic_address: selectedClinic.clinic_address,
                email: selectedClinic.email,
                phoneNumber: selectedClinic.phoneNumber,
                clinic_date_open: selectedClinic.clinic_date_open,
                clinic_close_date: selectedClinic.clinic_close_date,
                clinic_time: formatTimeToAMPM(selectedClinic.clinic_time),
                clinic_close_time: formatTimeToAMPM(selectedClinic.clinic_close_time),
                consultation_fee: selectedClinic.consultation_fee,
                clinic_type: selectedClinic.clinic_type
            }
        }
    }

    // function to handle the booking appointment
    const handleBooking = async (e) => {
        try {
            e.preventDefault();
            const payload = {
                ...appointmentData,
                patientID: appointmentID,
                clinicID: selectedClinic.clinic_id,
            }

            const response = await CMS.post("/CMS/patientsDashboard/patientsBookedAppointments", payload, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });

            if (response.status === 200) {
                alert("Confirmed Booked Appointment!");
                setFieldErrors({})
                setAppointmentData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: "",
                    gender: "",
                    appointmentDate: "",
                    preferredTime: "",
                    purposeOfAppointment: ""
                });
                handleCloseModal(); // close the modal
                setShowConfirmedBookAppointmentModal(true); // show the confirmed booked appointment modal
                setConfirmedAppointmentData(getConfirmedBookedAppointment()) // set the confirmed appointment data
            } else {
                console.error(`Error in rendering the status code: ${response.status}`);
            }
        } catch (error) {
            if (error.response || error.response.data.status === 400) {
                setFieldErrors(error.response.data.errors);
            } else if (error.response || error.response.data.status === 500) {
                setFieldErrors({ preferredTime: error.response.data.errors.preferredTime });
            } else {
                console.error(`Failed to book appointment: ${error}`);
            }
        }
    };

    const handleCallbackCloseConfirmedBookedAppointmentModal = useCallback(async () => {
        const handleCloseConfirmedBookedAppointmentModal = async () => {
            setShowConfirmedBookAppointmentModal(false);
        }
        handleCloseConfirmedBookedAppointmentModal()
    }, []);

    const handleCloseConfirmedBookedAppointmentSuccessDialogBox = async () => {
        setShowSuccessConfirmedBookedAppointmentDialogBox(false);
    }

    const proceedToConfirmedBookedAppointmentSuccessDialogBox = async () => {
        setShowConfirmedBookAppointmentModal(false);
        setShowSuccessConfirmedBookedAppointmentDialogBox(true);
    }

    return (
        <div className="flex flex-row flex-wrap justify-center gap-6 p-6 from-blue-50 to-blue-100">
            {loading ? (
                <CircularProgress />
            ) : clinics.length === 0 ? (
                <Typography variant="h6" className="text-gray-600">
                    No clinics found.
                </Typography>
            ) : (
                clinics.map((clinic, i) => (
                    <Card key={i} className="w-md mx-auto bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
                        <CardMedia
                            className="h-48 w-full bg-blue-200 flex items-center justify-center"
                            component="div"
                        >
                            <div className="text-center p-4">
                                <ImageList sx={{ width: '100%', height: 450 }} cols={3} rowHeight={164}>
                                    <ImageListItem>
                                        <img
                                            src={`CMS/patients-dashboard/uploads/${clinic.clinic_image}`}
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
                                    <Phone className="h-6 w-6 text-blue-600 mr-3" />
                                    <span className="text-gray-800">
                                        {clinic ? clinic.phoneNumber : ""}
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
                                    <span className="text-gray-800">{formatTimeToAMPM(clinic.clinic_time)} - {formatTimeToAMPM(clinic.clinic_close_time)}</span>
                                </div>
                                <div className="flex items-center">
                                    <DollarSign className="h-6 w-6 text-blue-600 mr-3" />
                                    <span className="text-gray-800">₱ {clinic.consultation_fee}</span>
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

            {showConfirmedBookAppointmentModal && (
                <ConfirmAppointmentModal
                    open={showConfirmedBookAppointmentModal}
                    onClose={handleCallbackCloseConfirmedBookedAppointmentModal}
                    onNextStep={proceedToConfirmedBookedAppointmentSuccessDialogBox}
                    patientsData={confirmedAppointmentData}
                />
            )}

            {showSuccessConfirmedBookedAppointmentDialogBox && (
                <Dialog open={showSuccessConfirmedBookedAppointmentDialogBox} onClose={handleCloseConfirmedBookedAppointmentSuccessDialogBox} maxWidth="xs" fullWidth>
                    <div className="relative p-4">
                        <div className="flex flex-col items-center text-center p-6">
                            <CheckCircleOutlineIcon className="text-green-500 text-2xl" />
                            <DialogTitle className="text-lg font-semibold text-black">
                                Confirmed Booked Appointment Successful!
                            </DialogTitle>
                            <DialogContent className="px-2">
                                <Typography className="text-gray-600">
                                    Thank you! Your appointment  was processed successfully.
                                </Typography>
                            </DialogContent>
                            <DialogActions className="mt-1">
                                <Button
                                    onClick={handleCloseConfirmedBookedAppointmentSuccessDialogBox}
                                    variant="contained"
                                    color="success"
                                    className="w-full"
                                >
                                    Okay
                                </Button>
                            </DialogActions>
                        </div>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default ClinicCards;
