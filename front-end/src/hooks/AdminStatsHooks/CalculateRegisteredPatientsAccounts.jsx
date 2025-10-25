import {
    useEffect,
    useState
} from "react";
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

const CalculateRegisteredPatientsAccounts = () => {
    const [totalNumberOfRegisteredPatientsAccounts, setTotalNumberOfRegisteredPatientsAccounts] = useState(0);
    const { token } = useAuthorization();

    const tokenContext = token;

    /**
     * @function useEffect to retrieve total number of registered patients accounts
     */
    useEffect(() => {
        if (!tokenContext) {
            console.error("Token is not available in context state or local storage.");
            return;
        }

        const retrieveCalculateRegisteredPatientAccounts = async () => {
            try {
                const response = await CMS.get(`/adminDashboard/totalNumberOfRegisteredPatientsAccounts`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenContext}`
                    }
                })

                if (response.status === 200) {
                    const data = response.data.totalNumberOfRegisteredPatientsAccounts;
                    setTotalNumberOfRegisteredPatientsAccounts(data);
                } else {
                    throw new Error(`Failed to fetch total number of registered patients accounts: ${response.status}`)
                }
            } catch (error) {
                console.error(`Code functionality error for fetching total number of registered patients accounts: ${error}`)
            }
        }
        retrieveCalculateRegisteredPatientAccounts();

    }, [tokenContext])

    return totalNumberOfRegisteredPatientsAccounts;
}

export default CalculateRegisteredPatientsAccounts