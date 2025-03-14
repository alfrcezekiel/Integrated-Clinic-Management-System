import HomeIcon from "@mui/icons-material/Home";
import DashboardHome from "./widgets/layout/DashboardHome";
import Schedule from "@mui/icons-material/Schedule";
import PatientsTable from "./layouts/patients-utils/patients-table";
import DoctorsDashboardHome from "./widgets/layout/doctors-dashboard/DoctorsDashboardHome";

const iconStyle = {
    fontSize: 20,
    color: "inherit",
};

const routes = [
    {
        layout: "/patients-dashboard/",
        pages: [
            {
                id: 1,
                icon: <HomeIcon style={iconStyle} />,
                name: "Patients Dashboard",
                path: "home",
                element: <DashboardHome />,
            },
            {
                id: 2,
                icon: <Schedule style={iconStyle} />,
                name: "Book Appointment",
                path: "book-appointment",
                element: <PatientsTable />,
            },
        ],
    },
];

export const doctorRoutes = [{
    layout: "/doctor-portal/dashboard",
    pages: [
        {
            id: 1,
            icon: <HomeIcon style={iconStyle} />,
            name: "Doctor's Dashboard",
            path: "/home",
            element: <DoctorsDashboardHome />,
        }
    ]
}]
export default routes;
