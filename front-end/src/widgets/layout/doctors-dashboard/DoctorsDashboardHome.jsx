import {
    AttachMoney as MoneyIcon,
    People as UsersIcon,
    PersonAdd as UserPlusIcon,
    BarChart as ChartBarIcon,
} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import StatisticsCard from "../../cards/statistics-card";
import usePatientsCount from "../../../hooks/usePatientsCount";
import ClinicViewAppointmentCalendar from "../../../layouts/ClinicUtils/ViewClinicCalendar/ClinicViewAppointmentCalendar";

const DoctorsDashboardHome = () => {
    const patientCount = usePatientsCount();

    const statisticsCardsData = [
        {
            color: "gray",
            icon: MoneyIcon,
            title: "Today's Money",
            value: "$53k",
            footer: {
                color: "text-green-500",
                value: "+55%",
                label: "than last week",
            },
        },
        {
            color: "gray",
            icon: UsersIcon,
            title: "Patients Registered",
            value: patientCount,
            footer: {
                color: "text-green-500",
                value: "+3%",
                label: "than last month",
            },
        },
        {
            color: "gray",
            icon: UserPlusIcon,
            title: "New Clients",
            value: "3,462",
            footer: {
                color: "text-red-500",
                value: "-2%",
                label: "than yesterday",
            },
        },
        {
            color: "gray",
            icon: ChartBarIcon,
            title: "Sales",
            value: "$103,430",
            footer: {
                color: "text-green-500",
                value: "+5%",
                label: "than yesterday",
            },
        },
    ];

    return (
        <div className="mt-12">
            <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
                {statisticsCardsData.map(({ icon: Icon, title, footer, ...rest }) => (
                    <StatisticsCard
                        key={title}
                        {...rest}
                        title={title}
                        icon={<Icon />}
                        footer={
                            <Typography className="font-normal text-blue-gray-600">
                                <strong className={footer.color}>{footer.value}</strong>
                                &nbsp;{footer.label}
                            </Typography>
                        }
                    />
                ))}
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-auto">
                <ClinicViewAppointmentCalendar />
            </div>
        </div>
    )
}

export default DoctorsDashboardHome;