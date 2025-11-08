import {
    useState,
    useEffect,
    useCallback
} from "react"
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

const CalculateConsultedPatients = () => {
    const [totalNumberOfConsultedPatients, setTotalNumberOfConsultedPatients] = useState(0);
    const { user, token } = useAuthorization();
    const clinic_id = user?.sid;
    const tokenContext = token;

    const retrievedCalculatedConsultedPatients = useCallback(async () => {
        try {
            if(!clinic_id || !tokenContext) {
                console.error("Clinic ID or token is not available in context state or local storage.")
                return;
            }

            const response = await CMS.get(`/clinicDashboard/calculatedConsultedPatients`, {
                params: {
                    clinicID: clinic_id
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            });

            if(response.status === 200) {
                const data = response.data.totalConsultedPatients;
                setTotalNumberOfConsultedPatients(data);
            } else {
                throw new Error(`Failed to retrieved total number of consulted patients: ${response}`);
            }
        } catch (error) {
            console.error(`Code functionality error for fetching total number of consulted patients: ${error}`)
        }
    }, [clinic_id, tokenContext])

    useEffect(() => {
        retrievedCalculatedConsultedPatients();
    }, [retrievedCalculatedConsultedPatients])

    return totalNumberOfConsultedPatients;
}

export default CalculateConsultedPatients;