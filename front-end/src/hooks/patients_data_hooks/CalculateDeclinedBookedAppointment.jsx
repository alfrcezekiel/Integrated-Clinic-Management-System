import {
    useState,
    useEffect,
    useCallback
} from "react";
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

/**
 * @function component CalculateDeclinedBookedAppointment
 */

const CalculateDeclinedBookedAppointment = () => {
    const [calculateDeclinedBookedAppointment, setCalculateDeclinedBookedAppointment] = useState(0);
    const { user, token } = useAuthorization();
    const patientEmail = user?.sem;
    const tokenContext = token;

    /**
     * @function logic to calculate the declined booked appointment of specific patient account
     */
    const retrieveCalculatedDeclinedBookedAppointment = useCallback(async () => {
        try {
            if(!patientEmail || !tokenContext) {
                console.error(`Patient email or token is not set in context or local storage`);
                return;
            }

            const response = await CMS.get(`/patient/dashboard/calculateDeclinedBookedAppointments`, {
                params: {
                    patientEmail: patientEmail
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            });

            if(response.status === 200) {
                const data = response.data.totalDeclinedBookedAppointmentsOfPatient;
                setCalculateDeclinedBookedAppointment(data);
            } else {
                throw new Error("Failed to retrieve calculated declined booked appointment")
            }
        } catch (error) {
            console.error(`Failed to retrieve calculated declined booked appointment: ${error}`)
        }
    }, [patientEmail, tokenContext]);

    useEffect(() => {
        retrieveCalculatedDeclinedBookedAppointment();
    }, [retrieveCalculatedDeclinedBookedAppointment]);

    return calculateDeclinedBookedAppointment;
}

export default CalculateDeclinedBookedAppointment;