import {
    useState,
    useEffect,
    useCallback
} from "react";
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

// This custom hook calculates the total number of booked appointments in a specific clinic.
const CalculateBookedAppointments = () => {
    const { user, token } = useAuthorization();
    const clinic_id = user?.sid;
    const tokenContext = token;

    const [totalAllBookedAppointments, setTotalAllBookedAppointments] = useState(0);

    // function to retrieve the total numbmer of all booked appointments in specific clinic
    const retrieveTotalAllBookedAppoointmetns = useCallback(async () => {
        try {
            if (!clinic_id || !tokenContext) {
                console.error("Clinic ID or token is not available in context state or local storage.");
                return;
            }

            const response = await CMS.get(`/clinicDashboard/calculateTotalBookedAppointments`, {
                params: {
                    clinicID: clinic_id
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`,
                }
            })

            if (response.status === 200) {
                const data = response.data.totalBookedAppointments;
                setTotalAllBookedAppointments(data);
            } else {
                throw new Error(`Failed to fetch total booked appointments: ${response}`);
            }
        } catch (error) {
            console.error(`Code functionality error for fetching total booked appointments: ${error}`);
        }
    }, [clinic_id, tokenContext])

    useEffect(() => {
        retrieveTotalAllBookedAppoointmetns();
    }, [retrieveTotalAllBookedAppoointmetns]);

    return totalAllBookedAppointments;
}

export default CalculateBookedAppointments;
