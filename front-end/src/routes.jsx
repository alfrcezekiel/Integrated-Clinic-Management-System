import HomeIcon from "@mui/icons-material/Home";
import DashboardHome from "./widgets/layout/DashboardHome";
import Schedule from "@mui/icons-material/Schedule";
import PatientsTable from "./layouts/patients-utils/patients-table";

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

export default routes;
