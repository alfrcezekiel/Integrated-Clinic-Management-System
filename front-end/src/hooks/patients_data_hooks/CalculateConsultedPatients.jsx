import {
    useState,
    useEffect
} from "react";
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

/**
 * @exports custom hook for calculating the consulted patients in specific patient account
 */

const CalculateConsultedPatients = () => {
    const [calculatedConsultedPatients, setCalculatedConsultedPatients] = useState(0);
    const { user, token } = useAuthorization();
    const patientEmail = user?.sem;
    const tokenContext = token;

    useEffect(() => {
        /**
         * function to retrieve the total number of consulted patients in a specific patient account
         */
        const retrieveCalculatedConsultedPatients = async () => {
            try {
                if(!patientEmail || !tokenContext) {
                    console.error(`Patient email or token is not set in context or local storage`);
                    return;
                }

                const response = await CMS.get(`/CMS/patient/dashboard/calculateConsultedPatients`, {
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
                    const data = response.data.totalConsultedBookedAppointmentsOfPatient;
                    setCalculatedConsultedPatients(data);
                } else {
                    throw new Error(`Failed to fetch total consulted patients: ${response}`);
                }
            } catch (error) {
                console.error(`Code functionality error for fetching total consulted patients: ${error}`);
            }
        }

        retrieveCalculatedConsultedPatients();
    }, [patientEmail, tokenContext]);

    return calculatedConsultedPatients;
}

export default CalculateConsultedPatients;