import {
    useEffect,
    useState,
    useCallback
} from "react";
import CMS from "../API/CMS";
import { useAuthorization } from "../context/auth/useAuthorization";

const PatientsCount = () => {
    const [getPatientsData, setPatientsData] = useState(0);
    const { token } = useAuthorization();
    const tokenContext = token;

    const retrievePatientsData = useCallback(async () => {
        try {
            const response = await CMS.get("/patientsDashboard", {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`,
                }
            });
            if (!response.data) {
                throw new Error("No retrieved data for patients");
            } else {
                setPatientsData(response.data.patientsDashboard[0].total_count);
            }
        } catch (error) {
            console.error(`Code functionality error for fetching patients data: ${error}`);
        }
    }, [tokenContext]);

    useEffect(() => {
        retrievePatientsData();
    }, [retrievePatientsData]);

    return getPatientsData;
}

export default PatientsCount;