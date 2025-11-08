import {
    useState,
    useEffect,
    useCallback
} from "react";
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

const CalculateDeclinedBookedAppointments = () => {
    const { user, token } = useAuthorization();
    const clinic_id = user?.sid;
    const tokenContext = token;

    const [totalDeclinedBookedAppointments, setTotalDeclinedBookedAppointments] = useState(0);

    const retrieveTotalNumberOfDeclinedBookedAppointments = useCallback(async () => {
        try {
            if (!clinic_id || !tokenContext) {
                console.error("Clinic ID or token is not available in context state or local storage.");
                return;
            }

            const response = await CMS.get(`/clinicDashboard/calculateTotalNumberOfDeclinedBookedAppointments`, {
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
                const data = response.data.totalDeclinedBookedAppointments;
                setTotalDeclinedBookedAppointments(data);
            } else {
                throw new Error(`Failed to retrieved total declined booked appointments: ${response}`);
            }
        } catch (error) {
            console.error(`Code functionality error for fetching total declined booked appointments: ${error}`);
        }
    }, [clinic_id, tokenContext])

    useEffect(() => {
        retrieveTotalNumberOfDeclinedBookedAppointments()
    }, [retrieveTotalNumberOfDeclinedBookedAppointments]);

    return totalDeclinedBookedAppointments;
}

export default CalculateDeclinedBookedAppointments;