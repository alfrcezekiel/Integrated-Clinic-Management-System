import {
    useState,
    useEffect,
    useCallback
} from "react";
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

const CalculateAdminAccounts = () => {
    const [calculateAdminAccounts, setCalculateAdminAccounts] = useState(0);

    const { token } = useAuthorization();

    const tokenContext = token;

    if (!tokenContext) {
        console.error("Token is not available in context state or local storage.");
    }

    const retrieveCalculateAdminAccounts = useCallback(async () => {
        try {
            const response = await CMS.get(`/adminDashboard/totalNumberOfAdminAccounts`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            })

            if (response.status === 200) {
                const data = response.data.totalNumberOfAdminAccounts;
                setCalculateAdminAccounts(data);
            } else {
                throw new Error(`Failed to fetch total number of admin accounts: ${response.status}`)
            }
        } catch (error) {
            console.error(`Code functionality error for fetching total number of admin accounts: ${error}`)
        }
    }, [tokenContext]);

    useEffect(() => {
        retrieveCalculateAdminAccounts();
    }, [retrieveCalculateAdminAccounts])

    return calculateAdminAccounts;
}

export default CalculateAdminAccounts;