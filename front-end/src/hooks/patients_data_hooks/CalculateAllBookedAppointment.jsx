import {
    useState,
    useEffect
} from "react";
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

const CalculateAllBookedAppointments = () => {
    const [totalNumberOfAllBookedAppointments, setTotalNumberOfAllBookedAppointments] = useState(0);
    const { user, token } = useAuthorization();
    const patientEmail = user?.sem;
    const tokenContext = token;

    useEffect(() => {
        const retrievedAllBookedAppointmentsOfPatient = async () => {
            try {
                if(!patientEmail || !tokenContext){
                    console.error(`Patient email or token is not set in context or local storage`)
                    return;
                }

                const response = await CMS.get(`/patient/dashboard/calculateAllBookedAppointments`, {
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
                    const data = response.data.totalBookedAppointmentsOfPatient;
                    setTotalNumberOfAllBookedAppointments(data);
                } else {
                    throw new Error(`Failed to retrieve total booked appointments of patient: ${response}`)
                }
            } catch (error) {
                console.error(`Failed to retrieve all booked appointments of patient: ${error}`)
            }
        }

        retrievedAllBookedAppointmentsOfPatient();
    }, [tokenContext, patientEmail]);

    return totalNumberOfAllBookedAppointments;
}

export default CalculateAllBookedAppointments;