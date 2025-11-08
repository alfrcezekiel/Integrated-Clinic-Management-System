import {
    useState,
    useEffect,
    useCallback
} from "react"
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

/**
 * @function component CalculateCancelledBookedAppointments
 * @description Calculate the total number of cancelled booked appointments
 * @returns {number} totalCancelledBookedAppointments
 */

const CalculateCancelledBookedAppointments = () => {
    const [totalCancelledBookedAppointments, setTotalCancelledBookedAppointments] = useState(0);
    const { user, token } = useAuthorization();
    const clinic_id = user?.sid;
    const tokenContext = token;

    const retrievedCalculatedCancelledBookedAppointments = useCallback(async () => {
        try {
            if (!clinic_id || !tokenContext) {
                console.error("Clinic ID or token is not available in context state or local storage.")
                return;
            }
            
            const response = await CMS.get(`/clinicDashboard/calculateCancelledBookedAppointments`, {
                params: {
                    clinicID: clinic_id
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            })

            if (response.status === 200) {
                const data = response.data.totalCancelledBookedAppointments;
                setTotalCancelledBookedAppointments(data);
            } else {
                throw new Error("Failed to retrieve the total number of cancelled booked appointments")
            }
        } catch (error) {
            console.error(`Code functionality error for fetching total number of cancelled booked appointments: ${error}`)
        }
    }, [clinic_id, tokenContext])

    useEffect(() => {
        retrievedCalculatedCancelledBookedAppointments()
    }, [retrievedCalculatedCancelledBookedAppointments])

    return totalCancelledBookedAppointments;
}

export default CalculateCancelledBookedAppointments;