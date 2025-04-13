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
import PendingAppointmentTable from "./layouts/patients-utils/PendingAppointmentTable";
import ApprovedAppointmentsTable from "./layouts/patients-utils/ApprovedAppointmentTable";
/*
    modules of clinics dashboard
*/
import DeclinedAppointmentStatusTable from "./layouts/patients-utils/DeclinedAppointmentTable";
import PendingAppointmentClinicTable from "./layouts/doctor-utils/PendingAppointmentClinicTable";
import ApprovedAppointmentClinicTable from "./layouts/doctor-utils/ApprovedAppointmentClinicTable";
import DeclinedAppointmentStatusClinicTable from "./layouts/doctor-utils/DeclinedAppointmentStatusClinicTable";
import AppointmentHistoryTable from "./layouts/doctor-utils/AppointmentHistoryTable";

import AccountCircle from '@mui/icons-material/AccountCircle';
import RegisterPatientsAccountTable from "./layouts/adminUtils/RegisterPatientsAccountTable";
import AssignmentTurnedIn from "@mui/icons-material/AssignmentTurnedIn";

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
                name: "View Clinics",
                path: "View-Clinics",
                element: <ClinicCard />
            },
            {
                id: 3,
                icon: <Schedule style={iconStyle} />,
                name: "Appointments",
                path: "View-Appointment",
                element: <PatientsTable />
            }, {
                id: 4,
                icon: <Schedule style={iconStyle} />,
                name: "Pending Appointments",
                path: "Pending-Appointment",
                element: <PendingAppointmentTable />
            }, {
                id: 5,
                icon: <Schedule style={iconStyle} />,
                name: "Approved Appointments",
                path: "Approved-Appointment",
                element: <ApprovedAppointmentsTable />
            }, {
                id: 6,
                icon: <Schedule style={iconStyle} />,
                name: "Declined Appointments",
                path: "Declined-Appointment",
                element: <DeclinedAppointmentStatusTable />
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
                name: "Clinics Dashboard",
                path: "/home",
                element: <DoctorsDashboardHome />,
            },
            {
                id: 2,
                icon: <Schedule style={iconStyle} />,
                name: "Appointments",
                path: "/patients-appointments",
                element: <DoctorsTablesListOfAppointments />
            },
            {
                id: 3,
                icon: <Schedule style={iconStyle} />,
                name: "Pending Appointments",
                path: "/pending-appointments",
                element: <PendingAppointmentClinicTable />
            },
            {
                id: 4,
                icon: <Schedule style={iconStyle} />,
                name: "Approved Appointments",
                path: "/approved-appointments",
                element: <ApprovedAppointmentClinicTable />
            },
            {
                id: 5,
                icon: <Schedule style={iconStyle} />,
                name: "Declined Appointments",
                path: "/declined-appointments",
                element: <DeclinedAppointmentStatusClinicTable />
            },
            {
                id: 6,
                icon: <AssignmentTurnedIn style={iconStyle} />,
                name: "Appointment History",
                path: "/appointment-history",
                element: <AppointmentHistoryTable />
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
                name: "Create Clinic",
                path: "/add-clinic",
                element: <AddClinic />
            },
            {
                id: 4,
                icon: <AccountCircle style={iconStyle} />,
                name: "Register Patients Account",
                path: "/register-patients-account",
                element: <RegisterPatientsAccountTable />
            }
        ]
    }
]
export default routes;
