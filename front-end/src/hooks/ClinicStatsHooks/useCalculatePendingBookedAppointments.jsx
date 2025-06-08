import {
    useEffect,
    useState
} from "react";
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

// This custom hook calculates the total number of pending booked appointments in a specific clinic.
const CalculatePendingBookedAppointments = () => {
    const { user, token } = useAuthorization();
    const clinic_id = user?.sid;
    const tokenContext = token;

    const [totalPendingBookedAppointments, setTotalPendingBookedAppointments] = useState(0);

    useEffect(() => {
        // function to retrieve the total number of pending booked appointments in a specific clinic
        const retrieveTotalPendingBookedAppointments = async () => {
            try {
                if (!clinic_id || !tokenContext) {
                    console.error("Clinic ID or token is not available in context state or local storage.");
                    return;
                }

                const response = await CMS.get(`/CMS/clinicDashboard/calculatePendingBookedAppointments`, {
                    params: {
                        clinicID: clinic_id
                    }
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenContext}`,
                    }
                });

                if (response.status === 200) {
                    const data = response.data.totalPendingBookedAppointments;
                    setTotalPendingBookedAppointments(data);
                } else {
                    throw new Error(`Failed to fetch total pending booked appointments: ${response}`);
                }
            } catch (error) {
                console.error(`Code functionality error for fetching total pending booked appointments: ${error}`);
            }
        };

        retrieveTotalPendingBookedAppointments();
    }, [clinic_id, tokenContext]);

    return totalPendingBookedAppointments;
};

export default CalculatePendingBookedAppointments;