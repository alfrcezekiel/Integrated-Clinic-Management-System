import {
    useEffect,
    useState,
    useCallback
} from "react";
import CMS from "../../API/CMS"
import { useAuthorization } from "../../context/auth/useAuthorization";

const TotalApprovedBookedAppointments = () => {
    const { user, token } = useAuthorization();
    const clinic_id = user?.sid;
    const tokenContext = token;

    const [totalApprovedBookedAppointments, setTotalApprovedBookedAppointments] = useState(0);

    // function to retrieve the total number of approved booked appointments in a specific clinic
    const retrieveTotalApprovedBookedAppointments = useCallback(async () => {
        try {
            if (!clinic_id || !tokenContext) {
                console.error("Clinic ID or token is not available in context state or local storage.");
                return;
            }

            const response = await CMS.get(`/clinicDashboard/calculateTotalNumberOfApprovedBookedAppointments`, {
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
                const data = response.data.totalApprovedBookedAppointments;
                setTotalApprovedBookedAppointments(data);
            } else {
                throw new Error(`Failed to fetch total approved booked appointments: ${response}`);
            }
        } catch (error) {
            console.error(`Code functionality error for fetching total approved booked appointments: ${error}`);
        }
    }, [clinic_id, tokenContext]);

    useEffect(() => {
        retrieveTotalApprovedBookedAppointments();
    }, [retrieveTotalApprovedBookedAppointments]);

    return totalApprovedBookedAppointments;
}

export default TotalApprovedBookedAppointments;