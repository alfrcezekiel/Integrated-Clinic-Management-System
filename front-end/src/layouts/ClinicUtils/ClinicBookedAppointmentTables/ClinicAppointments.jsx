import {
    useState,
    useEffect,
    useCallback
} from "react"
import CMS from "../../../API/CMS";
import { useAuthorization } from "../../../context/auth/useAuthorization";
import dayjs from "dayjs";
import Delete from "@mui/icons-material/Delete";
import { Edit } from "@mui/icons-material";
import {
    IconButton
} from "@mui/material"
import {
    useNavigate,
    useLocation
} from "react-router-dom";
import DeleteBookedAppointmentDialog from "../../../utils/DeleteConfirmation";

/**
 * @function ClinicAppointments
 * @description This component is used to display the clinic appointments
 */
const ClinicAppointments = () => {
    const { user, token } = useAuthorization();

    const clinic_id = user?.sid;
    const tokenContext = token;

    const navigate = useNavigate();
    const location = useLocation();
    const [clinicBookedAppointments, setClinicBookedAppointments] = useState([]);
    const [openDeleteBookedAppointmentDialog, setOpenDeleteBookedAppointmentDialog] = useState(false);
    const [selectedBookedAppointment, setSelectedBookedAppointment] = useState(null);

    const retrieveClinicBookedAppointments = useCallback(async () => {
        try {
            if (!clinic_id || isNaN(clinic_id)) {
                console.warn("Invalid or missing clinic_id", clinic_id);
                return;
            }

            const response = await CMS.get(`/clinicDashboard/clinicBookedAppointments/${clinic_id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            })

            if (response.status === 200) {
                const data = response.data.bookedAppointments;
                setClinicBookedAppointments(data);
            } else {
                throw new Error(`Error retrieving clinic appointments: ${response.statusText}`);
            }
        } catch (error) {
            console.error(`Failed to retrieve clinic appointments: ${error}`);
        }
    }, [clinic_id, tokenContext]);

    useEffect(() => {
        if (clinic_id) {
            retrieveClinicBookedAppointments();
        }
    }, [clinic_id, tokenContext, location.pathname, retrieveClinicBookedAppointments]);

    const clinic_columns = [
        "Full Name",
        "Address",
        "Email",
        "Phone Number",
        "Appointment Date",
        "Appointment Time",
        "Gender",
        "Purpose of Appointment",
        "Clinic Name",
        "Status",
        "Action",
    ]

    const statusColor = (status) => {
        switch (status) {
            case "Pending":
                return "text-black bg-white"
            case "Approved":
                return "text-black bg-green-200"
            case "Declined":
                return "text-black bg-red-200"
            case "Consulted":
                return "text-black bg-blue-200"
            case "Cancelled":
                return "text-black bg-yellow-200"
            default:
                return "text-black bg-gray-200";
        }
    }

    /**
     * @function that handles to delete specific booked appointnment details
     */

    const deleteBookedAppointmentDetails = async (e) => {
        try {
            e.preventDefault();

            if (!selectedBookedAppointment) {
                console.error(`No booked appointment selected`);
                return;
            }

            const response = await CMS.delete(`/cms.api.com/clinic/dashboard/deleteBookedAppointmentInClinicSideTable`, {
                params: {
                    bookedAppointmentID: selectedBookedAppointment.id
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            });

            if (response.status === 200) {
                setClinicBookedAppointments((prevClinicBookedAppointments) => prevClinicBookedAppointments.filter((clinicBookedAppointment) => clinicBookedAppointment.id !== selectedBookedAppointment.id));
                closeDeleteBookedAppointmentDialog();
            } else {
                throw new Error(`Failed to delete specific booked appointment details in all appointments in clinic side table: ${response.status}`);
            }
        } catch (error) {
            console.error(`Failed to delete specific booked appointment details in all appointments in clinic side table: ${error}`)
        }
    }

    /**
     * @function openConfirmedDeleteBookedAppointmentDialog
     * @description This function is used to open the delete booked appointment dialog
     * @param {object} bookedAppointmentDetails 
     */
    const openConfirmedDeleteBookedAppointmentDialog = async (bookedAppointmentDetails) => {
        setSelectedBookedAppointment(bookedAppointmentDetails);
        setOpenDeleteBookedAppointmentDialog(true);
    }

    /**
     * @function closeDeleteBookedAppointmentDialog
     * @description This function is used to close the delete booked appointment dialog
     */
    const closeDeleteBookedAppointmentDialog = async () => {
        setSelectedBookedAppointment(null);
        setOpenDeleteBookedAppointmentDialog(false);
    }

    /**
     * This function is used to format the date to a more readable format
     * @param {string} dateString 
     * @returns {string}
     */
    const dateFormat = (dateString) => {
        if (!dateString) return "N/A";
        return dayjs(dateString).format("MMMM D, YYYY");
    };

    /**
     * This function is used to navigate to the modify booked appointment page
     * @param {number} appointmentID 
     */
    const navigateToModifyBookedAppointment = async (appointment) => {
        console.log(`Edit appointment of ID: ${appointment.id}`)
        navigate("/doctor-portal/dashboard/ModifyBookedAppointment", {
            state: {
                bookedAppointment: {
                    bookedAppointmentID: appointment.id,
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
                    type: "Clinic"
                }
            }
        })
    }

    // this function is used to format the time to AM/PM
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

    return (
        <div className="p-6 max-h-screen">
            <div className="max-w-dvw mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
                <div className="p-6 bg-blue-600 text-white font-semibold text-lg text-center">
                    <span className="text-2xl text-center p-4 font-bold">Clinic Appointments</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-center text-gray-700">
                        <thead className="bg-blue-100 text-black uppercase text-xs sticky top-0 z-10">
                            <tr>
                                {clinic_columns.map((column, i) => (
                                    <th
                                        key={i}
                                        className="px-6 py-4"
                                        scope="col"
                                    >
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {clinicBookedAppointments && clinicBookedAppointments.length > 0 ? (
                                clinicBookedAppointments.map((appointment, i) => (
                                    <tr
                                        key={i}
                                        className={`hover:bg-blue-50 transition-colors duration-200 ${statusColor(appointment.status)}`}
                                    >
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {appointment.firstName} {appointment.lastName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 ">
                                            <span className="text-center">
                                                {appointment.address}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {appointment.email}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {appointment.phoneNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {dateFormat(appointment.appointmentDate)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {formatTimeToAMPM(appointment.appointmentTime)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {appointment.gender}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {appointment.purposeOfAppointment}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {appointment.clinic_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            <span className="text-center">
                                                {appointment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex">
                                            {/* Edit button placeholder */}
                                            <IconButton
                                                aria-label="edit"
                                                onClick={() => navigateToModifyBookedAppointment(appointment)}
                                                className="cursor-pointer"
                                            >
                                                <Edit className="h-5 w-5" color="primary" />
                                            </IconButton>
                                            {/* Delete button placeholder */}
                                            <IconButton
                                                aria-label="delete"
                                                onClick={() => openConfirmedDeleteBookedAppointmentDialog(appointment)}
                                                className="cursor-pointer"
                                            >
                                                <Delete className="h-5 w-5" color="error" />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="hover:bg-blue-50 transition-colors duration-200">
                                    <td colSpan={clinic_columns.length} className="text-center py-4">
                                        No appointments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* this component is used to confirrmed the deletion of booked appointment details in specific booked appointment */}
            <DeleteBookedAppointmentDialog
                open={openDeleteBookedAppointmentDialog}
                users={selectedBookedAppointment}
                onClose={closeDeleteBookedAppointmentDialog}
                onConfirm={deleteBookedAppointmentDetails}
            />
        </div>
    )
}

export default ClinicAppointments;