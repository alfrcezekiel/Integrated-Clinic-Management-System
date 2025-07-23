import {
    useState,
    useEffect
} from "react";
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

// This custom hook calculates the total number of booked appointments in a specific clinic.
const CalculateBookedAppointments = () => {
    const { user, token } = useAuthorization();
    const clinic_id = user?.sid;
    const tokenContext = token;

    const [totalAllBookedAppointments, setTotalAllBookedAppointments] = useState(0);

    useEffect(() => {
        // function to retrieve the total numbmer of all booked appointments in specific clinic
        const retrieveTotalAllBookedAppoointmetns = async () => {
            try {
                if (!clinic_id || !tokenContext) {
                    console.error("Clinic ID or token is not available in context state or local storage.");
                    return;
                }

                const response = await CMS.get(`/CMS/clinicDashboard/calculateTotalBookedAppointments`, {
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
        }

        retrieveTotalAllBookedAppoointmetns();
    }, [clinic_id, tokenContext]);

    return totalAllBookedAppointments;
}

export default CalculateBookedAppointments;
