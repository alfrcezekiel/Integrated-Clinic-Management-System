import {
    useState,
    useEffect,
    useMemo
} from "react";
import { useAuthorization } from "../../../context/auth/useAuthorization";
import CMS from "../../../API/CMS";
import dayjs from "dayjs";

const DeclinedBookedAppointmentTable = () => {
    const { user, token } = useAuthorization();
    const [declinedBookedAppointments, setDeclinedBookedAppoinments] = useState([]);
    const clinicID = user?.sid;
    const tokenContext = token;
    const memoizedRetrieveDeclinedBookedAppointments = useMemo(() => declinedBookedAppointments, [declinedBookedAppointments]);

    useEffect(() => {
        /**
         * function to retrieve the declined booked appointments
         */
        const retrieveDeclinedBookedAppointments = async () => {
            try {
                if(!clinicID || !tokenContext) {
                    console.error(`Clinic ID or Token is not set in context or local storage`);
                    return;
                }

                const response = await CMS.get("/CMS/clinic/dashboard/retrieveDeclinedBookedAppointments", {
                    params: {
                        clinicID: clinicID
                    }
                }, {
                    headers: {
                        "Content-Type" : "application/json",
                        "Authorization" : `Bearer ${tokenContext}`
                    }
                })

                if (response.status === 200) {
                    const data = response.data.retrievedDeclinedBookedAppointments;
                    setDeclinedBookedAppoinments(data);
                } else {
                    throw new Error(`Failed to retrieve declined booked appointment to render in clinic side table: ${response.statusText}`);
                }
            } catch (error){
                console.error(`Failed to retrieve declined booked appointment to render in clinic side table in catch block: ${error}`)
            }
        }
        retrieveDeclinedBookedAppointments();
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
                    <span className="text-2xl font-bold p-4">Declined Booked Appointments</span>
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
                            {memoizedRetrieveDeclinedBookedAppointments && memoizedRetrieveDeclinedBookedAppointments.length > 0 ? (
                                memoizedRetrieveDeclinedBookedAppointments.map((declined, i) => (
                                    <tr
                                        key={i}
                                        className={`hover:bg-blue-50 transition-colors duration-200 ${statusColor(declined.status)}`}
                                    >
                                        <td className="px-6 py-6`">
                                            <span className="text-center">
                                                {declined.firstName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6`">
                                            <span className="text-center">
                                                {declined.lastName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6`">
                                            <span className="text-center">
                                                {declined.address}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6`">
                                            <span className="text-center">
                                                {declined.email}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6`">
                                            <span className="text-center">
                                                {declined.phoneNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6`">
                                            <span className="text-center">
                                                {dateFormat(declined.appointmentDate)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6`">
                                            <span className="text-center">
                                                {formatTimeToAMPM(declined.appointmentTime)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6`">
                                            <span className="text-center">
                                                {declined.gender}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6`">
                                            <span className="text-center">
                                                {declined.purposeOfAppointment}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6`">
                                            <span className="text-center">
                                                {declined.clinic_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 font-medium">
                                            <span className="text-center">
                                                {declined.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="hover:bg-blue-50 transition-colors duration-200">
                                    <td colSpan={clinic_columns.length} className="px-6 py-6 text-center text-gray-500">
                                        No declined appointments found.
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

export default DeclinedBookedAppointmentTable;