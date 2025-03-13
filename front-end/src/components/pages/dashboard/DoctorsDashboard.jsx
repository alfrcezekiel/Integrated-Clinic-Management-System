import {useEffect} from "react";
import "../../../assets/css/main.css";

const DoctorsDashboard = () => {
    useEffect(() => {
        const doctorTitleHeader = () => {
            document.title = "Doctor's Dashboard | CMS"
        }
        doctorTitleHeader();
    }, [])

    return (
        <div>
            <h1>Doctors Dashboard</h1>
        </div>
    );
}

export default DoctorsDashboard;    