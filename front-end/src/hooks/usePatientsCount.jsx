import { useEffect, useState } from "react";
import CMS from "../API/CMS";

function usePatientsCount() {
    const [getPatientsData, setPatientsData] = useState(0);

    useEffect(() => {
        const retrievePatientsData = async () => {
            try {
                const response = await CMS.get("/CMS/patientsDashboard");
                if (!response.data) {
                    throw new Error("No retrieved data for patients");
                } else {
                    setPatientsData(response.data.patientsDashboard[0].total_count);
                }
            } catch (error) {
                console.error(`Code functionality error for fetching patients data: ${error}`);
            }
        }
        retrievePatientsData();
    }, [getPatientsData]);

    return getPatientsData;
}
export default usePatientsCount;