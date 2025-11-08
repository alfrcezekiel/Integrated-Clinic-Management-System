import {
    useState,
    useEffect,
    useCallback
} from "react";
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";
/**
 * @function component CalculateCancelledBookedAppointments
 * @description Calculate the total number of cancelled booked appointments of specific patient account
 */
const CalculateCancelledBookedAppointments = () => {
    const [calculateCancelledBookedAppointment, setCalculateCancelledBookedAppointment] = useState(0);
    const { user, token } = useAuthorization();
    const patientEmail = user?.sem;
    const tokenContext = token;

    /**
     * @ function to retrieve the total number of cancelled booked appointments of specific patient account
     */

    const retrieveCalculatedCancelledBookedAppointment = useCallback(async () => {
        try {
            if(!patientEmail || !tokenContext) {
                console.error(`Patient email or token is not set in context or local storage`);
                return;
            }

            const response = await CMS.get(`/patient/dashboard/calculateCancelledBookedAppointments`, {
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
                const data = response.data.totalCancelledBookedAppointmentsOfPatient;
                setCalculateCancelledBookedAppointment(data);
            } else {
                throw new Error(`Failed to retrieve total cancelled booked appointments of patient: ${response}`);
            }
        } catch (error) {
            console.error(`Failed to retrieve total cancelled booked appointments of patient: ${error}`);
        }
    }, [patientEmail, tokenContext]);

    useEffect(() => {
        retrieveCalculatedCancelledBookedAppointment();
    }, [retrieveCalculatedCancelledBookedAppointment]);

    return calculateCancelledBookedAppointment;
}

export default CalculateCancelledBookedAppointments;