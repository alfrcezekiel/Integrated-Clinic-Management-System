import {
    useState,
    useEffect,
    useCallback
} from "react";
import CMS from "../../../API/CMS";
import { useAuthorization } from "../../../context/auth/useAuthorization";
import dayjs from "dayjs";
import {
    Edit,
    Delete
} from "@mui/icons-material";
import {
    IconButton
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteBookedAppointmentDialog from "../../../utils/DeleteConfirmation";

/**
 * 
 * @function component that filters the pending booked appointment status
 */
const PendingBookedAppointment = () => {
    const { user, token } = useAuthorization();
    const clinic_id = user?.sid;
    const tokenContext = token;
    const navigate = useNavigate();
    const [pendingBookedAppointments, setPendingBookedAppointments] = useState([]);
    const [openDeleteBookedAppointmentDialog, setOpenDeleteBookedAppointmentDialog] = useState(false);
    const [selectedBookedAppointment, setSelectedBookedAppointment] = useState(null);

    useEffect(() => {
        const retrievedClinicPendingBookedAppointments = async () => {
            try {
                if (!clinic_id || isNaN(clinic_id)) {
                    console.warn("Invalid or missing clinic_id", clinic_id);
                }

                if (!tokenContext) {
                    console.warn("Token is not available in context state or local storage.");
                }

                const response = await CMS.get(`/CMS/clinicDashboard/clinic/retrievePendingBookedAppointments`, {
                    params: {
                        clinicID: clinic_id
                    }
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenContext}`
                    }
                });

                if (response.status === 200) {
                    const data = response.data.pendingBookedAppointments;
                    setPendingBookedAppointments(data);
                } else {
                    throw new Error(`Error retrieving pending appointments: ${response.statusText}`);
                }
            } catch (error) {
                console.error(`Failed to retrieve pending appointments: ${error}`);
            }
        }

        if (clinic_id && tokenContext) {
            retrievedClinicPendingBookedAppointments();
        }
    }, [clinic_id, tokenContext]);

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
            case "Cancelled":
                return "text-black bg-yellow-200"
            default:
                return "text-black bg-gray-200";
        }
    }

    const dateFormat = (dateString) => {
        if (!dateString) return "N/A";
        return dayjs(dateString).format("MMMM D, YYYY");
    };

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

    /**
     * @function callback to navigate in modify booked appointment details
     */
    const navigateToModifyBookedAppointment = useCallback(appointment => {
        navigate("/doctor-portal/dashboard/ModifyBookedAppointment", {
            state: {
                bookedAppointment: appointment
            }
        })
    }, [navigate]);

    /**
     * @function callback to open the delete booked appointment dialog in selected pending status
     */
    const openDeleteBookedAppointmentComponent = useCallback(appointment => {
        setSelectedBookedAppointment(appointment);
        setOpenDeleteBookedAppointmentDialog(true);
    }, []);

    /**
     * @function callback to close the delete booked appointment dialog in selected pending status
     */
    const closeDeleteBookedAppointmentComponent = useCallback(() => {
        setSelectedBookedAppointment(null);
        setOpenDeleteBookedAppointmentDialog(false);
    }, []);

    /**
     * @function to delete the pending booked appointment details
     */
    const deletePendingBookedAppointmentDetails = useCallback(async (e) => {
        try {
            e.preventDefault();

            if (!selectedBookedAppointment) {
                console.error(`No pending booked appointment details selected`)
                return;
            }

            const response = await CMS.delete(`/CMS/cms.api.com/clinic/dashboard/deletePendingBookedAppointmentDetails`, {
                params: {
                    pendingBookedAppointmentID: selectedBookedAppointment.id
                },
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            })

            if (response.status === 200) {
                setPendingBookedAppointments((prevPendingBookedAppointments) => prevPendingBookedAppointments.filter((pendingBookedAppointment) => pendingBookedAppointment.id !== selectedBookedAppointment.id));
                closeDeleteBookedAppointmentComponent();
            } else {
                throw new Error(`Failed to delete the pending booked appointment details: ${response.status}`)
            }
        } catch (error) {
            console.error(`Failed to delete the pending booked appointment details: ${error}`)
        }
    }, [selectedBookedAppointment, tokenContext, closeDeleteBookedAppointmentComponent])

    return (
        <div className="p-6 max-h-screen">
            <div className="max-w-dvw mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
                <div className="p-6 bg-blue-600 text-white font-semibold text-lg text-center">
                    <span className="text-2xl font-bold text-center p-4">Pending Booked Appointments</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="max-w-full text-sm text-center text-gray-700">
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
                            {pendingBookedAppointments && pendingBookedAppointments.length > 0 ? (
                                pendingBookedAppointments.map((pendingBookedAppointments, index) => (
                                    <tr
                                        key={index}
                                        className={`hover:bg-blue-50 transition-colors duration-200 ${statusColor(pendingBookedAppointments.status)} cursor-pointer`}
                                    >
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {pendingBookedAppointments.firstName} {pendingBookedAppointments.lastName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {pendingBookedAppointments.address}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {pendingBookedAppointments.email}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {pendingBookedAppointments.phoneNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {dateFormat(pendingBookedAppointments.appointmentDate)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {formatTimeToAMPM(pendingBookedAppointments.appointmentTime)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {pendingBookedAppointments.gender}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {pendingBookedAppointments.purposeOfAppointment}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-center">
                                                {pendingBookedAppointments.clinic_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            <span className="text-center">
                                                {pendingBookedAppointments.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex">
                                            <IconButton
                                                aria-label="Edit Appointment"
                                                onClick={() => navigateToModifyBookedAppointment(pendingBookedAppointments)}
                                                className="cursor-pointer"
                                            >
                                                <Edit className="h-5 w-5 inline" color="primary" />
                                            </IconButton>
                                            <IconButton
                                                aria-label="Delete Appointment"
                                                onClick={() => openDeleteBookedAppointmentComponent(pendingBookedAppointments)}
                                                className="cursor-pointer"
                                            >
                                                <Delete className="h-5 w-5 inline" color="error" />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="hover:bg-blue-50 transition-colors duration-200">
                                    <td colSpan={clinic_columns.length} className="px-6 py-4 text-center text-gray-500">
                                        No pending appointments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* this component is used to confirrmed the deletion of booked appointment details in pending booked appointment */}
            <DeleteBookedAppointmentDialog
                open={openDeleteBookedAppointmentDialog}
                users={selectedBookedAppointment}
                onClose={closeDeleteBookedAppointmentComponent}
                onConfirm={deletePendingBookedAppointmentDetails}
            />
        </div>
    )
}

export default PendingBookedAppointment;