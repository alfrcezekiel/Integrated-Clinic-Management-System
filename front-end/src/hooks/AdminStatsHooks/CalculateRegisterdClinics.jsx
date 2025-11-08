import {
    useEffect,
    useState,
    useCallback
} from "react";
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

/**
 * @function CalculateRegisterdClinics
 * @description This custom hook calculates the total number of registered clinics in admin side
 */

const CalculateRegisteredClinics = () => {
    const { token } = useAuthorization();
    const [totalNumberOfRegisteredClinics, setTotalNumberOfRegisteredClinics] = useState(0);

    const tokenContext = token;

    const retrieveTotalNumberOfRegisteredClinics = useCallback(async () => {
        try {
            if (!tokenContext) {
                console.error("Token is not available in context state or local storage.");
                return;
            }

            const response = await CMS.get(`/adminDashboard/totalNumberOfRegisteredClinics`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`,
                }
            })

            if (response.status === 200) {
                const data = response.data.totalNumberOfRegisteredClinics;
                setTotalNumberOfRegisteredClinics(data);
            } else {
                throw new Error(`Failed to retrieve total number of registered clinics: ${response.status}`)
            }
        } catch (error) {
            console.error(`Code functionality error for fetching total number of registered clinics: ${error}`);
        }
    }, [tokenContext])

    useEffect(() => {
        retrieveTotalNumberOfRegisteredClinics();
    }, [retrieveTotalNumberOfRegisteredClinics])

    return totalNumberOfRegisteredClinics;
}

export default CalculateRegisteredClinics