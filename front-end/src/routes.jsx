import HomeIcon from "@mui/icons-material/Home";
import DashboardHome from "./widgets/layout/DashboardHome";
import Schedule from "@mui/icons-material/Schedule";
import PatientsTable from "./layouts/patients-utils/patients-table";
import DoctorsDashboardHome from "./widgets/layout/doctors-dashboard/DoctorsDashboardHome";
import DoctorsTablesListOfAppointments from "./layouts/doctor-utils/DoctorsTablesListOfAppointment";
import AddIcon from "@mui/icons-material/Add";
import AddDoctor from "./layouts/adminUtils/AddDoctor";
import AdminDashboardHome from "./layouts/adminUtils/AdminHome";

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

export const doctorRoutes = [
    {
        layout: "/doctor-portal/dashboard",
        pages: [
            {
                id: 1,
                icon: <HomeIcon style={iconStyle} />,
                name: "Doctor's Dashboard",
                path: "/home",
                element: <DoctorsDashboardHome />,
            },
            {
                id: 2,
                icon: <Schedule style={iconStyle} />,
                name: "Patient's Appointments",
                path: "/patients-appointments",
                element: <DoctorsTablesListOfAppointments />
            }
        ]
    }
]

export const adminRoutes = [
    {
        layout: "/admin-dashboard",
        pages: [
            {
                id: 1,
                icon: <HomeIcon style={iconStyle} />,
                name: "Admin Dashboard",
                path:"/home",
                element: <AdminDashboardHome />
            },
            {
                id: 2,
                icon: <AddIcon style={iconStyle} />,
                name: "Add Doctor",
                path: "/add-doctor",
                element: <AddDoctor />
            }
        ]
    }
]
export default routes;
