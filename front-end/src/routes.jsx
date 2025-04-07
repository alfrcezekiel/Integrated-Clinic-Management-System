import HomeIcon from "@mui/icons-material/Home";
import DashboardHome from "./widgets/layout/DashboardHome";
import Schedule from "@mui/icons-material/Schedule";
import PatientsTable from "./layouts/patients-utils/patients-table";
import DoctorsDashboardHome from "./widgets/layout/doctors-dashboard/DoctorsDashboardHome";
import DoctorsTablesListOfAppointments from "./layouts/doctor-utils/DoctorsTablesListOfAppointment";
import AddIcon from "@mui/icons-material/Add";
import AddDoctor from "./layouts/adminUtils/Doctors";
import AdminDashboardHome from "./layouts/adminUtils/AdminHome";
import ClinicIcon from "@mui/icons-material/LocalHospital";
import ClinicCard from "./layouts/patients-utils/ClinicCards";
import AddClinicIcon from "@mui/icons-material/LocalHospital"; // Add this import
import AddClinic from "./layouts/adminUtils/AddClinic";

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
                path: "Home",
                element: <DashboardHome />,
            },
            {
                id: 2,
                icon: <ClinicIcon style={iconStyle} />,
                name: "Clinics",
                path: "View-Clinics",
                element: <ClinicCard />
            },
            {
                id: 3,
                icon: <Schedule style={iconStyle} />,
                name: "Appointments",
                path: "View-Appointment",
                element: <PatientsTable />
            },{
                id: 4,
                icon: <Schedule style={iconStyle} />,
                name: "Pending Appointments",
                path: "Pending-Appointment",
                element: <PatientsTable />
            }
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
                path: "/home",
                element: <AdminDashboardHome />
            },
            {
                id: 2,
                icon: <AddIcon style={iconStyle} />,
                name: "Add Doctor",
                path: "/add-doctor",
                element: <AddDoctor />
            },
            {
                id: 3,
                icon: <AddClinicIcon style={iconStyle} />, // Use the new icon here
                name: "Add Clinic",
                path: "/add-clinic",
                element: <AddClinic />
            }
        ]
    }
]
export default routes;
