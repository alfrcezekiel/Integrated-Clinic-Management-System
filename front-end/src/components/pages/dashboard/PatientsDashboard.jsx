import Dashboard from "../../../layouts/dashboard";
import {useEffect} from "react";
import {useLocation} from "react-router-dom";

const PatientsDashboard = () => {
    const location = useLocation();
    useEffect(() => {
        const titleHead = () => document.title = "Patients Dashboard | CMS";
        titleHead();
    }, [location.pathname]);

    return (
        <>
            <Dashboard/>
        </>
    )
}

export default PatientsDashboard;