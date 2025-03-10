import { useEffect, useState } from "react";
import CMS from "../API/CMS";

function usePatientsCount() {
    const [getPatientsData, setPatientsData] = useState([]);

    useEffect(() => {
        const retrievePatientsData = async () => {
            try {
                const response = await CMS.get("/CMS/patientsDashboard");
                console.log(response.data)
                if (!response.data) {
                    throw new Error("No retrieved data for patients");
                } else {
                    setPatientsData(response.data.length);
                }
            } catch (error) {
                console.error(`Code functionality error for fetching patients data: ${error}`);
            }
        }
        retrievePatientsData();
    }, []);

    return getPatientsData;
}
export default usePatientsCount;    