import {
    useState,
    useEffect,
    useCallback
} from "react";
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

/**
 * @function CalculatePendingBookedAppointments
 * @description Calculate the total number of pending booked appointments of specific patient account
 */

const CalculatePendingBookedAppointments = () => {
    const [calculatePendingBookedAppointments, setCalculatePendingBookedAppointments] = useState(0);
    const { user, token } = useAuthorization();
    const patientEmail = user?.sem;
    const tokenContext = token;
    
    const retrievePendingBookedAppointments = useCallback(async () => {
        try {
            if(!patientEmail || !tokenContext){
                console.error(`Patient email or token is not set in context or local storage`)
                return;
            }

            const response = await CMS.get(`/patient/dashboard/calculatePendingBookedAppointments`, {
                params: {
                    patientEmail: patientEmail
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            });

            if (response.status === 200) {
                const data = response.data.totalPendingBookedAppointmentsOfPatient;
                setCalculatePendingBookedAppointments(data);
            } else {
                throw new Error(`Failed to retrieve total pending booked appointments of patient: ${response}`)
            }
        } catch (error) {
            console.error(`Failed to retrieve pending booked appointments of patient: ${error}`)
        }
    }, [patientEmail, tokenContext])

    useEffect(() => {
        retrievePendingBookedAppointments();
    }, [retrievePendingBookedAppointments]);

    return calculatePendingBookedAppointments;
}

export default CalculatePendingBookedAppointments;