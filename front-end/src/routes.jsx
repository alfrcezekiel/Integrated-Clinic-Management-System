import HomeIcon from "@mui/icons-material/Home";
import DashboardHome from "./widgets/layout/DashboardHome";
import PatientsTable from "./layouts/patients-utils/patients-table";
import DoctorsDashboardHome from "./widgets/layout/doctors-dashboard/DoctorsDashboardHome";
import DoctorsTablesListOfAppointments from "./layouts/ClinicUtils/DoctorsTablesListOfAppointment";
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
import PendingAppointmentClinicTable from "./layouts/ClinicUtils/PendingAppointmentClinicTable";
import ApprovedAppointmentClinicTable from "./layouts/ClinicUtils/ApprovedAppointmentClinicTable";
import DeclinedAppointmentStatusClinicTable from "./layouts/ClinicUtils/DeclinedAppointmentStatusClinicTable";
import AppointmentHistoryTable from "./layouts/ClinicUtils/AppointmentHistoryTable";
import ConsultPatientPage from "./layouts/ClinicUtils/ConsultationPage/ConsultPatientPage";

import AccountCircle from '@mui/icons-material/AccountCircle';
import RegisterPatientsAccountTable from "./layouts/adminUtils/RegisterPatientsAccountTable";
import PersonIcon from '@mui/icons-material/Person';	
import EventIcon from '@mui/icons-material/Event';	
import HourglassTopIcon from '@mui/icons-material/HourglassTop';	
import CheckCircleIcon from '@mui/icons-material/CheckCircle';	
import CancelIcon from '@mui/icons-material/Cancel';	
import HistoryIcon from '@mui/icons-material/History';	
import ViewClinicDetails from "./layouts/adminUtils/ViewClinicDetails";

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
                icon: <EventIcon style={iconStyle} />,
                name: "Appointments",
                path: "View-Appointment",
                element: <PatientsTable />
            }, {
                id: 4,
                icon: <HourglassTopIcon style={iconStyle} />,
                name: "Pending Appointments",
                path: "Pending-Appointment",
                element: <PendingAppointmentTable />
            }, {
                id: 5,
                icon: <CheckCircleIcon style={iconStyle} />,
                name: "Approved Appointments",
                path: "Approved-Appointment",
                element: <ApprovedAppointmentsTable />
            }, {
                id: 6,
                icon: <CancelIcon style={iconStyle} />,
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
                icon: <EventIcon style={iconStyle} />,
                name: "Appointments",
                path: "/patients-appointments",
                element: <DoctorsTablesListOfAppointments />
            },
            {
                id: 3,
                icon: <HourglassTopIcon style={iconStyle} />,
                name: "Pending Appointments",
                path: "/pending-appointments",
                element: <PendingAppointmentClinicTable />
            },
            {
                id: 4,
                icon: <CheckCircleIcon style={iconStyle} />,
                name: "Approved Appointments",
                path: "/approved-appointments",
                element: <ApprovedAppointmentClinicTable />
            },
            {
                id: 5,
                icon: <CancelIcon style={iconStyle} />,
                name: "Declined Appointments",
                path: "/declined-appointments",
                element: <DeclinedAppointmentStatusClinicTable />
            },
            {
                id: 6,
                icon: <HistoryIcon style={iconStyle} />,
                name: "Appointment History",
                path: "/appointment-history",
                element: <AppointmentHistoryTable />
            },
            {
                id: 7,
                icon: <PersonIcon style={iconStyle} />,
                name: "Consult Patient",
                path: "/consult-patient",
                element: <ConsultPatientPage />
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
                path: "/Home",
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
                icon: <AddClinicIcon style={iconStyle} />, 
                name: "Add Clinic",
                path: "/AddClinic",
                element: <AddClinic />
            },
            {
                id: 4,
                icon: <AccountCircle style={iconStyle} />,
                name: "Registered Patients Account",
                path: "/RegisterPatientsAccount",
                element: <RegisterPatientsAccountTable />
            },{
                id: 5,
                icon: <ClinicIcon style={iconStyle} />,
                name:"View Clinic",
                path: "/ViewClinic",
                element: <ViewClinicDetails />  
            }
        ]
    }
]
export default routes;
