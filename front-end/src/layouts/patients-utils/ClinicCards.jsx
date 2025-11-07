import {
    useEffect,
    useState,
    useCallback
} from "react";
import CMS from "../../API/CMS";
import { Phone } from "@mui/icons-material";
import {
    Clock,
    Mail,
    Stethoscope,
    Building,
    PhilippinePesoIcon,
    MapPin
} from 'lucide-react';
import BookingAppointmentModal from "./BookingAppointmentModal";
import {
    useLocation,
    useNavigate
} from "react-router-dom";
import ConfirmAppointmentModal from "./ConfirmBookedAppointment";
import { useAuthorization } from "../../context/auth/useAuthorization";
import dayjs from "dayjs";
import DailyBookAppointmentbox from "../../components/dialog_box/daily_book_appointment_box";
import config from "../../API/config.js";

const ClinicCards = () => {
    const [clinics, setClinics] = useState([]);
    const [filteredClinic, setFilteredClinic] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showConfirmedBookAppointmentModal, setShowConfirmedBookAppointmentModal] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [selectedClinicId, setSelectedClinicId] = useState(null);
    const [appointmentData, setAppointmentData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        gender: "",
        appointmentDate: null,
        preferredTime: null,
        purposeOfAppointment: ""
    });
    const [appointmentID, setAppointmentID] = useState("");
    const [fieldErrors, setFieldErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        gender: "",
        appointmentDate: null,
        preferredTime: null,
        purposeOfAppointment: ""
    });
    const [confirmedAppointmentData, setConfirmedAppointmentData] = useState(null)
    const [showSuccessConfirmedBookedAppointmentDialogBox, setShowSuccessConfirmedBookedAppointmentDialogBox] = useState(false);
    const [showDailyLimitDialog, setShowDailyLimitDialog] = useState(false);
    const [dailyAppointmentCount, setDailyAppointmentCount] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const MAX_DAILY_APPOINTMENTS = 2; // Set 2 your daily limit here

    const navigate = useNavigate();
    const { user, token } = useAuthorization();
    const tokenContext = token || localStorage.getItem("authToken");
    if (!tokenContext) {
        console.error("No token found in context or localStorage");
    }

    const location = useLocation();

    if (!tokenContext) {
        console.error("No token found in context or localStorage");
    }

    useEffect(() => {
        const searchFilterClinics = async () => {
            try {

                const response = await CMS.get(`/patients-dashboard/filter_search`, {
                    params: {
                        clinicName: searchQuery,
                        clinicType: searchQuery,
                        clinicAddress: searchQuery,
                        phoneNumber: searchQuery,
                        emailAddress: searchQuery,
                        clinicImage: searchQuery,
                        businessOpenHours: searchQuery,
                        businessClosingHours: searchQuery
                    }
                });

                if (response.status === 200) {
                    const clinicsData = response.data.clinics;
                    setClinics(clinicsData);
                    if (selectedClinicId) {
                        const selectedClinic = clinicsData.find((c) => c.clinic_id === selectedClinicId);
                        setFilteredClinic(selectedClinic ? [selectedClinic] : [])
                    } else {
                        setFilteredClinic(clinicsData)
                    }
                } else {
                    throw new Error(`Failed to filter specific clinic: ${response.status}`)
                }
            } catch (error) {
                console.error(`Failed to filter specific clinic: ${error}`)
            }
        }
        searchFilterClinics()
    }, [selectedClinicId, searchQuery]);

    useEffect(() => {
        const searchClinics = () => {
            if (searchQuery && searchQuery.trim() !== "") {
                const filtered = clinics.filter((clinic) => {
                    const query = searchQuery.toLowerCase().trim();

                    return (
                        (clinic?.clinic_name?.toLowerCase()?.includes(query)) ||
                        (clinic?.clinic_type?.toLowerCase()?.includes(query)) ||
                        (clinic?.clinic_address?.toLowerCase()?.includes(query)) ||
                        (clinic?.phoneNumber?.toLowerCase()?.includes(query)) ||
                        (clinic?.email?.toLowerCase()?.includes(query)) ||
                        (clinic?.clinic_image?.toLowerCase()?.includes(query)) ||
                        (clinic?.clinic_time?.toLowerCase()?.includes(query)) ||
                        (clinic?.clinic_close_time?.toLowerCase()?.includes(query))
                    )
                });
                setFilteredClinic(filtered)
            } else if (!selectedClinicId) {
                setFilteredClinic(clinics);
            }
        }
        searchClinics()

    }, [clinics, searchQuery, location.search, selectedClinicId])

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

    /**
     * @function to check daily book appointment limit per day
     */
    const checkDailyAppointmentLimit = useCallback(async (selectedDate) => {
        try {
            const dateToCheck = selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
            const patient_id = user?.sid;

            const response = await CMS.get(`/cms.api.com/patient/dashboard/appointments/daily-count`, {
                params: {
                    patientID: patient_id,
                    appointmentDate: dateToCheck
                },
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`,
                }
            })

            if (response.status === 200) {
                const count = response.data.count;
                setDailyAppointmentCount(count);

                return count < MAX_DAILY_APPOINTMENTS;
            } else {
                throw new Error(`Failed to check daily appointment limit: ${response.status}`);
            }
        } catch (error) {
            if (error.response.status === 500) {
                console.error(`Failed to check daily appointment limit: ${error.response.data.message}`);
            }
        }
    }, [tokenContext, user]);

    /**
     * @function close the daily book appointment limit
     */
    const closeDailyBookAppointmentBox = useCallback(async () => {
        setShowDailyLimitDialog(false);
    }, []);

    // function to retrieve the patient data based on the patiente id to automate the input fields
    const retrievePatientData = useCallback(async (patientID) => {
        try {
            const response = await CMS.get(`/patientsDashboard/getBookedAppointments/${patientID}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`,
                },
            });

            if (response.status === 200) {
                setAppointmentData(prevData => ({
                    ...prevData,
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email,
                    phoneNumber: response.data.phoneNumber,
                    gender: response.data.gender
                }));
            } else {
                throw new Error(`Failed to automate the input fields`);
            }
        } catch (error) {
            console.error(`Failed to retrieve patient data: ${error}`);
        }
    }, [tokenContext]);

    useEffect(() => {
        const fetchClinics = async () => {
            try {
                const response = await CMS.get("/admin-dashboard/clinics", {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenContext}`,
                    }
                });

                if (response.status === 200) {
                    setClinics(response.data.clinics);
                    setLoading(false);
                }
            } catch (error) {
                console.error(`Failed to retrieve clinic data: ${error}`);
            }
        }
        fetchClinics();

        const retrievePatientId = user?.sid;

        if (retrievePatientId) {
            setAppointmentID(retrievePatientId);
            retrievePatientData(retrievePatientId);
        }

        const confirmedBookedAppointment = () => {
            if (showConfirmedBookAppointmentModal) {
                const timer = setTimeout(() => {
                    navigate("/patients-dashboard/ViewClinics");
                }, 3000)

                return () => clearTimeout(timer);
            }
        }
        confirmedBookedAppointment()
    }, [appointmentID, retrievePatientData, location.pathname, navigate, showConfirmedBookAppointmentModal, user?.sid, tokenContext]);

    // function to open a booking appointment dialog
    const handleOpenModal = async (clinic) => {
        setSelectedClinic(clinic);
        if (appointmentID) {
            await retrievePatientData(appointmentID);
        }
    };

    // function to close a booking appointment dialog
    const handleCloseModal = () => {
        setSelectedClinic(null);
        setFieldErrors({})
        setAppointmentData((prev) => ({
            ...prev,
            gender: "",
            appointmentDate: null,
            preferredTime: null,
            purposeOfAppointment: ""
        }))
        setSubmitting(false);
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
        e.preventDefault();

        if (submitting) return;
        setSubmitting(true);

        // Check daily appointment limit first
        const canBook = await checkDailyAppointmentLimit(appointmentData.appointmentDate);
        if (!canBook) {
            setShowDailyLimitDialog(true);

            setSubmitting(false);

            setTimeout(() => {
                setShowDailyLimitDialog(false);
            }, 3000);
            return;
        }

        try {
            const payload = {
                ...appointmentData,
                appointmentDate: appointmentData.appointmentDate ? dayjs(appointmentData.appointmentDate).format("YYYY-MM-DD") : null,
                clinicID: selectedClinic?.clinic_id || selectedClinic?._id || selectedClinic?.id,
                patientID: appointmentID
            }

            const response = await CMS.post("/patientsDashboard/patientsBookedAppointments", payload, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`,
                }
            });

            if (response.status === 200) {
                const confirmedAppointment = getConfirmedBookedAppointment();
                const apppointment = response.data.appointment;

                setFieldErrors({})
                setAppointmentData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: "",
                    gender: "",
                    appointmentDate: null,
                    preferredTime: null,
                    purposeOfAppointment: ""
                });
                handleCloseModal(); // close the modal
                setShowConfirmedBookAppointmentModal(true); // show the confirmed booked appointment modal
                setConfirmedAppointmentData({
                    ...confirmedAppointment,
                    appointmentID: apppointment?.appointmentID
                }) // set the confirmed appointment data
            } else {
                throw new Error(`Failed to book appointment: ${response.status}`);
            }
        } catch (error) {
            if (error.response || error.response?.data?.status === 400) {
                const errors = error.response.data.errors;
                setFieldErrors((prev) => ({
                    ...prev,
                    ...errors
                }));
            } else if (error.response || error.response?.data?.status === 500) {
                setFieldErrors({ preferredTime: error.response.data.errors.preferredTime });
            } else {
                throw new Error(`Failed to book appointment: ${error}`);
            }
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    /**
     * @function to close the confirmed booked appointment dialog
     * cancels booked appointment if the patient wants to cancel its appointment
     */
    const handleCallbackCloseConfirmedBookedAppointmentModal = async (appointmentID) => {
        // setShowConfirmedBookAppointmentModal(false);
        try {
            if (submitting) return;
            setSubmitting(true);

            const response = await CMS.put(`/patients-dashboard/cancelBookedAppointment/${appointmentID}`, {
                headers: {
                    "Authorization": `Bearer ${tokenContext}`,
                    "Content-Type": "application/json"
                }
            })

            if (response.status === 200) {
                setShowConfirmedBookAppointmentModal(false);
                alert("Booked Appointment cancelled successfully.");
            } else {
                throw new Error(`Failed to cancel appointment: ${response.status}`);
            }
        } catch (error) {
            if (error.response || error.response?.data?.status === 500) {
                console.error(`Error in cancelling an booked appointment ${error}`)
            }
        } finally {
            setSubmitting(false);
        }
    };

    // function to close the success confirmed booked appointment dialog
    const handleCloseConfirmedBookedAppointmentSuccessDialogBox = async () => {
        setShowSuccessConfirmedBookedAppointmentDialogBox(false);
    }

    const proceedToConfirmedBookedAppointmentSuccessDialogBox = async () => {
        setShowConfirmedBookAppointmentModal(false);
        setShowSuccessConfirmedBookedAppointmentDialogBox(true);
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50dvh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-20 min-h-dvh">
            {selectedClinicId && (
                <button
                    onClick={() => {
                        navigate('/patients-dashboard/Home');
                        setSelectedClinicId(null);
                    }}
                    className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="rdound" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to dashboard
                </button>
            )}

            {!selectedClinicId && (
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search clinics..."
                        className="w-full max-w-md px-4 py-2 border rounded-4xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        name="searchQuery"
                        autoComplete="off"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClinic.length > 0 ? (
                    filteredClinic.map((clinic) => {
                        const clinicId = clinic.clinic_id || clinic._id || clinic.id;

                        return (
                            <div
                                key={clinicId}
                                id={clinicId}
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="p-6">
                                    <div className="flex items-center p-4">
                                        <Building className="h-6 w-6 text-black mr-2" />
                                        <h3 className="text-lg text-black font-semibold">{clinic.clinic_name}</h3>
                                    </div>
                                    <div className="py-2">
                                        <img
                                            src={`${config.api.baseURL}/uploads/clinic_images/${clinic.clinic_image}`}
                                            alt={clinic.clinic_name}
                                            className="object-center object-cover rounded-2xl min-h-[25dvh]"
                                            crossOrigin="anonymous"
                                        />
                                    </div>
                                    <div className="space-y-3 text-black">
                                        <div className="flex items-start">
                                            <MapPin className="h-5 w-5 text-black mt-0.5 mr-2 flex-shrink-0" />
                                            <p className="text-sm text-black">{clinic.clinic_address}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <Stethoscope className="h-5 w-5 text-black mt-0.5 mr-2 flex-shrink-0" />
                                            <p className="text-sm text-black">{clinic.clinic_type}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone className="h-5 w-5 text-black mr-2" />
                                            <a
                                                href={`tel:${clinic.phoneNumber}`}
                                                className="text-sm hover:text-black transition-colors"
                                            >
                                                {clinic.phoneNumber}
                                            </a>
                                        </div>
                                        <div className="flex items-center">
                                            <Mail className="h-5 w-5 text-black mr-2" />
                                            <a
                                                href={`mailto:${clinic.email}`}
                                                className="text-sm hover:text-black transition-colors"
                                            >
                                                {clinic.email}
                                            </a>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="h-5 w-5 text-black mr-2" />
                                            <span className="text-sm">
                                                {formatTimeToAMPM(clinic.clinic_time)} - {formatTimeToAMPM(clinic.clinic_close_time)}
                                            </span>
                                        </div>
                                        {clinic.consultation_fee && (
                                            <div className="flex items-start">
                                                <PhilippinePesoIcon className="h-5 w-5 text-black mr-2" />
                                                <span className="text-sm">
                                                    Consultation Fee: ₱ {clinic.consultation_fee}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-start mt-4">
                                        <button
                                            onClick={() => handleOpenModal(clinic)}
                                            className="cursor-pointer bg-black/100 text-white px-4 py-2 rounded-full transition-colors duration-300"
                                        >
                                            <div className="flex justify-center items-center">
                                                <span>Book Appointment</span>
                                                <svg className="w-4 h-4 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-500 text-lg">No clinics found matching your search.</p>
                    </div>
                )}
            </div>

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
                    submitting={submitting}
                />
            )}

            {showDailyLimitDialog && (
                <DailyBookAppointmentbox
                    onClose={closeDailyBookAppointmentBox}
                    patientID={user?.sid}
                    onOpen={setShowDailyLimitDialog}
                    dailyAppointmentCount={dailyAppointmentCount}
                    maxDailyAppointments={MAX_DAILY_APPOINTMENTS}
                />
            )}

            {showConfirmedBookAppointmentModal && (
                <ConfirmAppointmentModal
                    open={showConfirmedBookAppointmentModal}
                    onClose={handleCallbackCloseConfirmedBookedAppointmentModal}
                    onNextStep={proceedToConfirmedBookedAppointmentSuccessDialogBox}
                    patientsData={confirmedAppointmentData}
                    submitting={submitting}
                />
            )}

            {showSuccessConfirmedBookedAppointmentDialogBox && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative transform transition-all duration-300 scale-100 opacity-100 animate-fadeInScale">
                        <div className="flex flex-col items-center text-center">
                            <svg
                                className="w-12 h-12 text-green-500 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z"
                                />
                            </svg>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Appointment Confirmed!
                            </h2>
                            <p className="text-gray-600 mb-4">
                                You will receive a confirmation email with the details of your appointment.
                                Thank you! Your appointment was booked successfully.
                            </p>
                            <button
                                onClick={handleCloseConfirmedBookedAppointmentSuccessDialogBox}
                                className="w-20 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 cursor-pointer"
                            >
                                Okay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClinicCards;
