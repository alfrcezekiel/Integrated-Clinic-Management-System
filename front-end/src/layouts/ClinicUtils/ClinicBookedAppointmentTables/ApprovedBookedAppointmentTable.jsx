import {
    useState,
    useEffect,
    useMemo
} from "react";
import CMS from "../../../API/CMS";
import { useAuthorization } from "../../../context/auth/useAuthorization";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

/**
 * @function component ApprovedBookedAppointmentTable
 * Retrieve approved booked appointment in clinic side
 */
const ApprovedBookedAppointmentTable = () => {
    const [approvedBookedAppointments, setApprovedBookedAppoinments] = useState([]);
    const { user, token } = useAuthorization();
    const clinicID = user?.sid;
    const tokenContext = token;
    const navigate = useNavigate();
    const memoizedRetrieveApprovedBookedAppointments = useMemo(() => approvedBookedAppointments, [approvedBookedAppointments]);

    useEffect(() => {
        const retrieveApprovedBookedAppointment = async () => {
            try {
                if (!clinicID || !tokenContext) {
                    console.error(`Clinic ID or Token is not set in context or local storage`);
                    return;
                }

                const response = await CMS.get("/clinic/dashboard/retrieveApprovedBookedAppointments", {
                    params: {
                        clinicID: clinicID
                    }
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenContext}`
                    }
                })

                if (response.status === 200) {
                    const data = response.data.retrievedApprovedBookedAppointments;
                    setApprovedBookedAppoinments(data);
                } else {
                    throw new Error(`Failed to retrieve approved booked appointment to render in clinic side table: ${response.statusText}`);
                }
            } catch (error) {
                console.error(`Failed to retrieve approved booked appointment to render in clinic side table in catch block: ${error}`)
            }
        }
        retrieveApprovedBookedAppointment();
    }, [clinicID, tokenContext]);

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
     * @function to navigate in consultation page with retrieved booked appointment details in clinic table
     */
    const navigateInConsultationPage = async (appointment) => {
        navigate("/doctor-portal/dashboard/ConsultPatient", {
            state: {
                appointmentData: {
                    firstName: appointment.firstName,
                    lastName: appointment.lastName,
                    email: appointment.email,
                    phoneNumber: appointment.phoneNumber,
                    appointmentDate: dateFormat(appointment.appointmentDate),
                    preferredTime: appointment.appointmentTime,
                    appointmentID: appointment.id,
                    clinic_name: appointment.clinic_name,
                    type: "Clinic"
                }
            }
        })
    }

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
        "Consultation"
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

    return (
        <div className="p-6 max-h-screen">
            <div className="max-w-dvw m-auto bg-white shadow-xl rounded-2xl overflow-hidden">
                <div className="p-6 bg-blue-600 text-white font-semibold text-lg text-center">
                    <span className="text-2xl font-bold p-4">Approved Booked Appointments</span>
                </div>
                <div className="overflow-x-auto block">
                    <table className="min-w-full text-sm text-center text-gray-700">
                        <thead className="bg-blue-100 text-black uppercase text-xs sticky top-0 z-10">
                            <tr>
                                {clinic_columns.map((columns, i) => (
                                    <th
                                        key={i}
                                        className="px-6 py-4"
                                    >
                                        {columns}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {memoizedRetrieveApprovedBookedAppointments && memoizedRetrieveApprovedBookedAppointments.length > 0 ? (
                                memoizedRetrieveApprovedBookedAppointments.map((approved, i) => (
                                    <tr
                                        key={i}
                                        className={`hover:bg-blue-50 transition-colors duration-200 ${statusColor(approved.status)} cursor-pointer`}
                                    >
                                        <td className="px-6 py-6">
                                            <span className="text-center">
                                                {approved.firstName} {approved.lastName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-center">
                                                {approved.address}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-center">
                                                {approved.email}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-center">
                                                {approved.phoneNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-center">
                                                {dateFormat(approved.appointmentDate)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-center">
                                                {formatTimeToAMPM(approved.appointmentTime)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-center">
                                                {approved.gender}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-center">
                                                {approved.purposeOfAppointment}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-center">
                                                {approved.clinic_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 font-medium">
                                            <span className="text-center">
                                                {approved.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <button
                                                type="button"
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer"
                                                onClick={() => navigateInConsultationPage(approved)}
                                            >
                                                Consult Patient
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="hover:bg-blue-50 transition-colors duration-200">
                                    <td colSpan={clinic_columns.length} className="px-6 py-6 text-center text-gray-500">
                                        No approved appointments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ApprovedBookedAppointmentTable;
