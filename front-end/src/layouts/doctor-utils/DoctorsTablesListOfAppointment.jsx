import {useEffect} from "react"
import { useLocation } from "react-router-dom"
const DoctorsTablesListOfAppointments = () => {
    const location = useLocation();
    useEffect(() => {
        const titleHeader = () => {
            document.title = "Doctor's Dashboard | Patient's Appointment | CMS"
        }
        titleHeader();
    }, [location.pathname])

    return (
        <h1>Tables</h1>
    )
}

export default DoctorsTablesListOfAppointments;