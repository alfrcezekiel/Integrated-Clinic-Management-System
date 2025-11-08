import {
    useState,
    useEffect,
    useCallback
} from "react";
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

/**
 * @function component CalculateApprovedBookedAppointment
 */

const CalculateApprovedBookedAppointments = () => {
    const [calculatedApprovedBookedAppointments, setCalculatedApprovedBookedAppointments] = useState(0);
    const { user, token } = useAuthorization();
    const patientEmail = user?.sem;
    const tokenContext = token;

    const retrieveCalculateApprovedBookedAppointments = useCallback(async () => {
        try {
            if (!patientEmail || !tokenContext) {
                console.error(`Patient email or token is not set in context or local storage`);
                return;
            }

            const response = await CMS.get(`/patient/dashboard/calculateApprovedBookedAppointment`, {
                params: {
                    patientEmail: patientEmail
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            })

            if (response.status === 200) {
                const data = response.data.totalApprovedBookedAppointmentsOfPatient;
                setCalculatedApprovedBookedAppointments(data);
            } else {
                throw new Error("Failed to retrieve the calculated approved booked of patient email")
            }
        } catch (error) {
            console.error(`Failed to retrieve the calculated approved booked of patient email: ${error}`);
        }
    }, [patientEmail, tokenContext])

    useEffect(() => {
        retrieveCalculateApprovedBookedAppointments();
    }, [retrieveCalculateApprovedBookedAppointments]);

    return calculatedApprovedBookedAppointments;
}

export default CalculateApprovedBookedAppointments;