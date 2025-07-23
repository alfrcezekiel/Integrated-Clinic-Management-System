import {
    useState,
    useEffect
} from "react"
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

const CalculateConsultedPatients = () => {
    const [totalNumberOfConsultedPatients, setTotalNumberOfConsultedPatients] = useState(0);
    const { user, token } = useAuthorization();
    const clinic_id = user?.sid;
    const tokenContext = token;

    useEffect(() => {
        
        const retrievedCalculatedConsultedPatients = async () => {
            try {
                if(!clinic_id || !tokenContext) {
                    console.error("Clinic ID or token is not available in context state or local storage.")
                    return;
                }

                const response = await CMS.get(`/CMS/clinicDashboard/calculatedConsultedPatients`, {
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
        }
        retrievedCalculatedConsultedPatients();
    }, [clinic_id, tokenContext])

    return totalNumberOfConsultedPatients;
}

export default CalculateConsultedPatients;